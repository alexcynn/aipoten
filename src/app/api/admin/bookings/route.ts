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
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    console.log('📥 [관리자 API] 예약 목록 조회 요청, 날짜:', startDate, '~', endDate)

    // 날짜 필터 조건 구성
    const where: any = {}

    if (startDate || endDate) {
      where.scheduledAt = {}

      if (startDate) {
        const [year, month, day] = startDate.split('-').map(Number)
        where.scheduledAt.gte = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
      }

      if (endDate) {
        const [year, month, day] = endDate.split('-').map(Number)
        where.scheduledAt.lte = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999))
      }
    }

    // sessionType 필터 추가
    const sessionType = searchParams.get('sessionType')
    if (sessionType) {
      where.payment = {
        sessionType: sessionType
      }
    }

    const bookings = await prisma.booking.findMany({
      where,
      select: {
        id: true,
        scheduledAt: true,
        duration: true,
        sessionNumber: true,
        status: true,
        createdAt: true,
        completedAt: true,
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
        payment: {
          select: {
            id: true,
            sessionType: true,
            totalSessions: true,
            status: true,
            paidAt: true,
            finalFee: true,
            originalFee: true,
            discountRate: true,
          },
        },
      },
      orderBy: [
        {
          createdAt: 'desc',
        },
      ],
    })

    const formattedBookings = bookings.map((booking) => ({
      id: booking.id,
      scheduledAt: booking.scheduledAt.toISOString(),
      duration: booking.duration,
      sessionNumber: booking.sessionNumber,
      status: booking.status,
      createdAt: booking.createdAt.toISOString(),
      completedAt: booking.completedAt?.toISOString() || null,
      parentUser: booking.parentUser,
      child: booking.child,
      therapist: booking.therapist,
      timeSlot: {
        date: booking.timeSlot.date.toISOString(),
        startTime: booking.timeSlot.startTime,
        endTime: booking.timeSlot.endTime,
      },
      payment: {
        id: booking.payment.id,
        sessionType: booking.payment.sessionType,
        totalSessions: booking.payment.totalSessions,
        status: booking.payment.status,
        paidAt: booking.payment.paidAt?.toISOString() || null,
        finalFee: booking.payment.finalFee,
        originalFee: booking.payment.originalFee,
        discountRate: booking.payment.discountRate,
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
