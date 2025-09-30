import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'

// 뉴스 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const featured = searchParams.get('featured') === 'true'
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    let whereCondition: any = {
      isPublished: true
    }

    if (category) {
      whereCondition.category = category
    }

    if (featured) {
      whereCondition.isFeatured = true
    }

    if (search) {
      whereCondition.OR = [
        { title: { contains: search } },
        { summary: { contains: search } },
        { content: { contains: search } }
      ]
    }

    const [news, total] = await Promise.all([
      prisma.news.findMany({
        where: whereCondition,
        select: {
          id: true,
          title: true,
          summary: true,
          imageUrl: true,
          category: true,
          tags: true,
          views: true,
          isFeatured: true,
          publishedAt: true,
          createdAt: true
        },
        orderBy: [
          { isFeatured: 'desc' },
          { publishedAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.news.count({ where: whereCondition })
    ])

    return NextResponse.json({
      news,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('뉴스 목록 조회 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 뉴스 작성 (관리자만)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    // 관리자 권한 확인
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    const {
      title,
      summary,
      content,
      imageUrl,
      category,
      tags,
      isFeatured = false,
      isPublished = false
    } = await request.json()

    if (!title || !summary || !content || !category) {
      return NextResponse.json(
        { error: '제목, 요약, 내용, 카테고리는 필수입니다.' },
        { status: 400 }
      )
    }

    const news = await prisma.news.create({
      data: {
        title,
        summary,
        content,
        imageUrl,
        category,
        tags: tags ? JSON.stringify(tags) : null,
        isFeatured,
        isPublished,
        publishedAt: isPublished ? new Date() : null,
        authorId: session.user.id
      }
    })

    return NextResponse.json({
      message: '뉴스가 작성되었습니다.',
      news
    })
  } catch (error) {
    console.error('뉴스 작성 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}