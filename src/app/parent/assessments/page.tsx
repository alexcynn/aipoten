'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Assessment {
  id: string
  childId: string
  ageInMonths: number
  totalScore: number
  createdAt: string
  child: {
    id: string
    name: string
  }
}

interface Child {
  id: string
  name: string
  birthDate: string
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
    <div className="min-h-screen bg-neutral-light">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="text-xl font-bold text-aipoten-navy">
              아이포텐
            </Link>
            <div className="flex items-center space-x-4">
              {session && (
                <>
                  <Link href="/dashboard" className="text-gray-600 hover:text-aipoten-green">
                    대시보드
                  </Link>
                  <span className="text-gray-700">{session.user?.name}님</span>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">발달체크</h1>
            <p className="mt-2 text-gray-600">
              우리 아이의 발달 상태를 정기적으로 체크하고 관리해보세요.
            </p>
          </div>

          {/* Action Bar */}
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <select
                  value={selectedChildId}
                  onChange={(e) => setSelectedChildId(e.target.value)}
                  className="border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-aipoten-green focus:border-aipoten-green"
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
                  href="/assessments/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-aipoten-green hover:bg-aipoten-navy"
                >
                  새 발달체크 시작
                </Link>
              ) : (
                <Link
                  href="/children/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-aipoten-blue hover:bg-aipoten-navy"
                >
                  먼저 아이를 등록하세요
                </Link>
              )}
            </div>
          </div>

          {/* Assessments List */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">발달체크 기록</h3>

              {filteredAssessments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">📊</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {selectedChildId ? '해당 아이의 발달체크 기록이 없습니다' : '아직 발달체크 기록이 없습니다'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {selectedChildId
                      ? '첫 번째 발달체크를 시작해보세요.'
                      : '첫 번째 발달체크를 시작해보세요.'}
                  </p>
                  {children.length > 0 && (
                    <Link
                      href="/assessments/new"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-aipoten-green hover:bg-aipoten-navy"
                    >
                      첫 번째 발달체크 시작
                    </Link>
                  )}
                </div>
              ) : (
                <div className="overflow-hidden">
                  <div className="grid grid-cols-1 gap-4">
                    {filteredAssessments.map((assessment) => (
                      <div
                        key={assessment.id}
                        className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <h4 className="text-lg font-medium text-gray-900">
                                {assessment.child.name}의 발달체크
                              </h4>
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-aipoten-accent bg-opacity-20 text-aipoten-green">
                                {assessment.ageInMonths}개월
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>평가일: {new Date(assessment.createdAt).toLocaleDateString('ko-KR')}</span>
                              <span>총점: {assessment.totalScore}점</span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Link
                              href={`/assessments/${assessment.id}`}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                              자세히 보기
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          {filteredAssessments.length > 0 && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-aipoten-blue rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold">{filteredAssessments.length}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">총 평가 횟수</p>
                    <p className="text-lg font-semibold text-gray-900">{filteredAssessments.length}회</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-aipoten-green rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold">📈</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">최근 평가</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {Math.max(...filteredAssessments.map(a => a.totalScore))}점
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-aipoten-orange rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold">📊</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">평균 점수</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {Math.round(filteredAssessments.reduce((sum, a) => sum + a.totalScore, 0) / filteredAssessments.length)}점
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}