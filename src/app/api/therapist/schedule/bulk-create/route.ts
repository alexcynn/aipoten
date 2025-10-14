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
      weeklyPattern,    // { monday: ["09:00-10:00", "10:00-11:00"], tuesday: [...], ... }
      excludeHolidays,  // true
    } = body

    console.log('📥 일괄 생성 요청:', {
      startDate,
      endDate,
      weeklyPattern,
      excludeHolidays
    })

    // Validation
    if (!startDate || !endDate || !weeklyPattern) {
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

    // 한국 시간 기준으로 날짜 처리 (UTC+9)
    const [startYear, startMonth, startDay] = startDate.split('-').map(Number)
    const [endYear, endMonth, endDay] = endDate.split('-').map(Number)

    // UTC 기준으로 정오 12시 = KST 21시 = 한국 날짜 유지
    const start = new Date(Date.UTC(startYear, startMonth - 1, startDay, 12, 0, 0, 0))
    const end = new Date(Date.UTC(endYear, endMonth - 1, endDay, 12, 0, 0, 0))

    console.log('📅 날짜 파싱 (한국 시간 기준):', {
      startDateStr: startDate,
      endDateStr: endDate,
      startUTC: start.toISOString(),
      endUTC: end.toISOString()
    })

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
    let debugCount = 0

    console.log('📅 슬롯 생성 시작:', {
      start: start.toISOString(),
      end: end.toISOString()
    })

    while (currentDate <= end) {
      // 한국 날짜 문자열 추출 (UTC+9 고려)
      const dateStr = currentDate.toISOString().split('T')[0]

      // 공휴일 체크 (날짜 문자열로 비교)
      const isHoliday = holidays.some(h => {
        const holidayStr = h.toISOString().split('T')[0]
        return holidayStr === dateStr
      })

      if (!isHoliday) {
        // 요일 확인 (UTC 기준으로 계산)
        const dayOfWeek = currentDate.getUTCDay()
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
        const dayName = dayNames[dayOfWeek]

        const timeRanges = weeklyPattern[dayName]

        // 첫 5일만 상세 로그
        if (debugCount < 5) {
          console.log(`  📆 ${dateStr} UTC요일:(${currentDate.getUTCDay()}) → ${dayName}:`, timeRanges?.length || 0, '개 시간대')
          debugCount++
        }

        if (timeRanges && timeRanges.length > 0) {
          for (const timeRange of timeRanges) {
            // "09:00-10:00" 형태의 시간 범위를 직접 사용
            const [startTime, endTime] = timeRange.split('-')

            // 현재 날짜를 그대로 사용 (이미 UTC 기준으로 생성됨)
            slots.push({
              therapistId: therapistProfile.id,
              date: new Date(currentDate),
              startTime,
              endTime,
              isAvailable: true,
              isHoliday: false,
              isBufferBlocked: false,
              currentBookings: 0,
            })
          }
        }
      }

      // 다음 날 (UTC 기준으로 하루 추가)
      currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000)
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
