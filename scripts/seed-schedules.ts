import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🗓️  스케줄 샘플 데이터 생성 시작...\n')

  // 1. 승인된 치료사 가져오기
  const therapists = await prisma.therapistProfile.findMany({
    where: { approvalStatus: 'APPROVED' },
    take: 3 // 3명의 치료사만 스케줄 생성
  })

  if (therapists.length === 0) {
    console.log('⚠️  승인된 치료사가 없습니다. 먼저 npm run db:seed:therapists 를 실행하세요.')
    return
  }

  console.log(`✅ ${therapists.length}명의 치료사 발견\n`)

  // 2. 날짜 범위 설정 (오늘부터 3개월)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const endDate = new Date(today)
  endDate.setMonth(endDate.getMonth() + 3)

  console.log(`📅 스케줄 생성 기간: ${today.toISOString().split('T')[0]} ~ ${endDate.toISOString().split('T')[0]}\n`)

  // 3. 각 치료사별로 데이터 생성
  for (const therapist of therapists) {
    console.log(`\n🔧 치료사: ${therapist.name} (${therapist.id})`)

    // 3-1. 개인 휴일 추가 (UTC 기준으로 정오 생성)
    const holidays = [
      { date: new Date(Date.UTC(2025, 11, 25, 12, 0, 0, 0)), reason: '크리스마스' }, // 12월 25일
      { date: new Date(Date.UTC(2026, 0, 1, 12, 0, 0, 0)), reason: '신정' },          // 1월 1일
    ]

    let holidayCount = 0
    for (const holiday of holidays) {
      try {
        await prisma.holidayDate.create({
          data: {
            therapistId: therapist.id,
            date: holiday.date,
            reason: holiday.reason,
            isRecurring: false
          }
        })
        holidayCount++
      } catch (e: any) {
        if (e.code === 'P2002') {
          // 중복 건너뛰기
        } else {
          throw e
        }
      }
    }
    console.log(`  ✅ 휴일 ${holidayCount}개 추가`)

    // 3-2. TimeSlot 생성
    // 주중 패턴: 월-금 09:00-18:00 (1시간 단위 예약)
    const slots = []

    // UTC 기준으로 날짜 생성 (한국 시간 기준 유지)
    const startYear = today.getFullYear()
    const startMonth = today.getMonth()
    const startDay = today.getDate()
    let currentDate = new Date(Date.UTC(startYear, startMonth, startDay, 12, 0, 0, 0))

    const endYear = endDate.getFullYear()
    const endMonth = endDate.getMonth()
    const endDay = endDate.getDate()
    const endDateUTC = new Date(Date.UTC(endYear, endMonth, endDay, 12, 0, 0, 0))

    while (currentDate <= endDateUTC) {
      const dayOfWeek = currentDate.getUTCDay() // UTC 기준 요일 (0=일, 1=월, ..., 6=토)

      // 주중만 (월-금)
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        // 점심시간 제외: 09:00-12:00, 14:00-18:00 (1시간 단위)
        const morningSlots = [
          { start: '09:00', end: '10:00' },
          { start: '10:00', end: '11:00' },
          { start: '11:00', end: '12:00' },
        ]

        const afternoonSlots = [
          { start: '14:00', end: '15:00' },
          { start: '15:00', end: '16:00' },
          { start: '16:00', end: '17:00' },
          { start: '17:00', end: '18:00' },
        ]

        const allSlots = [...morningSlots, ...afternoonSlots]

        for (const slot of allSlots) {
          slots.push({
            therapistId: therapist.id,
            date: new Date(currentDate), // 이미 UTC 기준으로 생성된 날짜
            startTime: slot.start,
            endTime: slot.end,
            isAvailable: true,
            isHoliday: false,
            isBufferBlocked: false,
            currentBookings: 0,
          })
        }
      }

      // 다음 날 (UTC 기준으로 하루 추가)
      currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000)
    }

    // 일괄 생성
    let created = 0
    let skipped = 0

    for (const slot of slots) {
      try {
        await prisma.timeSlot.create({ data: slot })
        created++
      } catch (e: any) {
        if (e.code === 'P2002') {
          skipped++
        } else {
          throw e
        }
      }
    }

    console.log(`  ✅ 타임슬롯 ${created}개 생성 완료 (${skipped}개 중복 건너뜀)`)
    console.log(`  📊 총 ${slots.length}개 슬롯 처리`)
  }

  // 4. 공휴일 추가 (UTC 기준으로 정오 생성)
  console.log('\n\n📆 공휴일 추가 중...')

  const publicHolidays = [
    { date: new Date(Date.UTC(2025, 0, 1, 12, 0, 0, 0)), reason: '신정' },
    { date: new Date(Date.UTC(2025, 2, 1, 12, 0, 0, 0)), reason: '삼일절' },
    { date: new Date(Date.UTC(2025, 4, 5, 12, 0, 0, 0)), reason: '어린이날' },
    { date: new Date(Date.UTC(2025, 5, 6, 12, 0, 0, 0)), reason: '현충일' },
    { date: new Date(Date.UTC(2025, 7, 15, 12, 0, 0, 0)), reason: '광복절' },
    { date: new Date(Date.UTC(2025, 9, 3, 12, 0, 0, 0)), reason: '개천절' },
    { date: new Date(Date.UTC(2025, 9, 9, 12, 0, 0, 0)), reason: '한글날' },
    { date: new Date(Date.UTC(2025, 11, 25, 12, 0, 0, 0)), reason: '크리스마스' },
  ]

  let publicHolidayCount = 0
  for (const holiday of publicHolidays) {
    try {
      await prisma.holidayDate.create({
        data: {
          therapistId: null, // null = 공휴일
          date: holiday.date,
          reason: holiday.reason,
          isRecurring: true
        }
      })
      publicHolidayCount++
    } catch (e: any) {
      if (e.code === 'P2002') {
        // 중복 건너뛰기
      } else {
        throw e
      }
    }
  }

  console.log(`✅ 공휴일 ${publicHolidayCount}개 추가\n`)

  // 5. 통계 출력
  console.log('\n📊 === 최종 통계 ===')

  const totalSlots = await prisma.timeSlot.count()
  const totalHolidays = await prisma.holidayDate.count()
  const publicHolidaysCount = await prisma.holidayDate.count({
    where: { therapistId: null }
  })

  console.log(`\n타임슬롯: ${totalSlots}개`)
  console.log(`휴일: ${totalHolidays}개 (공휴일: ${publicHolidaysCount}개)`)

  console.log('\n✅ 스케줄 샘플 데이터 생성 완료!\n')
}

main()
  .catch((e) => {
    console.error('❌ 에러 발생:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
