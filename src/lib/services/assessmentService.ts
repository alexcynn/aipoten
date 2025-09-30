import { prisma } from '@/lib/prisma'
import { AssessmentStatus, DevelopmentCategory, DevelopmentLevel } from '@prisma/client'

export interface CreateAssessmentData {
  childId: string
  ageInMonths: number
}

export interface AssessmentResultData {
  category: DevelopmentCategory
  score: number
  feedback?: string
  recommendations?: string
}

export interface UpdateAssessmentData {
  results?: AssessmentResultData[]
  status?: AssessmentStatus
}

export class AssessmentService {
  static async createAssessment(data: CreateAssessmentData) {
    const { childId, ageInMonths } = data

    // 이미 진행 중인 발달 체크가 있는지 확인
    const existingAssessment = await prisma.developmentAssessment.findFirst({
      where: {
        childId,
        ageInMonths,
        status: 'IN_PROGRESS'
      }
    })

    if (existingAssessment) {
      return existingAssessment
    }

    return prisma.developmentAssessment.create({
      data: {
        childId,
        ageInMonths,
        status: 'IN_PROGRESS'
      }
    })
  }

  static async getAssessmentById(id: string, userId: string) {
    return prisma.developmentAssessment.findFirst({
      where: {
        id,
        child: {
          userId
        }
      },
      include: {
        child: {
          select: {
            id: true,
            name: true,
            birthDate: true
          }
        },
        results: true
      }
    })
  }

  static async getAssessmentsByUserId(userId: string, childId?: string) {
    let whereCondition: any = {
      child: {
        userId
      }
    }

    if (childId) {
      whereCondition.childId = childId
    }

    return prisma.developmentAssessment.findMany({
      where: whereCondition,
      include: {
        child: {
          select: {
            id: true,
            name: true
          }
        },
        results: {
          select: {
            id: true,
            category: true,
            score: true,
            level: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  static async updateAssessment(id: string, userId: string, data: UpdateAssessmentData) {
    // 소유권 확인
    const assessment = await prisma.developmentAssessment.findFirst({
      where: {
        id,
        child: {
          userId
        }
      }
    })

    if (!assessment) {
      throw new Error('발달 체크를 찾을 수 없습니다.')
    }

    // 기존 결과 삭제 후 새로 생성
    if (data.results && Array.isArray(data.results)) {
      await prisma.assessmentResult.deleteMany({
        where: { assessmentId: id }
      })

      const assessmentResults = data.results.map(result => ({
        assessmentId: id,
        category: result.category,
        score: result.score,
        level: this.calculateDevelopmentLevel(result.score),
        feedback: result.feedback,
        recommendations: result.recommendations
      }))

      await prisma.assessmentResult.createMany({
        data: assessmentResults
      })
    }

    // 발달 체크 상태 업데이트
    return prisma.developmentAssessment.update({
      where: { id },
      data: {
        status: data.status || (data.results ? 'COMPLETED' : 'IN_PROGRESS'),
        completedAt: data.status === 'COMPLETED' || data.results ? new Date() : null
      },
      include: {
        results: true,
        child: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
  }

  static async deleteAssessment(id: string, userId: string) {
    // 소유권 확인
    const assessment = await prisma.developmentAssessment.findFirst({
      where: {
        id,
        child: {
          userId
        }
      }
    })

    if (!assessment) {
      throw new Error('발달 체크를 찾을 수 없습니다.')
    }

    return prisma.developmentAssessment.delete({
      where: { id }
    })
  }

  static calculateDevelopmentLevel(score: number): DevelopmentLevel {
    if (score >= 80) return 'EXCELLENT'
    if (score >= 60) return 'GOOD'
    if (score >= 40) return 'CAUTION'
    return 'NEEDS_OBSERVATION'
  }

  static getDevelopmentLevelInfo(level: DevelopmentLevel) {
    const levelInfo = {
      'EXCELLENT': {
        label: '우수',
        description: '연령에 맞는 발달을 잘 보이고 있습니다.',
        color: 'green',
        scoreRange: '80-100점'
      },
      'GOOD': {
        label: '양호',
        description: '정상적인 발달 범위에 있습니다.',
        color: 'blue',
        scoreRange: '60-79점'
      },
      'CAUTION': {
        label: '주의',
        description: '발달 지연이 우려되어 주의 깊은 관찰이 필요합니다.',
        color: 'yellow',
        scoreRange: '40-59점'
      },
      'NEEDS_OBSERVATION': {
        label: '관찰 필요',
        description: '전문가 상담이 권장됩니다.',
        color: 'red',
        scoreRange: '0-39점'
      }
    }

    return levelInfo[level]
  }

  static getCategoryInfo(category: DevelopmentCategory) {
    const categoryInfo = {
      'GROSS_MOTOR': {
        label: '대근육 발달',
        description: '몸의 큰 근육을 사용하는 운동 능력',
        examples: ['앉기', '서기', '걷기', '뛰기', '균형 잡기']
      },
      'FINE_MOTOR': {
        label: '소근육 발달',
        description: '손가락과 손목의 정교한 움직임 능력',
        examples: ['잡기', '그리기', '쓰기', '단추 끼우기', '블록 쌓기']
      },
      'COGNITIVE': {
        label: '인지 발달',
        description: '사고하고 학습하는 능력',
        examples: ['문제 해결', '기억하기', '주의집중', '상상하기', '추론하기']
      },
      'LANGUAGE': {
        label: '언어 발달',
        description: '말하기와 이해하기 능력',
        examples: ['옹알이', '단어 말하기', '문장 구성', '대화하기', '읽기']
      },
      'SOCIAL': {
        label: '사회성 발달',
        description: '다른 사람과 상호작용하는 능력',
        examples: ['미소 짓기', '놀이 참여', '규칙 지키기', '협력하기', '공감하기']
      },
      'EMOTIONAL': {
        label: '정서 발달',
        description: '감정을 이해하고 표현하는 능력',
        examples: ['감정 인식', '감정 조절', '애착 형성', '자신감', '스트레스 관리']
      }
    }

    return categoryInfo[category]
  }

  static generateRecommendations(results: AssessmentResultData[]) {
    const recommendations: string[] = []

    results.forEach(result => {
      const categoryInfo = this.getCategoryInfo(result.category)
      const levelInfo = this.getDevelopmentLevelInfo(this.calculateDevelopmentLevel(result.score))

      if (result.score < 60) {
        recommendations.push(
          `${categoryInfo.label} 영역의 발달을 위해 ${categoryInfo.examples.slice(0, 2).join(', ')} 등의 활동을 늘려보세요.`
        )
      }
    })

    if (recommendations.length === 0) {
      recommendations.push('전반적으로 좋은 발달을 보이고 있습니다. 현재 활동을 지속해주세요.')
    }

    return recommendations
  }
}