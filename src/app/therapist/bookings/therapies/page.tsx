'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import { getParentViewStatus } from '@/lib/booking-status'
import TherapistBookingDetailModal from '@/components/modals/TherapistBookingDetailModal'

interface Booking {
  id: string
  sessionNumber: number
  scheduledAt: string
  status: string
  completedAt: string | null
  child: {
    id: string
    name: string
  }
  parentUser: {
    id: string
    name: string
    email: string
  }
  payment: {
    id: string
    finalFee: number
    totalSessions: number
    status: string
  }
}

interface PaginationInfo {
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function TherapistTherapiesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [bookings, setBookings] = useState<Booking[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  // Filters
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [activeTab, setActiveTab] = useState<string>('ALL')

  // Modal state
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)

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
    fetchBookings()
  }, [session, status, router, pagination.page, startDate, endDate, activeTab])

  const fetchBookings = async () => {
    try {
      setIsLoading(true)

      const params = new URLSearchParams({
        sessionType: 'THERAPY',
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      if (activeTab !== 'ALL') {
        if (activeTab === 'PENDING') {
          params.append('status', 'PENDING_PAYMENT,PENDING_CONFIRMATION')
        } else if (activeTab === 'COMPLETED') {
          params.append('status', 'PENDING_SETTLEMENT,SETTLEMENT_COMPLETED')
        } else if (activeTab === 'REFUNDED_CANCELLED') {
          params.append('status', 'REFUNDED,CANCELLED')
        } else {
          params.append('status', activeTab)
        }
      }

      const response = await fetch(`/api/therapist/bookings?${params}`)
      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings || [])
        if (data.pagination) {
          setPagination(data.pagination)
        }
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const handleFilterChange = () => {
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const getStatusLabel = (booking: Booking) => {
    return getParentViewStatus(booking.status, booking.payment?.status)
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

  return (
    <div className="min-h-screen bg-neutral-light">
      <Header />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">홈티 요청</h1>
                <p className="mt-2 text-gray-600">
                  받은 홈티 예약 요청 목록입니다.
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px overflow-x-auto">
                {[
                  { key: 'ALL', label: '전체' },
                  { key: 'PENDING', label: '요청대기' },
                  { key: 'CONFIRMED', label: '예약확정' },
                  { key: 'COMPLETED', label: '완료' },
                  { key: 'REFUNDED_CANCELLED', label: '환불/취소' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setActiveTab(tab.key)
                      handleFilterChange()
                    }}
                    className={`
                      whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm transition-colors
                      ${activeTab === tab.key
                        ? 'border-green-600 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Date Filters */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    시작일
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value)
                      handleFilterChange()
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    종료일
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value)
                      handleFilterChange()
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                예약 목록 ({pagination.total}건)
              </h2>
            </div>

            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">예약 요청이 없습니다.</p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          아이명
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          부모님
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          일시
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          세션수
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          금액
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          상태
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          액션
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bookings.map((booking) => {
                        const statusInfo = getStatusLabel(booking)

                        return (
                          <tr key={booking.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {booking.child.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {booking.parentUser.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {new Date(booking.scheduledAt).toLocaleString('ko-KR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {booking.sessionNumber} / {booking.payment.totalSessions}회
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ₩{booking.payment.finalFee.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span
                                className="px-2 py-1 text-xs rounded-full font-medium"
                                style={{
                                  backgroundColor: statusInfo.bgColor,
                                  color: statusInfo.color
                                }}
                              >
                                {statusInfo.label}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button
                                onClick={() => {
                                  setSelectedBookingId(booking.id)
                                  setIsBookingModalOpen(true)
                                }}
                                className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                상세보기
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-gray-200">
                  {bookings.map((booking) => {
                    const statusInfo = getStatusLabel(booking)

                    return (
                      <div key={booking.id} className="px-6 py-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900">{booking.child.name}</h3>
                            <span
                              className="px-2 py-1 text-xs rounded-full font-medium"
                              style={{
                                backgroundColor: statusInfo.bgColor,
                                color: statusInfo.color
                              }}
                            >
                              {statusInfo.label}
                            </span>
                          </div>

                          <div className="space-y-1 text-sm text-gray-600">
                            <p>
                              <span className="font-medium">부모님:</span> {booking.parentUser.name}
                            </p>
                            <p>
                              <span className="font-medium">일시:</span>{' '}
                              {new Date(booking.scheduledAt).toLocaleString('ko-KR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            <p>
                              <span className="font-medium">세션:</span> {booking.sessionNumber} / {booking.payment.totalSessions}회
                            </p>
                            <p>
                              <span className="font-medium">금액:</span> ₩{booking.payment.finalFee.toLocaleString()}
                            </p>
                          </div>

                          <div className="pt-2">
                            <button
                              onClick={() => {
                                setSelectedBookingId(booking.id)
                                setIsBookingModalOpen(true)
                              }}
                              className="block w-full px-3 py-2 text-sm text-center border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                            >
                              상세보기
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    이전
                  </button>

                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 border rounded-md text-sm ${
                        page === pagination.page
                          ? 'bg-green-600 text-white border-green-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    다음
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Booking Detail Modal */}
      <TherapistBookingDetailModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false)
          setSelectedBookingId(null)
        }}
        bookingId={selectedBookingId}
        onUpdate={() => {
          // 예약 정보 업데이트 시 목록 새로고침
          fetchBookings()
        }}
      />
    </div>
  )
}
