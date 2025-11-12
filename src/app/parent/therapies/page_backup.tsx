'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import TherapistInfoModal from '@/components/modals/TherapistInfoModal'
import ReviewModal from '@/components/modals/ReviewModal'
import ParentBookingDetailModal from '@/components/modals/ParentBookingDetailModal'
import JournalViewModal from '@/components/modals/JournalViewModal'
import { Star, FileText } from 'lucide-react'
import { getParentViewStatus } from '@/lib/booking-status'

interface Booking {
  id: string
  sessionNumber: number
  scheduledAt: string
  status: string
  completedAt: string | null
  therapistNote: string | null
  child: {
    id: string
    name: string
  }
  therapist: {
    id: string
    userId: string
    user: {
      name: string
    }
  }
  payment: {
    id: string
    totalSessions: number
    status: string
  }
  review: {
    id: string
    rating: number
    content: string | null
    createdAt: string
  } | null
}

interface PaginationInfo {
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function ParentConsultationsPage() {
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

  // Modals
  const [selectedTherapistId, setSelectedTherapistId] = useState<string | null>(null)
  const [reviewModalBooking, setReviewModalBooking] = useState<Booking | null>(null)
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [journalBookingId, setJournalBookingId] = useState<string | null>(null)
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
    fetchBookings()
  }, [session, status, router, pagination.page, startDate, endDate, activeTab])

  const fetchBookings = async () => {
    try {
      setIsLoading(true)

      const params = new URLSearchParams({
        sessionType: 'CONSULTATION',
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      if (activeTab !== 'ALL') {
        if (activeTab === 'COMPLETED') {
          params.append('status', 'PENDING_SETTLEMENT,SETTLEMENT_COMPLETED')
        } else if (activeTab === 'REFUNDED_CANCELLED') {
          params.append('status', 'REFUNDED,CANCELLED')
        } else {
          params.append('status', activeTab)
        }
      }

      const response = await fetch(`/api/bookings?${params}`)
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

  const canWriteReview = (booking: Booking) => {
    if (booking.status !== 'PENDING_SETTLEMENT' && booking.status !== 'SETTLEMENT_COMPLETED') {
      return false
    }

    const sessionDate = new Date(booking.scheduledAt)
    const now = new Date()
    const daysSince = Math.floor((now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24))

    return daysSince <= 7
  }

  const getStatusLabel = (booking: Booking) => {
    return getParentViewStatus(booking.status, booking.payment?.status)
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-[#F5EFE7] font-pretendard flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6A00] mx-auto"></div>
          <p className="mt-4 text-stone-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5EFE7] font-pretendard">
      <Header />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">언어 컨설팅</h1>
                <p className="mt-2 text-sm sm:text-base text-stone-600">
                  1회성 언어 컨설팅 예약 내역입니다.
                </p>
              </div>
              <Link
                href="/parent/therapists?type=consultation"
                className="px-6 py-3 bg-[#FF6A00] text-white rounded-[10px] hover:bg-[#E55F00] transition-colors font-semibold shadow-lg text-center"
              >
                신규 예약하기
              </Link>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px overflow-x-auto">
                {[
                  { key: 'ALL', label: '전체' },
                  { key: 'PENDING_PAYMENT', label: '결제대기' },
                  { key: 'PENDING_CONFIRMATION', label: '예약대기' },
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
                      whitespace-nowrap py-4 px-6 border-b-2 font-semibold text-sm transition-colors
                      ${activeTab === tab.key
                        ? 'border-[#FF6A00] text-[#FF6A00]'
                        : 'border-transparent text-stone-600 hover:text-stone-900 hover:border-gray-300'
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
                {/* 시작일 */}
                <div>
                  <label className="block text-sm font-semibold text-stone-900 mb-2">
                    시작일
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value)
                      handleFilterChange()
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:border-[#FF6A00]"
                  />
                </div>

                {/* 종료일 */}
                <div>
                  <label className="block text-sm font-semibold text-stone-900 mb-2">
                    종료일
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value)
                      handleFilterChange()
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:border-[#FF6A00]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="bg-white shadow-sm rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-stone-900">
                예약 목록 ({pagination.total}건)
              </h2>
            </div>

            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-stone-500">예약 내역이 없습니다.</p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-[#F5EFE7]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-stone-700 uppercase tracking-wider">
                          아이명
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-stone-700 uppercase tracking-wider">
                          일시
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-stone-700 uppercase tracking-wider">
                          치료사
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-stone-700 uppercase tracking-wider">
                          상태
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-stone-700 uppercase tracking-wider">
                          후기
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-stone-700 uppercase tracking-wider">
                          액션
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bookings.map((booking) => {
                        const statusInfo = getStatusLabel(booking)
                        const canReview = canWriteReview(booking)

                        return (
                          <tr key={booking.id} className="hover:bg-[#FFE5E5]/30">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-stone-900">
                              {booking.child.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-600">
                              {new Date(booking.scheduledAt).toLocaleString('ko-KR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button
                                onClick={() => setSelectedTherapistId(booking.therapist.userId)}
                                className="text-[#FF6A00] hover:text-[#E55F00] hover:underline font-medium"
                              >
                                {booking.therapist.user.name}
                              </button>
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
                            <td className="px-6 py-4 text-sm">
                              {booking.review ? (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1">
                                    <Star size={16} className="fill-yellow-400 text-yellow-400" />
                                    <span className="font-medium text-gray-700">
                                      {booking.review.rating}.0
                                    </span>
                                  </div>
                                  {booking.review.content && (
                                    <p className="text-gray-600 text-xs line-clamp-2 max-w-xs">
                                      {booking.review.content}
                                    </p>
                                  )}
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => setReviewModalBooking(booking)}
                                      className="text-[#FF6A00] hover:text-[#E55F00] hover:underline text-xs font-medium"
                                    >
                                      {booking.review.content ? '전체보기' : '보기'}
                                    </button>
                                    {canReview && (
                                      <button
                                        onClick={() => setReviewModalBooking(booking)}
                                        className="text-stone-600 hover:text-stone-900 hover:underline text-xs"
                                      >
                                        수정
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ) : canReview ? (
                                <button
                                  onClick={() => setReviewModalBooking(booking)}
                                  className="px-3 py-1 text-xs bg-[#FF6A00] text-white rounded-[10px] hover:bg-[#E55F00] transition-colors font-semibold shadow"
                                >
                                  후기 작성
                                </button>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedBookingId(booking.id)
                                    setIsBookingModalOpen(true)
                                  }}
                                  className="px-3 py-1 border-2 border-stone-300 rounded-[10px] text-stone-700 hover:bg-[#FFE5E5] hover:border-[#FF6A00] hover:text-[#FF6A00] transition-colors font-medium"
                                >
                                  상세보기
                                </button>
                                {booking.therapistNote && (
                                  <button
                                    onClick={() => {
                                      setJournalBookingId(booking.id)
                                      setIsJournalModalOpen(true)
                                    }}
                                    className="px-3 py-1 bg-[#FF6A00] text-white rounded-[10px] hover:bg-[#E55F00] transition-colors flex items-center gap-1 font-semibold shadow"
                                  >
                                    <FileText size={14} />
                                    상담일지
                                  </button>
                                )}
                              </div>
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
                    const canReview = canWriteReview(booking)

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
                              <span className="font-medium">치료사:</span>{' '}
                              <button
                                onClick={() => setSelectedTherapistId(booking.therapist.userId)}
                                className="text-[#FF6A00] hover:text-[#E55F00] hover:underline font-medium"
                              >
                                {booking.therapist.user.name}
                              </button>
                            </p>
                          </div>

                          {/* Review */}
                          {booking.review && (
                            <div className="space-y-2 bg-[#FFE5E5] p-3 rounded-[10px] border border-[#FF9999]">
                              <div className="flex items-center gap-1 text-sm">
                                <span className="font-semibold text-stone-900">내 후기:</span>
                                <Star size={16} className="fill-yellow-400 text-yellow-400" />
                                <span className="font-semibold text-stone-900">
                                  {booking.review.rating}.0
                                </span>
                              </div>
                              {booking.review.content && (
                                <p className="text-stone-700 text-sm line-clamp-3">
                                  {booking.review.content}
                                </p>
                              )}
                              <button
                                onClick={() => setReviewModalBooking(booking)}
                                className="text-[#FF6A00] hover:text-[#E55F00] hover:underline text-xs font-semibold"
                              >
                                {booking.review.content ? '전체보기 / 수정' : '보기 / 수정'}
                              </button>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2 pt-2 flex-wrap">
                            {canReview && !booking.review && (
                              <button
                                onClick={() => setReviewModalBooking(booking)}
                                className="flex-1 px-3 py-2 text-sm rounded-[10px] transition-colors font-semibold bg-[#FF6A00] text-white hover:bg-[#E55F00] shadow"
                              >
                                후기 작성
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setSelectedBookingId(booking.id)
                                setIsBookingModalOpen(true)
                              }}
                              className={`px-3 py-2 text-sm border-2 border-stone-300 rounded-[10px] text-stone-700 hover:bg-[#FFE5E5] hover:border-[#FF6A00] hover:text-[#FF6A00] transition-colors font-medium text-center ${
                                canReview && !booking.review ? 'flex-1' : 'w-full'
                              }`}
                            >
                              상세보기
                            </button>
                            {booking.therapistNote && (
                              <button
                                onClick={() => {
                                  setJournalBookingId(booking.id)
                                  setIsJournalModalOpen(true)
                                }}
                                className="w-full px-3 py-2 text-sm bg-[#FF6A00] text-white rounded-[10px] hover:bg-[#E55F00] transition-colors font-semibold flex items-center justify-center gap-1 shadow"
                              >
                                <FileText size={16} />
                                상담일지 보기
                              </button>
                            )}
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
                    className="px-3 py-1 border border-gray-300 rounded-[10px] text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#FFE5E5] font-medium"
                  >
                    이전
                  </button>

                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 border rounded-[10px] text-sm font-medium ${
                        page === pagination.page
                          ? 'bg-[#FF6A00] text-white border-[#FF6A00] shadow'
                          : 'border-gray-300 hover:bg-[#FFE5E5]'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-[10px] text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#FFE5E5] font-medium"
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
      <ParentBookingDetailModal
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

      {/* Journal View Modal */}
      <JournalViewModal
        bookingId={journalBookingId}
        isOpen={isJournalModalOpen}
        onClose={() => {
          setIsJournalModalOpen(false)
          setJournalBookingId(null)
        }}
      />

      {/* Therapist Info Modal */}
      <TherapistInfoModal
        therapistId={selectedTherapistId}
        isOpen={!!selectedTherapistId}
        onClose={() => setSelectedTherapistId(null)}
      />

      {/* Review Modal */}
      <ReviewModal
        bookingId={reviewModalBooking?.id || null}
        existingReview={reviewModalBooking?.review || null}
        isOpen={!!reviewModalBooking}
        onClose={() => setReviewModalBooking(null)}
        onSuccess={fetchBookings}
      />
    </div>
  )
}
