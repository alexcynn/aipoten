import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

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
    const timeRange = searchParams.get('timeRange') || '30d'

    // Calculate date ranges
    const now = new Date()
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

    // User Statistics
    const [
      totalUsers,
      newUsersThisMonth,
      newUsersLastMonth,
      userRoleDistribution
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          createdAt: {
            gte: currentMonth
          }
        }
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: lastMonth,
            lt: currentMonth
          }
        }
      }),
      prisma.user.groupBy({
        by: ['role'],
        _count: true
      })
    ])

    const roleDistribution = userRoleDistribution.reduce((acc, item) => {
      acc[item.role] = item._count
      return acc
    }, {} as Record<string, number>)

    const userGrowthRate = newUsersLastMonth > 0
      ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100
      : 0

    // Consultation Statistics
    const [
      totalConsultations,
      completedConsultations,
      scheduledConsultations,
      cancelledConsultations,
      monthlyRevenue,
      averageConsultationFee
    ] = await Promise.all([
      prisma.consultation.count(),
      prisma.consultation.count({
        where: { status: 'COMPLETED' }
      }),
      prisma.consultation.count({
        where: { status: 'SCHEDULED' }
      }),
      prisma.consultation.count({
        where: { status: 'CANCELLED' }
      }),
      prisma.consultation.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: currentMonth
          }
        },
        _sum: {
          fee: true
        }
      }),
      prisma.consultation.aggregate({
        where: {
          status: 'COMPLETED'
        },
        _avg: {
          fee: true
        }
      })
    ])

    // Content Statistics
    const [
      totalVideos,
      activeVideos,
      totalViews,
      mostViewedVideos
    ] = await Promise.all([
      prisma.video.count(),
      prisma.video.count({
        where: { isActive: true }
      }),
      prisma.video.aggregate({
        _sum: {
          views: true
        }
      }),
      prisma.video.findMany({
        orderBy: {
          views: 'desc'
        },
        take: 10,
        select: {
          id: true,
          title: true,
          views: true
        }
      })
    ])

    // System Statistics
    const [
      totalChildren,
      totalAssessments,
      pendingTherapistApprovals
    ] = await Promise.all([
      prisma.child.count(),
      prisma.developmentAssessment.count(),
      prisma.therapistProfile.count({
        where: { status: 'PENDING' }
      })
    ])

    // Monthly Data (last 6 months)
    const monthlyData = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)

      const [monthUsers, monthConsultations, monthRevenue] = await Promise.all([
        prisma.user.count({
          where: {
            createdAt: {
              gte: monthStart,
              lte: monthEnd
            }
          }
        }),
        prisma.consultation.count({
          where: {
            createdAt: {
              gte: monthStart,
              lte: monthEnd
            }
          }
        }),
        prisma.consultation.aggregate({
          where: {
            status: 'COMPLETED',
            createdAt: {
              gte: monthStart,
              lte: monthEnd
            }
          },
          _sum: {
            fee: true
          }
        })
      ])

      monthlyData.push({
        month: monthStart.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' }),
        users: monthUsers,
        consultations: monthConsultations,
        revenue: monthRevenue._sum.fee || 0
      })
    }

    const analytics = {
      userStats: {
        totalUsers,
        newUsersThisMonth,
        newUsersLastMonth,
        userGrowthRate,
        roleDistribution: {
          PARENT: roleDistribution.PARENT || 0,
          THERAPIST: roleDistribution.THERAPIST || 0,
          ADMIN: roleDistribution.ADMIN || 0
        }
      },
      consultationStats: {
        totalConsultations,
        completedConsultations,
        scheduledConsultations,
        cancelledConsultations,
        monthlyRevenue: monthlyRevenue._sum.fee || 0,
        averageConsultationFee: averageConsultationFee._avg.fee || 0
      },
      contentStats: {
        totalVideos,
        activeVideos,
        totalViews: totalViews._sum.views || 0,
        mostViewedVideos
      },
      systemStats: {
        totalChildren,
        totalAssessments,
        pendingTherapistApprovals,
        systemUptime: '99.9%' // This would be calculated from actual system monitoring
      },
      monthlyData
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('분석 데이터 조회 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}