import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireTherapist } from '@/lib/auth-helpers'

/**
 * DELETE /api/therapist/holidays/[id]
 * 휴일 삭제
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // RBAC: THERAPIST 또는 ADMIN 권한 확인
    const { error, user } = await requireTherapist()
    if (error) return error

    const { id } = params

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

    // 휴일 존재 및 권한 확인
    const holiday = await prisma.holidayDate.findUnique({
      where: { id }
    })

    if (!holiday) {
      return NextResponse.json(
        { error: '휴일을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 공휴일은 삭제 불가
    if (!holiday.therapistId) {
      return NextResponse.json(
        { error: '공휴일은 삭제할 수 없습니다.' },
        { status: 403 }
      )
    }

    // 본인의 휴일만 삭제 가능
    if (holiday.therapistId !== therapistProfile.id) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    // 삭제
    await prisma.holidayDate.delete({
      where: { id }
    })

    console.log(`✅ 치료사 ${therapistProfile.id}: 휴일 삭제 ${holiday.date}`)

    return NextResponse.json({
      message: '휴일이 삭제되었습니다.'
    })

  } catch (error) {
    console.error('휴일 삭제 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
