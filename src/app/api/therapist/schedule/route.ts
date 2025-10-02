import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

// 치료사 스케줄 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'THERAPIST') {
      return NextResponse.json(
        { error: '치료사 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    // 치료사 프로필 확인
    const therapistProfile = await prisma.therapistProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!therapistProfile) {
      return NextResponse.json(
        { error: '치료사 프로필을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const schedule = await prisma.therapistAvailability.findMany({
      where: { therapistId: therapistProfile.id },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ]
    })

    return NextResponse.json(schedule)
  } catch (error) {
    console.error('스케줄 조회 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 치료사 스케줄 추가
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'THERAPIST') {
      return NextResponse.json(
        { error: '치료사 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    // 치료사 프로필 확인
    const therapistProfile = await prisma.therapistProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!therapistProfile) {
      return NextResponse.json(
        { error: '치료사 프로필을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const { dayOfWeek, startTime, endTime } = await request.json()

    if (dayOfWeek === undefined || !startTime || !endTime) {
      return NextResponse.json(
        { error: '요일, 시작시간, 종료시간은 필수입니다.' },
        { status: 400 }
      )
    }

    if (startTime >= endTime) {
      return NextResponse.json(
        { error: '종료 시간은 시작 시간보다 늦어야 합니다.' },
        { status: 400 }
      )
    }

    // 중복 시간대 체크
    const existingSlot = await prisma.therapistAvailability.findFirst({
      where: {
        therapistId: therapistProfile.id,
        dayOfWeek,
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } }
            ]
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } }
            ]
          },
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } }
            ]
          }
        ]
      }
    })

    if (existingSlot) {
      return NextResponse.json(
        { error: '이미 설정된 시간대와 겹칩니다.' },
        { status: 400 }
      )
    }

    const newSlot = await prisma.therapistAvailability.create({
      data: {
        therapistId: therapistProfile.id,
        dayOfWeek,
        startTime,
        endTime,
        isActive: true
      }
    })

    return NextResponse.json({
      message: '시간대가 추가되었습니다.',
      slot: newSlot
    })
  } catch (error) {
    console.error('스케줄 추가 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}