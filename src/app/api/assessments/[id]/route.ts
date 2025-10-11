import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { DevelopmentCategory, DevelopmentLevel } from '@prisma/client'

// 발달 체크 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    const { id } = await params

    const assessment = await prisma.developmentAssessment.findUnique({
      where: { id },
      include: {
        child: {
          select: {
            id: true,
            name: true,
            birthDate: true,
            gender: true,
            user: {
              select: {
                id: true
              }
            }
          }
        },
        results: true,
        responses: {
          include: {
            question: {
              select: {
                category: true,
                questionText: true
              }
            }
          }
        }
      }
    })

    if (!assessment) {
      return NextResponse.json(
        { error: '발달 체크를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 본인의 아이 발달 체크인지 확인
    if (assessment.child.user.id !== session.user.id) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    console.log('Assessment data:', JSON.stringify(assessment, null, 2))
    return NextResponse.json({ assessment })
  } catch (error) {
    console.error('발달 체크 조회 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 발달 체크 결과 저장/수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    const { id } = await params
    const { results, status } = await request.json()

    // 발달 체크 소유권 확인
    const assessment = await prisma.developmentAssessment.findUnique({
      where: { id },
      include: {
        child: {
          select: {
            user: {
              select: {
                id: true
              }
            }
          }
        }
      }
    })

    if (!assessment) {
      return NextResponse.json(
        { error: '발달 체크를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (assessment.child.user.id !== session.user.id) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    // 기존 결과 삭제 후 새로 생성
    if (results && Array.isArray(results)) {
      await prisma.assessmentResult.deleteMany({
        where: { assessmentId: id }
      })

      const assessmentResults = results.map((result: any) => ({
        assessmentId: id,
        category: result.category as DevelopmentCategory,
        score: result.score,
        level: calculateDevelopmentLevel(result.score),
        feedback: result.feedback,
        recommendations: result.recommendations
      }))

      await prisma.assessmentResult.createMany({
        data: assessmentResults
      })
    }

    // 발달 체크 상태 업데이트
    const updatedAssessment = await prisma.developmentAssessment.update({
      where: { id },
      data: {
        status: status || (results ? 'COMPLETED' : 'IN_PROGRESS'),
        completedAt: status === 'COMPLETED' || results ? new Date() : null
      },
      include: {
        results: true,
        child: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      message: '발달 체크 결과가 저장되었습니다.',
      assessment: updatedAssessment
    })
  } catch (error) {
    console.error('발달 체크 결과 저장 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 발달 체크 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    const { id } = await params

    // 발달 체크 소유권 확인
    const assessment = await prisma.developmentAssessment.findUnique({
      where: { id },
      include: {
        child: {
          select: {
            user: {
              select: {
                id: true
              }
            }
          }
        }
      }
    })

    if (!assessment) {
      return NextResponse.json(
        { error: '발달 체크를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (assessment.child.user.id !== session.user.id) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    await prisma.developmentAssessment.delete({
      where: { id }
    })

    return NextResponse.json({
      message: '발달 체크가 삭제되었습니다.'
    })
  } catch (error) {
    console.error('발달 체크 삭제 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 점수에 따른 발달 수준 계산
function calculateDevelopmentLevel(score: number): DevelopmentLevel {
  if (score >= 80) return 'EXCELLENT'
  if (score >= 60) return 'GOOD'
  if (score >= 40) return 'CAUTION'
  return 'NEEDS_OBSERVATION'
}