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
      },
      include: {
        assessments: {
          where: { status: 'COMPLETED' },
          include: {
            results: true
          },
          orderBy: { completedAt: 'desc' },
          take: 1
        }
      }
    })

    if (!child) {
      return NextResponse.json(
        { error: '아이 정보를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 현재 월령 계산
    const birthDate = new Date(child.birthDate)
    const today = new Date()
    const ageInMonths = Math.floor(
      (today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
    )

    // 기본 추천: 연령대에 맞는 영상
    let recommendedVideos = await prisma.video.findMany({
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

    // 최근 발달 체크 결과가 있는 경우 맞춤 추천
    if (child.assessments.length > 0) {
      const latestAssessment = child.assessments[0]
      const weakCategories: string[] = []
      const weakLevels: string[] = []

      // 점수가 낮은 영역과 레벨 찾기
      latestAssessment.results.forEach(result => {
        weakCategories.push(result.category)
        if (result.score < 60) {
          // NEEDS_ATTENTION, CAUTION 레벨
          if (result.level === 'NEEDS_ATTENTION' || result.level === 'CAUTION') {
            weakLevels.push(result.level)
          }
        }
      })

      // 약한 영역에 맞는 영상 우선 추천 (developmentCategories 필드 활용)
      if (weakCategories.length > 0) {
        const allVideos = await prisma.video.findMany({
          where: {
            isPublished: true,
            targetAgeMin: { lte: ageInMonths },
            targetAgeMax: { gte: ageInMonths }
          }
        })

        // developmentCategories와 recommendedForLevels를 파싱하여 매칭
        const targetedVideos = allVideos
          .filter(video => {
            const categories = video.developmentCategories
              ? JSON.parse(video.developmentCategories)
              : []
            const levels = video.recommendedForLevels
              ? JSON.parse(video.recommendedForLevels)
              : []

            // 약한 영역과 매칭되거나, 추천 레벨과 매칭되는 영상
            const hasMatchingCategory = categories.some((cat: string) =>
              weakCategories.includes(cat)
            )
            const hasMatchingLevel = levels.length === 0 || levels.some((level: string) =>
              weakLevels.includes(level)
            )

            return hasMatchingCategory || hasMatchingLevel
          })
          .sort((a, b) => {
            // priority 높은 순, viewCount 높은 순
            if (a.priority !== b.priority) return b.priority - a.priority
            return b.viewCount - a.viewCount
          })
          .slice(0, Math.ceil(limit * 0.7))

        // 나머지는 일반 추천으로 채우기
        const remainingCount = limit - targetedVideos.length
        const generalVideos = await prisma.video.findMany({
          where: {
            isPublished: true,
            targetAgeMin: { lte: ageInMonths },
            targetAgeMax: { gte: ageInMonths },
            NOT: {
              id: { in: targetedVideos.map(v => v.id) }
            }
          },
          orderBy: [
            { priority: 'desc' },
            { viewCount: 'desc' }
          ],
          take: remainingCount
        })

        recommendedVideos = [...targetedVideos, ...generalVideos]
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

      if (child.assessments.length > 0) {
        const latestAssessment = child.assessments[0]
        const weakAreas = latestAssessment.results
          .filter(r => r.score < 60)
          .map(r => r.category)

        if (weakAreas.length > 0) {
          const categories: Record<string, string> = {
            'GROSS_MOTOR': '대근육',
            'FINE_MOTOR': '소근육',
            'COGNITIVE': '인지',
            'LANGUAGE': '언어',
            'SOCIAL': '사회성',
            'EMOTIONAL': '정서'
          }

          // developmentCategories에서 약한 영역과 매칭되는 것 찾기
          const matchingCategories = developmentCategories.filter((cat: string) =>
            weakAreas.includes(cat)
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
      assessmentBased: child.assessments.length > 0
    })
  } catch (error) {
    console.error('영상 추천 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}