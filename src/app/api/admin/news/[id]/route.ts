import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { isPublished, title, content, summary, imageUrl } = body

    const news = await prisma.news.findUnique({
      where: { id: params.id }
    })

    if (!news) {
      return NextResponse.json(
        { error: '뉴스를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const updateData: any = {}

    if (isPublished !== undefined) updateData.isPublished = isPublished
    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content
    if (summary !== undefined) updateData.summary = summary
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl

    const updatedNews = await prisma.news.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json({
      message: '뉴스가 업데이트되었습니다.',
      news: updatedNews
    })
  } catch (error) {
    console.error('뉴스 업데이트 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const news = await prisma.news.findUnique({
      where: { id: params.id }
    })

    if (!news) {
      return NextResponse.json(
        { error: '뉴스를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    await prisma.news.delete({
      where: { id: params.id }
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