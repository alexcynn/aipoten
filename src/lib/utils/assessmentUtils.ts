import { DevelopmentCategory, DevelopmentLevel } from '@prisma/client'
import { DEVELOPMENT_CATEGORIES, DEVELOPMENT_LEVELS } from '@/types/assessment'

/**
 * 발달 체크 관련 유틸리티 함수들
 */

/**
 * 점수에 따른 발달 수준을 계산합니다.
 */
export function calculateDevelopmentLevel(score: number): DevelopmentLevel {
  if (score >= 80) return 'EXCELLENT'
  if (score >= 60) return 'GOOD'
  if (score >= 40) return 'CAUTION'
  return 'NEEDS_OBSERVATION'
}

/**
 * 발달 수준 정보를 가져옵니다.
 */
export function getDevelopmentLevelInfo(level: DevelopmentLevel) {
  return DEVELOPMENT_LEVELS[level]
}

/**
 * 발달 영역 정보를 가져옵니다.
 */
export function getDevelopmentCategoryInfo(category: DevelopmentCategory) {
  return DEVELOPMENT_CATEGORIES[category]
}

/**
 * 전체 점수를 계산합니다.
 */
export function calculateOverallScore(categoryScores: Record<DevelopmentCategory, number>): number {
  const scores = Object.values(categoryScores)
  const total = scores.reduce((sum, score) => sum + score, 0)
  return Math.round(total / scores.length)
}

/**
 * 강점 영역을 식별합니다.
 */
export function identifyStrengths(
  categoryScores: Record<DevelopmentCategory, number>,
  threshold = 70
): DevelopmentCategory[] {
  return Object.entries(categoryScores)
    .filter(([_, score]) => score >= threshold)
    .map(([category, _]) => category as DevelopmentCategory)
}

/**
 * 개선이 필요한 영역을 식별합니다.
 */
export function identifyAreasForImprovement(
  categoryScores: Record<DevelopmentCategory, number>,
  threshold = 60
): DevelopmentCategory[] {
  return Object.entries(categoryScores)
    .filter(([_, score]) => score < threshold)
    .map(([category, _]) => category as DevelopmentCategory)
}

/**
 * 발달 점수에 따른 맞춤 추천사항을 생성합니다.
 */
export function generateRecommendations(
  categoryScores: Record<DevelopmentCategory, number>,
  ageInMonths: number
): string[] {
  const recommendations: string[] = []
  const areasForImprovement = identifyAreasForImprovement(categoryScores)

  // 개선이 필요한 영역별 추천
  areasForImprovement.forEach(category => {
    const categoryInfo = getDevelopmentCategoryInfo(category)
    const activities = categoryInfo.examples.slice(0, 2).join(', ')

    recommendations.push(
      `${categoryInfo.label} 향상을 위해 ${activities} 등의 활동을 늘려보세요.`
    )
  })

  // 연령별 일반적인 추천
  if (ageInMonths < 12) {
    recommendations.push('이 시기에는 감각적 자극과 애착 형성이 중요합니다.')
  } else if (ageInMonths < 24) {
    recommendations.push('언어 발달과 기본적인 운동 능력 향상에 집중해보세요.')
  } else if (ageInMonths < 36) {
    recommendations.push('사회성 발달과 정서 조절 능력 향상이 중요한 시기입니다.')
  }

  // 모든 영역이 양호한 경우
  if (areasForImprovement.length === 0) {
    recommendations.push('전반적으로 훌륭한 발달을 보이고 있습니다. 현재 활동을 지속하며 새로운 도전을 시도해보세요.')
  }

  return recommendations
}

/**
 * 백분위를 계산합니다 (일반적인 분포 가정)
 */
export function calculatePercentile(score: number): number {
  // 정규분포를 가정한 근사치 계산
  // 실제로는 연령별 표준화된 점수를 사용해야 함
  if (score >= 90) return 95
  if (score >= 80) return 85
  if (score >= 70) return 70
  if (score >= 60) return 50
  if (score >= 50) return 30
  if (score >= 40) return 15
  return 5
}

/**
 * 발달 지연 위험도를 평가합니다.
 */
export function assessDevelopmentRisk(
  categoryScores: Record<DevelopmentCategory, number>
): 'low' | 'moderate' | 'high' {
  const scores = Object.values(categoryScores)
  const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length
  const lowScoreCount = scores.filter(score => score < 40).length

  if (lowScoreCount >= 2 || averageScore < 45) {
    return 'high'
  } else if (lowScoreCount >= 1 || averageScore < 60) {
    return 'moderate'
  }
  return 'low'
}

/**
 * 다음 평가 시기를 추천합니다.
 */
export function recommendNextAssessment(
  ageInMonths: number,
  riskLevel: 'low' | 'moderate' | 'high'
): string {
  let intervalMonths: number

  switch (riskLevel) {
    case 'high':
      intervalMonths = ageInMonths < 24 ? 2 : 3
      break
    case 'moderate':
      intervalMonths = ageInMonths < 24 ? 3 : 6
      break
    case 'low':
    default:
      intervalMonths = ageInMonths < 12 ? 3 : ageInMonths < 36 ? 6 : 12
      break
  }

  return `${intervalMonths}개월 후`
}

/**
 * 발달 진행 상황을 분석합니다.
 */
export function analyzeDevelopmentProgress(
  previousScores: Record<DevelopmentCategory, number>,
  currentScores: Record<DevelopmentCategory, number>
): {
  category: DevelopmentCategory
  trend: 'improving' | 'stable' | 'declining'
  change: number
}[] {
  const categories = Object.keys(currentScores) as DevelopmentCategory[]

  return categories.map(category => {
    const previousScore = previousScores[category] || 0
    const currentScore = currentScores[category]
    const change = currentScore - previousScore

    let trend: 'improving' | 'stable' | 'declining'
    if (change > 5) {
      trend = 'improving'
    } else if (change < -5) {
      trend = 'declining'
    } else {
      trend = 'stable'
    }

    return {
      category,
      trend,
      change
    }
  })
}

/**
 * 발달 체크 결과를 요약합니다.
 */
export function summarizeAssessmentResults(
  categoryScores: Record<DevelopmentCategory, number>,
  ageInMonths: number
) {
  const overallScore = calculateOverallScore(categoryScores)
  const overallLevel = calculateDevelopmentLevel(overallScore)
  const strengths = identifyStrengths(categoryScores)
  const areasForImprovement = identifyAreasForImprovement(categoryScores)
  const recommendations = generateRecommendations(categoryScores, ageInMonths)
  const riskLevel = assessDevelopmentRisk(categoryScores)

  return {
    overallScore,
    overallLevel,
    overallLevelInfo: getDevelopmentLevelInfo(overallLevel),
    strengths,
    areasForImprovement,
    recommendations,
    riskLevel,
    nextAssessmentRecommendation: recommendNextAssessment(ageInMonths, riskLevel),
    categoryAnalysis: Object.entries(categoryScores).map(([category, score]) => ({
      category: category as DevelopmentCategory,
      score,
      level: calculateDevelopmentLevel(score),
      percentile: calculatePercentile(score),
      categoryInfo: getDevelopmentCategoryInfo(category as DevelopmentCategory)
    }))
  }
}

/**
 * 연령에 맞는 발달 목표를 제공합니다.
 */
export function getDevelopmentGoals(ageInMonths: number): Record<DevelopmentCategory, string[]> {
  if (ageInMonths < 6) {
    return {
      GROSS_MOTOR: ['목 가누기', '뒤집기 준비'],
      FINE_MOTOR: ['손 쥐기', '물건 잡기'],
      COGNITIVE: ['시각 추적', '소리 반응'],
      LANGUAGE: ['옹알이', '소리 모방'],
      SOCIAL: ['미소 짓기', '눈 맞춤'],
      EMOTIONAL: ['기본 감정 표현', '안정감']
    }
  } else if (ageInMonths < 12) {
    return {
      GROSS_MOTOR: ['앉기', '기어다니기', '잡고 서기'],
      FINE_MOTOR: ['집게 손가락 사용', '박수치기'],
      COGNITIVE: ['물체 영속성', '원인과 결과'],
      LANGUAGE: ['첫 단어', '지시 이해'],
      SOCIAL: ['사회적 미소', '놀이 참여'],
      EMOTIONAL: ['애착 형성', '분리불안']
    }
  } else if (ageInMonths < 24) {
    return {
      GROSS_MOTOR: ['걷기', '뛰기 시도', '계단 오르기'],
      FINE_MOTOR: ['끄적이기', '블록 쌓기'],
      COGNITIVE: ['모방 놀이', '간단한 퍼즐'],
      LANGUAGE: ['2단어 문장', '질문하기'],
      SOCIAL: ['병행 놀이', '규칙 따르기'],
      EMOTIONAL: ['독립심', '감정 조절']
    }
  }

  // 24개월 이상
  return {
    GROSS_MOTOR: ['달리기', '점프', '균형 잡기'],
    FINE_MOTOR: ['가위 사용', '그림 그리기'],
    COGNITIVE: ['상징 놀이', '문제 해결'],
    LANGUAGE: ['문장 구성', '대화하기'],
    SOCIAL: ['협력 놀이', '공감하기'],
    EMOTIONAL: ['감정 인식', '자제력']
  }
}