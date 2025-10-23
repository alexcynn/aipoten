'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Booking {
  id: string
  scheduledAt: string
  sessionType: string
  sessionCount: number
  status: string
  paymentStatus: string
  finalFee: number
  child: {
    id: string
    name: string
  }
  therapist: {
    id: string
    user: {
      name: string
    }
  }
  timeSlot: {
    startTime: string
    endTime: string
  }
}

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING_CONFIRMATION: { label: '확인 대기', color: 'bg-yellow-100 text-yellow-800' },
  CONFIRMED: { label: '확정됨', color: 'bg-green-100 text-green-800' },
  IN_PROGRESS: { label: '진행 중', color: 'bg-blue-100 text-blue-800' },
  COMPLETED: { label: '완료', color: 'bg-gray-100 text-gray-800' },
  CANCELLED: { label: '취소됨', color: 'bg-red-100 text-red-800' },
  REJECTED: { label: '거절됨', color: 'bg-red-100 text-red-800' },
  NO_SHOW: { label: '노쇼', color: 'bg-red-100 text-red-800' },
}

const paymentStatusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: '결제 대기', color: 'bg-orange-100 text-orange-800' },
  PAID: { label: '결제 완료', color: 'bg-green-100 text-green-800' },
  REFUNDED: { label: '환불 완료', color: 'bg-gray-100 text-gray-800' },
  FAILED: { label: '결제 실패', color: 'bg-red-100 text-red-800' },
}

export default function MyBookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [children, setChildren] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // 필터
  const [activeTab, setActiveTab] = useState('all')
  const [selectedChildId, setSelectedChildId] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterBookings()
  }, [bookings, activeTab, selectedChildId])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [bookingsRes, childrenRes] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/children')
      ])

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json()
        setBookings(bookingsData.bookings || [])
      }

      if (childrenRes.ok) {
        const childrenData = await childrenRes.json()
        setChildren(Array.isArray(childrenData) ? childrenData : (childrenData.children || []))
      }
    } catch (err) {
      setError('데이터를 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const filterBookings = () => {
    let filtered = [...bookings]

    // 상태별 필터
    if (activeTab !== 'all') {
      filtered = filtered.filter(b => b.status === activeTab)
    }

    // 자녀별 필터
    if (selectedChildId) {
      filtered = filtered.filter(b => b.child.id === selectedChildId)
    }

    setFilteredBookings(filtered)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">내 예약</h1>
          <Link
            href="/parent/therapists"
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            새 예약 만들기
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* 필터 */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                자녀별 필터
              </label>
              <select
                value={selectedChildId}
                onChange={(e) => setSelectedChildId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">전체</option>
                {children.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 탭 메뉴 */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'all'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                전체 ({bookings.length})
              </button>
              <button
                onClick={() => setActiveTab('PENDING_CONFIRMATION')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'PENDING_CONFIRMATION'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                확인 대기 ({bookings.filter(b => b.status === 'PENDING_CONFIRMATION').length})
              </button>
              <button
                onClick={() => setActiveTab('CONFIRMED')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'CONFIRMED'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                확정됨 ({bookings.filter(b => b.status === 'CONFIRMED').length})
              </button>
              <button
                onClick={() => setActiveTab('COMPLETED')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'COMPLETED'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                완료 ({bookings.filter(b => b.status === 'COMPLETED').length})
              </button>
              <button
                onClick={() => setActiveTab('CANCELLED')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'CANCELLED'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                취소됨 ({bookings.filter(b => b.status === 'CANCELLED').length})
              </button>
            </nav>
          </div>
        </div>

        {/* 예약 목록 */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 mb-4">예약 내역이 없습니다.</p>
            <Link
              href="/parent/therapists"
              className="inline-block px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              치료사 찾기
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {booking.therapist.user.name} 치료사
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          statusLabels[booking.status]?.color || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {statusLabels[booking.status]?.label || booking.status}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          paymentStatusLabels[booking.paymentStatus]?.color || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {paymentStatusLabels[booking.paymentStatus]?.label || booking.paymentStatus}
                      </span>
                    </div>

                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        👤 자녀: {booking.child.name}
                      </p>
                      <p>
                        📅 일시:{' '}
                        {new Date(booking.scheduledAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          weekday: 'short',
                        })}{' '}
                        {booking.timeSlot.startTime} - {booking.timeSlot.endTime}
                      </p>
                      <p>
                        💊 세션: {booking.sessionType === 'CONSULTATION' ? '방문 컨설팅' : '치료'} -{' '}
                        {booking.sessionCount}회
                      </p>
                      <p className="font-semibold text-gray-900">
                        💰 금액: ₩{booking.finalFee.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/parent/bookings/${booking.id}`}
                    className="ml-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    상세보기
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
