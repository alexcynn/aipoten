import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// POST - 환불 요청 생성
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'PARENT') {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    const { paymentId } = await params
    const { reason, requestedAmount } = await request.json()

    // 입력 검증
    if (!reason || reason.trim().length < 10) {
      return NextResponse.json(
        { error: '환불 사유를 최소 10자 이상 입력해주세요.' },
        { status: 400 }
      )
    }

    if (!requestedAmount || requestedAmount <= 0) {
      return NextResponse.json(
        { error: '환불 요청 금액을 입력해주세요.' },
        { status: 400 }
      )
    }

    // Payment 조회
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        bookings: true,
        refundRequests: {
          where: {
            status: 'PENDING'
          }
        }
      }
    })

    if (!payment) {
      return NextResponse.json(
        { error: '결제 정보를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 본인의 결제인지 확인
    if (payment.parentUserId !== session.user.id) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    // 이미 환불된 결제인지 확인
    if (payment.status === 'REFUNDED' || payment.status === 'PARTIALLY_REFUNDED') {
      return NextResponse.json(
        { error: '이미 환불된 결제입니다.' },
        { status: 400 }
      )
    }

    // 완료된 결제는 환불 불가 (모든 세션이 완료된 경우)
    const allCompleted = payment.bookings.every(
      (b: any) => b.status === 'PENDING_SETTLEMENT' || b.status === 'SETTLEMENT_COMPLETED'
    )
    if (allCompleted && payment.bookings.length > 0) {
      return NextResponse.json(
        { error: '이미 모든 세션이 완료된 결제는 환불할 수 없습니다.' },
        { status: 400 }
      )
    }

    // 이미 대기 중인 환불 요청이 있는지 확인
    if (payment.refundRequests.length > 0) {
      return NextResponse.json(
        { error: '이미 처리 중인 환불 요청이 있습니다.' },
        { status: 400 }
      )
    }

    // 환불 요청 금액 검증
    if (requestedAmount > payment.finalFee) {
      return NextResponse.json(
        { error: '환불 요청 금액이 결제 금액을 초과할 수 없습니다.' },
        { status: 400 }
      )
    }

    // 환불 요청 생성
    const refundRequest = await prisma.refundRequest.create({
      data: {
        paymentId: payment.id,
        requestedBy: session.user.id,
        reason: reason.trim(),
        requestedAmount,
        status: 'PENDING'
      },
      include: {
        payment: {
          include: {
            child: true,
            therapist: {
              include: {
                user: true
              }
            }
          }
        },
        requestedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    })

    // TODO: 관리자에게 알림 전송 (선택적 구현)
    // await sendAdminNotification({
    //   type: 'NEW_REFUND_REQUEST',
    //   refundRequestId: refundRequest.id
    // })

    return NextResponse.json({
      success: true,
      refundRequest
    }, { status: 201 })
  } catch (error) {
    console.error('환불 요청 생성 오류:', error)
    return NextResponse.json(
      { error: '환불 요청 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
