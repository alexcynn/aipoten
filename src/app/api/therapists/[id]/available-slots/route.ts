import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/therapists/[id]/available-slots
 * 특정 치료사의 가용한 타임슬롯 조회
 *
 * Query Parameters:
 * - startDate: "2025-11-01" (필수)
 * - endDate: "2025-11-30" (필수)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const therapistId = params.id
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    console.log('📥 가용 슬롯 조회:', { therapistId, startDate, endDate })

    // Validation
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate와 endDate는 필수입니다.' },
        { status: 400 }
      )
    }

    // 치료사가 존재하고 승인된 상태인지 확인
    const therapist = await prisma.therapistProfile.findFirst({
      where: {
        id: therapistId,
        approvalStatus: 'APPROVED'
      }
    })

    if (!therapist) {
      return NextResponse.json(
        { error: '치료사를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 날짜 파싱 (한국 시간 기준)
    const [startYear, startMonth, startDay] = startDate.split('-').map(Number)
    const [endYear, endMonth, endDay] = endDate.split('-').map(Number)

    const start = new Date(Date.UTC(startYear, startMonth - 1, startDay, 0, 0, 0, 0))
    const end = new Date(Date.UTC(endYear, endMonth - 1, endDay, 23, 59, 59, 999))

    console.log('📅 조회 날짜 범위:', {
      start: start.toISOString(),
      end: end.toISOString()
    })

    // 가용한 타임슬롯 조회
    const slots = await prisma.timeSlot.findMany({
      where: {
        therapistId,
        date: {
          gte: start,
          lte: end
        },
        isAvailable: true,
        isHoliday: false,
        isBufferBlocked: false,
        currentBookings: 0
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ],
      select: {
        id: true,
        date: true,
        startTime: true,
        endTime: true,
        isAvailable: true,
        currentBookings: true
      }
    })

    console.log(`✅ ${slots.length}개의 가용 슬롯 조회 완료`)

    // 날짜별로 그룹화
    const groupedByDate = slots.reduce((acc: any, slot) => {
      const dateKey = slot.date.toISOString().split('T')[0]
      if (!acc[dateKey]) {
        acc[dateKey] = []
      }
      acc[dateKey].push({
        id: slot.id,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isAvailable: slot.isAvailable
      })
      return acc
    }, {})

    return NextResponse.json({
      therapistId,
      startDate,
      endDate,
      totalSlots: slots.length,
      slots,
      groupedByDate
    })

  } catch (error) {
    console.error('❌ 가용 슬롯 조회 오류:', error)
    return NextResponse.json(
      {
        error: '서버 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
