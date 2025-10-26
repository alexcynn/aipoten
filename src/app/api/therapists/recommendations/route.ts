import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

/**
 * GET /api/therapists/recommendations
 * 발달체크 결과를 기반으로 추천 치료사 필터를 제공
 *
 * Query Parameters:
 * - assessmentId: 발달체크 ID
 */
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
    const assessmentId = searchParams.get('assessmentId')

    if (!assessmentId) {
      return NextResponse.json(
        { error: 'assessmentId가 필요합니다.' },
        { status: 400 }
      )
    }

    // 발달체크 결과 조회
    const assessment = await prisma.developmentAssessment.findUnique({
      where: { id: assessmentId },
      include: {
        results: true,
        child: true,
      },
    })

    if (!assessment) {
      return NextResponse.json(
        { error: '발달체크를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 부모 권한 확인 - Child는 userId로 User와 직접 연결되어 있음
    if (session.user.role === 'PARENT') {
      if (assessment.child.userId !== session.user.id) {
        return NextResponse.json(
          { error: '권한이 없습니다.' },
          { status: 403 }
        )
      }
    }

    // 또래 수준 미달인 영역 찾기 (NEEDS_TRACKING 또는 NEEDS_ASSESSMENT)
    const belowLevelCategories = assessment.results
      .filter(
        (result) =>
          result.level === 'NEEDS_TRACKING' || result.level === 'NEEDS_ASSESSMENT'
      )
      .map((result) => result.category)

    console.log('또래 수준 미달 영역:', belowLevelCategories)

    // 미달 영역이 없으면 빈 추천 반환
    if (belowLevelCategories.length === 0) {
      return NextResponse.json({
        recommendedSpecialties: [],
        childAgeRange: null,
        message: '모든 발달 영역이 또래 수준입니다. 추천할 치료 분야가 없습니다.',
      })
    }

    // 미달 영역에 매핑된 치료 분야 조회
    const mappings = await prisma.therapyMapping.findMany({
      where: {
        developmentCategory: { in: belowLevelCategories },
        isActive: true,
      },
      orderBy: {
        priority: 'asc',
      },
    })

    // 중복 제거하여 추천 치료 분야 목록 생성
    const recommendedSpecialties = [
      ...new Set(mappings.map((m) => m.therapyType)),
    ]

    console.log('추천 치료 분야:', recommendedSpecialties)

    // 아이 나이를 기반으로 연령대 계산
    const childBirthDate = new Date(assessment.child.birthDate)
    const ageInMonths =
      (new Date().getTime() - childBirthDate.getTime()) / (1000 * 60 * 60 * 24 * 30)

    let childAgeRange = ''
    if (ageInMonths <= 12) childAgeRange = 'AGE_0_12'
    else if (ageInMonths <= 24) childAgeRange = 'AGE_13_24'
    else if (ageInMonths <= 36) childAgeRange = 'AGE_25_36'
    else if (ageInMonths <= 48) childAgeRange = 'AGE_37_48'
    else if (ageInMonths <= 60) childAgeRange = 'AGE_49_60'
    else childAgeRange = 'AGE_5_7'

    console.log(`아이 나이: ${Math.floor(ageInMonths)}개월 → ${childAgeRange}`)

    return NextResponse.json({
      recommendedSpecialties,
      childAgeRange,
      belowLevelCategories,
      message: `${belowLevelCategories.length}개 영역에서 또래 수준 미달이 확인되었습니다.`,
    })
  } catch (error) {
    console.error('❌ 치료사 추천 오류:', error)
    return NextResponse.json(
      {
        error: '서버 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
