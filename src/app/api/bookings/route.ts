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
 *   timeSlotIds: string[],  // 여러 슬롯 ID 배열
 *   childId: string,
 *   sessionType: "CONSULTATION" | "THERAPY",
 *   sessionCount: 1 | 4 | 8 | 12,
 *   visitAddress: string,  // 필수
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
      timeSlotIds,
      childId,
      sessionType,
      sessionCount,
      visitAddress,
      visitAddressDetail,
      parentNote
    } = body

    console.log('📋 예약 정보:', {
      timeSlotIds,
      childId,
      sessionType,
      sessionCount,
      visitAddress,
      parentNote
    })

    // Validation
    if (!timeSlotIds || !Array.isArray(timeSlotIds) || timeSlotIds.length === 0) {
      return NextResponse.json(
        { error: '슬롯을 선택해주세요.' },
        { status: 400 }
      )
    }

    if (!childId || !sessionType || !sessionCount || !visitAddress) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      )
    }

    // 세션 타입별 슬롯 수 검증
    if (sessionType === 'CONSULTATION') {
      if (timeSlotIds.length !== 1) {
        return NextResponse.json(
          { error: '컨설팅은 1개의 슬롯만 선택해야 합니다.' },
          { status: 400 }
        )
      }
      if (sessionCount !== 1) {
        return NextResponse.json(
          { error: '상담은 1회만 가능합니다.' },
          { status: 400 }
        )
      }
    }

    if (sessionType === 'THERAPY') {
      if (![1, 4, 8, 12].includes(sessionCount)) {
        return NextResponse.json(
          { error: '치료는 1회, 4회, 8회, 12회만 가능합니다.' },
          { status: 400 }
        )
      }
      if (timeSlotIds.length !== sessionCount) {
        return NextResponse.json(
          { error: `치료 ${sessionCount}회는 ${sessionCount}개의 슬롯을 선택해야 합니다.` },
          { status: 400 }
        )
      }
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

    // 모든 타임슬롯 확인 및 가용성 검증
    const timeSlots = await prisma.timeSlot.findMany({
      where: { id: { in: timeSlotIds } },
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

    if (timeSlots.length !== timeSlotIds.length) {
      return NextResponse.json(
        { error: '일부 타임슬롯을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 모든 슬롯이 같은 치료사인지 확인
    const therapistIds = [...new Set(timeSlots.map(slot => slot.therapistId))]
    if (therapistIds.length > 1) {
      return NextResponse.json(
        { error: '모든 슬롯은 같은 치료사여야 합니다.' },
        { status: 400 }
      )
    }

    const therapist = timeSlots[0].therapist

    // 각 슬롯의 가용성 확인
    for (const slot of timeSlots) {
      if (!slot.isAvailable || slot.isHoliday || slot.isBufferBlocked) {
        return NextResponse.json(
          { error: `${new Date(slot.date).toLocaleDateString()} ${slot.startTime}은 예약할 수 없습니다.` },
          { status: 400 }
        )
      }

      if (slot.currentBookings > 0) {
        return NextResponse.json(
          { error: `${new Date(slot.date).toLocaleDateString()} ${slot.startTime}은 이미 예약되었습니다.` },
          { status: 400 }
        )
      }
    }

    console.log('✅ 모든 타임슬롯 가용 확인:', {
      therapist: therapist.user.name,
      slotsCount: timeSlots.length
    })

    // 치료사가 승인된 상태인지 확인
    if (therapist.approvalStatus !== 'APPROVED') {
      return NextResponse.json(
        { error: '해당 치료사는 현재 예약을 받을 수 없습니다.' },
        { status: 400 }
      )
    }

    // 요금 계산
    const sessionFee = therapist.sessionFee || 0
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

    // bookingGroupId 생성 (여러 예약을 묶기 위해)
    const bookingGroupId = sessionType === 'THERAPY' && sessionCount > 1 ?
      `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` :
      null

    // 트랜잭션으로 여러 예약 생성 및 타임슬롯 업데이트
    const bookings = await prisma.$transaction(async (tx) => {
      const createdBookings = []

      for (const timeSlot of timeSlots) {
        const [hours, minutes] = timeSlot.startTime.split(':').map(Number)
        const scheduledAt = new Date(timeSlot.date)
        scheduledAt.setHours(hours, minutes, 0, 0)

        // 예약 생성
        const newBooking = await tx.booking.create({
          data: {
            timeSlotId: timeSlot.id,
            parentUserId: userId,
            childId,
            therapistId: timeSlot.therapistId,
            scheduledAt,
            sessionType,
            sessionCount,
            bookingGroupId,
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
          where: { id: timeSlot.id },
          data: {
            currentBookings: {
              increment: 1
            }
          }
        })

        createdBookings.push(newBooking)
      }

      return createdBookings
    })

    console.log(`✅ ${bookings.length}개 예약 생성 완료`)

    return NextResponse.json(
      {
        message: `${bookings.length}개의 예약이 생성되었습니다. 치료사의 확인을 기다려주세요.`,
        bookings: bookings.map(booking => ({
          id: booking.id,
          scheduledAt: booking.scheduledAt,
          sessionType: booking.sessionType,
          sessionCount: booking.sessionCount,
          bookingGroupId: booking.bookingGroupId,
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
        })),
        // 첫 번째 예약 정보 (하위 호환성)
        booking: {
          id: bookings[0].id,
          scheduledAt: bookings[0].scheduledAt,
          sessionType: bookings[0].sessionType,
          sessionCount: bookings[0].sessionCount,
          status: bookings[0].status,
          originalFee: bookings[0].originalFee,
          discountRate: bookings[0].discountRate,
          finalFee: bookings[0].finalFee,
          confirmationDeadline: bookings[0].confirmationDeadline,
          therapist: {
            id: bookings[0].therapist.id,
            name: bookings[0].therapist.user.name
          },
          child: {
            id: bookings[0].child.id,
            name: bookings[0].child.name
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
