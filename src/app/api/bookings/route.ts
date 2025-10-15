import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

/**
 * POST /api/bookings
 * 부모가 치료사 예약을 생성
 *
 * Request Body:
 * {
 *   timeSlotId: string,
 *   childId: string,
 *   sessionType: "CONSULTATION" | "THERAPY",
 *   sessionCount: 1 | 4 | 8 | 12,
 *   visitAddress?: string,
 *   visitAddressDetail?: string,
 *   parentNote?: string
 * }
 */
export async function POST(request: NextRequest) {
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
    console.log('📥 예약 생성 요청:', userId)

    const body = await request.json()
    const {
      timeSlotId,
      childId,
      sessionType,
      sessionCount,
      visitAddress,
      visitAddressDetail,
      parentNote
    } = body

    console.log('📋 예약 정보:', {
      timeSlotId,
      childId,
      sessionType,
      sessionCount,
      visitAddress,
      parentNote
    })

    // Validation
    if (!timeSlotId || !childId || !sessionType || !sessionCount) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      )
    }

    // 세션 타입별 세션 수 검증
    if (sessionType === 'CONSULTATION' && sessionCount !== 1) {
      return NextResponse.json(
        { error: '상담은 1회만 가능합니다.' },
        { status: 400 }
      )
    }

    if (sessionType === 'THERAPY' && ![1, 4, 8, 12].includes(sessionCount)) {
      return NextResponse.json(
        { error: '치료는 1회, 4회, 8회, 12회만 가능합니다.' },
        { status: 400 }
      )
    }

    // 아이가 부모의 자녀인지 확인
    const child = await prisma.child.findFirst({
      where: {
        id: childId,
        parentUserId: userId
      }
    })

    if (!child) {
      return NextResponse.json(
        { error: '자녀 정보를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    console.log('✅ 자녀 확인:', child.name)

    // 타임슬롯 확인 및 가용성 검증
    const timeSlot = await prisma.timeSlot.findUnique({
      where: { id: timeSlotId },
      include: {
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

    if (!timeSlot) {
      return NextResponse.json(
        { error: '타임슬롯을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 가용성 확인
    if (!timeSlot.isAvailable || timeSlot.isHoliday || timeSlot.isBufferBlocked) {
      return NextResponse.json(
        { error: '해당 시간은 예약할 수 없습니다.' },
        { status: 400 }
      )
    }

    if (timeSlot.currentBookings > 0) {
      return NextResponse.json(
        { error: '이미 예약된 시간입니다.' },
        { status: 400 }
      )
    }

    console.log('✅ 타임슬롯 가용 확인:', {
      therapist: timeSlot.therapist.user.name,
      date: timeSlot.date,
      time: `${timeSlot.startTime}-${timeSlot.endTime}`
    })

    // 치료사가 승인된 상태인지 확인
    if (timeSlot.therapist.approvalStatus !== 'APPROVED') {
      return NextResponse.json(
        { error: '해당 치료사는 현재 예약을 받을 수 없습니다.' },
        { status: 400 }
      )
    }

    // 요금 계산
    const sessionFee = timeSlot.therapist.sessionFee || 0
    const discountRate = sessionCount >= 12 ? 20 : sessionCount >= 8 ? 15 : sessionCount >= 4 ? 10 : 0
    const originalFee = sessionFee * sessionCount
    const finalFee = Math.round(originalFee * (1 - discountRate / 100))

    console.log('💰 요금 계산:', {
      sessionFee,
      sessionCount,
      discountRate,
      originalFee,
      finalFee
    })

    // 예약 생성일로부터 48시간 후를 확인 마감시간으로 설정
    const confirmationDeadline = new Date()
    confirmationDeadline.setHours(confirmationDeadline.getHours() + 48)

    // 스케줄 시간 (타임슬롯의 날짜 + 시작 시간)
    const [hours, minutes] = timeSlot.startTime.split(':').map(Number)
    const scheduledAt = new Date(timeSlot.date)
    scheduledAt.setHours(hours, minutes, 0, 0)

    // 트랜잭션으로 예약 생성 및 타임슬롯 업데이트
    const booking = await prisma.$transaction(async (tx) => {
      // 예약 생성
      const newBooking = await tx.booking.create({
        data: {
          timeSlotId,
          parentUserId: userId,
          childId,
          therapistId: timeSlot.therapistId,
          scheduledAt,
          sessionType,
          sessionCount,
          originalFee,
          discountRate,
          finalFee,
          visitAddress,
          visitAddressDetail,
          parentNote,
          confirmationDeadline,
          status: 'PENDING_CONFIRMATION'
        },
        include: {
          timeSlot: true,
          child: true,
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

      // 타임슬롯 예약 카운트 증가
      await tx.timeSlot.update({
        where: { id: timeSlotId },
        data: {
          currentBookings: {
            increment: 1
          }
        }
      })

      return newBooking
    })

    console.log('✅ 예약 생성 완료:', booking.id)

    return NextResponse.json(
      {
        message: '예약이 생성되었습니다. 치료사의 확인을 기다려주세요.',
        booking: {
          id: booking.id,
          scheduledAt: booking.scheduledAt,
          sessionType: booking.sessionType,
          sessionCount: booking.sessionCount,
          status: booking.status,
          originalFee: booking.originalFee,
          discountRate: booking.discountRate,
          finalFee: booking.finalFee,
          confirmationDeadline: booking.confirmationDeadline,
          therapist: {
            id: booking.therapist.id,
            name: booking.therapist.user.name
          },
          child: {
            id: booking.child.id,
            name: booking.child.name
          }
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('❌ 예약 생성 오류:', error)
    return NextResponse.json(
      {
        error: '서버 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/bookings
 * 부모의 예약 목록 조회
 *
 * Query Parameters:
 * - status: BookingStatus (선택)
 * - childId: string (선택)
 */
export async function GET(request: NextRequest) {
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
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const childId = searchParams.get('childId')

    console.log('📥 예약 목록 조회:', { userId, status, childId })

    const where: any = {
      parentUserId: userId
    }

    if (status) {
      where.status = status
    }

    if (childId) {
      where.childId = childId
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        timeSlot: true,
        child: true,
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
      },
      orderBy: {
        scheduledAt: 'desc'
      }
    })

    console.log(`✅ ${bookings.length}개의 예약 조회 완료`)

    return NextResponse.json({
      bookings,
      count: bookings.length
    })

  } catch (error) {
    console.error('❌ 예약 목록 조회 오류:', error)
    return NextResponse.json(
      {
        error: '서버 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
