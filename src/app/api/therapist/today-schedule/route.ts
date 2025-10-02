import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

// 치료사의 오늘 일정 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'THERAPIST') {
      return NextResponse.json(
        { error: '치료사 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    // 치료사 프로필 확인
    const therapistProfile = await prisma.therapistProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!therapistProfile) {
      return NextResponse.json(
        { error: '치료사 프로필을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 오늘 날짜 범위 설정
    const today = new Date()
    const startOfDay = new Date(today.setHours(0, 0, 0, 0))
    const endOfDay = new Date(today.setHours(23, 59, 59, 999))

    const todayConsultations = await prisma.consultation.findMany({
      where: {
        therapistId: therapistProfile.id,
        scheduledAt: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: 'SCHEDULED'
      },
      include: {
        parentUser: {
          select: {
            name: true
          }
        },
        child: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        scheduledAt: 'asc'
      }
    })

    // 데이터 포맷팅
    const formattedSchedule = todayConsultations.map(consultation => ({
      id: consultation.id,
      time: consultation.scheduledAt.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      childName: consultation.child.name,
      parentName: consultation.parentUser.name,
      type: consultation.type === 'ONLINE' ? '온라인 상담' :
            consultation.type === 'OFFLINE' ? '오프라인 상담' : '방문 상담',
      duration: consultation.duration,
      scheduledAt: consultation.scheduledAt.toISOString()
    }))

    return NextResponse.json(formattedSchedule)
  } catch (error) {
    console.error('오늘 일정 조회 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}