import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { generateStructuredAssessmentAnalysis } from '@/lib/services/vertexAIService'
import { generateRAGContext } from '@/lib/services/ragService'

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

    const { childId, ageInMonths, totalScore, responses, concernsText } = await request.json()

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
        concernsText: concernsText || null,
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
    const savedResults: Array<{ category: string; score: number; level: string }> = []
    for (const [category, scoreData] of Object.entries(categoryScores)) {
      const level = determineDevelopmentLevel(category, scoreData.score)

      await prisma.assessmentResult.create({
        data: {
          assessmentId: assessment.id,
          category: category as any,
          score: scoreData.score,
          level: level,
        }
      })

      savedResults.push({
        category,
        score: scoreData.score,
        level,
      })
    }

    // 자동 AI 분석 생성 (백그라운드에서 실행)
    triggerAIAnalysis(assessment.id, ageInMonths, savedResults, concernsText).catch((error) => {
      console.error('자동 AI 분석 생성 실패:', error)
    })

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

// 발달 수준 판정 (새로운 기준 적용)
function determineDevelopmentLevel(category: string, score: number): 'ADVANCED' | 'NORMAL' | 'NEEDS_TRACKING' | 'NEEDS_ASSESSMENT' {
  switch (category) {
    case 'GROSS_MOTOR':
      // 대근육: 0-9(심화), 10-16(추적), 17-23(또래), 24+(빠름)
      if (score >= 24) return 'ADVANCED'
      if (score >= 17) return 'NORMAL'
      if (score >= 10) return 'NEEDS_TRACKING'
      return 'NEEDS_ASSESSMENT'

    case 'FINE_MOTOR':
      // 소근육: 0-9(심화), 10-12(추적), 13-19(또래), 20+(빠름)
      if (score >= 20) return 'ADVANCED'
      if (score >= 13) return 'NORMAL'
      if (score >= 10) return 'NEEDS_TRACKING'
      return 'NEEDS_ASSESSMENT'

    case 'LANGUAGE':
      // 언어: 0-7(심화), 8-14(추적), 15-23(또래), 24+(빠름)
      if (score >= 24) return 'ADVANCED'
      if (score >= 15) return 'NORMAL'
      if (score >= 8) return 'NEEDS_TRACKING'
      return 'NEEDS_ASSESSMENT'

    case 'COGNITIVE':
      // 인지: 0-7(심화), 8-13(추적), 14-20(또래), 21+(빠름)
      if (score >= 21) return 'ADVANCED'
      if (score >= 14) return 'NORMAL'
      if (score >= 8) return 'NEEDS_TRACKING'
      return 'NEEDS_ASSESSMENT'

    case 'SOCIAL':
      // 사회성: 0-5(심화), 6-14(추적), 15-23(또래), 24+(빠름)
      if (score >= 24) return 'ADVANCED'
      if (score >= 15) return 'NORMAL'
      if (score >= 6) return 'NEEDS_TRACKING'
      return 'NEEDS_ASSESSMENT'

    default:
      return 'NEEDS_ASSESSMENT'
  }
}

// 백그라운드에서 AI 분석 자동 생성
async function triggerAIAnalysis(
  assessmentId: string,
  ageInMonths: number,
  results: Array<{ category: string; score: number; level: string }>,
  concernsText?: string
) {
  try {
    // RAG 컨텍스트 생성
    const ragContext = await generateRAGContext({
      ageInMonths,
      results,
      concernsText,
    })

    // 구조화된 AI 분석 생성
    const structuredAnalysis = await generateStructuredAssessmentAnalysis(
      {
        ageInMonths,
        results,
        concernsText,
      },
      ragContext
    )

    // 분석 결과 저장
    await prisma.developmentAssessment.update({
      where: { id: assessmentId },
      data: {
        aiAnalysis: structuredAnalysis.overallAnalysis,
        aiAnalysisSummary: structuredAnalysis.summary,
        aiRecommendations: JSON.stringify(structuredAnalysis.recommendations),
        aiCategoryAnalysis: JSON.stringify(structuredAnalysis.categoryAnalysis),
        aiAnalyzedAt: new Date(),
      },
    })

    // 각 AssessmentResult에 itemFeedbacks 저장
    if (structuredAnalysis.categoryAnalysis) {
      const assessmentResults = await prisma.assessmentResult.findMany({
        where: { assessmentId },
      })

      for (const result of assessmentResults) {
        const categoryData = structuredAnalysis.categoryAnalysis[result.category]
        if (categoryData && categoryData.itemFeedbacks) {
          await prisma.assessmentResult.update({
            where: { id: result.id },
            data: {
              itemFeedbacks: JSON.stringify(categoryData.itemFeedbacks),
            },
          })
        }
      }
    }

    console.log(`AI 분석 자동 생성 완료: ${assessmentId}`)
  } catch (error) {
    console.error(`AI 분석 자동 생성 실패 (${assessmentId}):`, error)
    // 실패해도 발달체크 결과는 유지됨
  }
}
