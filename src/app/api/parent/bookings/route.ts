import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

// GET - 부모의 예약(세션) 내역 조회 (Booking 기반)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'PARENT') {
      return NextResponse.json(
        { error: '부모 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // ALL, SCHEDULED, COMPLETED, CANCELLED
    const sessionType = searchParams.get('sessionType') // ALL, CONSULTATION, THERAPY
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // 본인의 예약만 조회
    const where: any = {
      parentUserId: session.user.id,
    }

    // 상태 필터 (다중 상태 지원, BookingStatus와 PaymentStatus 분리)
    if (status && status !== 'ALL') {
      const statusList = status.split(',')

      // BookingStatus와 PaymentStatus 분리
      const bookingStatuses = statusList.filter((s: string) =>
        ['PENDING_CONFIRMATION', 'CONFIRMED', 'SCHEDULED', 'PENDING_SETTLEMENT', 'SETTLEMENT_COMPLETED', 'COMPLETED', 'CANCELLED', 'REJECTED', 'NO_SHOW'].includes(s)
      )
      const paymentStatuses = statusList.filter((s: string) =>
        ['PENDING_PAYMENT', 'PAID', 'REFUNDED', 'PARTIALLY_REFUNDED', 'FAILED'].includes(s)
      )

      // OR 조건으로 결합
      if (bookingStatuses.length > 0 && paymentStatuses.length > 0) {
        where.OR = [
          { status: bookingStatuses.length === 1 ? bookingStatuses[0] : { in: bookingStatuses } },
          { payment: { status: paymentStatuses.length === 1 ? paymentStatuses[0] : { in: paymentStatuses } } }
        ]
      } else if (bookingStatuses.length > 0) {
        where.status = bookingStatuses.length === 1 ? bookingStatuses[0] : { in: bookingStatuses }
      } else if (paymentStatuses.length > 0) {
        where.payment = where.payment || {}
        where.payment.status = paymentStatuses.length === 1 ? paymentStatuses[0] : { in: paymentStatuses }
      }
    }

    // 세션 타입 필터
    if (sessionType && sessionType !== 'ALL') {
      where.payment = where.payment || {}
      where.payment.sessionType = sessionType
    }

    // 날짜 필터
    if (startDate || endDate) {
      where.scheduledAt = {}
      if (startDate) {
        where.scheduledAt.gte = new Date(startDate)
      }
      if (endDate) {
        const endDateTime = new Date(endDate)
        endDateTime.setHours(23, 59, 59, 999)
        where.scheduledAt.lte = endDateTime
      }
    }

    // 전체 개수 조회
    const total = await prisma.booking.count({ where })

    // 페이지네이션 적용
    const bookings = await prisma.booking.findMany({
      where,
      include: {
        payment: {
          select: {
            id: true,
            sessionType: true,
            totalSessions: true,
            originalFee: true,
            discountRate: true,
            finalFee: true,
            status: true,
            paidAt: true,
          },
        },
        child: {
          select: {
            id: true,
            name: true,
            birthDate: true,
            gender: true,
          },
        },
        therapist: {
          select: {
            id: true,
            userId: true,
            user: {
              select: {
                name: true,
                phone: true,
              },
            },
            specialties: true,
            education: true,
            introduction: true,
          },
        },
        timeSlot: true,
        review: {
          select: {
            id: true,
            rating: true,
            content: true,
            createdAt: true,
          },
        },
      },
      orderBy: [
        { scheduledAt: 'desc' },
        { sessionNumber: 'asc' },
      ],
      skip: (page - 1) * limit,
      take: limit,
    })

    return NextResponse.json({
      bookings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('부모 예약 내역 조회 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
