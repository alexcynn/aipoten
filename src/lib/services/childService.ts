import { prisma } from '@/lib/prisma'
import { Gender } from '@prisma/client'

export interface CreateChildData {
  userId: string
  name: string
  birthDate: Date
  gender: Gender
  gestationalWeeks?: number
  birthWeight?: number
  currentHeight?: number
  currentWeight?: number
  medicalHistory?: string
  familyHistory?: string
  treatmentHistory?: string
  notes?: string
}

export interface UpdateChildData {
  name?: string
  birthDate?: Date
  gender?: Gender
  gestationalWeeks?: number
  birthWeight?: number
  currentHeight?: number
  currentWeight?: number
  medicalHistory?: string
  familyHistory?: string
  treatmentHistory?: string
  notes?: string
}

export class ChildService {
  static async createChild(data: CreateChildData) {
    return prisma.child.create({
      data
    })
  }

  static async getChildById(id: string, userId: string) {
    const child = await prisma.child.findUnique({
      where: {
        id,
        userId
      },
      include: {
        assessments: {
          include: {
            results: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!child) return null

    // 현재 월령 계산
    const birthDate = new Date(child.birthDate)
    const today = new Date()
    const ageInMonths = Math.floor(
      (today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
    )

    return {
      ...child,
      ageInMonths
    }
  }

  static async getChildrenByUserId(userId: string) {
    const children = await prisma.child.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        birthDate: true,
        gender: true,
        currentHeight: true,
        currentWeight: true,
        medicalHistory: true,
        familyHistory: true,
        treatmentHistory: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            assessments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // 각 아이의 현재 월령 계산
    return children.map(child => {
      const birthDate = new Date(child.birthDate)
      const today = new Date()
      const ageInMonths = Math.floor(
        (today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
      )

      return {
        ...child,
        ageInMonths
      }
    })
  }

  static async updateChild(id: string, userId: string, data: UpdateChildData) {
    // 소유권 확인
    const existingChild = await prisma.child.findUnique({
      where: { id, userId }
    })

    if (!existingChild) {
      throw new Error('아이 정보를 찾을 수 없습니다.')
    }

    return prisma.child.update({
      where: { id },
      data
    })
  }

  static async deleteChild(id: string, userId: string) {
    // 소유권 확인
    const existingChild = await prisma.child.findUnique({
      where: { id, userId }
    })

    if (!existingChild) {
      throw new Error('아이 정보를 찾을 수 없습니다.')
    }

    return prisma.child.delete({
      where: { id }
    })
  }

  static calculateAgeInMonths(birthDate: Date): number {
    const today = new Date()
    return Math.floor(
      (today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
    )
  }

  static getAgeGroup(ageInMonths: number): string {
    if (ageInMonths < 6) return '0-6개월'
    if (ageInMonths < 12) return '6-12개월'
    if (ageInMonths < 24) return '1-2세'
    if (ageInMonths < 36) return '2-3세'
    if (ageInMonths < 48) return '3-4세'
    if (ageInMonths < 60) return '4-5세'
    return '5세 이상'
  }

  static getDevelopmentMilestones(ageInMonths: number) {
    // 연령별 발달 이정표 반환
    const milestones: Record<string, string[]> = {
      '0-3': [
        '목 가누기',
        '미소 짓기',
        '소리에 반응하기',
        '손을 입으로 가져가기'
      ],
      '4-6': [
        '뒤집기',
        '앉기 시도',
        '옹알이 하기',
        '장난감 잡기'
      ],
      '7-12': [
        '기어다니기',
        '서기 시도',
        '첫 걸음마',
        '간단한 말하기'
      ],
      '13-24': [
        '안정적으로 걷기',
        '2-3단어 말하기',
        '계단 오르기',
        '컵으로 물 마시기'
      ]
    }

    if (ageInMonths <= 3) return milestones['0-3']
    if (ageInMonths <= 6) return milestones['4-6']
    if (ageInMonths <= 12) return milestones['7-12']
    if (ageInMonths <= 24) return milestones['13-24']

    return ['연령에 맞는 발달 체크를 진행해주세요.']
  }
}