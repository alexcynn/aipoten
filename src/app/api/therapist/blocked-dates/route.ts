import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

// 휴무일 조회
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

    // For now, return empty array since we haven't created the blocked dates table yet
    // This will be expanded when we add the blocked dates functionality
    return NextResponse.json([])
  } catch (error) {
    console.error('휴무일 조회 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 휴무일 추가
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

    const { date, reason } = await request.json()

    if (!date || !reason) {
      return NextResponse.json(
        { error: '날짜와 사유는 필수입니다.' },
        { status: 400 }
      )
    }

    // For now, return success without actually creating the record
    // This will be implemented when we add the blocked dates table
    return NextResponse.json({
      message: '휴무일이 추가되었습니다.',
      blockedDate: { id: 'temp', date, reason }
    })
  } catch (error) {
    console.error('휴무일 추가 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}