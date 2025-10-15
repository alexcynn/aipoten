import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireTherapist } from '@/lib/auth-helpers'

/**
 * POST /api/bookings/[id]/confirm
 * 치료사가 예약을 확인
 *
 * Request Body:
 * {
 *   action: "confirm" | "reject",
 *   rejectionReason?: string (action이 "reject"일 때 필수)
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // RBAC: THERAPIST 또는 ADMIN 권한 확인
    const { error, user } = await requireTherapist()
    if (error) return error

    const bookingId = params.id
    const body = await request.json()
    const { action, rejectionReason } = body

    console.log('📥 예약 확인 요청:', { bookingId, action, therapist: user.id })

    // Validation
    if (!action || !['confirm', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'action은 "confirm" 또는 "reject"이어야 합니다.' },
        { status: 400 }
      )
    }

    if (action === 'reject' && !rejectionReason) {
      return NextResponse.json(
        { error: '거절 시 사유를 입력해야 합니다.' },
        { status: 400 }
      )
    }

    // 치료사 프로필 확인
    const therapistProfile = await prisma.therapistProfile.findUnique({
      where: { userId: user.id }
    })

    if (!therapistProfile) {
      return NextResponse.json(
        { error: '치료사 프로필을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 예약 조회
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        timeSlot: true,
        parentUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        child: true
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: '예약을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 해당 치료사의 예약인지 확인
    if (booking.therapistId !== therapistProfile.id) {
      return NextResponse.json(
        { error: '본인의 예약만 확인할 수 있습니다.' },
        { status: 403 }
      )
    }

    // 예약 상태 확인 (PENDING_CONFIRMATION만 처리 가능)
    if (booking.status !== 'PENDING_CONFIRMATION') {
      return NextResponse.json(
        { error: '이미 처리된 예약입니다.' },
        { status: 400 }
      )
    }

    console.log('✅ 예약 확인:', {
      booking: booking.id,
      parent: booking.parentUser.name,
      child: booking.child.name,
      scheduledAt: booking.scheduledAt
    })

    // 확인 또는 거절 처리
    if (action === 'confirm') {
      // 예약 확인
      const updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: 'CONFIRMED',
          confirmedAt: new Date(),
          confirmedBy: user.id
        },
        include: {
          timeSlot: true,
          parentUser: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          child: true
        }
      })

      console.log('✅ 예약 확인 완료:', updatedBooking.id)

      // TODO: 부모에게 확인 알림 전송 (이메일, 푸시 등)

      return NextResponse.json({
        message: '예약이 확인되었습니다.',
        booking: updatedBooking
      })

    } else {
      // 예약 거절
      const updatedBooking = await prisma.$transaction(async (tx) => {
        // 예약 상태 업데이트
        const rejected = await tx.booking.update({
          where: { id: bookingId },
          data: {
            status: 'REJECTED',
            rejectedAt: new Date(),
            rejectionReason
          },
          include: {
            timeSlot: true,
            parentUser: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            child: true
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

        return rejected
      })

      console.log('✅ 예약 거절 완료:', updatedBooking.id)

      // TODO: 부모에게 거절 알림 전송 (이메일, 푸시 등)
      // TODO: 결제가 이미 완료된 경우 환불 처리

      return NextResponse.json({
        message: '예약이 거절되었습니다.',
        booking: updatedBooking
      })
    }

  } catch (error) {
    console.error('❌ 예약 확인 오류:', error)
    return NextResponse.json(
      {
        error: '서버 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
