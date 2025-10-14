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
    if (error) {
      console.error('❌ 인증 실패')
      return error
    }

    console.log('✅ 인증된 사용자:', user.id, user.email)

    // 치료사 프로필 확인
    const therapistProfile = await prisma.therapistProfile.findUnique({
      where: { userId: user.id }
    })

    if (!therapistProfile) {
      console.error('❌ 치료사 프로필 없음:', user.id)
      return NextResponse.json(
        { error: '치료사 프로필을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    console.log('✅ 치료사 프로필:', therapistProfile.id)

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const date = searchParams.get('date')
    const isAvailable = searchParams.get('isAvailable')

    console.log('📥 요청 파라미터:', { startDate, endDate, date, isAvailable })

    // 조회 조건
    const where: any = {
      therapistId: therapistProfile.id
    }

    if (date) {
      // 특정 날짜만 조회 (UTC 기준)
      const [year, month, day] = date.split('-').map(Number)
      const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
      const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999))

      where.date = {
        gte: startOfDay,
        lte: endOfDay
      }
      console.log('📅 특정 날짜 조회 (한국 시간 기준):', { date, startOfDay: startOfDay.toISOString(), endOfDay: endOfDay.toISOString() })
    } else {
      // 날짜 범위 조회 (UTC 기준)
      where.date = {}

      if (startDate) {
        const [year, month, day] = startDate.split('-').map(Number)
        where.date.gte = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
        console.log('📅 시작일 (한국 시간 기준):', startDate, '→', where.date.gte.toISOString())
      }

      if (endDate) {
        const [year, month, day] = endDate.split('-').map(Number)
        where.date.lte = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999))
        console.log('📅 종료일 (한국 시간 기준):', endDate, '→', where.date.lte.toISOString())
      }
    }

    // 가용성 필터
    if (isAvailable !== null && isAvailable !== undefined) {
      where.isAvailable = isAvailable === 'true'
      console.log('🔍 가용성 필터:', where.isAvailable)
    }

    console.log('🔍 최종 조회 조건:', JSON.stringify(where, null, 2))

    // 조회
    console.log('⏳ Prisma 쿼리 실행 중...')
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
            specialties: true
          }
        }
      }
    })

    console.log('✅ 쿼리 완료:', slots.length, '개 슬롯 조회됨')

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
      availableSlots: slots.filter(s => s.isAvailable && s.currentBookings === 0).length,
      bookedSlots: slots.filter(s => s.currentBookings > 0).length,
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
    console.error('❌❌❌ 타임슬롯 조회 오류 ❌❌❌')
    console.error('에러 타입:', error instanceof Error ? error.constructor.name : typeof error)
    console.error('에러 메시지:', error instanceof Error ? error.message : String(error))
    console.error('스택 트레이스:', error instanceof Error ? error.stack : 'N/A')
    console.error('전체 에러 객체:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))

    return NextResponse.json(
      {
        error: '서버 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
