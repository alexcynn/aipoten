'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface AssessmentResult {
  id: string
  category: string
  score: number
  level: 'ADVANCED' | 'NORMAL' | 'NEEDS_TRACKING' | 'NEEDS_ASSESSMENT'
}

interface Assessment {
  id: string
  childId: string
  ageInMonths: number
  totalScore: number
  createdAt: string
  concernsText?: string | null
  aiAnalysis?: string | null
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

const CATEGORY_LABELS: Record<string, string> = {
  GROSS_MOTOR: '대근육 운동',
  FINE_MOTOR: '소근육 운동',
  COGNITIVE: '인지',
  LANGUAGE: '언어',
  SOCIAL: '사회성',
}

const LEVEL_LABELS: Record<string, { label: string; color: string; bgColor: string; emoji: string }> = {
  ADVANCED: { label: '빠른 수준', color: 'text-green-600', bgColor: 'bg-green-50', emoji: '🎉' },
  NORMAL: { label: '또래 수준', color: 'text-blue-600', bgColor: 'bg-blue-50', emoji: '😊' },
  NEEDS_TRACKING: { label: '추적검사 요망', color: 'text-yellow-600', bgColor: 'bg-yellow-50', emoji: '🤔' },
  NEEDS_ASSESSMENT: { label: '심화평가 권고', color: 'text-red-600', bgColor: 'bg-red-50', emoji: '😟' },
}

export default function AssessmentDetailPage({ params }: { params: Promise<PageParams> }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false)
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false)
  const [analysisError, setAnalysisError] = useState('')

  // Prompt management
  const [showPrompt, setShowPrompt] = useState(false)
  const [customPrompt, setCustomPrompt] = useState('')
  const [isPromptEdited, setIsPromptEdited] = useState(false)
  const [showGuide, setShowGuide] = useState(false)

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
        // API는 { assessment } 형태로 반환
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

  const getOverallInterpretation = () => {
    if (!assessment || !assessment.results || assessment.results.length === 0) {
      return { level: '-', color: 'text-gray-600', description: '평가 결과가 없습니다.' }
    }

    // 가장 낮은 레벨을 기준으로 종합 평가
    const hasAssessment = assessment.results.some(r => r.level === 'NEEDS_ASSESSMENT')
    const hasTracking = assessment.results.some(r => r.level === 'NEEDS_TRACKING')
    const hasNormal = assessment.results.some(r => r.level === 'NORMAL')
    const allAdvanced = assessment.results.every(r => r.level === 'ADVANCED')

    if (allAdvanced) {
      return { level: '빠른 수준', color: 'text-green-600', description: '모든 영역에서 빠른 발달을 보이고 있습니다.' }
    }
    if (hasAssessment) {
      return { level: '심화평가 필요', color: 'text-red-600', description: '일부 영역에서 심화평가가 권고됩니다. 전문가 상담을 고려해보세요.' }
    }
    if (hasTracking) {
      return { level: '추적 필요', color: 'text-yellow-600', description: '일부 영역에서 추적검사가 필요할 수 있습니다.' }
    }
    if (hasNormal) {
      return { level: '또래 수준', color: 'text-blue-600', description: '대체로 또래 수준의 발달을 보이고 있습니다.' }
    }
    return { level: '빠른 수준', color: 'text-green-600', description: '빠른 발달을 보이고 있습니다.' }
  }

  const handleTherapistRecommendation = async () => {
    if (!assessment) return

    setIsLoadingRecommendations(true)
    try {
      const response = await fetch(`/api/therapists/recommendations?assessmentId=${assessment.id}`)
      const data = await response.json()

      if (response.ok) {
        // 추천 치료 분야와 연령대를 쿼리 파라미터로 전달하여 치료사 검색 페이지로 이동
        const params = new URLSearchParams()
        if (data.recommendedSpecialties && data.recommendedSpecialties.length > 0) {
          params.append('specialties', data.recommendedSpecialties.join(','))
        }
        if (data.childAgeRange) {
          params.append('ageRange', data.childAgeRange)
        }
        params.append('autoFilter', 'true') // 자동 필터 적용 표시

        router.push(`/parent/therapists?${params.toString()}`)
      } else {
        alert(data.error || '추천 치료사를 불러오는 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('치료사 추천 오류:', error)
      alert('서버 오류가 발생했습니다.')
    } finally {
      setIsLoadingRecommendations(false)
    }
  }

  const hasBelowLevelResults = () => {
    if (!assessment || !assessment.results) return false
    return assessment.results.some(
      r => r.level === 'NEEDS_TRACKING' || r.level === 'NEEDS_ASSESSMENT'
    )
  }

  // 프롬프트 생성 함수
  const createAssessmentAnalysisPrompt = () => {
    if (!assessment) return ''

    const categoryNames: Record<string, string> = {
      GROSS_MOTOR: '대근육 운동',
      FINE_MOTOR: '소근육 운동',
      LANGUAGE: '언어',
      COGNITIVE: '인지',
      SOCIAL: '사회성',
    }

    const levelNames: Record<string, string> = {
      ADVANCED: '또래보다 빠른 수준',
      NORMAL: '또래 수준',
      NEEDS_TRACKING: '추적검사 권장',
      NEEDS_ASSESSMENT: '심화평가 권장',
    }

    const resultsText = assessment.results
      .map((r) => {
        const category = categoryNames[r.category] || r.category
        const level = levelNames[r.level] || r.level
        return `- ${category}: ${r.score}점 (${level})`
      })
      .join('\n')

    return `당신은 아동 발달 전문가입니다. 다음 발달체크 결과를 바탕으로 종합 분석을 제공해주세요.

## 아이 정보
- 월령: ${assessment.ageInMonths}개월

## 발달체크 결과
${resultsText}

${assessment.concernsText ? `## 부모님의 우려 사항\n${assessment.concernsText}\n` : ''}

## 참고할 전문 지식
[RAG 시스템이 월령과 발달 영역에 맞는 전문 지식을 자동으로 가져옵니다]

## 요청사항
위 정보를 바탕으로 다음 내용을 포함한 종합 분석을 작성해주세요:

1. **전반적인 발달 상태 요약** (2-3문장)
2. **영역별 상세 분석**
   - 각 발달 영역(대근육, 소근육, 언어, 인지, 사회성)에 대한 평가
   - 강점 영역과 주의가 필요한 영역 구분
3. **맞춤 육아 팁 및 활동 추천** (3-5가지)
   - 월령에 맞는 구체적인 놀이 및 활동
   - 일상생활에서 실천 가능한 팁
4. **전문가 상담 필요성**
   - 전문가 상담이 필요한지 여부
   - 필요하다면 어떤 분야의 치료사와 상담이 도움이 될지

응답은 마크다운 형식으로 작성하되, 부모님이 읽기 쉽고 따뜻한 톤으로 작성해주세요.`
  }

  // 프롬프트 미리보기 업데이트
  const updatePromptPreview = () => {
    if (!isPromptEdited) {
      setCustomPrompt(createAssessmentAnalysisPrompt())
    }
  }

  // 기본 프롬프트로 복원
  const resetToDefaultPrompt = () => {
    setCustomPrompt(createAssessmentAnalysisPrompt())
    setIsPromptEdited(false)
  }

  const handleGenerateAnalysis = async () => {
    if (!assessment) return

    setIsGeneratingAnalysis(true)
    setAnalysisError('')

    try {
      const body: any = {}

      // 커스텀 프롬프트가 있으면 추가
      if (isPromptEdited && customPrompt) {
        body.customPrompt = customPrompt
      }

      const response = await fetch(`/api/assessments/${assessment.id}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'AI 분석 생성 중 오류가 발생했습니다.')
      }

      const data = await response.json()

      // 분석 결과를 현재 assessment에 반영
      setAssessment(prev => prev ? {
        ...prev,
        aiAnalysis: data.data.aiAnalysis,
        aiAnalyzedAt: data.data.aiAnalyzedAt,
      } : null)
    } catch (error: any) {
      console.error('AI 분석 생성 오류:', error)
      setAnalysisError(error.message)
    } finally {
      setIsGeneratingAnalysis(false)
    }
  }

  const getRadarChartData = () => {
    if (!assessment || !assessment.results) return []

    // 발달 수준을 4점 척도로 변환
    const levelToScore = (level: string) => {
      switch (level) {
        case 'ADVANCED': return 4      // 빠른 수준
        case 'NORMAL': return 3         // 또래 수준
        case 'NEEDS_TRACKING': return 2 // 추적검사 요망
        case 'NEEDS_ASSESSMENT': return 1 // 심화평가 권고
        default: return 0
      }
    }

    return assessment.results.map(result => ({
      category: CATEGORY_LABELS[result.category] || result.category,
      score: levelToScore(result.level),
      fullMark: 4
    }))
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-neutral-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aipoten-green mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-light flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link
            href="/parent/dashboard"
            style={{ backgroundColor: '#F78C6B' }}
            className="inline-flex items-center px-6 py-3 text-white rounded-md hover:opacity-90 transition-all font-medium shadow-md"
          >
            대시보드로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  if (!assessment) {
    return null
  }

  const interpretation = getOverallInterpretation()

  return (
    <div className="min-h-screen bg-neutral-light">
      <Header />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Assessment Header */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {assessment.child.name}의 발달체크 결과
                  </h1>
                  <p className="text-gray-600 mt-1">
                    평가일: {new Date(assessment.createdAt).toLocaleDateString('ko-KR')} •
                    당시 월령: {assessment.ageInMonths}개월
                  </p>
                </div>
                <Link
                  href={`/assessments/new?childId=${assessment.child.id}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-aipoten-green hover:bg-aipoten-navy"
                >
                  새 평가 시작
                </Link>
              </div>

              {/* Overall Result */}
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <div className={`text-3xl font-bold mb-4 ${interpretation.color}`}>
                  {interpretation.level}
                </div>
                <div className="text-sm text-gray-500 mb-4">종합 발달 수준</div>
                <p className="text-gray-700">{interpretation.description}</p>
              </div>
            </div>
          </div>

          {/* Radar Chart */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6 text-center">발달 영역 종합 차트</h3>
              <div className="flex justify-center">
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={getRadarChartData()}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis
                      dataKey="category"
                      tick={{ fill: '#374151', fontSize: 14, fontWeight: 500 }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 4]}
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      ticks={[0, 1, 2, 3, 4]}
                    />
                    <Radar
                      name="발달 점수"
                      dataKey="score"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.6}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        padding: '0.75rem'
                      }}
                      formatter={(value: number) => {
                        const levelText = value === 4 ? '빠른 수준' :
                                        value === 3 ? '또래 수준' :
                                        value === 2 ? '추적검사 요망' :
                                        value === 1 ? '심화평가 권고' : '-'
                        return [`${value}점 (${levelText})`, '발달 수준']
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600 mb-3">각 영역의 발달 수준을 시각적으로 확인할 수 있습니다.</p>
                <div className="flex justify-center gap-4 text-xs text-gray-500">
                  <span>4점: 빠른 수준</span>
                  <span>3점: 또래 수준</span>
                  <span>2점: 추적검사 요망</span>
                  <span>1점: 심화평가 권고</span>
                </div>
              </div>
            </div>
          </div>

          {/* Category Results */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">영역별 발달 수준</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {(assessment.results || []).map((result) => {
                  const levelInfo = LEVEL_LABELS[result.level] || LEVEL_LABELS.NORMAL
                  return (
                    <div key={result.id} className="border border-gray-200 rounded-lg p-4 text-center">
                      <h4 className="font-medium text-gray-900 mb-3">
                        {CATEGORY_LABELS[result.category] || result.category}
                      </h4>
                      <div className="text-3xl mb-2">{levelInfo.emoji}</div>
                      <div className={`inline-flex items-center px-3 py-2 rounded-full ${levelInfo.bgColor}`}>
                        <span className={`text-sm font-medium ${levelInfo.color}`}>
                          {levelInfo.label}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* AI Analysis Section */}
          <div className="mt-6 bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">AI 종합 분석</h3>
              </div>

              {/* 프롬프트 관리 섹션 */}
              {!assessment.aiAnalysis && (
                <div className="mb-4 border-t border-gray-200 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPrompt(!showPrompt)
                      if (!showPrompt) {
                        updatePromptPreview()
                      }
                    }}
                    style={{
                      width: '100%',
                      backgroundColor: '#F3F4F6',
                      color: '#374151',
                      padding: '12px',
                      borderRadius: '6px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: '1px solid #D1D5DB',
                    }}
                  >
                    <span>🔧 프롬프트 보기/수정 (고급)</span>
                    <span>{showPrompt ? '▲' : '▼'}</span>
                  </button>

                  {showPrompt && (
                    <div className="mt-4 space-y-4">
                      {/* 프롬프트 작성 가이드 */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg">
                        <button
                          type="button"
                          onClick={() => setShowGuide(!showGuide)}
                          className="w-full px-4 py-3 flex items-center justify-between text-left"
                        >
                          <span className="font-medium text-blue-900">📖 프롬프트 작성 가이드</span>
                          <span className="text-blue-600">{showGuide ? '▲' : '▼'}</span>
                        </button>

                        {showGuide && (
                          <div className="px-4 pb-4 text-sm text-blue-900 space-y-3">
                            <div>
                              <h4 className="font-semibold mb-1">✨ 효과적인 프롬프트 작성 팁</h4>
                              <ul className="list-disc ml-5 space-y-1">
                                <li><strong>역할 정의:</strong> AI의 역할을 명확히 지정하세요</li>
                                <li><strong>구체적 지시:</strong> 원하는 출력 형식과 구조를 명확히 설명하세요</li>
                                <li><strong>톤 조정:</strong> 따뜻한 톤, 전문적 톤 등 원하는 어조를 명시하세요</li>
                                <li><strong>RAG 활용:</strong> 커스텀 프롬프트 사용 시 RAG 지식베이스가 자동으로 적용되지 않습니다</li>
                              </ul>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-1">🎯 발달체크 분석 프롬프트 구조</h4>
                              <ul className="list-disc ml-5 space-y-1 text-xs">
                                <li>아이 정보 (월령)</li>
                                <li>발달체크 결과 (영역별 점수와 수준)</li>
                                <li>부모님의 우려 사항 (선택)</li>
                                <li>요청사항 (전반적 요약, 영역별 분석, 육아 팁, 전문가 상담 필요성)</li>
                              </ul>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-1">⚠️ 주의사항</h4>
                              <ul className="list-disc ml-5 space-y-1">
                                <li>커스텀 프롬프트 사용 시 RAG 지식베이스 참조가 비활성화됩니다</li>
                                <li>전문 용어 사용 시 부모님이 이해하기 어려울 수 있습니다</li>
                                <li>지나치게 긴 프롬프트는 생성 시간이 오래 걸릴 수 있습니다</li>
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 프롬프트 편집기 */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            프롬프트 편집
                          </label>
                          <button
                            type="button"
                            onClick={resetToDefaultPrompt}
                            style={{
                              backgroundColor: '#EF4444',
                              color: 'white',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '500',
                              border: 'none',
                              cursor: 'pointer',
                            }}
                          >
                            기본값으로 복원
                          </button>
                        </div>
                        <textarea
                          value={customPrompt || createAssessmentAnalysisPrompt()}
                          onChange={(e) => {
                            setCustomPrompt(e.target.value)
                            setIsPromptEdited(true)
                          }}
                          rows={12}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aipoten-green font-mono text-xs"
                          style={{ backgroundColor: '#FAFAFA' }}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          {isPromptEdited ? '⚠️ 프롬프트가 수정되었습니다. RAG 참조 없이 수정된 프롬프트로만 AI가 생성합니다.' : '기본 프롬프트를 사용합니다. RAG 시스템이 자동으로 관련 지식을 참조합니다.'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* AI 분석 생성 버튼 */}
              {!assessment.aiAnalysis && (
                <button
                  onClick={handleGenerateAnalysis}
                  disabled={isGeneratingAnalysis}
                  style={{
                    width: '100%',
                    backgroundColor: isGeneratingAnalysis ? '#9CA3AF' : '#386646',
                    color: 'white',
                    padding: '12px',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: isGeneratingAnalysis ? 'not-allowed' : 'pointer',
                    border: 'none',
                    marginBottom: '16px',
                  }}
                  onMouseEnter={(e) => {
                    if (!isGeneratingAnalysis) e.currentTarget.style.backgroundColor = '#193149'
                  }}
                  onMouseLeave={(e) => {
                    if (!isGeneratingAnalysis) e.currentTarget.style.backgroundColor = '#386646'
                  }}
                >
                  {isGeneratingAnalysis ? '분석 생성 중...' : 'AI 분석 생성하기'}
                </button>
              )}

              {analysisError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{analysisError}</p>
                </div>
              )}

              {isGeneratingAnalysis && (
                <div className="py-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aipoten-green mx-auto mb-4"></div>
                  <p className="text-gray-600">AI가 발달체크 결과를 분석하고 있습니다...</p>
                  <p className="text-sm text-gray-500 mt-2">잠시만 기다려주세요 (약 10-20초 소요)</p>
                </div>
              )}

              {assessment.aiAnalysis && !isGeneratingAnalysis && (
                <div className="max-w-none">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800 m-0">
                      아래 분석은 AI가 자동으로 생성한 내용입니다. 참고용으로만 활용하시고, 정확한 진단은 전문가와 상담하시기 바랍니다.
                    </p>
                  </div>
                  <div className="max-h-[600px] overflow-y-auto bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-base">
                      {assessment.aiAnalysis}
                    </div>
                  </div>
                  {assessment.aiAnalyzedAt && (
                    <p className="text-xs text-gray-500 mt-4 mb-0">
                      분석 생성 시간: {new Date(assessment.aiAnalyzedAt).toLocaleString('ko-KR')}
                    </p>
                  )}
                </div>
              )}

              {!assessment.aiAnalysis && !isGeneratingAnalysis && !analysisError && (
                <div className="py-8 text-center">
                  <div className="text-4xl mb-4">🤖</div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    AI 분석을 생성하세요
                  </h4>
                  <p className="text-gray-600 mb-4">
                    발달체크 결과와 {assessment.concernsText ? '작성하신 우려 사항을 바탕으로' : ''} AI가 맞춤 분석을 제공합니다.
                  </p>
                  <ul className="text-sm text-gray-600 text-left max-w-md mx-auto space-y-2">
                    <li className="flex items-start">
                      <span className="mr-2">✓</span>
                      <span>영역별 발달 수준 상세 분석</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">✓</span>
                      <span>월령에 맞는 맞춤 육아 팁 및 활동 추천</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">✓</span>
                      <span>전문가 상담 필요성 판단</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Recommendations */}
          <div className="mt-6 bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">추천 활동</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link
                  href={`/videos?childId=${assessment.child.id}&age=${assessment.ageInMonths}`}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-aipoten-green hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-aipoten-red rounded-full flex items-center justify-center mr-3">
                      <span className="text-white">📹</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">추천 영상</h4>
                      <p className="text-sm text-gray-500">발달에 도움되는 영상</p>
                    </div>
                  </div>
                </Link>

                <Link
                  href={`/spirituality?childId=${assessment.child.id}`}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-aipoten-green hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-aipoten-orange rounded-full flex items-center justify-center mr-3">
                      <span className="text-white">🎮</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">놀이 영성</h4>
                      <p className="text-sm text-gray-500">맞춤 놀이 활동</p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/boards"
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-aipoten-green hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-aipoten-blue rounded-full flex items-center justify-center mr-3">
                      <span className="text-white">💬</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">커뮤니티</h4>
                      <p className="text-sm text-gray-500">다른 부모와 소통</p>
                    </div>
                  </div>
                </Link>

                {hasBelowLevelResults() && (
                  <button
                    onClick={handleTherapistRecommendation}
                    disabled={isLoadingRecommendations}
                    className="p-4 border-2 border-green-500 rounded-lg hover:border-green-600 hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white">👨‍⚕️</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">치료사 추천</h4>
                        <p className="text-sm text-gray-500">
                          {isLoadingRecommendations ? '로딩 중...' : '맞춤 치료사 찾기'}
                        </p>
                      </div>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}