import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

/**
 * POST /api/admin/bookings/[id]/refund
 * 예약 환불 처리
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    // 관리자 권한 확인
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 })
    }

    const { id: bookingId } = await params
    const body = await request.json()
    const { refundAmount, refundType, refundNote } = body

    // 검증
    if (!refundAmount || refundAmount <= 0) {
      return NextResponse.json({ error: '환불 금액을 입력해주세요.' }, { status: 400 })
    }

    if (!refundType || !['FULL', 'PARTIAL'].includes(refundType)) {
      return NextResponse.json({ error: '환불 유형을 선택해주세요.' }, { status: 400 })
    }

    // 예약 조회
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        payment: true,
      },
    })

    if (!booking) {
      return NextResponse.json({ error: '예약을 찾을 수 없습니다.' }, { status: 404 })
    }

    // 이미 환불된 경우
    if (booking.status === 'REFUNDED' || booking.payment.status === 'REFUNDED') {
      return NextResponse.json({ error: '이미 환불 처리된 예약입니다.' }, { status: 400 })
    }

    // 환불 금액 검증
    if (refundAmount > booking.payment.finalFee) {
      return NextResponse.json(
        { error: '환불 금액이 결제 금액을 초과할 수 없습니다.' },
        { status: 400 }
      )
    }

    // 전액 환불 검증
    if (refundType === 'FULL' && refundAmount !== booking.payment.finalFee) {
      return NextResponse.json(
        { error: '전액 환불 시 환불 금액은 결제 금액과 같아야 합니다.' },
        { status: 400 }
      )
    }

    // 트랜잭션으로 환불 처리
    const result = await prisma.$transaction(async (tx) => {
      // Payment 상태 업데이트
      const paymentStatus = refundType === 'FULL' ? 'REFUNDED' : 'PARTIALLY_REFUNDED'
      const updatedPayment = await tx.payment.update({
        where: { id: booking.paymentId },
        data: {
          status: paymentStatus,
          refundAmount,
          refundedAt: new Date(),
          refundReason: refundNote || '관리자 환불 처리',
        },
      })

      // Booking 상태 업데이트 (전액 환불인 경우만)
      let updatedBooking
      if (refundType === 'FULL') {
        updatedBooking = await tx.booking.update({
          where: { id: bookingId },
          data: {
            status: 'REFUNDED',
          },
        })
      } else {
        // 부분 환불인 경우 상태는 유지
        updatedBooking = booking
      }

      // TimeSlot 복원 (전액 환불이고 아직 세션이 시작되지 않은 경우)
      if (refundType === 'FULL' && booking.status === 'PENDING_CONFIRMATION') {
        await tx.timeSlot.update({
          where: { id: booking.timeSlotId },
          data: {
            currentBookings: {
              decrement: 1,
            },
          },
        })
      }

      return { booking: updatedBooking, payment: updatedPayment }
    })

    console.log(`✅ 환불 처리 완료: ${bookingId} (${refundType}, ${refundAmount}원)`)

    return NextResponse.json({
      success: true,
      message: '환불 처리가 완료되었습니다.',
      booking: {
        id: result.booking.id,
        status: result.booking.status,
      },
      payment: {
        id: result.payment.id,
        status: result.payment.status,
        refundAmount: result.payment.refundAmount,
        refundedAt: result.payment.refundedAt,
      },
    })
  } catch (error) {
    console.error('❌ 환불 처리 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
