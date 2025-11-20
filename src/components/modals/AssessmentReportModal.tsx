'use client'

import { useState, useEffect } from 'react'

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

interface AssessmentReportModalProps {
  assessmentId: string
  isOpen: boolean
  onClose: () => void
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

const LEVEL_CONFIG: Record<string, { label: string; bgColor: string; textColor: string; cardBg: string }> = {
  ADVANCED: { label: '빠른수준', bgColor: 'bg-[#0EBCFF]', textColor: 'text-white', cardBg: 'bg-[#F0FBFF]' },
  NORMAL: { label: '또래수준', bgColor: 'bg-[#7CCF3C]', textColor: 'text-white', cardBg: 'bg-[#EDFCE2]' },
  NEEDS_TRACKING: { label: '추적검사요망', bgColor: 'bg-[#FFA01B]', textColor: 'text-white', cardBg: 'bg-[#FFF5E8]' },
  NEEDS_ASSESSMENT: { label: '심화평가권고', bgColor: 'bg-[#EB4C25]', textColor: 'text-white', cardBg: 'bg-[#FFF1ED]' },
}

// 카테고리별 아이콘 컴포넌트
const CategoryIcon = ({ category }: { category: string }) => {
  const bgCircle = '/images/icon-bg-circle.svg'

  const renderIcon = () => {
    switch (category) {
      case 'GROSS_MOTOR':
        return (
          <div className="absolute inset-1/4">
            <img alt="" className="absolute h-[17.5px] left-0 top-0 w-[18.5px]" src="/images/icon-shoe-1.svg" />
            <img alt="" className="absolute h-[10px] left-[12.2px] top-[2.6px] w-[6.9px]" src="/images/icon-shoe-2.svg" />
            <img alt="" className="absolute h-[11.7px] left-[6px] top-[5.9px] w-[13.6px]" src="/images/icon-shoe-3.svg" />
            <img alt="" className="absolute h-[4.3px] left-[0.5px] top-[15.3px] w-[8.2px]" src="/images/icon-shoe-4.svg" />
          </div>
        )
      case 'FINE_MOTOR':
        return (
          <div className="absolute inset-1/4">
            <img alt="" className="w-full h-full" src="/images/icon-hand.svg" />
          </div>
        )
      case 'LANGUAGE':
        return (
          <div className="absolute inset-[30%_27.5%_30.7%_22.5%]">
            <img alt="" className="w-full h-full" src="/images/icon-korean.svg" />
          </div>
        )
      case 'COGNITIVE':
        return (
          <div className="absolute inset-[22.5%_25.4%_27.5%_24.6%]">
            <img alt="" className="absolute h-[10.5px] left-[5.5px] top-[3.8px] w-[9.7px]" src="/images/icon-bulb-1.svg" />
            <img alt="" className="absolute h-[10.5px] left-[5.5px] top-[3.8px] w-[5.4px]" src="/images/icon-bulb-2.svg" />
            <img alt="" className="absolute h-[2.2px] left-[9.9px] top-[16px] w-[1.1px]" src="/images/icon-bulb-3.svg" />
            <img alt="" className="absolute h-[1.7px] left-[7.7px] top-[13.8px] w-[5.6px]" src="/images/icon-bulb-4.svg" />
            <img alt="" className="absolute h-[1.7px] left-[7.7px] top-[15.4px] w-[5.6px]" src="/images/icon-bulb-5.svg" />
            <img alt="" className="absolute h-[2px] left-[10.2px] top-[1px] w-[0.6px]" src="/images/icon-bulb-6.svg" />
            <img alt="" className="absolute h-[1.6px] left-[4.5px] top-[3.3px] w-[1.6px]" src="/images/icon-bulb-7.svg" />
            <img alt="" className="absolute h-[0.6px] left-[2.2px] top-[8.8px] w-[2px]" src="/images/icon-bulb-8.svg" />
            <img alt="" className="absolute h-[0.6px] left-[16.8px] top-[8.8px] w-[2px]" src="/images/icon-bulb-9.svg" />
            <img alt="" className="absolute h-[1.6px] left-[14.9px] top-[3.3px] w-[1.6px]" src="/images/icon-bulb-10.svg" />
          </div>
        )
      case 'SOCIAL':
        return (
          <div className="absolute inset-1/4">
            <img alt="" className="absolute left-0 top-0 w-[20px] h-[20px]" src="/images/icon-smile-1.svg" />
            <img alt="" className="absolute h-[5.7px] left-[4.1px] top-[8.3px] w-[10.6px]" src="/images/icon-smile-2.svg" />
            <img alt="" className="absolute h-[2.1px] left-[6px] top-[6.2px] w-[2px]" src="/images/icon-smile-eye.svg" />
            <img alt="" className="absolute h-[2.1px] left-[10px] top-[6.2px] w-[2px]" src="/images/icon-smile-eye.svg" />
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="relative w-full h-full">
      <img alt="" className="w-full h-full" src={bgCircle} />
      {renderIcon()}
    </div>
  )
}

const LEVEL_COLORS: Record<string, string> = {
  ADVANCED: '#0EBCFF',
  NORMAL: '#7CCF3C',
  NEEDS_TRACKING: '#FFA01B',
  NEEDS_ASSESSMENT: '#EB4C25',
}

// 오각형 레이더 차트 컴포넌트
const PentagonRadarChart = ({ results }: { results: AssessmentResult[] }) => {
  const sortedResults = [...results].sort((a, b) => {
    return CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category)
  })

  const dotPositions = [
    { x: 80, y: 16 },
    { x: 135, y: 57 },
    { x: 115, y: 121 },
    { x: 44, y: 121 },
    { x: 24, y: 57 },
  ]

  const labelPositions = [
    { x: 75, y: 0, anchor: 'middle' as const },
    { x: 149, y: 55, anchor: 'start' as const },
    { x: 118, y: 131, anchor: 'start' as const },
    { x: 32, y: 132, anchor: 'end' as const },
    { x: 0, y: 55, anchor: 'start' as const },
  ]

  return (
    <div className="flex justify-center my-4">
      <div className="relative w-[170px] h-[160px]">
        <div className="absolute left-[15px] top-[10px] w-[140px] h-[140px]">
          <img src="/images/radar-chart-pentagon-outer.svg" alt="" className="absolute left-0 top-0 w-[140px] h-[140px] z-[1]" />
          <img src="/images/radar-chart-pentagon-middle.svg" alt="" className="absolute left-[9px] top-[9px] w-[122px] h-[122px] z-[2]" />
          <img src="/images/radar-chart-pentagon-inner.svg" alt="" className="absolute left-[16px] top-[16px] w-[108px] h-[108px] z-[3]" />
          <img src="/images/radar-chart-child-face.svg" alt="" className="absolute left-[49px] top-[48px] w-[43px] h-[41px] z-[4]" />
        </div>
        {sortedResults.map((result, i) => {
          const pos = dotPositions[i]
          const color = LEVEL_COLORS[result.level] || LEVEL_COLORS.NORMAL
          return (
            <div
              key={result.id}
              className="absolute w-[11px] h-[11px] rounded-full z-[10]"
              style={{ left: `${pos.x}px`, top: `${pos.y}px`, backgroundColor: color }}
            />
          )
        })}
        {sortedResults.map((result, i) => {
          const pos = labelPositions[i]
          const levelLabel = LEVEL_CONFIG[result.level]?.label.replace('수준', '').replace('검사요망', '').replace('평가권고', '') || ''
          return (
            <p
              key={`label-${i}`}
              className="absolute text-[12px] text-gray-500 whitespace-nowrap z-[20]"
              style={{
                left: `${pos.x}px`,
                top: `${pos.y}px`,
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

export default function AssessmentReportModal({ assessmentId, isOpen, onClose }: AssessmentReportModalProps) {
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'detail' | 'analysis'>('detail')
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
    if (!isOpen || !assessmentId) return

    const fetchAssessment = async () => {
      setIsLoading(true)
      setError('')
      try {
        const response = await fetch(`/api/assessments/${assessmentId}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError('평가 결과를 찾을 수 없습니다.')
          } else if (response.status === 403) {
            setError('이 평가 결과를 볼 권한이 없습니다.')
          } else {
            setError('평가 결과를 불러오는 중 오류가 발생했습니다.')
          }
          return
        }
        const data = await response.json()
        setAssessment(data.assessment || data)
      } catch (error) {
        console.error('평가 결과 조회 오류:', error)
        setError('평가 결과를 불러오는 중 오류가 발생했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAssessment()
  }, [isOpen, assessmentId])

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

    if (isOpen) {
      fetchTherapyMappings()
    }
  }, [isOpen])

  const getOverallSummary = () => {
    if (!assessment || !assessment.results || assessment.results.length === 0) {
      return '평가 결과가 없습니다.'
    }
    if (assessment.aiAnalysisSummary) {
      return assessment.aiAnalysisSummary
    }
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

  const getItemFeedbacks = (category: string): ItemFeedback[] => {
    if (!assessment) return []

    // 1. AssessmentResult의 itemFeedbacks에서 먼저 확인
    const result = assessment.results.find(r => r.category === category)
    if (result?.itemFeedbacks) {
      try {
        const parsed = JSON.parse(result.itemFeedbacks)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
        }
      } catch (e) {
        console.error('itemFeedbacks 파싱 오류:', e)
      }
    }

    // 2. aiCategoryAnalysis에서 확인
    if (assessment.aiCategoryAnalysis) {
      try {
        const categoryAnalysis = JSON.parse(assessment.aiCategoryAnalysis)
        if (categoryAnalysis[category]?.itemFeedbacks) {
          return categoryAnalysis[category].itemFeedbacks
        }
      } catch (e) {
        console.error('aiCategoryAnalysis 파싱 오류:', e)
      }
    }

    return []
  }

  // 카테고리별 분석 텍스트 가져오기
  const getCategoryAnalysisText = (category: string): string | null => {
    if (!assessment?.aiCategoryAnalysis) return null
    try {
      const categoryAnalysis = JSON.parse(assessment.aiCategoryAnalysis)
      return categoryAnalysis[category]?.analysis || null
    } catch {
      return null
    }
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#F3F3F3] rounded-2xl max-w-[420px] w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="bg-[#F3F3F3] px-5 py-4 flex items-center justify-between border-b border-gray-200">
          <div>
            <h1 className="text-[18px] font-bold text-[#281E19]">아이포텐 발달체크 리포트</h1>
            <p className="text-[12px] text-[#777777]">우리아이의 발달 현황을 한눈에 확인하세요</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 컨텐츠 */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF6A00] mx-auto"></div>
                <p className="mt-3 text-gray-600 text-sm">로딩 중...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <p className="text-red-600 mb-4 text-sm">{error}</p>
                <button onClick={onClose} className="px-4 py-2 bg-[#FF6A00] text-white rounded-lg text-sm">
                  닫기
                </button>
              </div>
            </div>
          ) : assessment ? (
            <div className="pb-4">
              {/* 아이 정보 카드 */}
              <div className="px-4 pt-4">
                <div className="bg-white rounded-[16px] p-4 mb-3">
                  <div className="flex justify-between items-start text-center">
                    <div>
                      <p className="text-[10px] text-[#777777] mb-1">아이 이름</p>
                      <p className="text-[14px] font-bold text-[#281E19]">{assessment.child.name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#777777] mb-1">검사일</p>
                      <p className="text-[14px] font-bold text-[#281E19]">
                        {new Date(assessment.createdAt).toLocaleDateString('ko-KR', {
                          year: 'numeric', month: '2-digit', day: '2-digit'
                        }).replace(/\. /g, '.').replace(/\.$/, '')}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#777777] mb-1">월령</p>
                      <p className="text-[14px] font-bold text-[#281E19]">{assessment.ageInMonths}개월</p>
                    </div>
                  </div>
                </div>

                {/* 발달 영역별 현황 */}
                <div className="bg-white rounded-[16px] p-4 mb-3">
                  <div className="mb-3">
                    <h2 className="text-[14px] font-bold text-[#281E19] mb-1">발달 영역별 현황</h2>
                    <p className="text-[13px] text-[#777777] leading-[18px]">{getOverallSummary()}</p>
                  </div>
                  {assessment.results && assessment.results.length >= 5 && (
                    <PentagonRadarChart results={assessment.results} />
                  )}
                  <div className="space-y-2">
                    {getSortedResults().map((result) => {
                      const config = LEVEL_CONFIG[result.level] || LEVEL_CONFIG.NORMAL
                      return (
                        <div key={result.id} className={`${config.cardBg} rounded-[8px] px-3 py-2 flex items-center justify-between`}>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8">
                              <CategoryIcon category={result.category} />
                            </div>
                            <span className="text-[12px] font-semibold text-[#281E19]">
                              {CATEGORY_LABELS[result.category]?.replace(' 발달', '').replace(' 운동', '') || result.category}
                            </span>
                          </div>
                          <span className={`${config.bgColor} ${config.textColor} text-[10px] font-bold px-2 py-0.5 rounded-full`}>
                            {config.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* 탭 네비게이션 */}
              <div className="bg-white pt-4">
                <div className="px-4">
                  <div className="bg-[#F3F3F3] rounded-[12px] p-1 flex">
                    <button
                      onClick={() => setActiveTab('detail')}
                      className={`flex-1 py-2 px-3 rounded-[10px] text-[12px] font-medium transition-all ${
                        activeTab === 'detail' ? 'bg-white shadow-sm font-bold text-[#281E19]' : 'text-[#666666]'
                      }`}
                    >
                      발달체크 결과 상세
                    </button>
                    <button
                      onClick={() => setActiveTab('analysis')}
                      className={`flex-1 py-2 px-3 rounded-[10px] text-[12px] font-medium transition-all ${
                        activeTab === 'analysis' ? 'bg-white shadow-sm font-bold text-[#281E19]' : 'text-[#666666]'
                      }`}
                    >
                      AI 종합 분석
                    </button>
                  </div>
                </div>

                {/* 탭 콘텐츠 */}
                {activeTab === 'detail' ? (
                  <div>
                    {getSortedResults().map((result, index) => {
                      const config = LEVEL_CONFIG[result.level] || LEVEL_CONFIG.NORMAL
                      const feedbacks = getItemFeedbacks(result.category)
                      return (
                        <div key={result.id}>
                          <div className="p-5">
                            <div className="border-b border-[#E6E6E6] pb-3 mb-4 flex items-center justify-between">
                              <h3 className="text-[18px] font-bold text-[#281E19]">
                                {CATEGORY_LABELS[result.category] || result.category}
                              </h3>
                              <span className={`${config.bgColor} ${config.textColor} text-[12px] font-bold px-2 py-0.5 rounded-full`}>
                                {config.label}
                              </span>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-[#777777] mb-2">발달 체크 결과</p>
                              <div className="space-y-4">
                                {feedbacks.length > 0 ? (
                                  feedbacks.map((feedback, i) => (
                                    <div key={i}>
                                      <div className="flex items-center gap-1 mb-1">
                                        <span className={`text-xs ${feedback.icon === 'check' ? 'text-green-500' : 'text-orange-500'}`}>
                                          {feedback.icon === 'check' ? '✓' : '△'}
                                        </span>
                                        <span className="text-[12px] font-bold text-[#281E19]">{feedback.question}</span>
                                      </div>
                                      <p className="text-[12px] text-[#454545] leading-[18px]">{feedback.feedback}</p>
                                    </div>
                                  ))
                                ) : getCategoryAnalysisText(result.category) ? (
                                  <p className="text-[12px] text-[#454545] leading-[18px] whitespace-pre-wrap">
                                    {getCategoryAnalysisText(result.category)}
                                  </p>
                                ) : (
                                  <p className="text-[12px] text-[#777777]">상세 분석 데이터가 없습니다.</p>
                                )}
                              </div>
                            </div>
                          </div>
                          {index < getSortedResults().length - 1 && <div className="h-2 bg-[#F3F3F3]" />}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="p-5">
                    {assessment.aiAnalysis ? (
                      <div className="space-y-5">
                        <div>
                          <h3 className="text-[14px] font-bold text-[#281E19] mb-2">종합 분석</h3>
                          <p className="text-[12px] text-[#454545] leading-[20px] whitespace-pre-wrap">
                            {assessment.aiAnalysis}
                          </p>
                        </div>
                        {getRecommendations().length > 0 && (
                          <div className="bg-[#FFF5EB] rounded-[12px] p-4">
                            <h3 className="text-[14px] font-bold text-[#FF6A00] mb-3">맞춤 권장사항</h3>
                            <ul className="space-y-2">
                              {getRecommendations().map((rec, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-[#FF6A00] mt-0.5">•</span>
                                  <span className="text-[12px] text-[#454545] leading-[18px]">{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-[#777777] text-sm">AI 분석이 아직 생성되지 않았습니다.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* 면책 문구 및 액션 버튼 - 탭과 상관없이 항상 표시 */}
                <div className="p-5 border-t border-gray-200">
                  {/* 면책 문구 */}
                  <p className="text-[10px] text-[#777777] text-center mb-4 leading-[14px]">
                    *본 리포트는 AI 분석기반 참고자료이며, 의학적 진단이 아닙니다.<br />
                    '심화평가 권고' 시 전문 평가를 권장합니다
                  </p>

                  {/* 액션 버튼 */}
                  <div className="flex gap-[12px]">
                    <button
                      onClick={() => {
                        onClose()
                        window.location.href = '/videos'
                      }}
                      className="flex-1 h-[48px] bg-[#FF6A00] rounded-[10px] flex items-center justify-center hover:bg-[#E55F00] transition-colors"
                    >
                      <span className="font-semibold text-[16px] text-white tracking-[0.16px]">
                        홈케어 콘텐츠 보기
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        onClose()
                        window.location.href = getTherapistBookingLink()
                      }}
                      className="flex-1 h-[48px] bg-[#FF6A00] rounded-[10px] flex items-center justify-center hover:bg-[#E55F00] transition-colors"
                    >
                      <span className="font-semibold text-[16px] text-white tracking-[0.16px]">
                        홈티 예약하기
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
