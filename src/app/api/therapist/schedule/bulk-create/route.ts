import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireTherapist } from '@/lib/auth-helpers'

/**
 * POST /api/therapist/schedule/bulk-create
 * 스케줄 일괄 생성
 *
 * 요일별 시간 패턴을 설정하여 최대 3개월치 스케줄을 자동 생성합니다.
 */
export async function POST(request: NextRequest) {
  try {
    // RBAC: THERAPIST 또는 ADMIN 권한 확인
    const { error, user } = await requireTherapist()
    if (error) return error

    const body = await request.json()

    const {
      startDate,        // "2025-10-15"
      endDate,          // "2025-12-31"
      weeklyPattern,    // { monday: ["09:00-12:00", "14:00-18:00"], tuesday: [...], ... }
      sessionDuration,  // 50 (분)
      maxCapacity,      // 1 (명)
      excludeHolidays,  // true
    } = body

    // Validation
    if (!startDate || !endDate || !weeklyPattern || !sessionDuration) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
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

    const start = new Date(startDate)
    const end = new Date(endDate)

    // 3개월 제한 검증
    const maxEndDate = new Date(start)
    maxEndDate.setMonth(maxEndDate.getMonth() + 3)

    if (end > maxEndDate) {
      return NextResponse.json(
        { error: '최대 3개월까지만 생성할 수 있습니다.' },
        { status: 400 }
      )
    }

    // 공휴일 조회 (필요시)
    let holidays: Date[] = []
    if (excludeHolidays) {
      const holidayRecords = await prisma.holidayDate.findMany({
        where: {
          OR: [
            { therapistId: therapistProfile.id },
            { therapistId: null } // 공휴일
          ],
          date: {
            gte: start,
            lte: end
          }
        }
      })
      holidays = holidayRecords.map(h => h.date)
    }

    // 슬롯 생성
    const slots = []
    let currentDate = new Date(start)

    while (currentDate <= end) {
      // 공휴일 체크
      const isHoliday = holidays.some(h =>
        h.getFullYear() === currentDate.getFullYear() &&
        h.getMonth() === currentDate.getMonth() &&
        h.getDate() === currentDate.getDate()
      )

      if (!isHoliday) {
        // 요일 확인 (0=일, 1=월, ..., 6=토)
        const dayOfWeek = currentDate.getDay()
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
        const dayName = dayNames[dayOfWeek]

        const timeRanges = weeklyPattern[dayName]

        if (timeRanges && timeRanges.length > 0) {
          for (const timeRange of timeRanges) {
            // "09:00-12:00" → 09:00, 09:50, 10:00, 10:50, 11:00, 11:50
            const [start, end] = timeRange.split('-')
            const startHour = parseInt(start.split(':')[0])
            const startMinute = parseInt(start.split(':')[1])
            const endHour = parseInt(end.split(':')[0])
            const endMinute = parseInt(end.split(':')[1])

            const startMinutes = startHour * 60 + startMinute
            const endMinutes = endHour * 60 + endMinute

            for (let minutes = startMinutes; minutes < endMinutes; minutes += sessionDuration) {
              const slotStartHour = Math.floor(minutes / 60)
              const slotStartMinute = minutes % 60
              const slotEndHour = Math.floor((minutes + sessionDuration) / 60)
              const slotEndMinute = (minutes + sessionDuration) % 60

              const slotStartTime = `${String(slotStartHour).padStart(2, '0')}:${String(slotStartMinute).padStart(2, '0')}`
              const slotEndTime = `${String(slotEndHour).padStart(2, '0')}:${String(slotEndMinute).padStart(2, '0')}`

              slots.push({
                therapistId: therapistProfile.id,
                date: new Date(currentDate),
                startTime: slotStartTime,
                endTime: slotEndTime,
                isAvailable: true,
                isHoliday: false,
                isBufferBlocked: false,
                maxCapacity: maxCapacity || 1,
                currentBookings: 0,
              })
            }
          }
        }
      }

      // 다음 날
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // 중복 체크 및 일괄 생성
    let created = 0
    let skipped = 0

    for (const slot of slots) {
      try {
        await prisma.timeSlot.create({
          data: slot
        })
        created++
      } catch (e: any) {
        // 이미 존재하는 슬롯은 건너뛰기
        if (e.code === 'P2002') {
          skipped++
        } else {
          throw e
        }
      }
    }

    console.log(`✅ 치료사 ${therapistProfile.id}: ${created}개 슬롯 생성 완료 (${skipped}개 중복 건너뜀)`)

    return NextResponse.json({
      message: `${created}개 슬롯이 생성되었습니다.`,
      created,
      skipped,
      total: slots.length
    }, { status: 201 })

  } catch (error) {
    console.error('스케줄 일괄 생성 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
