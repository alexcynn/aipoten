import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-config"
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    // 관리자 권한 확인 (실제로는 role 필드를 확인해야 함)
    const isAdmin = session.user?.email === 'admin@aipoten.com' ||
                   session.user?.name === 'admin'

    if (!isAdmin) {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
    }

    // 통계 데이터 수집
    const [
      usersCount,
      childrenCount,
      assessmentsCount,
      videosCount,
      postsCount,
      newsCount
    ] = await Promise.all([
      prisma.user.count(),
      prisma.child.count(),
      prisma.developmentAssessment.count(),
      prisma.video.count(),
      prisma.post.count(),
      prisma.news.count()
    ])

    const stats = {
      users: usersCount,
      children: childrenCount,
      assessments: assessmentsCount,
      videos: videosCount,
      posts: postsCount,
      news: newsCount
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