'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'

interface Consultation {
  id: string
  childName: string
  parentName: string
  parentEmail: string
  scheduledAt: string
  duration: number
  type: string
  status: string
  fee: number
  paymentStatus: string
  notes?: string
  feedback?: string
}

const statusMap: Record<string, string> = {
  PENDING_CONFIRMATION: '예약대기',
  CONFIRMED: '예약확정',
  SCHEDULED: '예약됨',
  PENDING_SETTLEMENT: '정산대기',
  SETTLEMENT_COMPLETED: '정산완료',
  COMPLETED: '완료됨',
  CANCELLED: '취소됨',
  REFUNDED: '환불',
  NO_SHOW: '노쇼'
}

const statusColors: Record<string, string> = {
  PENDING_CONFIRMATION: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  SCHEDULED: 'bg-blue-100 text-blue-800',
  PENDING_SETTLEMENT: 'bg-purple-100 text-purple-800',
  SETTLEMENT_COMPLETED: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
  REFUNDED: 'bg-red-100 text-red-800',
  NO_SHOW: 'bg-red-100 text-red-800'
}

const typeMap: Record<string, string> = {
  ONLINE: '온라인',
  OFFLINE: '오프라인',
  HOME_VISIT: '방문'
}

const paymentStatusMap: Record<string, string> = {
  PENDING: '결제 대기',
  PAID: '결제 완료',
  REFUNDED: '환불 완료',
  FAILED: '결제 실패'
}

export default function ConsultationDetailPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [consultation, setConsultation] = useState<Consultation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [notes, setNotes] = useState('')
  const [feedback, setFeedback] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    if (session.user?.role !== 'THERAPIST') {
      router.push('/dashboard')
      return
    }

    fetchConsultation()
  }, [session, status, router, params.id])

  const fetchConsultation = async () => {
    try {
      const response = await fetch(`/api/therapist/consultations/${params.id}`)

      if (response.ok) {
        const data = await response.json()
        setConsultation(data)
        setNotes(data.notes || '')
        setFeedback(data.feedback || '')
      } else if (response.status === 404) {
        router.push('/therapist/consultations')
      }
    } catch (error) {
      console.error('상담 정보 조회 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveNotes = async () => {
    setIsSaving(true)
    setMessage('')

    try {
      const response = await fetch(`/api/therapist/consultations/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes, feedback })
      })

      if (response.ok) {
        setMessage('노트가 성공적으로 저장되었습니다.')
        fetchConsultation() // Refresh data
      } else {
        const error = await response.json()
        setMessage(error.message || '저장 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('노트 저장 오류:', error)
      setMessage('저장 중 오류가 발생했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/therapist/consultations/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        setMessage(`상담이 ${statusMap[newStatus]}(으)로 변경되었습니다.`)
        fetchConsultation() // Refresh data
      }
    } catch (error) {
      console.error('상태 업데이트 오류:', error)
    }
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

  if (!session || !consultation) {
    return null
  }

  return (
    <div className="min-h-screen bg-neutral-light">
      <Header />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {message && (
            <div className={`mb-4 p-4 rounded-md ${
              message.includes('성공') || message.includes('변경')
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}>
              {message}
            </div>
          )}

          {/* Consultation Info Card */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  상담 정보
                </h3>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusColors[consultation.status]}`}>
                  {statusMap[consultation.status]}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">아이 & 부모 정보</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm">
                        <strong>아이 이름:</strong> {consultation.childName}
                      </p>
                      <p className="text-sm">
                        <strong>부모 이름:</strong> {consultation.parentName}
                      </p>
                      <p className="text-sm">
                        <strong>부모 이메일:</strong> {consultation.parentEmail}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">상담 정보</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm">
                        <strong>일시:</strong> {new Date(consultation.scheduledAt).toLocaleString('ko-KR')}
                      </p>
                      <p className="text-sm">
                        <strong>소요 시간:</strong> {consultation.duration}분
                      </p>
                      <p className="text-sm">
                        <strong>상담 방식:</strong> {typeMap[consultation.type]}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">결제 정보</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm">
                        <strong>상담료:</strong> ₩{consultation.fee.toLocaleString()}
                      </p>
                      <p className="text-sm">
                        <strong>결제 상태:</strong> {paymentStatusMap[consultation.paymentStatus]}
                      </p>
                    </div>
                  </div>

                  {consultation.status === 'SCHEDULED' && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">상태 변경</h4>
                      <div className="space-y-2">
                        <button
                          onClick={() => handleStatusUpdate('COMPLETED')}
                          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 text-sm"
                        >
                          완료 처리
                        </button>
                        <button
                          onClick={() => handleStatusUpdate('CANCELLED')}
                          className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 text-sm"
                        >
                          취소 처리
                        </button>
                        <button
                          onClick={() => handleStatusUpdate('NO_SHOW')}
                          className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 text-sm"
                        >
                          노쇼 처리
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Notes and Feedback */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
                상담 노트 & 피드백
              </h3>

              <div className="space-y-6">
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                    상담 노트
                  </label>
                  <textarea
                    id="notes"
                    rows={6}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="상담 중 관찰한 내용, 아이의 상태, 진행 과정 등을 기록하세요..."
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-aipoten-green focus:border-aipoten-green"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    상담 노트는 향후 연속 상담에 중요한 참고 자료가 됩니다.
                  </p>
                </div>

                <div>
                  <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                    부모 피드백
                  </label>
                  <textarea
                    id="feedback"
                    rows={4}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="부모님께 전달할 피드백, 권장사항, 가정에서의 활동 제안 등을 작성하세요..."
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-aipoten-green focus:border-aipoten-green"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    이 피드백은 부모님이 확인할 수 있습니다.
                  </p>
                </div>

                <div className="flex justify-end space-x-3">
                  <Link
                    href="/therapist/consultations"
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    목록으로
                  </Link>
                  <button
                    onClick={handleSaveNotes}
                    disabled={isSaving}
                    className="bg-aipoten-green border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-aipoten-navy focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-aipoten-green disabled:opacity-50"
                  >
                    {isSaving ? '저장 중...' : '저장하기'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Help Card */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-blue-400">💡</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  상담 노트 작성 가이드
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>아이의 현재 상태와 반응을 구체적으로 기록하세요.</li>
                    <li>상담 중 사용한 방법과 그 효과를 적어주세요.</li>
                    <li>부모님께는 실행 가능한 구체적인 활동을 제안해주세요.</li>
                    <li>다음 상담에서 확인해야 할 포인트를 남겨주세요.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}