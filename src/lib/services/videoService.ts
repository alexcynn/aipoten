import { prisma } from '@/lib/prisma'
import { VideoPlatform, Difficulty } from '@prisma/client'

export interface CreateVideoData {
  title: string
  description: string
  videoUrl: string
  videoPlatform: VideoPlatform
  thumbnailUrl?: string
  duration?: number
  targetAgeMin: number
  targetAgeMax: number
  difficulty: Difficulty
  priority?: number
  isPublished?: boolean
}

export interface UpdateVideoData {
  title?: string
  description?: string
  videoUrl?: string
  videoPlatform?: VideoPlatform
  thumbnailUrl?: string
  duration?: number
  targetAgeMin?: number
  targetAgeMax?: number
  difficulty?: Difficulty
  priority?: number
  isPublished?: boolean
}

export interface VideoListQuery {
  page?: number
  limit?: number
  ageInMonths?: number
  difficulty?: Difficulty
  search?: string
  recommended?: boolean
}

export class VideoService {
  static async createVideo(data: CreateVideoData) {
    return prisma.video.create({
      data
    })
  }

  static async getVideoById(id: string) {
    // 조회수 증가
    await prisma.video.update({
      where: { id },
      data: { viewCount: { increment: 1 } }
    })

    return prisma.video.findUnique({
      where: { id, isPublished: true }
    })
  }

  static async getVideos(query: VideoListQuery) {
    const { page = 1, limit = 12, ageInMonths, difficulty, search, recommended } = query
    const skip = (page - 1) * limit

    let whereCondition: any = {
      isPublished: true
    }

    // 연령별 필터링
    if (ageInMonths) {
      whereCondition.AND = [
        { targetAgeMin: { lte: ageInMonths } },
        { targetAgeMax: { gte: ageInMonths } }
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
          createdAt: true
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.video.count({ where: whereCondition })
    ])

    return {
      videos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  static async updateVideo(id: string, data: UpdateVideoData) {
    return prisma.video.update({
      where: { id },
      data
    })
  }

  static async deleteVideo(id: string) {
    return prisma.video.delete({
      where: { id }
    })
  }

  static async getPersonalizedRecommendations(childId: string, userId: string, limit = 10) {
    // 아이 정보 조회
    const child = await prisma.child.findUnique({
      where: {
        id: childId,
        userId
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
      throw new Error('아이 정보를 찾을 수 없습니다.')
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
      const weakAreas: string[] = []

      // 점수가 낮은 영역 찾기 (60점 미만)
      latestAssessment.results.forEach(result => {
        if (result.score < 60) {
          switch (result.category) {
            case 'GROSS_MOTOR':
              weakAreas.push('대근육')
              break
            case 'FINE_MOTOR':
              weakAreas.push('소근육')
              break
            case 'COGNITIVE':
              weakAreas.push('인지')
              break
            case 'LANGUAGE':
              weakAreas.push('언어')
              break
            case 'SOCIAL':
              weakAreas.push('사회성')
              break
            case 'EMOTIONAL':
              weakAreas.push('정서')
              break
          }
        }
      })

      // 약한 영역에 맞는 영상 우선 추천
      if (weakAreas.length > 0) {
        const targetedVideos = await prisma.video.findMany({
          where: {
            isPublished: true,
            targetAgeMin: { lte: ageInMonths },
            targetAgeMax: { gte: ageInMonths },
            OR: weakAreas.map(area => ({
              OR: [
                { title: { contains: area } },
                { description: { contains: area } }
              ]
            }))
          },
          orderBy: [
            { priority: 'desc' },
            { viewCount: 'desc' }
          ],
          take: Math.ceil(limit * 0.7) // 70%는 맞춤 추천
        })

        // 나머지는 일반 추천으로 채우기
        const remainingCount = limit - targetedVideos.length
        if (remainingCount > 0) {
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
        } else {
          recommendedVideos = targetedVideos
        }
      }
    }

    // 추천 이유 추가
    const videosWithReasons = recommendedVideos.map(video => {
      let reason = `${child.name}의 연령(${ageInMonths}개월)에 적합한 영상입니다.`

      if (child.assessments.length > 0) {
        const latestAssessment = child.assessments[0]
        const weakAreas = latestAssessment.results
          .filter(r => r.score < 60)
          .map(r => r.category)

        if (weakAreas.length > 0) {
          const categories = {
            'GROSS_MOTOR': '대근육',
            'FINE_MOTOR': '소근육',
            'COGNITIVE': '인지',
            'LANGUAGE': '언어',
            'SOCIAL': '사회성',
            'EMOTIONAL': '정서'
          }

          const weakAreaNames = weakAreas.map(area => categories[area as keyof typeof categories])

          if (weakAreaNames.some(area =>
            video.title.includes(area) || video.description.includes(area)
          )) {
            reason = `${weakAreaNames.join(', ')} 발달을 위해 추천하는 영상입니다.`
          }
        }
      }

      return {
        ...video,
        recommendationReason: reason
      }
    })

    return {
      child: {
        id: child.id,
        name: child.name,
        ageInMonths
      },
      videos: videosWithReasons,
      assessmentBased: child.assessments.length > 0
    }
  }

  static getDifficultyInfo(difficulty: Difficulty) {
    const difficultyInfo = {
      'EASY': {
        label: '쉬움',
        description: '기초적인 활동으로 누구나 쉽게 따라할 수 있습니다.',
        color: 'green'
      },
      'MEDIUM': {
        label: '보통',
        description: '적당한 수준의 활동으로 약간의 연습이 필요합니다.',
        color: 'yellow'
      },
      'HARD': {
        label: '어려움',
        description: '고급 활동으로 충분한 연습과 준비가 필요합니다.',
        color: 'red'
      }
    }

    return difficultyInfo[difficulty]
  }

  static extractVideoId(videoUrl: string, platform: VideoPlatform): string | null {
    try {
      switch (platform) {
        case 'YOUTUBE':
          const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
          const youtubeMatch = videoUrl.match(youtubeRegex)
          return youtubeMatch ? youtubeMatch[1] : null

        case 'VIMEO':
          const vimeoRegex = /vimeo\.com\/(\d+)/
          const vimeoMatch = videoUrl.match(vimeoRegex)
          return vimeoMatch ? vimeoMatch[1] : null

        default:
          return null
      }
    } catch (error) {
      return null
    }
  }

  static generateThumbnailUrl(videoUrl: string, platform: VideoPlatform): string | null {
    const videoId = this.extractVideoId(videoUrl, platform)
    if (!videoId) return null

    switch (platform) {
      case 'YOUTUBE':
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      case 'VIMEO':
        return `https://vumbnail.com/${videoId}.jpg`
      default:
        return null
    }
  }
}