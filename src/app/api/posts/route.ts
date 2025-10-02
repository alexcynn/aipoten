import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

// 게시글 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    let whereCondition: any = {
      isPublished: true
    }

    if (category && category !== 'ALL') {
      whereCondition.category = category
    }

    if (search) {
      whereCondition.OR = [
        { title: { contains: search } },
        { content: { contains: search } }
      ]
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: whereCondition,
        include: {
          author: {
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
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.post.count({ where: whereCondition })
    ])

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('게시글 목록 조회 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 새 게시글 작성
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    const { title, content, category } = await request.json()

    if (!title || !content || !category) {
      return NextResponse.json(
        { error: '제목, 내용, 카테고리는 필수입니다.' },
        { status: 400 }
      )
    }

    const validCategories = ['QUESTION', 'SHARE', 'REVIEW']
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: '유효하지 않은 카테고리입니다.' },
        { status: 400 }
      )
    }

    // 기본 게시판이 없으면 생성
    let defaultBoard = await prisma.board.findFirst({
      where: { id: 'community' }
    })

    if (!defaultBoard) {
      defaultBoard = await prisma.board.create({
        data: {
          id: 'community',
          name: '커뮤니티',
          description: '자유 게시판'
        }
      })
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        category,
        authorId: session.user.id,
        boardId: defaultBoard.id,
        views: 0,
        isPublished: true
      },
      include: {
        author: {
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
      }
    })

    return NextResponse.json({
      message: '게시글이 작성되었습니다.',
      post
    })
  } catch (error) {
    console.error('게시글 작성 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}