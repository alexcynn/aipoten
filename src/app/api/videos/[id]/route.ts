import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'

// 영상 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 조회수 증가
    await prisma.video.update({
      where: { id },
      data: { viewCount: { increment: 1 } }
    })

    const video = await prisma.video.findUnique({
      where: { id, isPublished: true }
    })

    if (!video) {
      return NextResponse.json(
        { error: '영상을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ video })
  } catch (error) {
    console.error('영상 조회 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 영상 수정 (관리자만)
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
      description,
      videoUrl,
      videoPlatform,
      thumbnailUrl,
      duration,
      targetAgeMin,
      targetAgeMax,
      difficulty,
      priority,
      isPublished
    } = await request.json()

    const updateData: any = {}

    if (title) updateData.title = title
    if (description) updateData.description = description
    if (videoUrl) updateData.videoUrl = videoUrl
    if (videoPlatform) updateData.videoPlatform = videoPlatform
    if (thumbnailUrl !== undefined) updateData.thumbnailUrl = thumbnailUrl
    if (duration !== undefined) updateData.duration = duration
    if (targetAgeMin !== undefined) updateData.targetAgeMin = targetAgeMin
    if (targetAgeMax !== undefined) updateData.targetAgeMax = targetAgeMax
    if (difficulty) updateData.difficulty = difficulty
    if (priority !== undefined) updateData.priority = priority
    if (isPublished !== undefined) updateData.isPublished = isPublished

    const video = await prisma.video.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({
      message: '영상이 수정되었습니다.',
      video
    })
  } catch (error) {
    console.error('영상 수정 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 영상 삭제 (관리자만)
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

    await prisma.video.delete({
      where: { id }
    })

    return NextResponse.json({
      message: '영상이 삭제되었습니다.'
    })
  } catch (error) {
    console.error('영상 삭제 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}