import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

// GET - 치료사 매핑 목록 조회 (인증된 사용자용)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    const mappings = await prisma.therapyMapping.findMany({
      where: {
        isActive: true,
      },
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
