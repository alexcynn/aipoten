import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'

// 뉴스 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 조회수 증가
    await prisma.news.update({
      where: { id },
      data: { views: { increment: 1 } }
    })

    const news = await prisma.news.findUnique({
      where: { id, isPublished: true },
      select: {
        id: true,
        title: true,
        summary: true,
        content: true,
        imageUrl: true,
        category: true,
        tags: true,
        views: true,
        isFeatured: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!news) {
      return NextResponse.json(
        { error: '뉴스를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 태그 파싱
    const newsWithParsedTags = {
      ...news,
      tags: news.tags ? JSON.parse(news.tags) : []
    }

    return NextResponse.json({ news: newsWithParsedTags })
  } catch (error) {
    console.error('뉴스 조회 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 뉴스 수정 (관리자만)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const {
      title,
      summary,
      content,
      imageUrl,
      category,
      tags,
      isFeatured,
      isPublished
    } = await request.json()

    const updateData: any = {}

    if (title) updateData.title = title
    if (summary) updateData.summary = summary
    if (content) updateData.content = content
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl
    if (category) updateData.category = category
    if (tags !== undefined) updateData.tags = tags ? JSON.stringify(tags) : null
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured
    if (isPublished !== undefined) {
      updateData.isPublished = isPublished
      if (isPublished && !updateData.publishedAt) {
        updateData.publishedAt = new Date()
      }
    }

    const news = await prisma.news.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({
      message: '뉴스가 수정되었습니다.',
      news
    })
  } catch (error) {
    console.error('뉴스 수정 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 뉴스 삭제 (관리자만)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    await prisma.news.delete({
      where: { id }
    })

    return NextResponse.json({
      message: '뉴스가 삭제되었습니다.'
    })
  } catch (error) {
    console.error('뉴스 삭제 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}