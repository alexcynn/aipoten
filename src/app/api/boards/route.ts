import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 게시판 목록 조회
export async function GET(request: NextRequest) {
  try {
    const boards = await prisma.board.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        description: true,
        order: true,
        _count: {
          select: {
            posts: {
              where: { isPublished: true }
            }
          }
        }
      },
      orderBy: {
        order: 'asc'
      }
    })

    return NextResponse.json({ boards })
  } catch (error) {
    console.error('게시판 목록 조회 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}