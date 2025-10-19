'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'

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

          {/* Recommendations */}
          <div className="mt-6 bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">추천 활동</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}