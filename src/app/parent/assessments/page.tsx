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
  completedAt?: string
  child: {
    id: string
    name: string
  }
  results?: AssessmentResult[]
}

interface Child {
  id: string
  name: string
  birthDate: string
}

const CATEGORY_LABELS: Record<string, string> = {
  GROSS_MOTOR: '대근육',
  FINE_MOTOR: '소근육',
  COGNITIVE: '인지',
  LANGUAGE: '언어',
  SOCIAL: '사회성',
  EMOTIONAL: '정서'
}

const LEVEL_LABELS: Record<string, { text: string; color: string; bgColor: string }> = {
  ADVANCED: { text: '빠른 발달', color: '#1976D2', bgColor: '#E3F2FD' },
  NORMAL: { text: '또래 수준', color: '#388E3C', bgColor: '#E8F5E9' },
  NEEDS_TRACKING: { text: '추적 필요', color: '#F57C00', bgColor: '#FFF3E0' },
  NEEDS_ASSESSMENT: { text: '심화 평가 필요', color: '#D32F2F', bgColor: '#FFEBEE' }
}

// 전체 발달 수준 판정 (가장 낮은 수준 기준)
const getOverallLevel = (results?: AssessmentResult[]) => {
  if (!results || results.length === 0) return 'NEEDS_ASSESSMENT'

  const levelPriority = ['NEEDS_ASSESSMENT', 'NEEDS_TRACKING', 'NORMAL', 'ADVANCED']
  let lowestLevel = 'ADVANCED'

  for (const result of results) {
    const currentPriority = levelPriority.indexOf(result.level)
    const lowestPriority = levelPriority.indexOf(lowestLevel)

    if (currentPriority < lowestPriority) {
      lowestLevel = result.level
    }
  }

  return lowestLevel
}

export default function AssessmentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [children, setChildren] = useState<Child[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedChildId, setSelectedChildId] = useState<string>('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (session) {
          const [assessmentsRes, childrenRes] = await Promise.all([
            fetch('/api/assessments'),
            fetch('/api/children')
          ])

          if (assessmentsRes.ok) {
            const assessmentsData = await assessmentsRes.json()
            const assessmentsArray = Array.isArray(assessmentsData) ? assessmentsData : (assessmentsData.assessments || [])
            setAssessments(assessmentsArray)
          }

          if (childrenRes.ok) {
            const childrenData = await childrenRes.json()
            const childrenArray = Array.isArray(childrenData) ? childrenData : (childrenData.children || [])
            setChildren(childrenArray)
          }
        }
      } catch (error) {
        console.error('데이터를 불러오는 중 오류 발생:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [session])

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate)
    const today = new Date()
    const ageInMonths = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth())

    if (ageInMonths < 12) {
      return `${ageInMonths}개월`
    } else {
      const years = Math.floor(ageInMonths / 12)
      const months = ageInMonths % 12
      return months > 0 ? `${years}세 ${months}개월` : `${years}세`
    }
  }

  const filteredAssessments = selectedChildId
    ? assessments.filter(assessment => assessment.childId === selectedChildId)
    : assessments

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aipoten-green mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5EFE7]">
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="sm:px-0">
          {/* Header Section */}
          <div className="mb-8 md:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-stone-900 mb-3 md:mb-4">발달체크</h1>
            <p className="text-sm sm:text-base md:text-lg text-stone-700">
              우리 아이의 발달 상태를 정기적으로 체크하고 관리해보세요.
            </p>
          </div>

          {/* Action Bar */}
          <div className="bg-white shadow-sm rounded-xl md:rounded-2xl p-4 sm:p-6 md:p-8 mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                <select
                  value={selectedChildId}
                  onChange={(e) => setSelectedChildId(e.target.value)}
                  className="border-2 border-gray-300 rounded-[10px] shadow-sm py-2 md:py-3 px-3 md:px-4 focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:border-transparent text-sm sm:text-base"
                >
                  <option value="">모든 아이</option>
                  {children.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.name} ({calculateAge(child.birthDate)})
                    </option>
                  ))}
                </select>
              </div>

              {children.length > 0 ? (
                <Link
                  href="/parent/assessments/new"
                  className="inline-block bg-[#FF6A00] text-white px-6 sm:px-8 md:px-10 py-3 md:py-4 rounded-[10px] font-semibold text-sm sm:text-base md:text-lg hover:bg-[#E55F00] transition-colors shadow-lg w-full sm:w-auto text-center"
                >
                  발달체크 시작하기
                </Link>
              ) : (
                <Link
                  href="/parent/children/new"
                  className="inline-block bg-[#FF9999] text-white px-6 sm:px-8 py-3 rounded-[10px] font-semibold text-sm sm:text-base hover:bg-[#FF8888] transition-colors shadow-lg w-full sm:w-auto text-center"
                >
                  먼저 아이를 등록하세요
                </Link>
              )}
            </div>
          </div>

          {/* Assessments List */}
          <div className="bg-white shadow-sm rounded-xl md:rounded-2xl">
            <div className="px-4 py-5 sm:p-6 md:p-8">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-stone-900 mb-4 md:mb-6">발달체크 기록</h3>

              {filteredAssessments.length === 0 ? (
                <div className="text-center py-12 md:py-16">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#FFE5E5] rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                    <span className="text-3xl sm:text-4xl md:text-5xl">📊</span>
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-stone-900 mb-2 md:mb-3">
                    {selectedChildId ? '해당 아이의 발달체크 기록이 없습니다' : '아직 발달체크 기록이 없습니다'}
                  </h3>
                  <p className="text-sm sm:text-base text-stone-600 mb-6 md:mb-8">
                    {selectedChildId
                      ? '첫 번째 발달체크를 시작해보세요.'
                      : '첫 번째 발달체크를 시작해보세요.'}
                  </p>
                  {children.length > 0 && (
                    <Link
                      href="/parent/assessments/new"
                      className="inline-block bg-[#FF6A00] text-white px-6 sm:px-8 md:px-10 py-3 md:py-4 rounded-[10px] font-semibold text-sm sm:text-base md:text-lg hover:bg-[#E55F00] transition-colors shadow-lg"
                    >
                      첫 발달체크 시작하기
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-4 md:space-y-6">
                  {filteredAssessments.map((assessment) => {
                    const date = new Date(assessment.createdAt)
                    const formattedDate = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`

                    // 전체 발달 수준 판정
                    const overallLevel = getOverallLevel(assessment.results)
                    const levelInfo = LEVEL_LABELS[overallLevel] || LEVEL_LABELS['NEEDS_ASSESSMENT']

                    return (
                      <Link
                        key={assessment.id}
                        href={`/parent/assessments/${assessment.id}`}
                        className="block"
                      >
                        <div className="bg-white border-2 border-gray-200 rounded-xl md:rounded-2xl p-4 sm:p-6 md:p-8 hover:shadow-lg hover:border-[#FF6A00] transition-all cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3 md:mb-4">
                                <h4 className="text-base sm:text-lg md:text-xl font-bold text-stone-900">
                                  {assessment.child.name}의 발달체크
                                </h4>
                                <span className="text-xs sm:text-sm font-medium text-stone-600">{formattedDate}</span>
                                <span className="text-xs sm:text-sm text-stone-500">
                                  {assessment.ageInMonths}개월
                                </span>
                                <span
                                  className="px-2 md:px-3 py-1 rounded-full text-xs font-semibold"
                                  style={{
                                    backgroundColor: assessment.completedAt ? '#7CCF3C' : '#E5E7EB',
                                    color: assessment.completedAt ? 'white' : '#6B7280'
                                  }}
                                >
                                  {assessment.completedAt ? '완료' : '진행 중'}
                                </span>
                              </div>

                              {/* 전체 발달 수준 표시 */}
                              <div
                                className="inline-block px-3 md:px-4 py-2 rounded-lg text-sm sm:text-base md:text-lg font-bold mb-3"
                                style={{
                                  backgroundColor: levelInfo.bgColor,
                                  color: levelInfo.color
                                }}
                              >
                                {levelInfo.text}
                              </div>

                              {/* 영역별 발달 수준 */}
                              {assessment.results && assessment.results.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {assessment.results.map((result, idx) => {
                                    const resultLevelInfo = LEVEL_LABELS[result.level] || LEVEL_LABELS['NEEDS_ASSESSMENT']
                                    return (
                                      <div
                                        key={idx}
                                        className="text-xs px-2 md:px-3 py-1 rounded-md font-medium"
                                        style={{
                                          backgroundColor: resultLevelInfo.bgColor,
                                          color: resultLevelInfo.color
                                        }}
                                      >
                                        {CATEGORY_LABELS[result.category] || result.category}: {resultLevelInfo.text}
                                      </div>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                            <div className="ml-4 flex-shrink-0">
                              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}