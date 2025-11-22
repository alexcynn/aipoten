'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'

interface ItemFeedback {
  question: string
  feedback: string
  icon: 'check' | 'warning'
}

interface AssessmentResult {
  id: string
  category: string
  score: number
  level: 'ADVANCED' | 'NORMAL' | 'NEEDS_TRACKING' | 'NEEDS_ASSESSMENT'
  itemFeedbacks?: string | null
}

interface Assessment {
  id: string
  childId: string
  ageInMonths: number
  totalScore: number
  createdAt: string
  concernsText?: string | null
  aiAnalysis?: string | null
  aiAnalysisSummary?: string | null
  aiRecommendations?: string | null
  aiCategoryAnalysis?: string | null
  aiAnalyzedAt?: string | null
  child: {
    id: string
    name: string
    gender: string
  }
  results: AssessmentResult[]
}

interface PageParams {
  id: string
}

interface TherapyMapping {
  id: string
  developmentCategory: string
  therapyType: string
  priority: number
  isActive: boolean
}

const CATEGORY_LABELS: Record<string, string> = {
  GROSS_MOTOR: '대근육 운동',
  FINE_MOTOR: '소근육 운동',
  COGNITIVE: '인지 발달',
  LANGUAGE: '언어 발달',
  SOCIAL: '사회성 발달',
}

const CATEGORY_ORDER = ['GROSS_MOTOR', 'FINE_MOTOR', 'LANGUAGE', 'COGNITIVE', 'SOCIAL']

const LEVEL_CONFIG: Record<string, { label: string; bgColor: string; textColor: string; cardBg: string; color: string }> = {
  ADVANCED: { label: '빠른수준', bgColor: 'bg-[#0EBCFF]', textColor: 'text-white', cardBg: 'bg-[#F0FBFF]', color: '#0EBCFF' },
  NORMAL: { label: '또래수준', bgColor: 'bg-[#7CCF3C]', textColor: 'text-white', cardBg: 'bg-[#EDFCE2]', color: '#7CCF3C' },
  NEEDS_TRACKING: { label: '추적검사요망', bgColor: 'bg-[#FFA01B]', textColor: 'text-white', cardBg: 'bg-[#FFF5E8]', color: '#FFA01B' },
  NEEDS_ASSESSMENT: { label: '심화평가권고', bgColor: 'bg-[#EB4C25]', textColor: 'text-white', cardBg: 'bg-[#FFF1ED]', color: '#EB4C25' },
}

const CATEGORY_ICONS: Record<string, string> = {
  GROSS_MOTOR: '👟',
  FINE_MOTOR: '✋',
  LANGUAGE: 'ㄱ',
  COGNITIVE: '💡',
  SOCIAL: '😊',
}

// 레벨별 색상 (HEX)
const LEVEL_COLORS: Record<string, string> = {
  ADVANCED: '#0EBCFF',
  NORMAL: '#7CCF3C',
  NEEDS_TRACKING: '#FFA01B',
  NEEDS_ASSESSMENT: '#EB4C25',
}

// 오각형 레이더 차트 컴포넌트
const PentagonRadarChart = ({ results }: { results: AssessmentResult[] }) => {
  // 5개 카테고리 순서대로 정렬
  const sortedResults = [...results].sort((a, b) => {
    return CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category)
  })

  // 점 위치 (모바일: 170x160, PC: 366x366 배경 기준)
  const dotPositions = [
    { mobile: { x: 80, y: 16 }, pc: { x: 171, y: 14 } },    // 위 (대근육)
    { mobile: { x: 135, y: 57 }, pc: { x: 317, y: 125 } },   // 오른쪽 위 (소근육)
    { mobile: { x: 115, y: 121 }, pc: { x: 261, y: 294 } },  // 오른쪽 아래 (언어)
    { mobile: { x: 44, y: 121 }, pc: { x: 78, y: 294 } },   // 왼쪽 아래 (인지)
    { mobile: { x: 24, y: 57 }, pc: { x: 24, y: 125 } },     // 왼쪽 위 (사회성)
  ]

  // 라벨 위치 (배경 기준으로 변환: graph_check 좌표 - bg_graph offset(46, 33))
  const labelPositions = [
    { mobile: { x: 75, y: 0 }, pc: { x: 164, y: -33 }, anchor: 'middle' as const },      // 위 (210-46, 0-33)
    { mobile: { x: 149, y: 55 }, pc: { x: 362, y: 125 }, anchor: 'start' as const },     // 오른쪽 위 (408-46, 158-33)
    { mobile: { x: 118, y: 131 }, pc: { x: 273, y: 340 }, anchor: 'start' as const },    // 오른쪽 아래 (319-46, 373-33)
    { mobile: { x: 32, y: 132 }, pc: { x: 50, y: 340 }, anchor: 'end' as const },        // 왼쪽 아래 (96-46, 373-33)
    { mobile: { x: 0, y: 55 }, pc: { x: -46, y: 125 }, anchor: 'start' as const },       // 왼쪽 위 (0-46, 158-33)
  ]

  return (
    <div className="flex justify-center my-4 md:my-0">
      <div className="relative w-[170px] h-[160px] md:w-[366px] md:h-[366px]">
        {/* 오각형 배경 (3개 레이어) */}
        <div className="absolute left-[15px] top-[10px] w-[140px] h-[140px] md:left-[0px] md:top-[0px] md:w-[366px] md:h-[366px]">
          {/* 외곽 오각형 */}
          <img
            src="/images/radar-chart-pentagon-outer.svg"
            alt=""
            className="absolute left-0 top-0 w-[140px] h-[140px] md:w-[366px] md:h-[366px] z-[1]"
          />
          {/* 중간 오각형 */}
          <img
            src="/images/radar-chart-pentagon-middle.svg"
            alt=""
            className="absolute left-[9px] top-[9px] w-[122px] h-[122px] md:left-[21px] md:top-[21px] md:w-[324px] md:h-[324px] z-[2]"
          />
          {/* 내부 오각형 */}
          <img
            src="/images/radar-chart-pentagon-inner.svg"
            alt=""
            className="absolute left-[16px] top-[16px] w-[108px] h-[108px] md:left-[42px] md:top-[42px] md:w-[282px] md:h-[282px] z-[3]"
          />
          {/* 중앙 아이 얼굴 */}
          <img
            src="/images/radar-chart-child-face.svg"
            alt=""
            className="absolute left-[49px] top-[48px] w-[43px] h-[41px] md:left-[126px] md:top-[125px] md:w-[113px] md:h-[106px] z-[4]"
          />
        </div>

        {/* 각 카테고리별 점 - 모바일 */}
        {sortedResults.map((result, i) => {
          const pos = dotPositions[i]
          const color = LEVEL_COLORS[result.level] || LEVEL_COLORS.NORMAL
          return (
            <div
              key={`dot-mobile-${result.id}`}
              className="absolute w-[11px] h-[11px] rounded-full z-[10] md:hidden"
              style={{
                left: `${pos.mobile.x}px`,
                top: `${pos.mobile.y}px`,
                backgroundColor: color,
              }}
            />
          )
        })}

        {/* 각 카테고리별 점 - PC */}
        {sortedResults.map((result, i) => {
          const pos = dotPositions[i]
          const color = LEVEL_COLORS[result.level] || LEVEL_COLORS.NORMAL
          return (
            <div
              key={`dot-pc-${result.id}`}
              className="hidden md:block absolute w-[28px] h-[28px] rounded-full z-[10]"
              style={{
                left: `${pos.pc.x}px`,
                top: `${pos.pc.y}px`,
                backgroundColor: color,
              }}
            />
          )
        })}

        {/* 라벨 - 모바일 */}
        {sortedResults.map((result, i) => {
          const pos = labelPositions[i]
          const levelLabel = LEVEL_CONFIG[result.level]?.label.replace('수준', '').replace('검사요망', '').replace('평가권고', '') || ''
          return (
            <p
              key={`label-mobile-${i}`}
              className="absolute text-[12px] text-gray-500 whitespace-nowrap z-[20] md:hidden"
              style={{
                left: `${pos.mobile.x}px`,
                top: `${pos.mobile.y}px`,
                textAlign: pos.anchor === 'middle' ? 'center' : pos.anchor === 'start' ? 'left' : 'right',
                transform: pos.anchor === 'middle' ? 'translateX(-50%)' : pos.anchor === 'end' ? 'translateX(-100%)' : 'none',
              }}
            >
              {levelLabel}
            </p>
          )
        })}

        {/* 라벨 - PC */}
        {sortedResults.map((result, i) => {
          const pos = labelPositions[i]
          const levelLabel = LEVEL_CONFIG[result.level]?.label.replace('수준', '').replace('검사요망', '').replace('평가권고', '') || ''
          return (
            <p
              key={`label-pc-${i}`}
              className="hidden md:block absolute text-[20px] text-gray-500 whitespace-nowrap z-[20]"
              style={{
                left: `${pos.pc.x}px`,
                top: `${pos.pc.y}px`,
                textAlign: pos.anchor === 'middle' ? 'center' : pos.anchor === 'start' ? 'left' : 'right',
                transform: pos.anchor === 'middle' ? 'translateX(-50%)' : pos.anchor === 'end' ? 'translateX(-100%)' : 'none',
              }}
            >
              {levelLabel}
            </p>
          )
        })}
      </div>
    </div>
  )
}

export default function AssessmentDetailPage({ params }: { params: Promise<PageParams> }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'detail' | 'analysis'>('detail')
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false)
  const [analysisError, setAnalysisError] = useState('')
  const [therapyMappings, setTherapyMappings] = useState<TherapyMapping[]>([])

  // 취약 영역에 맞는 치료 분야 가져오기
  const getRecommendedSpecialties = (): string[] => {
    if (!assessment?.results || therapyMappings.length === 0) return []

    // 취약 영역 (NEEDS_TRACKING 또는 NEEDS_ASSESSMENT) 찾기
    const vulnerableCategories = assessment.results
      .filter(r => r.level === 'NEEDS_TRACKING' || r.level === 'NEEDS_ASSESSMENT')
      .map(r => r.category)

    if (vulnerableCategories.length === 0) return []

    // 매핑된 치료 분야 찾기
    const specialties = new Set<string>()
    vulnerableCategories.forEach(category => {
      therapyMappings
        .filter(m => m.developmentCategory === category)
        .forEach(m => specialties.add(m.therapyType))
    })

    return Array.from(specialties)
  }

  // 홈티 예약 링크 생성
  const getTherapistBookingLink = (): string => {
    const specialties = getRecommendedSpecialties()
    if (specialties.length > 0) {
      return `/parent/therapists?specialties=${specialties.join(',')}&autoFilter=true`
    }
    return '/parent/therapists'
  }

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }

    const fetchAssessment = async () => {
      try {
        const resolvedParams = await params
        const response = await fetch(`/api/assessments/${resolvedParams.id}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError('평가 결과를 찾을 수 없습니다.')
          } else if (response.status === 403) {
            setError('이 평가 결과를 볼 권한이 없습니다.')
          } else {
            setError('평가 결과를 불러오는 중 오류가 발생했습니다.')
          }
          setIsLoading(false)
          return
        }
        const data = await response.json()
        const assessmentData = data.assessment || data
        setAssessment(assessmentData)
      } catch (error) {
        console.error('평가 결과 조회 오류:', error)
        setError('평가 결과를 불러오는 중 오류가 발생했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAssessment()
  }, [session, status, router, params])

  // 치료사 매핑 정보 가져오기
  useEffect(() => {
    const fetchTherapyMappings = async () => {
      try {
        const response = await fetch('/api/therapy-mappings')
        if (response.ok) {
          const data = await response.json()
          setTherapyMappings(data.mappings || [])
        }
      } catch (error) {
        console.error('치료사 매핑 조회 오류:', error)
      }
    }

    if (session) {
      fetchTherapyMappings()
    }
  }, [session])

  const getOverallSummary = () => {
    if (!assessment || !assessment.results || assessment.results.length === 0) {
      return '평가 결과가 없습니다.'
    }

    if (assessment.aiAnalysisSummary) {
      return assessment.aiAnalysisSummary
    }

    // 기본 요약 생성
    const hasAssessment = assessment.results.some(r => r.level === 'NEEDS_ASSESSMENT')
    const hasTracking = assessment.results.some(r => r.level === 'NEEDS_TRACKING')
    const weakAreas = assessment.results
      .filter(r => r.level === 'NEEDS_TRACKING' || r.level === 'NEEDS_ASSESSMENT')
      .map(r => CATEGORY_LABELS[r.category].replace(' 발달', '').replace(' 운동', ''))

    if (hasAssessment || hasTracking) {
      return `전반적으로 건강하게 발달하고 있으나 ${weakAreas.join(', ')} 분야는 추적이 필요합니다.`
    }
    return '전반적으로 건강하게 발달하고 있습니다.'
  }

  const handleGenerateAnalysis = async () => {
    if (!assessment) return

    setIsGeneratingAnalysis(true)
    setAnalysisError('')

    try {
      const response = await fetch(`/api/assessments/${assessment.id}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'AI 분석 생성 중 오류가 발생했습니다.')
      }

      const data = await response.json()

      setAssessment(prev => prev ? {
        ...prev,
        aiAnalysis: data.data.aiAnalysis,
        aiAnalysisSummary: data.data.aiAnalysisSummary,
        aiRecommendations: JSON.stringify(data.data.aiRecommendations),
        aiCategoryAnalysis: JSON.stringify(data.data.aiCategoryAnalysis),
        aiAnalyzedAt: data.data.aiAnalyzedAt,
      } : null)
    } catch (error: any) {
      console.error('AI 분석 생성 오류:', error)
      setAnalysisError(error.message)
    } finally {
      setIsGeneratingAnalysis(false)
    }
  }

  const getItemFeedbacks = (category: string): ItemFeedback[] => {
    if (!assessment) return []

    // 먼저 AssessmentResult의 itemFeedbacks 확인
    const result = assessment.results.find(r => r.category === category)
    if (result?.itemFeedbacks) {
      try {
        return JSON.parse(result.itemFeedbacks)
      } catch {
        // 파싱 실패
      }
    }

    // aiCategoryAnalysis에서 확인
    if (assessment.aiCategoryAnalysis) {
      try {
        const categoryAnalysis = JSON.parse(assessment.aiCategoryAnalysis)
        if (categoryAnalysis[category]?.itemFeedbacks) {
          return categoryAnalysis[category].itemFeedbacks
        }
      } catch {
        // 파싱 실패
      }
    }

    return []
  }

  const getRecommendations = (): string[] => {
    if (!assessment?.aiRecommendations) return []
    try {
      return JSON.parse(assessment.aiRecommendations)
    } catch {
      return []
    }
  }

  const getSortedResults = () => {
    if (!assessment?.results) return []
    return [...assessment.results].sort((a, b) => {
      return CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category)
    })
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-[#F3F3F3] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6A00] mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  if (error) {
    return (
      <div className="min-h-screen bg-[#F3F3F3] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link
            href="/parent/dashboard"
            className="inline-flex items-center px-6 py-3 bg-[#FF6A00] text-white rounded-[10px] hover:bg-[#E55F00] transition-colors font-medium"
          >
            대시보드로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  if (!assessment) return null

  return (
    <div className="min-h-screen bg-[#F3F3F3]">
      <Header />

      <main className="pb-8">
        {/* 헤더 섹션 */}
        <div className="bg-[#F3F3F3] px-5 py-5">
          <div className="max-w-[360px] md:max-w-[1280px] mx-auto md:px-[60px]">
            <h1 className="text-[22px] md:text-[28px] font-bold text-[#281E19] mb-2 text-center md:text-left">
              아이포텐 발달체크 리포트
            </h1>
            <p className="text-[16px] md:text-[18px] text-[#777777] text-center md:text-left">
              우리아이의 발달 현황을 한눈에 확인하세요
            </p>
          </div>
        </div>

        {/* 아이 정보 - PC: 상단 가로 배치 */}
        <div className="bg-[#F3F3F3] md:bg-[#F3F3F3] md:mb-6">
          <div className="px-5 md:px-0 max-w-[360px] md:max-w-[1280px] mx-auto">
            <div className="bg-white rounded-[20px] md:rounded-none p-5 md:px-[60px] md:py-[53.5px] mb-4 md:mb-0 md:bg-white">
              {/* 모바일: 세로 배치 */}
              <div className="flex justify-between items-start md:hidden">
                <div className="text-center">
                  <p className="text-[12px] text-[#777777] mb-1.5">아이 이름</p>
                  <p className="text-[16px] font-bold text-[#281E19]">{assessment.child.name}</p>
                </div>
                <div className="text-center">
                  <p className="text-[12px] text-[#777777] mb-1.5">검사일</p>
                  <p className="text-[16px] font-bold text-[#281E19]">
                    {new Date(assessment.createdAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    }).replace(/\. /g, '.').replace(/\.$/, '')}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[12px] text-[#777777] mb-1.5">월령</p>
                  <p className="text-[16px] font-bold text-[#281E19]">{assessment.ageInMonths}개월</p>
                </div>
              </div>

              {/* PC: 가로 배치 라벨+값 형식 */}
              <div className="hidden md:flex md:items-center md:gap-[250px]">
                <div className="flex items-center gap-3">
                  <span className="text-[14px] text-[#777777]">아이 이름</span>
                  <span className="text-[20px] font-bold text-[#281E19]">{assessment.child.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[14px] text-[#777777]">검사일</span>
                  <span className="text-[20px] font-bold text-[#281E19]">
                    {new Date(assessment.createdAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    }).replace(/\. /g, '.').replace(/\.$/, '')}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[14px] text-[#777777]">월령</span>
                  <span className="text-[20px] font-bold text-[#281E19]">{assessment.ageInMonths}개월</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 발달 영역별 현황 - 모바일: 세로, PC: 좌우 배치 */}
        <div className="bg-[#F3F3F3] md:bg-[#F3F3F3] md:mb-6">
          <div className="px-5 md:px-0 max-w-[360px] md:max-w-[1280px] mx-auto">
            <div className="bg-white rounded-[20px] md:rounded-none p-5 md:px-[60px] md:py-[62.5px] mb-4 md:mb-0 md:bg-white">
              <div className="md:flex md:gap-[110px]">
                {/* 왼쪽: 그래프 - 모바일에서만 제목/요약 표시 */}
                <div className="md:w-[450px] md:h-[400px] md:flex-shrink-0">
                  <div className="mb-4 md:hidden">
                    <h2 className="text-[16px] font-bold text-[#281E19] mb-2">발달 영역별 현황</h2>
                    <p className="text-[15px] text-[#777777] leading-[20px]">
                      {getOverallSummary()}
                    </p>
                  </div>

                  {/* 오각형 레이더 차트 */}
                  {assessment.results && assessment.results.length >= 5 && (
                    <div className="md:w-[450px] md:h-[400px]">
                      <PentagonRadarChart results={assessment.results} />
                    </div>
                  )}

                  {/* 영역별 요약 카드 - 모바일만 */}
                  <div className="space-y-2.5 md:hidden">
                    {getSortedResults().map((result) => {
                      const config = LEVEL_CONFIG[result.level] || LEVEL_CONFIG.NORMAL
                      return (
                        <div
                          key={result.id}
                          className={`${config.cardBg} rounded-[10px] px-4 py-2.5 flex items-center justify-between`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-[#FFF7EC] rounded-full flex items-center justify-center text-lg">
                              {CATEGORY_ICONS[result.category] || '📊'}
                            </div>
                            <span className="text-[14px] font-semibold text-[#281E19]">
                              {CATEGORY_LABELS[result.category]?.replace(' 발달', '').replace(' 운동', '') || result.category}
                            </span>
                          </div>
                          <span className={`${config.bgColor} ${config.textColor} text-[12px] font-bold px-2 py-0.5 rounded-full`}>
                            {config.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* 오른쪽: 발달 수준 텍스트 + 영역별 요약 - PC만 */}
                <div className="hidden md:block md:w-[600px]">
                  <div className="mb-[30px]">
                    <h2 className="text-[24px] font-bold text-[#1E1307] mb-[20px] tracking-[-0.48px]">발달 수준</h2>
                    <p className="text-[22px] text-[#1E1307] leading-[31px] tracking-[0.22px]">
                      {getOverallSummary()}
                    </p>
                  </div>

                  {/* 영역별 요약 그리드 - PC용 */}
                  <div className="grid grid-cols-2 gap-x-3 gap-y-3">
                    {getSortedResults().map((result) => {
                      const config = LEVEL_CONFIG[result.level] || LEVEL_CONFIG.NORMAL
                      return (
                        <div
                          key={result.id}
                          className={`${config.cardBg} rounded-[20px] h-[80px] flex items-center justify-between px-4`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-[40px] h-[40px] bg-[#FFF7EC] rounded-full flex items-center justify-center text-[20px]">
                              {CATEGORY_ICONS[result.category] || '📊'}
                            </div>
                            <span className="text-[18px] font-semibold text-[#1E1307] leading-[20px] tracking-[0.18px]">
                              {CATEGORY_LABELS[result.category]?.replace(' 발달', '').replace(' 운동', '') || result.category}
                            </span>
                          </div>
                          <span className={`${config.bgColor} ${config.textColor} text-[14px] font-bold px-[9.6px] py-[1.2px] rounded-full whitespace-nowrap leading-[24px] tracking-[0.14px]`}>
                            {config.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 발달체크 결과 상세 + AI 분석 */}
        <div className="bg-[#F3F3F3]">
          <div className="px-5 md:px-0 max-w-[360px] md:max-w-[1280px] mx-auto">
            {/* 탭 네비게이션 - 모바일만 표시 */}
            <div className="bg-white pt-6 rounded-t-[20px] md:hidden">
              <div className="px-5">
                <div className="bg-[#F3F3F3] rounded-[16px] h-[52px] p-[6px] flex">
                  <button
                    onClick={() => setActiveTab('detail')}
                    className={`flex-1 h-[40px] rounded-[12px] text-[14px] transition-all ${
                      activeTab === 'detail'
                        ? 'bg-white font-bold text-[#281E19]'
                        : 'font-normal text-[#666666]'
                    }`}
                    style={activeTab === 'detail' ? { boxShadow: '0px 3px 4px 0px rgba(0,0,0,0.05)' } : {}}
                  >
                    발달체크 결과 상세
                  </button>
                  <button
                    onClick={() => setActiveTab('analysis')}
                    className={`flex-1 h-[40px] rounded-[12px] text-[14px] transition-all ${
                      activeTab === 'analysis'
                        ? 'bg-white font-bold text-[#281E19]'
                        : 'font-normal text-[#666666]'
                    }`}
                    style={activeTab === 'analysis' ? { boxShadow: '0px 3px 4px 0px rgba(0,0,0,0.05)' } : {}}
                  >
                    AI 종합 분석
                  </button>
                </div>
              </div>
            </div>

            {/* PC: 모든 콘텐츠 표시, 모바일: 탭 콘텐츠 */}
            <div className="bg-white md:bg-transparent">
                  {/* 발달체크 결과 상세 */}
                  <div className={`${activeTab === 'detail' ? 'block' : 'hidden'} md:block`}>
                    <div className="bg-white md:bg-transparent">
                      <div className="md:bg-white md:mb-6">
                        <h2 className="hidden md:block text-[20px] font-bold text-[#281E19] px-[60px] pt-[60px] pb-[13px] border-b border-[#E6E6E6]">발달체크 결과 상세</h2>
                        {getSortedResults().map((result, index) => {
                          const config = LEVEL_CONFIG[result.level] || LEVEL_CONFIG.NORMAL
                          const feedbacks = getItemFeedbacks(result.category)

                          return (
                            <div key={result.id}>
                              <div className="p-[30px] md:px-5 md:py-[30px]">
                                {/* 모바일: 제목과 뱃지 */}
                                <div className="border-b border-[#E6E6E6] pb-4 mb-5 flex items-center justify-between md:hidden">
                                  <h3 className="text-[22px] font-bold text-[#281E19]">
                                    {CATEGORY_LABELS[result.category] || result.category}
                                  </h3>
                                  <span className={`${config.bgColor} ${config.textColor} text-[14px] font-bold px-2.5 py-1 rounded-full`}>
                                    {config.label}
                                  </span>
                                </div>

                                {/* PC: 제목과 아이콘 */}
                                <div className="hidden md:flex md:items-center md:mb-[30px]">
                                  <div className="w-[40px] h-[40px] bg-[#FFF7EC] rounded-full flex items-center justify-center text-[20px] mr-0">
                                    {CATEGORY_ICONS[result.category] || '📊'}
                                  </div>
                                  <h3 className="text-[24px] font-bold text-[#281E19] tracking-[0.24px]">
                                    {CATEGORY_LABELS[result.category] || result.category}
                                  </h3>
                                </div>

                                {/* PC: 발달 체크 결과 박스 */}
                                <div className="hidden md:flex md:items-center md:gap-[10px] md:h-[50px] md:px-6 md:py-[14px] md:mb-[30px] md:rounded-lg" style={{ backgroundColor: 'rgba(240, 251, 255, 0.6)' }}>
                                  <p className="text-[18px] font-bold text-[#333333] tracking-[0.18px]">
                                    발달 체크 결과 :
                                  </p>
                                  <p className="text-[18px] font-extrabold leading-[20px] tracking-[0.18px]" style={{ color: config.color }}>
                                    {config.label}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-[12px] font-bold text-[#777777] mb-2.5 md:hidden">발달 체크 결과</p>
                                  {feedbacks.length > 0 ? (
                                    <div className="space-y-6 md:space-y-0 md:flex md:px-5 md:gap-10">
                                      {/* 왼쪽 컬럼 */}
                                      <div className="md:flex-1 md:space-y-10">
                                        {feedbacks.slice(0, Math.ceil(feedbacks.length / 2)).map((feedback, i) => (
                                          <div key={i}>
                                            <div className="flex items-center gap-[14px] mb-[10px]">
                                              <span className={`text-base md:text-[16px] ${feedback.icon === 'check' ? 'text-[#4CAF50]' : 'text-[#FF6A00]'}`}>
                                                {feedback.icon === 'check' ? '✓' : '△'}
                                              </span>
                                              <span className="text-[14px] md:text-[18px] font-bold text-[#281E19] tracking-[0.18px]">
                                                {feedback.question}
                                              </span>
                                            </div>
                                            <p className="text-[14px] md:text-[18px] text-[#454545] leading-[22px] md:leading-[24px] md:pl-[30px]">
                                              {feedback.feedback}
                                            </p>
                                          </div>
                                        ))}
                                      </div>

                                      {/* 세로 구분선 - PC만 */}
                                      {feedbacks.length > 1 && (
                                        <div className="hidden md:block w-px bg-[#D9D9D9]"></div>
                                      )}

                                      {/* 오른쪽 컬럼 */}
                                      {feedbacks.length > 1 && (
                                        <div className="md:flex-1 md:space-y-10">
                                          {feedbacks.slice(Math.ceil(feedbacks.length / 2)).map((feedback, i) => (
                                            <div key={i}>
                                              <div className="flex items-center gap-[14px] mb-[10px]">
                                                <span className={`text-base md:text-[16px] ${feedback.icon === 'check' ? 'text-[#4CAF50]' : 'text-[#FF6A00]'}`}>
                                                  {feedback.icon === 'check' ? '✓' : '△'}
                                                </span>
                                                <span className="text-[14px] md:text-[18px] font-bold text-[#281E19] tracking-[0.18px]">
                                                  {feedback.question}
                                                </span>
                                              </div>
                                              <p className="text-[14px] md:text-[18px] text-[#454545] leading-[22px] md:leading-[24px] md:pl-[30px]">
                                                {feedback.feedback}
                                              </p>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <p className="text-[14px] md:text-[12px] text-[#777777]">
                                      AI 분석을 생성하면 상세 피드백을 확인할 수 있습니다.
                                    </p>
                                  )}
                                </div>
                              </div>
                              {index < getSortedResults().length - 1 && (
                                <div className="bg-[#F3F3F3] h-4 md:h-2 w-full" />
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* AI 종합 분석 */}
                  <div className={`${activeTab === 'analysis' ? 'block' : 'hidden'} md:block bg-white md:mb-6`}>
                    <h2 className="hidden md:block text-[20px] font-bold text-[#281E19] px-[60px] pt-[60px] pb-[13px] border-b border-[#E6E6E6]">AI 종합분석</h2>
                    <div className="p-[30px] md:px-5 md:py-[30px]">
                      {/* AI 분석이 없는 경우 */}
                      {!assessment.aiAnalysis && !isGeneratingAnalysis && (
                        <div className="text-center py-8">
                          <div className="text-4xl mb-4">🤖</div>
                          <h4 className="text-lg font-medium text-[#281E19] mb-2">
                            AI 종합 분석을 생성하세요
                          </h4>
                          <p className="text-[14px] text-[#777777] mb-6">
                            발달체크 결과를 바탕으로 AI가 맞춤 분석을 제공합니다.
                          </p>
                          <button
                            onClick={handleGenerateAnalysis}
                            className="w-full bg-[#FF6A00] text-white py-3 rounded-[10px] font-semibold text-[16px] hover:bg-[#E55F00] transition-colors"
                          >
                            AI 분석 생성하기
                          </button>
                        </div>
                      )}

                      {/* 분석 생성 중 */}
                      {isGeneratingAnalysis && (
                        <div className="py-8 text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6A00] mx-auto mb-4"></div>
                          <p className="text-[#777777]">AI가 발달체크 결과를 분석하고 있습니다...</p>
                          <p className="text-sm text-[#999999] mt-2">잠시만 기다려주세요 (약 10-20초 소요)</p>
                        </div>
                      )}

                      {/* 분석 에러 */}
                      {analysisError && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-600">{analysisError}</p>
                        </div>
                      )}

                      {/* AI 분석 결과 */}
                      {assessment.aiAnalysis && !isGeneratingAnalysis && (
                        <div>
                          <div className="border-b border-[#FF6A00] pb-2.5 mb-6 flex items-center justify-between md:hidden">
                            <h3 className="text-[24px] font-bold text-[#281E19]">AI 종합 분석</h3>
                            <span className="text-[24px]">🤖</span>
                          </div>

                          <div className="text-[14px] md:text-[18px] text-[#281E19] leading-[22px] md:leading-[30px] mb-6 md:mb-10 whitespace-pre-wrap tracking-[0.18px]">
                            {assessment.aiAnalysis}
                          </div>

                          {/* 맞춤 권장사항 */}
                          {getRecommendations().length > 0 && (
                            <div className="bg-[#FFF7EC] rounded-[14px] p-5 md:px-[50px] md:py-[50px] mb-[10px]">
                              <h4 className="text-[16px] md:text-[18px] font-bold text-[#FF6A00] mb-4 md:mb-6 tracking-[0.18px]">맞춤 권장사항</h4>
                              <div className="space-y-2 md:space-y-[18px] md:flex md:gap-[100px]">
                                {/* 왼쪽 컬럼 */}
                                <div className="md:flex-1 md:space-y-[18px]">
                                  {getRecommendations().slice(0, Math.ceil(getRecommendations().length / 2)).map((rec, i) => (
                                    <div key={i} className="flex items-start gap-[10px]">
                                      <span className="text-[#FF6A00] mt-1 md:mt-0 md:w-4 md:h-[22px] md:flex md:items-center">✓</span>
                                      <p className="text-[14px] md:text-[18px] text-[#454545] leading-[22px] tracking-[0.18px]">{rec}</p>
                                    </div>
                                  ))}
                                </div>
                                {/* 오른쪽 컬럼 - PC만 */}
                                {getRecommendations().length > 1 && (
                                  <div className="hidden md:block md:flex-1 md:space-y-[18px]">
                                    {getRecommendations().slice(Math.ceil(getRecommendations().length / 2)).map((rec, i) => (
                                      <div key={i} className="flex items-start gap-[10px]">
                                        <span className="text-[#FF6A00] w-4 h-[22px] flex items-center">✓</span>
                                        <p className="text-[18px] text-[#454545] leading-[22px] tracking-[0.18px]">{rec}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* 안내 문구 - PC만 */}
                          <div className="hidden md:flex md:items-center md:gap-[10px] md:px-5 md:py-[10px]">
                            <p className="text-[13px] text-[#777777] leading-[20px] tracking-[0.13px]">
                              *본 리포트는 AI 분석기반 참고자료이며, 의학적 진단이 아닙니다. '심화평가 권고' 시 전문 평가를 권장합니다
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 면책 문구 및 액션 버튼 */}
                  <div className="bg-white px-5 md:px-[60px] py-6 md:py-[60px] border-t md:border-t-0 border-gray-200">
                    {/* 면책 문구 - 모바일만 */}
                    <p className="text-[10px] text-[#777777] text-center mb-4 leading-[14px] md:hidden">
                      *본 리포트는 AI 분석기반 참고자료이며, 의학적 진단이 아닙니다.<br />
                      '심화평가 권고' 시 전문 평가를 권장합니다
                    </p>

                    {/* CTA 버튼 - 모바일: 전체 너비, PC: 중앙 정렬 고정 너비 */}
                    <div className="flex gap-3 md:gap-5 md:justify-center">
                      <Link
                        href="/videos"
                        className="flex-1 md:flex-none md:w-[300px] md:h-[60px] bg-[#FF6A00] text-white py-3 md:py-0 md:flex md:items-center md:justify-center rounded-[10px] font-semibold text-[16px] md:text-[18px] md:leading-[20px] md:tracking-[0.18px] text-center hover:bg-[#E55F00] transition-colors"
                      >
                        홈케어 콘텐츠 보기
                      </Link>
                      <Link
                        href={getTherapistBookingLink()}
                        className="flex-1 md:flex-none md:w-[300px] md:h-[60px] bg-[#FF6A00] text-white py-3 md:py-0 md:flex md:items-center md:justify-center rounded-[10px] font-semibold text-[16px] md:text-[18px] md:leading-[20px] md:tracking-[0.18px] text-center hover:bg-[#E55F00] transition-colors"
                      >
                        홈티 예약하기
                      </Link>
                    </div>
                  </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
