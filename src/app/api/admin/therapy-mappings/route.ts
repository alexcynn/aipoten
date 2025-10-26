import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

// GET - 치료사 매핑 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    const mappings = await prisma.therapyMapping.findMany({
      orderBy: [
        { developmentCategory: 'asc' },
        { priority: 'asc' },
      ],
    })

    return NextResponse.json({ mappings })
  } catch (error) {
    console.error('치료사 매핑 조회 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// POST - 치료사 매핑 생성
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { developmentCategory, therapyType, priority, isActive } = body

    // 중복 체크
    const existing = await prisma.therapyMapping.findUnique({
      where: {
        developmentCategory_therapyType: {
          developmentCategory,
          therapyType,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: '이미 존재하는 매핑입니다.' },
        { status: 400 }
      )
    }

    const mapping = await prisma.therapyMapping.create({
      data: {
        developmentCategory,
        therapyType,
        priority: priority || 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    })

    return NextResponse.json({
      message: '치료사 매핑이 생성되었습니다.',
      mapping,
    })
  } catch (error) {
    console.error('치료사 매핑 생성 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
