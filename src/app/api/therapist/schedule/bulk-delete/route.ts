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

    const start = new Date(startDate)
    const end = new Date(endDate)

    // 삭제 조건
    const deleteWhere: any = {
      therapistId: therapistProfile.id,
      date: {
        gte: start,
        lte: end
      }
    }

    // 예약 없는 슬롯만 삭제
    if (onlyEmpty) {
      deleteWhere.currentBookings = 0
    }

    // 삭제
    const result = await prisma.timeSlot.deleteMany({
      where: deleteWhere
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
