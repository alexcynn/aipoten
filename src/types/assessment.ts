import { DevelopmentCategory, DevelopmentLevel } from '@prisma/client'

// 발달 체크 관련 상수
export const DEVELOPMENT_CATEGORIES = {
  GROSS_MOTOR: {
    label: '대근육 발달',
    description: '몸의 큰 근육을 사용하는 운동 능력',
    examples: ['앉기', '서기', '걷기', '뛰기', '균형 잡기'],
    color: '#3B82F6'
  },
  FINE_MOTOR: {
    label: '소근육 발달',
    description: '손가락과 손목의 정교한 움직임 능력',
    examples: ['잡기', '그리기', '쓰기', '단추 끼우기', '블록 쌓기'],
    color: '#10B981'
  },
  COGNITIVE: {
    label: '인지 발달',
    description: '사고하고 학습하는 능력',
    examples: ['문제 해결', '기억하기', '주의집중', '상상하기', '추론하기'],
    color: '#8B5CF6'
  },
  LANGUAGE: {
    label: '언어 발달',
    description: '말하기와 이해하기 능력',
    examples: ['옹알이', '단어 말하기', '문장 구성', '대화하기', '읽기'],
    color: '#F59E0B'
  },
  SOCIAL: {
    label: '사회성 발달',
    description: '다른 사람과 상호작용하는 능력',
    examples: ['미소 짓기', '놀이 참여', '규칙 지키기', '협력하기', '공감하기'],
    color: '#EF4444'
  },
  EMOTIONAL: {
    label: '정서 발달',
    description: '감정을 이해하고 표현하는 능력',
    examples: ['감정 인식', '감정 조절', '애착 형성', '자신감', '스트레스 관리'],
    color: '#EC4899'
  }
} as const

export const DEVELOPMENT_LEVELS = {
  EXCELLENT: {
    label: '우수',
    description: '연령에 맞는 발달을 잘 보이고 있습니다.',
    color: '#10B981',
    bgColor: '#D1FAE5',
    scoreRange: { min: 80, max: 100 },
    recommendations: [
      '현재 수준을 유지하며 다양한 활동을 경험해보세요.',
      '아이의 관심사를 더 깊이 탐구할 수 있는 활동을 제공해주세요.',
      '또래 친구들과의 상호작용 기회를 늘려주세요.'
    ]
  },
  GOOD: {
    label: '양호',
    description: '정상적인 발달 범위에 있습니다.',
    color: '#3B82F6',
    bgColor: '#DBEAFE',
    scoreRange: { min: 60, max: 79 },
    recommendations: [
      '꾸준한 활동으로 발달을 지속적으로 도와주세요.',
      '아이의 흥미를 유발하는 다양한 놀이를 시도해보세요.',
      '발달 수준에 맞는 적절한 자극을 제공해주세요.'
    ]
  },
  CAUTION: {
    label: '주의',
    description: '발달 지연이 우려되어 주의 깊은 관찰이 필요합니다.',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    scoreRange: { min: 40, max: 59 },
    recommendations: [
      '해당 영역의 발달을 위한 집중적인 활동이 필요합니다.',
      '전문가와 상담하여 적절한 개입 방법을 알아보세요.',
      '일상생활에서 더 많은 관련 경험을 제공해주세요.'
    ]
  },
  NEEDS_OBSERVATION: {
    label: '관찰 필요',
    description: '전문가 상담이 권장됩니다.',
    color: '#EF4444',
    bgColor: '#FEE2E2',
    scoreRange: { min: 0, max: 39 },
    recommendations: [
      '즉시 전문가와 상담하여 정확한 평가를 받으세요.',
      '개별화된 발달 지원 계획을 수립하세요.',
      '지속적인 모니터링과 개입이 필요합니다.'
    ]
  }
} as const

// 연령별 발달 이정표
export const DEVELOPMENT_MILESTONES = {
  '0-3': {
    ageRange: '0-3개월',
    milestones: {
      GROSS_MOTOR: ['목 가누기 시도', '엎드려서 고개 들기', '반사적 움직임'],
      FINE_MOTOR: ['손 쥐기 반사', '물건을 잠깐 잡기', '손을 입으로 가져가기'],
      COGNITIVE: ['소리에 반응하기', '움직이는 물체 따라보기', '익숙한 소리 구별하기'],
      LANGUAGE: ['울음으로 의사표현', '다양한 소리 내기', '목소리에 반응하기'],
      SOCIAL: ['미소 짓기', '눈 맞춤하기', '사람 얼굴 선호하기'],
      EMOTIONAL: ['기본적 감정 표현', '안정감 느끼기', '애착 형성 시작']
    }
  },
  '4-6': {
    ageRange: '4-6개월',
    milestones: {
      GROSS_MOTOR: ['뒤집기', '목 완전히 가누기', '앉기 시도'],
      FINE_MOTOR: ['장난감 잡기', '손에서 손으로 옮기기', '입으로 탐색하기'],
      COGNITIVE: ['원인과 결과 이해하기', '낯선 것에 호기심 보이기', '간단한 게임 즐기기'],
      LANGUAGE: ['옹알이 하기', '목소리 톤 구별하기', '자신의 이름에 반응하기'],
      SOCIAL: ['웃음소리 내기', '놀이에 참여하기', '사람들과 상호작용 즐기기'],
      EMOTIONAL: ['기쁨과 불쾌감 표현', '익숙한 사람 구별하기', '감정 조절 시작']
    }
  },
  '7-12': {
    ageRange: '7-12개월',
    milestones: {
      GROSS_MOTOR: ['기어다니기', '잡고 서기', '걷기 시도'],
      FINE_MOTOR: ['집게 손가락으로 잡기', '박수치기', '컵 들고 마시기'],
      COGNITIVE: ['물체 영속성 이해', '간단한 지시 따르기', '문제 해결 시도'],
      LANGUAGE: ['첫 단어 말하기', '간단한 지시 이해하기', '몸짓 언어 사용하기'],
      SOCIAL: ['까꿍 놀이 즐기기', '분리불안 보이기', '사회적 미소 짓기'],
      EMOTIONAL: ['다양한 감정 표현', '애착 대상 선호하기', '낯선 사람 경계하기']
    }
  },
  '13-18': {
    ageRange: '13-18개월',
    milestones: {
      GROSS_MOTOR: ['혼자 걷기', '계단 기어오르기', '공 차기 시도'],
      FINE_MOTOR: ['크레용으로 끄적이기', '블록 2-3개 쌓기', '숟가락 사용 시도'],
      COGNITIVE: ['모방 놀이 하기', '간단한 퍼즐 맞추기', '책 페이지 넘기기'],
      LANGUAGE: ['5-10개 단어 사용하기', '간단한 요청 이해하기', '몸짓과 말 결합하기'],
      SOCIAL: ['다른 아이들에게 관심 보이기', '간단한 놀이 규칙 따르기', '도움 요청하기'],
      EMOTIONAL: ['자율성 추구하기', '좌절감 표현하기', '칭찬에 기뻐하기']
    }
  },
  '19-24': {
    ageRange: '19-24개월',
    milestones: {
      GROSS_MOTOR: ['뛰기 시도', '계단 오르내리기', '공 던지기'],
      FINE_MOTOR: ['선 그리기', '블록 4-6개 쌓기', '지퍼 올리기 시도'],
      COGNITIVE: ['상징 놀이 하기', '색깔 구별하기', '2-3단계 지시 따르기'],
      LANGUAGE: ['2단어 문장 만들기', '50개 이상 단어 사용', '질문하기 시작'],
      SOCIAL: ['병행 놀이 하기', '소유욕 나타내기', '어른 행동 따라하기'],
      EMOTIONAL: ['독립심 강해지기', '고집 부리기', '감정 조절 발달']
    }
  }
} as const

// 발달 체크 질문 타입
export interface AssessmentQuestion {
  id: string
  category: DevelopmentCategory
  question: string
  ageRangeMin: number
  ageRangeMax: number
  expectedBehavior: string
  scoringCriteria: {
    score: number
    description: string
  }[]
}

// 발달 체크 결과 분석
export interface AssessmentAnalysis {
  overallScore: number
  overallLevel: DevelopmentLevel
  categoryScores: {
    category: DevelopmentCategory
    score: number
    level: DevelopmentLevel
    percentile?: number
  }[]
  strengths: DevelopmentCategory[]
  areasForImprovement: DevelopmentCategory[]
  recommendations: string[]
  nextAssessmentDate?: Date
}

// 발달 진행 상황 추적
export interface DevelopmentProgress {
  childId: string
  assessments: {
    date: Date
    ageInMonths: number
    scores: Record<DevelopmentCategory, number>
  }[]
  trends: {
    category: DevelopmentCategory
    trend: 'improving' | 'stable' | 'declining'
    changeRate: number
  }[]
}