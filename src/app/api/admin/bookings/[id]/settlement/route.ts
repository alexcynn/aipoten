import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// POST - 정산 처리
export async function POST(request: NextRequest, { params }: RouteParams) {
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

    const { id } = await params
    const body = await request.json()
    const { settlementNote } = body // settlementAmount는 자동 계산

    // 예약 조회 (Payment, Therapist 포함)
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        payment: {
          include: {
            therapist: {
              select: {
                consultationSettlementAmount: true,
              },
            },
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

    // 상태 검증
    if (booking.status !== 'PENDING_SETTLEMENT') {
      return NextResponse.json(
        { error: `현재 상태(${booking.status})에서는 정산 처리를 할 수 없습니다.` },
        { status: 400 }
      )
    }

    // 정산 금액 자동 계산
    let settlementAmount: number

    if (booking.sessionType === 'CONSULTATION') {
      // 언어컨설팅: 미리 설정된 정산금 사용 (필수)
      if (!booking.payment.therapist.consultationSettlementAmount) {
        return NextResponse.json(
          { error: '이 치료사는 언어 컨설팅 정산금이 설정되지 않았습니다.' },
          { status: 400 }
        )
      }
      settlementAmount = booking.payment.therapist.consultationSettlementAmount
    } else {
      // 홈티: 결제 금액 - 플랫폼 수수료
      if (booking.payment.platformFee) {
        settlementAmount = booking.payment.finalFee - booking.payment.platformFee
      } else {
        // platformFee가 없는 경우 (레거시 데이터) 정산율로 계산
        const systemSettings = await prisma.systemSettings.findUnique({
          where: { id: 'system' },
        })
        const settlementRate = systemSettings?.settlementRate || 5
        const platformFee = Math.round(booking.payment.finalFee * (settlementRate / 100))
        settlementAmount = booking.payment.finalFee - platformFee
      }
    }

    console.log(`💰 정산 금액 자동 계산:`, {
      bookingId: id,
      sessionType: booking.sessionType,
      settlementAmount,
    })

    // 트랜잭션으로 Booking 상태 변경 및 Payment 정산 정보 업데이트
    const result = await prisma.$transaction(async (tx) => {
      // Payment 정산 정보 업데이트
      const updatedPayment = await tx.payment.update({
        where: { id: booking.paymentId },
        data: {
          settlementAmount,
          settledAt: new Date(),
          settlementNote: settlementNote || '정산 완료',
        },
      })

      // Booking 상태 변경
      const updatedBooking = await tx.booking.update({
        where: { id },
        data: {
          status: 'SETTLEMENT_COMPLETED',
        },
      })

      return { booking: updatedBooking, payment: updatedPayment }
    })

    console.log(`✅ 정산 처리 완료: ${id}`)

    return NextResponse.json({
      success: true,
      message: '정산 처리가 완료되었습니다.',
      booking: result.booking,
      payment: {
        id: result.payment.id,
        settlementAmount: result.payment.settlementAmount,
        settledAt: result.payment.settledAt,
      },
    })
  } catch (error) {
    console.error('❌ 정산 처리 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
