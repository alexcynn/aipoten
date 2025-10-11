'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'

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

export default function TherapistMatchingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [requests, setRequests] = useState<MatchingRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<string>('ALL')

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

    fetchRequests()
  }, [session, status, router])

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/therapist/matching-requests')

      if (response.ok) {
        const data = await response.json()
        setRequests(data)
      }
    } catch (error) {
      console.error('매칭 요청 조회 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickResponse = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`/api/therapist/matching-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: action === 'approve' ? 'APPROVED' : 'REJECTED',
          response: action === 'approve' ? '요청을 승인합니다.' : '요청을 거절합니다.'
        })
      })

      if (response.ok) {
        fetchRequests() // Refresh the list
      }
    } catch (error) {
      console.error('매칭 요청 처리 오류:', error)
    }
  }

  const filteredRequests = requests.filter(request => {
    if (filter === 'ALL') return true
    return request.status === filter
  })

  const getRequestCounts = () => {
    return {
      all: requests.length,
      pending: requests.filter(r => r.status === 'PENDING').length,
      approved: requests.filter(r => r.status === 'APPROVED').length,
      rejected: requests.filter(r => r.status === 'REJECTED').length
    }
  }

  const counts = getRequestCounts()

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
    <div className="min-h-screen bg-neutral-light">
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                    <span className="text-white text-sm">📊</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">전체</h3>
                  <p className="text-2xl font-bold text-blue-600">{counts.all}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center">
                    <span className="text-white text-sm">⏳</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">대기중</h3>
                  <p className="text-2xl font-bold text-yellow-600">{counts.pending}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
                    <span className="text-white text-sm">✅</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">승인됨</h3>
                  <p className="text-2xl font-bold text-green-600">{counts.approved}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center">
                    <span className="text-white text-sm">❌</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">거절됨</h3>
                  <p className="text-2xl font-bold text-red-600">{counts.rejected}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex">
                <button
                  onClick={() => setFilter('ALL')}
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${
                    filter === 'ALL'
                      ? 'border-aipoten-green text-aipoten-green'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  전체 ({counts.all})
                </button>
                <button
                  onClick={() => setFilter('PENDING')}
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${
                    filter === 'PENDING'
                      ? 'border-aipoten-green text-aipoten-green'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  대기중 ({counts.pending})
                </button>
                <button
                  onClick={() => setFilter('APPROVED')}
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${
                    filter === 'APPROVED'
                      ? 'border-aipoten-green text-aipoten-green'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  승인됨 ({counts.approved})
                </button>
                <button
                  onClick={() => setFilter('REJECTED')}
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${
                    filter === 'REJECTED'
                      ? 'border-aipoten-green text-aipoten-green'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  거절됨 ({counts.rejected})
                </button>
              </nav>
            </div>
          </div>

          {/* Requests List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {filteredRequests.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <p className="text-gray-500 text-lg">
                  {filter === 'ALL' ? '매칭 요청이 없습니다.' : `${statusMap[filter]} 상태의 요청이 없습니다.`}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <li key={request.id}>
                    <div className="px-4 py-6 sm:px-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <h3 className="text-lg font-medium text-gray-900">
                                {request.childName} ({request.childAge}개월, {request.childGender === 'MALE' ? '남아' : '여아'})
                              </h3>
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[request.status]}`}>
                                {statusMap[request.status]}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(request.createdAt).toLocaleDateString('ko-KR')}
                            </div>
                          </div>

                          <div className="mt-2">
                            <p className="text-sm text-gray-600">
                              <strong>부모:</strong> {request.parentName} ({request.parentEmail})
                              {request.parentPhone && ` | ${request.parentPhone}`}
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>희망 일정:</strong> {request.preferredDates.join(', ')}
                            </p>
                            {request.notes && (
                              <p className="text-sm text-gray-600 mt-1">
                                <strong>특이사항:</strong> {request.notes}
                              </p>
                            )}
                            {request.therapistResponse && (
                              <p className="text-sm text-gray-600 mt-1">
                                <strong>응답:</strong> {request.therapistResponse}
                              </p>
                            )}
                          </div>

                          <div className="mt-4 flex items-center space-x-3">
                            <Link
                              href={`/therapist/matching/${request.id}`}
                              className="text-aipoten-green hover:text-aipoten-navy text-sm font-medium"
                            >
                              상세보기
                            </Link>

                            {request.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleQuickResponse(request.id, 'approve')}
                                  className="text-green-600 hover:text-green-800 text-sm font-medium"
                                >
                                  빠른 승인
                                </button>
                                <button
                                  onClick={() => handleQuickResponse(request.id, 'reject')}
                                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                                >
                                  빠른 거절
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Help Card */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-blue-400">💡</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  매칭 요청 처리 안내
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>요청을 승인하면 해당 날짜에 예약이 생성됩니다.</li>
                    <li>상세보기에서 더 자세한 정보를 확인할 수 있습니다.</li>
                    <li>빠른 승인/거절 기능으로 즉시 처리할 수 있습니다.</li>
                    <li>승인된 요청은 상담 관리에서 확인할 수 있습니다.</li>
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