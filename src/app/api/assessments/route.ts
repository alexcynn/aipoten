import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

// 발달 체크 생성 및 완료
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    const { childId, ageInMonths, totalScore, responses } = await request.json()

    if (!childId || !ageInMonths) {
      return NextResponse.json(
        { error: '아이 ID와 연령은 필수입니다.' },
        { status: 400 }
      )
    }

    // 본인의 아이인지 확인
    const child = await prisma.child.findUnique({
      where: {
        id: childId,
        userId: session.user.id
      }
    })

    if (!child) {
      return NextResponse.json(
        { error: '아이 정보를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 발달 체크 생성 (완료 상태로)
    const assessment = await prisma.developmentAssessment.create({
      data: {
        childId,
        ageInMonths,
        status: 'COMPLETED',
        totalScore: totalScore || 0,
        completedAt: new Date(),
        responses: {
          create: responses?.map((r: any) => ({
            questionId: r.questionId,
            level: r.level,
            answer: r.answer,
            score: r.score || 0,
          })) || []
        }
      },
      include: {
        child: {
          select: {
            id: true,
            name: true
          }
        },
        responses: true
      }
    })

    // 카테고리별 점수 계산 및 결과 저장
    const categoryScores = await calculateCategoryScores(assessment.id, responses)

    // AssessmentResult 저장
    for (const [category, scoreData] of Object.entries(categoryScores)) {
      const level = determineDevelopmentLevel(scoreData.score, scoreData.maxScore)

      await prisma.assessmentResult.create({
        data: {
          assessmentId: assessment.id,
          category: category as any,
          score: scoreData.score,
          level: level,
        }
      })
    }

    return NextResponse.json({
      message: '발달 체크가 완료되었습니다.',
      ...assessment
    })
  } catch (error) {
    console.error('발달 체크 생성 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 사용자별 발달 체크 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const childId = searchParams.get('childId')

    let whereCondition: any = {
      child: {
        userId: session.user.id
      }
    }

    if (childId) {
      whereCondition.childId = childId
    }

    const assessments = await prisma.developmentAssessment.findMany({
      where: whereCondition,
      include: {
        child: {
          select: {
            id: true,
            name: true
          }
        },
        results: {
          select: {
            id: true,
            category: true,
            score: true,
            level: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(assessments)
  } catch (error) {
    console.error('발달 체크 목록 조회 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 카테고리별 점수 계산
async function calculateCategoryScores(assessmentId: string, responses: any[]) {
  const scores: Record<string, { score: number; maxScore: number }> = {}

  for (const response of responses) {
    const question = await prisma.assessmentQuestion.findUnique({
      where: { id: response.questionId }
    })

    if (!question || question.isWarning) continue

    const category = question.category
    if (!scores[category]) {
      scores[category] = { score: 0, maxScore: 0 }
    }

    scores[category].score += response.score

    // 최대 점수 계산 (Q1 질문만 카운트, Q1 최대 점수는 3)
    if (question.level === 'Q1') {
      scores[category].maxScore += 3
    }
  }

  return scores
}

// 발달 수준 판정
function determineDevelopmentLevel(score: number, maxScore: number): 'EXCELLENT' | 'GOOD' | 'CAUTION' | 'NEEDS_OBSERVATION' {
  if (maxScore === 0) return 'NEEDS_OBSERVATION'

  const percentage = (score / maxScore) * 100

  if (percentage >= 80) return 'EXCELLENT'
  if (percentage >= 60) return 'GOOD'
  if (percentage >= 40) return 'CAUTION'
  return 'NEEDS_OBSERVATION'
}
