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

    const bookings = await prisma.booking.findMany({
      select: {
        id: true,
        scheduledAt: true,
        duration: true,
        sessionType: true,
        sessionCount: true,
        status: true,
        paymentStatus: true,
        paidAt: true,
        finalFee: true,
        createdAt: true,
        parentUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        child: {
          select: {
            id: true,
            name: true,
          },
        },
        therapist: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        timeSlot: {
          select: {
            date: true,
            startTime: true,
            endTime: true,
          },
        },
      },
      orderBy: [
        {
          paymentStatus: 'asc', // PENDING first
        },
        {
          createdAt: 'desc',
        },
      ],
    })

    const formattedBookings = bookings.map((booking) => ({
      id: booking.id,
      scheduledAt: booking.scheduledAt.toISOString(),
      duration: booking.duration,
      sessionType: booking.sessionType,
      sessionCount: booking.sessionCount,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      paidAt: booking.paidAt?.toISOString() || null,
      finalFee: booking.finalFee,
      createdAt: booking.createdAt.toISOString(),
      parentUser: booking.parentUser,
      child: booking.child,
      therapist: booking.therapist,
      timeSlot: {
        date: booking.timeSlot.date.toISOString(),
        startTime: booking.timeSlot.startTime,
        endTime: booking.timeSlot.endTime,
      },
    }))

    return NextResponse.json({ bookings: formattedBookings })
  } catch (error) {
    console.error('예약 목록 조회 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
