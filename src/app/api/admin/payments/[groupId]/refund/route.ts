import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

export async function POST(
  request: NextRequest,
  { params }: { params: { groupId: string } }
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
    const groupId = params.groupId

    if (!refundAmount || refundAmount <= 0) {
      return NextResponse.json(
        { error: '환불 금액을 입력해주세요.' },
        { status: 400 }
      )
    }

    // 그룹의 모든 예약 찾기
    const bookings = await prisma.booking.findMany({
      where: {
        OR: [
          { id: groupId },
          { bookingGroupId: groupId },
        ],
      },
    })

    if (bookings.length === 0) {
      return NextResponse.json(
        { error: '예약을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 환불 불가능한 상태 체크
    const alreadyRefunded = bookings.some((b) => b.status === 'REFUNDED')
    if (alreadyRefunded) {
      return NextResponse.json(
        { error: '이미 환불된 예약입니다.' },
        { status: 400 }
      )
    }

    const notPaid = bookings.some((b) => !b.paidAt)
    if (notPaid) {
      return NextResponse.json(
        { error: '결제되지 않은 예약은 환불할 수 없습니다.' },
        { status: 400 }
      )
    }

    // 그룹의 대표 예약
    const representativeBooking = bookings[0]

    // 환불 처리 - 그룹의 모든 예약 상태 변경
    await prisma.$transaction([
      // 모든 예약 상태를 REFUNDED로 변경
      prisma.booking.updateMany({
        where: {
          id: { in: bookings.map((b) => b.id) },
        },
        data: {
          status: 'REFUNDED',
          refundAmount,
          cancelledAt: new Date(),
          cancelledBy: session.user.id,
          cancellationReason: refundReason,
        },
      }),
      // 환불 요청 기록 생성 (대표 예약으로)
      prisma.refundRequest.create({
        data: {
          bookingId: representativeBooking.id,
          requestedBy: representativeBooking.parentUserId,
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
      refundedBookings: bookings.length,
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
