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
    const { isActive, title, description, youtubeUrl, thumbnailUrl, category, ageGroup, tags } = body

    const video = await prisma.video.findUnique({
      where: { id: params.id }
    })

    if (!video) {
      return NextResponse.json(
        { error: '비디오를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const updateData: any = {}

    if (isActive !== undefined) updateData.isActive = isActive
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (youtubeUrl !== undefined) updateData.youtubeUrl = youtubeUrl
    if (thumbnailUrl !== undefined) updateData.thumbnailUrl = thumbnailUrl
    if (category !== undefined) updateData.category = category
    if (ageGroup !== undefined) updateData.ageGroup = ageGroup
    if (tags !== undefined) updateData.tags = JSON.stringify(tags)

    const updatedVideo = await prisma.video.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json({
      message: '비디오가 업데이트되었습니다.',
      video: updatedVideo
    })
  } catch (error) {
    console.error('비디오 업데이트 오류:', error)
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

    const video = await prisma.video.findUnique({
      where: { id: params.id }
    })

    if (!video) {
      return NextResponse.json(
        { error: '비디오를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    await prisma.video.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: '비디오가 삭제되었습니다.'
    })
  } catch (error) {
    console.error('비디오 삭제 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}