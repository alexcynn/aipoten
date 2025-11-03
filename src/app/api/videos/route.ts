import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

// 영상 목록 조회 및 추천
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const ageInMonths = searchParams.get('ageInMonths')
    const difficulty = searchParams.get('difficulty')
    const search = searchParams.get('search')
    const recommended = searchParams.get('recommended') === 'true'

    const skip = (page - 1) * limit

    let whereCondition: any = {}

    // 관리자가 아닌 경우만 공개된 영상만 조회
    if (session?.user?.role !== 'ADMIN') {
      whereCondition.isPublished = true
    }

    // 연령별 필터링
    if (ageInMonths) {
      const age = parseInt(ageInMonths)
      whereCondition.AND = [
        { targetAgeMin: { lte: age } },
        { targetAgeMax: { gte: age } }
      ]
    }

    // 난이도 필터링
    if (difficulty) {
      whereCondition.difficulty = difficulty
    }

    // 검색어 필터링
    if (search) {
      whereCondition.OR = [
        { title: { contains: search } },
        { description: { contains: search } }
      ]
    }

    let orderBy: any = { priority: 'desc' }

    // 추천 영상인 경우 우선순위와 조회수 기준 정렬
    if (recommended) {
      orderBy = [
        { priority: 'desc' },
        { viewCount: 'desc' },
        { createdAt: 'desc' }
      ]
    }

    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where: whereCondition,
        select: {
          id: true,
          title: true,
          description: true,
          videoUrl: true,
          videoPlatform: true,
          thumbnailUrl: true,
          duration: true,
          targetAgeMin: true,
          targetAgeMax: true,
          difficulty: true,
          viewCount: true,
          bookmarkCount: true,
          priority: true,
          isPublished: true,
          createdAt: true
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.video.count({ where: whereCondition })
    ])

    return NextResponse.json({
      videos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('영상 목록 조회 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 영상 추가 (관리자만)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    // 관리자 권한 확인
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      )
    }

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
      developmentCategories,
      recommendedForLevels,
      priority = 5,
      isPublished = false
    } = await request.json()

    if (!title || !description || !videoUrl || !videoPlatform || !targetAgeMin || !targetAgeMax || !difficulty) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      )
    }

    const video = await prisma.video.create({
      data: {
        title,
        description,
        videoUrl,
        videoPlatform,
        thumbnailUrl,
        duration,
        targetAgeMin,
        targetAgeMax,
        difficulty,
        developmentCategories: developmentCategories ? JSON.stringify(developmentCategories) : null,
        recommendedForLevels: recommendedForLevels ? JSON.stringify(recommendedForLevels) : null,
        priority,
        isPublished
      }
    })

    return NextResponse.json({
      message: '영상이 추가되었습니다.',
      video
    })
  } catch (error) {
    console.error('영상 추가 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}