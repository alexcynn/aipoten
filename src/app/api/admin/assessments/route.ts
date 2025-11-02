import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

// GET - 발달체크 현황 조회 (관리자)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const startDateParam = searchParams.get('startDate') // 'YYYY-MM-DD'
    const endDateParam = searchParams.get('endDate') // 'YYYY-MM-DD'

    const where: any = {
      status: 'COMPLETED', // 완료된 검사만
    }

    // 날짜 범위 필터링
    if (startDateParam || endDateParam) {
      where.completedAt = {}

      if (startDateParam) {
        // 시작일의 00:00:00부터
        const startDate = new Date(startDateParam)
        startDate.setHours(0, 0, 0, 0)
        where.completedAt.gte = startDate
      }

      if (endDateParam) {
        // 종료일의 23:59:59까지
        const endDate = new Date(endDateParam)
        endDate.setHours(23, 59, 59, 999)
        where.completedAt.lte = endDate
      }
    }

    const assessments = await prisma.developmentAssessment.findMany({
      where,
      include: {
        child: {
          select: {
            id: true,
            name: true,
            gender: true,
            birthDate: true,
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        results: {
          select: {
            category: true,
            level: true,
            feedback: true,
            recommendations: true,
          },
          orderBy: {
            category: 'asc',
          },
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
    })

    // concernsText를 100자로 제한 (미리보기용)
    const assessmentsWithPreview = assessments.map((assessment) => ({
      ...assessment,
      concernsPreview: assessment.concernsText
        ? assessment.concernsText.substring(0, 100) + (assessment.concernsText.length > 100 ? '...' : '')
        : null,
    }))

    return NextResponse.json({
      assessments: assessmentsWithPreview,
    })
  } catch (error) {
    console.error('발달체크 현황 조회 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
