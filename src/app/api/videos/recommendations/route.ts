import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

// 개인화된 영상 추천
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const childId = searchParams.get('childId')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!childId) {
      return NextResponse.json(
        { error: '아이 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    // 아이 정보 조회
    const child = await prisma.child.findUnique({
      where: {
        id: childId,
        userId: session.user.id
      }
    })

    if (!child) {
      return NextResponse.json(
        { error: '아이 정보를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 최근 완료된 발달체크 결과 조회
    const latestAssessment = await prisma.developmentAssessment.findFirst({
      where: {
        childId: childId,
        status: 'COMPLETED'
      },
      include: {
        results: true
      },
      orderBy: { completedAt: 'desc' }
    })

    // 현재 월령 계산
    const birthDate = new Date(child.birthDate)
    const today = new Date()
    const ageInMonths = Math.floor(
      (today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
    )

    let recommendedVideos: any[] = []
    let priorityCategories: string[] = []

    // 최근 발달 체크 결과가 있는 경우 취약 영역 영상만 추천
    if (latestAssessment) {
      // NEEDS_ASSESSMENT(전문가 상담 필요)와 NEEDS_TRACKING(관심필요)을 분리
      const needsAssessmentCategories: string[] = []
      const needsTrackingCategories: string[] = []

      latestAssessment.results.forEach(result => {
        if (result.level === 'NEEDS_ASSESSMENT') {
          needsAssessmentCategories.push(result.category)
        } else if (result.level === 'NEEDS_TRACKING') {
          needsTrackingCategories.push(result.category)
        }
      })

      // NEEDS_ASSESSMENT 영역 우선, 없으면 NEEDS_TRACKING 영역 사용
      priorityCategories = needsAssessmentCategories.length > 0
        ? needsAssessmentCategories
        : needsTrackingCategories

      // 취약 영역이 있는 경우 해당 영역 영상만 추천
      if (priorityCategories.length > 0) {
        const allVideos = await prisma.video.findMany({
          where: {
            isPublished: true,
            targetAgeMin: { lte: ageInMonths },
            targetAgeMax: { gte: ageInMonths }
          }
        })

        // developmentCategories와 매칭하여 필터링 - 취약 영역만
        recommendedVideos = allVideos
          .filter(video => {
            const categories = video.developmentCategories
              ? JSON.parse(video.developmentCategories)
              : []

            // 취약 영역과 매칭되는 영상만 필터링
            const hasMatchingCategory = categories.some((cat: string) =>
              priorityCategories.includes(cat)
            )

            return hasMatchingCategory
          })
          .sort((a, b) => {
            // priority 높은 순, viewCount 높은 순
            if (a.priority !== b.priority) return b.priority - a.priority
            return b.viewCount - a.viewCount
          })
          .slice(0, limit)
      }
    }

    // 발달체크가 없거나 취약 영역이 없는 경우에만 일반 추천
    if (recommendedVideos.length === 0 && priorityCategories.length === 0) {
      recommendedVideos = await prisma.video.findMany({
        where: {
          isPublished: true,
          targetAgeMin: { lte: ageInMonths },
          targetAgeMax: { gte: ageInMonths }
        },
        orderBy: [
          { priority: 'desc' },
          { viewCount: 'desc' }
        ],
        take: limit
      })

      // 연령대에 맞는 영상이 없으면 전체 공개 영상에서 가져오기
      if (recommendedVideos.length === 0) {
        recommendedVideos = await prisma.video.findMany({
          where: {
            isPublished: true
          },
          orderBy: [
            { priority: 'desc' },
            { viewCount: 'desc' }
          ],
          take: limit
        })
      }
    }

    // 추천 이유 추가 및 JSON 파싱
    const videosWithReasons = recommendedVideos.map(video => {
      let reason = `${child.name}의 연령(${ageInMonths}개월)에 적합한 영상입니다.`

      // JSON 필드 파싱
      const developmentCategories = video.developmentCategories
        ? JSON.parse(video.developmentCategories)
        : []
      const recommendedForLevels = video.recommendedForLevels
        ? JSON.parse(video.recommendedForLevels)
        : []

      if (latestAssessment) {
        // NEEDS_ASSESSMENT 우선, 없으면 NEEDS_TRACKING
        const needsAssessment = latestAssessment.results
          .filter(r => r.level === 'NEEDS_ASSESSMENT')
          .map(r => r.category)
        const needsTracking = latestAssessment.results
          .filter(r => r.level === 'NEEDS_TRACKING')
          .map(r => r.category)

        const priorityAreas = needsAssessment.length > 0 ? needsAssessment : needsTracking

        if (priorityAreas.length > 0) {
          const categories: Record<string, string> = {
            'GROSS_MOTOR': '대근육',
            'FINE_MOTOR': '소근육',
            'COGNITIVE': '인지',
            'LANGUAGE': '언어',
            'SOCIAL': '사회성',
            'EMOTIONAL': '정서'
          }

          // developmentCategories에서 우선순위 취약 영역과 매칭되는 것 찾기
          const matchingCategories = developmentCategories.filter((cat: string) =>
            priorityAreas.includes(cat)
          )

          if (matchingCategories.length > 0) {
            const categoryNames = matchingCategories.map((cat: string) => categories[cat])
            reason = `${categoryNames.join(', ')} 발달을 위해 추천하는 영상입니다.`
          }
        }
      }

      return {
        ...video,
        developmentCategories,
        recommendedForLevels,
        recommendationReason: reason
      }
    })

    return NextResponse.json({
      child: {
        id: child.id,
        name: child.name,
        ageInMonths
      },
      videos: videosWithReasons,
      assessmentBased: !!latestAssessment
    })
  } catch (error) {
    console.error('영상 추천 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}