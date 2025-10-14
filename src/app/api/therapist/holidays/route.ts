import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireTherapist } from '@/lib/auth-helpers'

/**
 * POST /api/therapist/holidays
 * 개인 휴일 추가
 */
export async function POST(request: NextRequest) {
  try {
    // RBAC: THERAPIST 또는 ADMIN 권한 확인
    const { error, user } = await requireTherapist()
    if (error) return error

    const body = await request.json()

    const {
      date,         // "2025-11-15"
      reason,       // "개인 사정"
      isRecurring,  // false
    } = body

    // Validation
    if (!date) {
      return NextResponse.json(
        { error: '날짜가 필요합니다.' },
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

    // 휴일 추가
    const holiday = await prisma.holidayDate.create({
      data: {
        therapistId: therapistProfile.id,
        date: new Date(date),
        reason: reason || null,
        isRecurring: isRecurring || false,
      }
    })

    console.log(`✅ 치료사 ${therapistProfile.id}: 휴일 추가 ${date}`)

    return NextResponse.json({
      message: '휴일이 추가되었습니다.',
      holiday
    }, { status: 201 })

  } catch (error: any) {
    // 중복 체크
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: '이미 등록된 휴일입니다.' },
        { status: 409 }
      )
    }

    console.error('휴일 추가 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/therapist/holidays
 * 휴일 목록 조회
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
    const includePublic = searchParams.get('includePublic') === 'true'

    // 조회 조건
    const where: any = {
      date: {}
    }

    if (includePublic) {
      // 개인 휴일 + 공휴일
      where.OR = [
        { therapistId: therapistProfile.id },
        { therapistId: null }
      ]
    } else {
      // 개인 휴일만
      where.therapistId = therapistProfile.id
    }

    if (startDate) {
      where.date.gte = new Date(startDate)
    }

    if (endDate) {
      where.date.lte = new Date(endDate)
    }

    // 조회
    const holidays = await prisma.holidayDate.findMany({
      where,
      orderBy: { date: 'asc' }
    })

    return NextResponse.json({
      holidays,
      count: holidays.length
    })

  } catch (error) {
    console.error('휴일 조회 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
