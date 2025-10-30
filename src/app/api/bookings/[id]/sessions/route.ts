/**
 * 예약의 모든 세션 조회 API
 * GET /api/bookings/[id]/sessions
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    // 예약 정보 조회
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        child: true,
        parentUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        therapist: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        therapySessions: {
          orderBy: {
            sessionNumber: 'asc',
          },
        },
      },
    })

    if (!booking) {
      return NextResponse.json(
        { error: '예약을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 권한 확인: 치료사, 부모, 관리자만 조회 가능
    const isTherapist = booking.therapistId === session.user.therapistProfileId
    const isParent = booking.parentUserId === session.user.id
    const isAdmin = session.user.role === 'ADMIN'

    if (!isTherapist && !isParent && !isAdmin) {
      return NextResponse.json(
        { error: '세션 목록을 조회할 권한이 없습니다.' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        sessionType: booking.sessionType,
        sessionCount: booking.sessionCount,
        completedSessions: booking.completedSessions,
        scheduledAt: booking.scheduledAt,
        child: booking.child,
        parentUser: booking.parentUser,
        therapist: booking.therapist,
      },
      sessions: booking.therapySessions,
    })
  } catch (error) {
    console.error('세션 목록 조회 오류:', error)
    return NextResponse.json(
      { error: '세션 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
