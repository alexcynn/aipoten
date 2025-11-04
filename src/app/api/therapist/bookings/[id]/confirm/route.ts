import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/therapist/bookings/[id]/confirm
 * 치료사가 예약을 확인
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    // 치료사 권한 확인
    if (!session?.user || session.user.role !== 'THERAPIST') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const { id: bookingId } = await params

    // 예약 조회
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        payment: {
          select: {
            id: true,
            status: true,
          },
        },
        therapist: {
          select: {
            userId: true,
          },
        },
      },
    })

    if (!booking) {
      return NextResponse.json({ error: '예약을 찾을 수 없습니다.' }, { status: 404 })
    }

    // 본인 예약인지 확인
    if (booking.therapist.userId !== session.user.id) {
      return NextResponse.json({ error: '본인의 예약만 확인할 수 있습니다.' }, { status: 403 })
    }

    // 상태 검증
    if (booking.status !== 'PENDING_CONFIRMATION') {
      return NextResponse.json(
        { error: `현재 상태(${booking.status})에서는 예약 확인을 할 수 없습니다.` },
        { status: 400 }
      )
    }

    // 결제 완료 여부 확인
    if (booking.payment.status !== 'PAID') {
      return NextResponse.json(
        { error: '결제가 완료되지 않은 예약은 확인할 수 없습니다.' },
        { status: 400 }
      )
    }

    // 예약 확인 처리
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CONFIRMED',
        confirmedAt: new Date(),
      },
      include: {
        child: {
          select: {
            id: true,
            name: true,
          },
        },
        parentUser: {
          select: {
            id: true,
            name: true,
            email: true,
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
    })

    console.log(`✅ 예약 확인 완료: ${bookingId}`)

    return NextResponse.json({
      success: true,
      message: '예약이 확인되었습니다.',
      booking: {
        id: updatedBooking.id,
        status: updatedBooking.status,
        confirmedAt: updatedBooking.confirmedAt,
        scheduledAt: updatedBooking.scheduledAt,
        child: updatedBooking.child,
        parent: updatedBooking.parentUser,
        timeSlot: updatedBooking.timeSlot,
      },
    })
  } catch (error) {
    console.error('❌ 예약 확인 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
