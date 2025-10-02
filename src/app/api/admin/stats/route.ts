import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

// 관리자 통계 조회
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

    // 병렬로 통계 데이터 수집
    const [
      totalUsers,
      totalChildren,
      totalAssessments,
      totalVideos,
      totalPosts,
      totalNews,
      totalTherapists,
      totalConsultations,
      pendingTherapists,
      monthlyRevenue
    ] = await Promise.all([
      prisma.user.count(),
      prisma.child.count(),
      prisma.developmentAssessment.count(),
      prisma.video.count(),
      prisma.post.count(),
      prisma.news.count(),
      prisma.therapistProfile.count(),
      prisma.consultation.count(),
      prisma.therapistProfile.count({
        where: { status: 'PENDING' }
      }),
      prisma.consultation.aggregate({
        where: {
          status: 'COMPLETED',
          paymentStatus: 'PAID',
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        },
        _sum: {
          fee: true
        }
      })
    ])

    // 최근 7일간 사용자 증가 추이
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    })

    // 최근 활동 조회
    const recentActivities = await prisma.user.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    const stats = {
      users: totalUsers,
      children: totalChildren,
      assessments: totalAssessments,
      videos: totalVideos,
      posts: totalPosts,
      news: totalNews,
      therapists: totalTherapists,
      consultations: totalConsultations,
      pendingTherapists,
      monthlyRevenue: monthlyRevenue._sum.fee || 0,
      recentUsers,
      recentActivities
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('관리자 통계 조회 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}