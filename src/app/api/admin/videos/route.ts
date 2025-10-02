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

    const videos = await prisma.video.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedVideos = videos.map(video => ({
      id: video.id,
      title: video.title,
      description: video.description,
      youtubeUrl: video.youtubeUrl,
      thumbnailUrl: video.thumbnailUrl,
      category: video.category,
      ageGroup: video.ageGroup,
      tags: JSON.parse(video.tags || '[]'),
      views: video.views,
      isActive: video.isActive,
      createdAt: video.createdAt.toISOString()
    }))

    return NextResponse.json(formattedVideos)
  } catch (error) {
    console.error('비디오 목록 조회 오류:', error)
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

    const { title, description, youtubeUrl, thumbnailUrl, category, ageGroup, tags } = await request.json()

    if (!title || !description || !youtubeUrl || !category || !ageGroup) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      )
    }

    const video = await prisma.video.create({
      data: {
        title,
        description,
        youtubeUrl,
        thumbnailUrl: thumbnailUrl || null,
        category,
        ageGroup,
        tags: JSON.stringify(tags || []),
        views: 0,
        isActive: true
      }
    })

    return NextResponse.json({
      message: '비디오가 추가되었습니다.',
      video
    })
  } catch (error) {
    console.error('비디오 추가 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}