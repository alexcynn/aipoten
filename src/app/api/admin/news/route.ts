import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

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

    const news = await prisma.news.findMany({
      include: {
        author: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedNews = news.map(item => ({
      id: item.id,
      title: item.title,
      content: item.content,
      summary: item.summary,
      imageUrl: item.imageUrl,
      isPublished: item.isPublished,
      views: item.views,
      author: item.author,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString()
    }))

    return NextResponse.json(formattedNews)
  } catch (error) {
    console.error('뉴스 목록 조회 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

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

    const { title, content, summary, imageUrl, isPublished } = await request.json()

    if (!title || !content) {
      return NextResponse.json(
        { error: '제목과 내용은 필수입니다.' },
        { status: 400 }
      )
    }

    const news = await prisma.news.create({
      data: {
        title,
        content,
        summary: summary || null,
        imageUrl: imageUrl || null,
        isPublished: isPublished || false,
        views: 0,
        authorId: session.user.id
      }
    })

    return NextResponse.json({
      message: '뉴스가 추가되었습니다.',
      news
    })
  } catch (error) {
    console.error('뉴스 추가 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}