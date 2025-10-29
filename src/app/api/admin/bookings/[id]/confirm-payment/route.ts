import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const bookingId = params.id

    // 예약 확인
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        status: true,
      },
    })

    if (!booking) {
      return NextResponse.json(
        { error: '예약을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (booking.status !== 'PENDING_PAYMENT') {
      return NextResponse.json(
        { error: '결제 대기 중인 예약만 승인할 수 있습니다.' },
        { status: 400 }
      )
    }

    // 결제 상태를 PAID로, 예약 상태를 BOOKING_IN_PROGRESS로 변경
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paidAt: new Date(),
        // 결제 대기 상태면 예약 중 상태로 변경
        status: booking.status === 'PENDING_PAYMENT' ? 'BOOKING_IN_PROGRESS' : booking.status,
      },
      select: {
        id: true,
        paidAt: true,
        status: true,
      },
    })

    return NextResponse.json({
      message: '결제가 승인되었습니다.',
      booking: {
        id: updatedBooking.id,
        paidAt: updatedBooking.paidAt?.toISOString(),
        status: updatedBooking.status,
      },
    })
  } catch (error) {
    console.error('결제 승인 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
