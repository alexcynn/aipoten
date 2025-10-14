import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireTherapist } from '@/lib/auth-helpers'

/**
 * DELETE /api/therapist/schedule/bulk-delete
 * 스케줄 일괄 삭제
 *
 * 특정 기간의 예약되지 않은 슬롯을 일괄 삭제합니다.
 */
export async function DELETE(request: NextRequest) {
  try {
    // RBAC: THERAPIST 또는 ADMIN 권한 확인
    const { error, user } = await requireTherapist()
    if (error) return error

    const body = await request.json()

    const {
      startDate,     // "2025-11-01"
      endDate,       // "2025-11-30"
      onlyEmpty,     // true: 예약 없는 슬롯만 삭제
    } = body

    console.log('📥 일괄 삭제 요청:', {
      startDate,
      endDate,
      onlyEmpty
    })

    // Validation
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: '시작일과 종료일이 필요합니다.' },
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

    // 조회 범위를 넓게 잡음 (하루 전 ~ 하루 후) - UTC 기준
    const queryStart = new Date(Date.UTC(startYear, startMonth - 1, startDay - 1, 0, 0, 0, 0))
    const queryEnd = new Date(Date.UTC(endYear, endMonth - 1, endDay + 1, 23, 59, 59, 999))

    console.log('📅 날짜 파싱 (한국 시간 기준):', {
      startDateStr: startDate,
      endDateStr: endDate,
      queryStart: queryStart.toISOString(),
      queryEnd: queryEnd.toISOString()
    })

    // 먼저 슬롯 조회
    const queryWhere: any = {
      therapistId: therapistProfile.id,
      date: {
        gte: queryStart,
        lte: queryEnd
      }
    }

    if (onlyEmpty) {
      queryWhere.currentBookings = 0
    }

    const slotsToCheck = await prisma.timeSlot.findMany({
      where: queryWhere,
      select: {
        id: true,
        date: true,
        startTime: true,
        currentBookings: true
      }
    })

    console.log(`🔍 조회된 슬롯: ${slotsToCheck.length}개`)

    // 날짜 문자열로 필터링
    const slotsToDelete = slotsToCheck.filter(slot => {
      const slotDateStr = new Date(slot.date).toISOString().split('T')[0]
      const inRange = slotDateStr >= startDate && slotDateStr <= endDate
      if (slotsToCheck.length <= 10) {
        console.log(`  📌 슬롯 ${slot.id}: ${slotDateStr} (${slot.startTime}) → ${inRange ? '삭제 대상' : '범위 밖'}`)
      }
      return inRange
    })

    console.log(`✅ 삭제 대상 슬롯: ${slotsToDelete.length}개`)

    // ID 기반 삭제
    if (slotsToDelete.length === 0) {
      console.log('⚠️ 삭제할 슬롯이 없습니다.')
      return NextResponse.json({
        message: '삭제할 슬롯이 없습니다.',
        deleted: 0
      })
    }

    const result = await prisma.timeSlot.deleteMany({
      where: {
        id: {
          in: slotsToDelete.map(s => s.id)
        }
      }
    })

    console.log(`✅ 치료사 ${therapistProfile.id}: ${result.count}개 슬롯 삭제 완료`)

    return NextResponse.json({
      message: `${result.count}개 슬롯이 삭제되었습니다.`,
      deleted: result.count
    })

  } catch (error) {
    console.error('스케줄 일괄 삭제 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
