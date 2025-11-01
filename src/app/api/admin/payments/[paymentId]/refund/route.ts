import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

// POST - 환불 처리 (Payment 기반)
export async function POST(
  request: NextRequest,
  { params }: { params: { paymentId: string } }
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

    const { refundAmount, refundReason } = await request.json()
    const paymentId = params.paymentId

    if (!refundAmount || refundAmount <= 0) {
      return NextResponse.json(
        { error: '환불 금액을 입력해주세요.' },
        { status: 400 }
      )
    }

    // 결제 정보 찾기
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        bookings: true,
      },
    })

    if (!payment) {
      return NextResponse.json(
        { error: '결제 정보를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 환불 불가능한 상태 체크
    if (payment.status === 'REFUNDED' || payment.status === 'PARTIALLY_REFUNDED') {
      return NextResponse.json(
        { error: '이미 환불된 결제입니다.' },
        { status: 400 }
      )
    }

    if (payment.status !== 'PAID') {
      return NextResponse.json(
        { error: '결제 완료된 건만 환불할 수 있습니다.' },
        { status: 400 }
      )
    }

    // 환불 금액이 결제 금액보다 큰지 체크
    if (refundAmount > payment.finalFee) {
      return NextResponse.json(
        { error: '환불 금액이 결제 금액보다 클 수 없습니다.' },
        { status: 400 }
      )
    }

    // 완전 환불인지 부분 환불인지 판단
    const isFullRefund = refundAmount === payment.finalFee
    const newStatus = isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED'

    // 환불 처리
    await prisma.$transaction([
      // Payment 상태 업데이트
      prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: newStatus,
          refundedAt: new Date(),
          refundAmount,
          refundReason,
        },
      }),
      // 예약들 취소 처리
      prisma.booking.updateMany({
        where: {
          paymentId: paymentId,
          status: 'SCHEDULED', // 아직 진행하지 않은 세션만 취소
        },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancelledBy: session.user.id,
          cancellationReason: refundReason,
        },
      }),
      // 환불 요청 기록 생성
      prisma.refundRequest.create({
        data: {
          paymentId: paymentId,
          requestedBy: payment.parentUserId,
          reason: refundReason || '관리자 직접 환불',
          requestedAmount: refundAmount,
          status: 'APPROVED',
          processedBy: session.user.id,
          processedAt: new Date(),
          approvedAmount: refundAmount,
          adminNote: '관리자가 직접 환불 처리함',
        },
      }),
    ])

    return NextResponse.json({
      message: '환불이 완료되었습니다.',
      refundType: isFullRefund ? 'full' : 'partial',
      refundAmount,
    })
  } catch (error) {
    console.error('환불 처리 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
