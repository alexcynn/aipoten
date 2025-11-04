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

export default function TherapistConsultationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [consultations, setConsultations] = useState<Consultation[]>([])
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

    fetchConsultations()
  }, [session, status, router])

  const fetchConsultations = async () => {
    try {
      const response = await fetch('/api/therapist/consultations')

      if (response.ok) {
        const data = await response.json()
        setConsultations(data)
      }
    } catch (error) {
      console.error('상담 목록 조회 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusUpdate = async (consultationId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/therapist/consultations/${consultationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        fetchConsultations() // Refresh the list
      }
    } catch (error) {
      console.error('상담 상태 업데이트 오류:', error)
    }
  }

  const filteredConsultations = consultations.filter(consultation => {
    if (filter === 'ALL') return true
    return consultation.status === filter
  })

  const getConsultationCounts = () => {
    return {
      all: consultations.length,
      scheduled: consultations.filter(c => c.status === 'SCHEDULED').length,
      completed: consultations.filter(c => c.status === 'COMPLETED').length,
      cancelled: consultations.filter(c => c.status === 'CANCELLED').length
    }
  }

  const counts = getConsultationCounts()

  const getTotalRevenue = () => {
    return consultations
      .filter(c => c.status === 'COMPLETED' && c.paymentStatus === 'PAID')
      .reduce((total, c) => total + c.fee, 0)
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
                  <h3 className="text-lg font-medium text-gray-900">전체 상담</h3>
                  <p className="text-2xl font-bold text-blue-600">{counts.all}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center">
                    <span className="text-white text-sm">📅</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">예정된 상담</h3>
                  <p className="text-2xl font-bold text-yellow-600">{counts.scheduled}</p>
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
                  <h3 className="text-lg font-medium text-gray-900">완료된 상담</h3>
                  <p className="text-2xl font-bold text-green-600">{counts.completed}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-aipoten-green rounded flex items-center justify-center">
                    <span className="text-white text-sm">💰</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">총 수익</h3>
                  <p className="text-2xl font-bold text-aipoten-green">
                    ₩{getTotalRevenue().toLocaleString()}
                  </p>
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
                  onClick={() => setFilter('SCHEDULED')}
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${
                    filter === 'SCHEDULED'
                      ? 'border-aipoten-green text-aipoten-green'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  예정 ({counts.scheduled})
                </button>
                <button
                  onClick={() => setFilter('COMPLETED')}
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${
                    filter === 'COMPLETED'
                      ? 'border-aipoten-green text-aipoten-green'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  완료 ({counts.completed})
                </button>
                <button
                  onClick={() => setFilter('CANCELLED')}
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${
                    filter === 'CANCELLED'
                      ? 'border-aipoten-green text-aipoten-green'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  취소 ({counts.cancelled})
                </button>
              </nav>
            </div>
          </div>

          {/* Consultations List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {filteredConsultations.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <p className="text-gray-500 text-lg">
                  {filter === 'ALL' ? '상담 일정이 없습니다.' : `${statusMap[filter]} 상태의 상담이 없습니다.`}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {filteredConsultations.map((consultation) => (
                  <li key={consultation.id}>
                    <div className="px-4 py-6 sm:px-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <h3 className="text-lg font-medium text-gray-900">
                                {consultation.childName} - {consultation.parentName}
                              </h3>
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[consultation.status]}`}>
                                {statusMap[consultation.status]}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500">
                              ₩{consultation.fee.toLocaleString()}
                            </div>
                          </div>

                          <div className="mt-2">
                            <p className="text-sm text-gray-600">
                              <strong>일시:</strong> {new Date(consultation.scheduledAt).toLocaleString('ko-KR')}
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>상담 방식:</strong> {typeMap[consultation.type]}
                              <span className="ml-4">
                                <strong>소요 시간:</strong> {consultation.duration}분
                              </span>
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>결제 상태:</strong> {paymentStatusMap[consultation.paymentStatus]}
                            </p>
                            {consultation.notes && (
                              <p className="text-sm text-gray-600 mt-1">
                                <strong>상담 노트:</strong> {consultation.notes}
                              </p>
                            )}
                          </div>

                          <div className="mt-4 flex items-center space-x-3">
                            <Link
                              href={`/therapist/consultations/${consultation.id}`}
                              className="text-aipoten-green hover:text-aipoten-navy text-sm font-medium"
                            >
                              상세보기
                            </Link>

                            {consultation.status === 'SCHEDULED' && (
                              <>
                                <button
                                  onClick={() => handleStatusUpdate(consultation.id, 'COMPLETED')}
                                  className="text-green-600 hover:text-green-800 text-sm font-medium"
                                >
                                  완료 처리
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(consultation.id, 'CANCELLED')}
                                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                                >
                                  취소 처리
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
                  상담 관리 안내
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>예정된 상담을 클릭하여 상담 노트를 작성할 수 있습니다.</li>
                    <li>상담 완료 후에는 피드백을 남겨주세요.</li>
                    <li>취소된 상담의 경우 환불 처리가 필요할 수 있습니다.</li>
                    <li>상담 이력은 향후 연속 상담에 도움이 됩니다.</li>
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