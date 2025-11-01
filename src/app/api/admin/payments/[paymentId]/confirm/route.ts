import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

// POST - 입금 확인 및 결제 승인
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

    const paymentId = params.paymentId

    // 결제 정보 조회
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    })

    if (!payment) {
      return NextResponse.json(
        { error: '결제 정보를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (payment.status !== 'PENDING_PAYMENT') {
      return NextResponse.json(
        { error: '입금 대기 상태가 아닙니다.' },
        { status: 400 }
      )
    }

    // 결제 승인 처리
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        depositConfirmedAt: new Date(),
        depositConfirmedBy: session.user.id,
      },
    })

    return NextResponse.json({
      message: '입금이 확인되었습니다.',
      payment: updatedPayment,
    })
  } catch (error) {
    console.error('입금 확인 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
