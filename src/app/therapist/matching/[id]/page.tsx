'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface MatchingRequest {
  id: string
  childName: string
  parentName: string
  parentEmail: string
  parentPhone?: string
  childAge: number
  childGender: string
  preferredDates: string[]
  notes?: string
  status: string
  therapistResponse?: string
  createdAt: string
}

const statusMap: Record<string, string> = {
  PENDING: '대기중',
  APPROVED: '승인됨',
  REJECTED: '거절됨',
  CANCELLED: '취소됨'
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800'
}

export default function MatchingRequestDetailPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [request, setRequest] = useState<MatchingRequest | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [response, setResponse] = useState('')
  const [selectedAction, setSelectedAction] = useState<'approve' | 'reject' | ''>('')

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

    fetchRequest()
  }, [session, status, router, params.id])

  const fetchRequest = async () => {
    try {
      const response = await fetch(`/api/therapist/matching-requests/${params.id}`)

      if (response.ok) {
        const data = await response.json()
        setRequest(data)
        setResponse(data.therapistResponse || '')
      } else if (response.status === 404) {
        router.push('/therapist/matching')
      }
    } catch (error) {
      console.error('매칭 요청 조회 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitResponse = async () => {
    if (!selectedAction || !response.trim()) {
      alert('처리 결과와 응답 메시지를 입력해주세요.')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/therapist/matching-requests/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: selectedAction === 'approve' ? 'APPROVED' : 'REJECTED',
          response: response.trim()
        })
      })

      if (res.ok) {
        alert('응답이 성공적으로 전송되었습니다.')
        fetchRequest() // Refresh data
      } else {
        const error = await res.json()
        alert(error.message || '응답 전송 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('응답 전송 오류:', error)
      alert('응답 전송 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
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

  if (!session || !request) {
    return null
  }

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/therapist/matching" className="text-aipoten-green hover:text-aipoten-navy">
                ← 매칭 요청 목록
              </Link>
              <h1 className="text-xl font-bold text-aipoten-navy">매칭 요청 상세</h1>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-gray-700">안녕하세요, {session.user?.name}님</span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-gray-600 hover:text-aipoten-green"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Request Info Card */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  매칭 요청 정보
                </h3>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusColors[request.status]}`}>
                  {statusMap[request.status]}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">아이 정보</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm">
                        <strong>이름:</strong> {request.childName}
                      </p>
                      <p className="text-sm">
                        <strong>나이:</strong> {request.childAge}개월
                      </p>
                      <p className="text-sm">
                        <strong>성별:</strong> {request.childGender === 'MALE' ? '남아' : '여아'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">부모 정보</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm">
                        <strong>이름:</strong> {request.parentName}
                      </p>
                      <p className="text-sm">
                        <strong>이메일:</strong> {request.parentEmail}
                      </p>
                      {request.parentPhone && (
                        <p className="text-sm">
                          <strong>전화번호:</strong> {request.parentPhone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">요청 정보</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm">
                        <strong>요청일:</strong> {new Date(request.createdAt).toLocaleDateString('ko-KR')}
                      </p>
                      <p className="text-sm">
                        <strong>희망 일정:</strong>
                      </p>
                      <ul className="text-sm mt-1 ml-4">
                        {request.preferredDates.map((date, index) => (
                          <li key={index}>• {date}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {request.notes && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">부모 요청사항</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm">{request.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Response Section */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
                응답 관리
              </h3>

              {request.status === 'PENDING' ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      처리 결과 선택
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="action"
                          value="approve"
                          checked={selectedAction === 'approve'}
                          onChange={(e) => setSelectedAction(e.target.value as 'approve')}
                          className="h-4 w-4 text-aipoten-green focus:ring-aipoten-green border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">승인</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="action"
                          value="reject"
                          checked={selectedAction === 'reject'}
                          onChange={(e) => setSelectedAction(e.target.value as 'reject')}
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">거절</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="response" className="block text-sm font-medium text-gray-700 mb-2">
                      응답 메시지
                    </label>
                    <textarea
                      id="response"
                      rows={4}
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      placeholder={
                        selectedAction === 'approve'
                          ? '승인 메시지를 입력하세요. 예: 요청해주신 일정으로 상담을 진행하겠습니다.'
                          : selectedAction === 'reject'
                          ? '거절 사유를 입력하세요. 예: 해당 시간대에 이미 예약이 있어 진행이 어렵습니다.'
                          : '처리 결과를 먼저 선택해주세요.'
                      }
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-aipoten-green focus:border-aipoten-green"
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Link
                      href="/therapist/matching"
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      취소
                    </Link>
                    <button
                      onClick={handleSubmitResponse}
                      disabled={isSubmitting || !selectedAction || !response.trim()}
                      className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                        selectedAction === 'approve'
                          ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                          : selectedAction === 'reject'
                          ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                          : 'bg-gray-400'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50`}
                    >
                      {isSubmitting ? '처리 중...' : selectedAction === 'approve' ? '승인하기' : '거절하기'}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">이전 응답</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm">{request.therapistResponse}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    이 요청은 이미 처리되었습니다.
                  </p>
                </div>
              )}
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
                  매칭 요청 처리 팁
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>승인 시 구체적인 일정과 준비사항을 안내해주세요.</li>
                    <li>거절 시 대안 일정이나 추천 사항을 제시해주세요.</li>
                    <li>친절하고 전문적인 톤으로 작성해주세요.</li>
                    <li>승인된 요청은 자동으로 상담 일정에 등록됩니다.</li>
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