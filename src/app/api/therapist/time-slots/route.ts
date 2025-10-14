import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireTherapist } from '@/lib/auth-helpers'

/**
 * GET /api/therapist/time-slots
 * TimeSlot 조회 (실제 생성된 스케줄)
 *
 * Query Parameters:
 * - startDate: "2025-11-01"
 * - endDate: "2025-11-30"
 * - isAvailable: "true" | "false"
 * - date: "2025-11-15" (특정 날짜만 조회)
 */
export async function GET(request: NextRequest) {
  try {
    // RBAC: THERAPIST 또는 ADMIN 권한 확인
    const { error, user } = await requireTherapist()
    if (error) return error

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

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const date = searchParams.get('date')
    const isAvailable = searchParams.get('isAvailable')

    // 조회 조건
    const where: any = {
      therapistId: therapistProfile.id
    }

    if (date) {
      // 특정 날짜만 조회
      const targetDate = new Date(date)
      where.date = {
        gte: new Date(targetDate.setHours(0, 0, 0, 0)),
        lte: new Date(targetDate.setHours(23, 59, 59, 999))
      }
    } else {
      // 날짜 범위 조회
      where.date = {}

      if (startDate) {
        where.date.gte = new Date(startDate)
      }

      if (endDate) {
        where.date.lte = new Date(endDate)
      }
    }

    // 가용성 필터
    if (isAvailable !== null && isAvailable !== undefined) {
      where.isAvailable = isAvailable === 'true'
    }

    // 조회
    const slots = await prisma.timeSlot.findMany({
      where,
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ],
      include: {
        therapist: {
          select: {
            id: true,
            userId: true,
            name: true,
            specialties: true
          }
        }
      }
    })

    // 날짜별로 그룹화
    const groupedByDate = slots.reduce((acc: any, slot) => {
      const dateKey = slot.date.toISOString().split('T')[0]
      if (!acc[dateKey]) {
        acc[dateKey] = []
      }
      acc[dateKey].push(slot)
      return acc
    }, {})

    // 통계 계산
    const stats = {
      totalSlots: slots.length,
      availableSlots: slots.filter(s => s.isAvailable && s.currentBookings < s.maxCapacity).length,
      bookedSlots: slots.filter(s => s.currentBookings > 0).length,
      fullyBookedSlots: slots.filter(s => s.currentBookings >= s.maxCapacity).length,
      holidaySlots: slots.filter(s => s.isHoliday).length,
      blockedSlots: slots.filter(s => s.isBufferBlocked).length
    }

    return NextResponse.json({
      slots,
      groupedByDate,
      stats,
      count: slots.length
    })

  } catch (error) {
    console.error('타임슬롯 조회 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
