'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/layout/AdminLayout'
import ChildInfoModal from '@/components/modals/ChildInfoModal'

interface Assessment {
  id: string
  ageInMonths: number
  status: string
  completedAt: string
  concernsText: string | null
  concernsPreview: string | null
  aiAnalyzedAt: string | null
  child: {
    id: string
    name: string
    gender: string
    birthDate: string
    user: {
      name: string
      email: string
      phone: string | null
    }
  }
  results: Array<{
    category: string
    level: string
    feedback: string | null
    recommendations: string | null
  }>
}

const categoryLabels: Record<string, string> = {
  GROSS_MOTOR: '대근육',
  FINE_MOTOR: '소근육',
  COGNITIVE: '인지',
  LANGUAGE: '언어',
  SOCIAL: '사회성',
}

const levelColors: Record<string, string> = {
  ADVANCED: 'text-green-600',
  NORMAL: 'text-green-600',
  NEEDS_TRACKING: 'text-yellow-600',
  NEEDS_ASSESSMENT: 'text-red-600',
}

const levelLabels: Record<string, string> = {
  ADVANCED: '빠른 수준',
  NORMAL: '또래 수준',
  NEEDS_TRACKING: '추적검사 요망',
  NEEDS_ASSESSMENT: '심화평가 권고',
}

const levelIcons: Record<string, string> = {
  ADVANCED: '🟢',
  NORMAL: '🟢',
  NEEDS_TRACKING: '🟡',
  NEEDS_ASSESSMENT: '🔴',
}

export default function AdminAssessmentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 날짜 범위 (기본값: 최근 한 달)
  const getDefaultStartDate = () => {
    const date = new Date()
    date.setDate(date.getDate() - 30)
    return date.toISOString().split('T')[0]
  }

  const getDefaultEndDate = () => {
    return new Date().toISOString().split('T')[0]
  }

  const [startDate, setStartDate] = useState(getDefaultStartDate())
  const [endDate, setEndDate] = useState(getDefaultEndDate())

  // Modal states
  const [selectedChild, setSelectedChild] = useState<any>(null)
  const [isChildModalOpen, setIsChildModalOpen] = useState(false)

  const fetchAssessments = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const response = await fetch(`/api/admin/assessments?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setAssessments(data.assessments || [])
      }
    } catch (error) {
      console.error('발달체크 조회 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }, [startDate, endDate])

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    if (session.user?.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }

    fetchAssessments()
  }, [session, status, router, fetchAssessments])

  const handleSearch = () => {
    setIsLoading(true)
    fetchAssessments()
  }

  const handleOpenChildModal = (child: any) => {
    setSelectedChild(child)
    setIsChildModalOpen(true)
  }

  const getCategoryResult = (assessment: Assessment, category: string) => {
    const result = assessment.results.find((r) => r.category === category)
    return result || null
  }

  const calculateAge = (birthDate: string, assessmentDate: string) => {
    const birth = new Date(birthDate)
    const assessment = new Date(assessmentDate)
    const months = Math.floor((assessment.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30.44))
    return months
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

  return (
    <AdminLayout title="발달체크 현황">
      <div className="space-y-6">
        {/* 날짜 검색 */}
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex gap-3 flex-wrap items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">시작일</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-aipoten-green"
              />
            </div>
            <span className="text-gray-500">~</span>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">종료일</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-aipoten-green"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-aipoten-green text-white rounded-md text-sm font-medium hover:bg-opacity-90 transition-colors"
            >
              검색
            </button>
            <div className="ml-auto text-sm text-gray-600 flex items-center">
              총 {assessments.length}건
            </div>
          </div>
        </div>

        {/* 발달체크 목록 */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {assessments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">발달체크 내역이 없습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      부모/아이
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      검사일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      월령
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      5개 발달 영역
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assessments.map((assessment) => (
                    <tr key={assessment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {assessment.child.user.name}
                        </div>
                        <button
                          onClick={() => handleOpenChildModal(assessment.child)}
                          className="text-left"
                        >
                          <div className="text-sm text-aipoten-green hover:text-aipoten-navy cursor-pointer">
                            {assessment.child.name} ({assessment.child.gender === 'MALE' ? '남' : '여'})
                          </div>
                        </button>
                        <div className="text-xs text-gray-400">
                          {assessment.child.user.phone || assessment.child.user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(assessment.completedAt).toLocaleDateString('ko-KR')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(assessment.completedAt).toLocaleTimeString('ko-KR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{assessment.ageInMonths}개월</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 flex-wrap">
                          {['GROSS_MOTOR', 'FINE_MOTOR', 'COGNITIVE', 'LANGUAGE', 'SOCIAL'].map((category) => {
                            const result = getCategoryResult(assessment, category)
                            if (!result) return null

                            return (
                              <div
                                key={category}
                                className="group relative"
                                title={`${categoryLabels[category]}: ${levelLabels[result.level]}`}
                              >
                                <div className="flex items-center gap-1 text-sm">
                                  <span className="text-base">{levelIcons[result.level]}</span>
                                  <span className="text-xs text-gray-600">{categoryLabels[category]}</span>
                                </div>
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                  {categoryLabels[category]}: {levelLabels[result.level]}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <a
                          href={`/admin/assessments/${assessment.id}`}
                          className="text-aipoten-green hover:text-aipoten-navy"
                        >
                          상세보기
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ChildInfoModal
        child={selectedChild}
        isOpen={isChildModalOpen}
        onClose={() => setIsChildModalOpen(false)}
      />
    </AdminLayout>
  )
}
