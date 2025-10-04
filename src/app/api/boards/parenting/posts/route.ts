import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      where: {
        boardId: 'parenting',
        isPublished: true
      },
      include: {
        author: {
          select: {
            name: true
          }
        },
        _count: {
          select: {
            comments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ posts })
  } catch (error) {
    console.error('육아소통 게시글 조회 오류:', error)
    return NextResponse.json(
      { error: '게시글을 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
