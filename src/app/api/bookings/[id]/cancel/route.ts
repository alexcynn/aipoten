import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

/**
 * POST /api/bookings/[id]/cancel
 * 부모가 예약을 취소
 *
 * Request Body:
 * {
 *   cancellationReason: string
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 인증 확인
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const bookingId = params.id
    const body = await request.json()
    const { cancellationReason } = body

    console.log('📥 예약 취소 요청:', { bookingId, userId, cancellationReason })

    // Validation
    if (!cancellationReason) {
      return NextResponse.json(
        { error: '취소 사유를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 예약 조회
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        timeSlot: true,
        therapist: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: '예약을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 본인의 예약인지 확인
    if (booking.parentUserId !== userId) {
      return NextResponse.json(
        { error: '본인의 예약만 취소할 수 있습니다.' },
        { status: 403 }
      )
    }

    // 취소 가능한 상태인지 확인
    if (!['PENDING_CONFIRMATION', 'CONFIRMED'].includes(booking.status)) {
      return NextResponse.json(
        { error: '취소할 수 없는 예약입니다.' },
        { status: 400 }
      )
    }

    // 이미 취소된 예약
    if (booking.status === 'CANCELLED') {
      return NextResponse.json(
        { error: '이미 취소된 예약입니다.' },
        { status: 400 }
      )
    }

    console.log('✅ 예약 확인:', {
      booking: booking.id,
      status: booking.status,
      scheduledAt: booking.scheduledAt
    })

    // 환불 금액 계산
    let refundAmount = 0
    const now = new Date()
    const scheduledAt = new Date(booking.scheduledAt)
    const hoursUntilAppointment = (scheduledAt.getTime() - now.getTime()) / (1000 * 60 * 60)

    // 환불 정책:
    // - 24시간 이전 취소: 100% 환불
    // - 12-24시간 이전 취소: 50% 환불
    // - 12시간 이내 취소: 환불 없음
    if (booking.paidAt) {
      if (hoursUntilAppointment >= 24) {
        refundAmount = booking.finalFee
      } else if (hoursUntilAppointment >= 12) {
        refundAmount = Math.round(booking.finalFee * 0.5)
      } else {
        refundAmount = 0
      }
    }

    console.log('💰 환불 금액 계산:', {
      hoursUntilAppointment,
      finalFee: booking.finalFee,
      refundAmount
    })

    // 트랜잭션으로 예약 취소 및 타임슬롯 업데이트
    const cancelledBooking = await prisma.$transaction(async (tx) => {
      // 예약 상태 업데이트
      const cancelled = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancelledBy: userId,
          cancellationReason,
          refundAmount
        },
        include: {
          timeSlot: true,
          therapist: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      })

      // 타임슬롯 예약 카운트 감소
      await tx.timeSlot.update({
        where: { id: booking.timeSlotId },
        data: {
          currentBookings: {
            decrement: 1
          }
        }
      })

      return cancelled
    })

    console.log('✅ 예약 취소 완료:', cancelledBooking.id)

    // TODO: 치료사에게 취소 알림 전송 (이메일, 푸시 등)
    // TODO: 결제 시스템과 연동하여 실제 환불 처리

    return NextResponse.json({
      message: '예약이 취소되었습니다.',
      booking: cancelledBooking,
      refund: {
        amount: refundAmount,
        description: hoursUntilAppointment >= 24
          ? '100% 환불 (24시간 이전 취소)'
          : hoursUntilAppointment >= 12
          ? '50% 환불 (12-24시간 이전 취소)'
          : '환불 불가 (12시간 이내 취소)'
      }
    })

  } catch (error) {
    console.error('❌ 예약 취소 오류:', error)
    return NextResponse.json(
      {
        error: '서버 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
