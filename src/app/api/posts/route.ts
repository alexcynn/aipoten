import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 최근 게시글 조회 (전체 게시판)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '5')

    const posts = await prisma.post.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        title: true,
        views: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            name: true
          }
        },
        board: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            comments: true
          }
        }
      },
      orderBy: [
        { isSticky: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit
    })

    return NextResponse.json({ posts })
  } catch (error) {
    console.error('최근 게시글 조회 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}