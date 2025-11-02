'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import AdminLayout from '@/components/layout/AdminLayout'
import Link from 'next/link'

interface AssessmentDetail {
  id: string
  ageInMonths: number
  status: string
  totalScore: number
  completedAt: string
  createdAt: string
  concernsText: string | null
  aiAnalysis: string | null
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
    id: string
    category: string
    score: number
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
  ADVANCED: 'bg-green-100 text-green-800 border-green-300',
  NORMAL: 'bg-green-100 text-green-800 border-green-300',
  NEEDS_TRACKING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  NEEDS_ASSESSMENT: 'bg-red-100 text-red-800 border-red-300',
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

export default function AdminAssessmentDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [assessment, setAssessment] = useState<AssessmentDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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

    fetchAssessment()
  }, [session, status, router, id])

  const fetchAssessment = async () => {
    try {
      const response = await fetch(`/api/assessments/${id}`)
      if (response.ok) {
        const data = await response.json()
        setAssessment(data)
      } else {
        router.push('/admin/assessments')
      }
    } catch (error) {
      console.error('발달체크 조회 오류:', error)
      router.push('/admin/assessments')
    } finally {
      setIsLoading(false)
    }
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

  if (!session || !assessment) {
    return null
  }

  return (
    <AdminLayout title="발달체크 상세">
      <div className="space-y-6">
        {/* 뒤로 가기 */}
        <div>
          <Link
            href="/admin/assessments"
            className="text-sm text-aipoten-green hover:text-aipoten-navy flex items-center gap-1"
          >
            ← 목록으로 돌아가기
          </Link>
        </div>

        {/* 기본 정보 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📋 기본 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">아이</div>
              <div className="text-base font-medium text-gray-900">
                {assessment.child.name} ({assessment.child.gender === 'MALE' ? '남' : '여'}, {assessment.ageInMonths}개월)
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">부모</div>
              <div className="text-base font-medium text-gray-900">
                {assessment.child.user.name}
              </div>
              <div className="text-sm text-gray-500">
                {assessment.child.user.phone || assessment.child.user.email}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">검사일</div>
              <div className="text-base font-medium text-gray-900">
                {new Date(assessment.completedAt).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
              <div className="text-sm text-gray-500">
                {new Date(assessment.completedAt).toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">상태</div>
              <div>
                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  완료됨
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 발달 영역별 결과 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 발달 영역별 결과</h2>
          <div className="space-y-4">
            {assessment.results
              .sort((a, b) => {
                const order = ['GROSS_MOTOR', 'FINE_MOTOR', 'COGNITIVE', 'LANGUAGE', 'SOCIAL']
                return order.indexOf(a.category) - order.indexOf(b.category)
              })
              .map((result) => (
                <div
                  key={result.id}
                  className={`border-2 rounded-lg p-4 ${levelColors[result.level]}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{levelIcons[result.level]}</span>
                      <h3 className="text-base font-semibold">{categoryLabels[result.category]}</h3>
                    </div>
                    <span className="text-sm font-medium">{levelLabels[result.level]}</span>
                  </div>

                  {result.feedback && (
                    <div className="mt-2 text-sm">
                      <div className="font-medium mb-1">피드백:</div>
                      <div className="text-gray-700">{result.feedback}</div>
                    </div>
                  )}

                  {result.recommendations && (
                    <div className="mt-2 text-sm">
                      <div className="font-medium mb-1">권장사항:</div>
                      <div className="text-gray-700">{result.recommendations}</div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* 부모 우려사항 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">💬 부모 우려사항</h2>
          {assessment.concernsText ? (
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{assessment.concernsText}</p>
            </div>
          ) : (
            <p className="text-gray-500 italic">작성된 우려사항이 없습니다.</p>
          )}
        </div>

        {/* AI 종합분석 */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">🤖 AI 종합분석</h2>
            {assessment.aiAnalyzedAt && (
              <span className="text-xs text-gray-500">
                분석 생성일: {new Date(assessment.aiAnalyzedAt).toLocaleDateString('ko-KR')}
              </span>
            )}
          </div>

          {assessment.aiAnalysis ? (
            <div className="prose max-w-none">
              <div className="text-gray-700 whitespace-pre-wrap">{assessment.aiAnalysis}</div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 italic mb-4">AI 분석이 생성되지 않았습니다.</p>
              <p className="text-sm text-gray-400">
                부모가 AI 분석을 요청하면 여기에 표시됩니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
