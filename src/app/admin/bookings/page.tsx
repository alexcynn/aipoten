'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminLayout from '@/components/layout/AdminLayout'

interface Booking {
  id: string
  scheduledAt: string
  duration: number
  sessionType: string
  sessionCount: number
  status: string
  paymentStatus: string
  paidAt: string | null
  finalFee: number
  createdAt: string
  parentUser: {
    id: string
    name: string
    email: string
  }
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
    date: string
    startTime: string
    endTime: string
  }
}

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING_CONFIRMATION: { label: '예약대기', color: 'bg-yellow-100 text-yellow-800' },
  CONFIRMED: { label: '예약확정', color: 'bg-blue-100 text-blue-800' },
  PENDING_SETTLEMENT: { label: '정산대기', color: 'bg-purple-100 text-purple-800' },
  SETTLEMENT_COMPLETED: { label: '정산완료', color: 'bg-green-100 text-green-800' },
  REFUNDED: { label: '환불', color: 'bg-red-100 text-red-800' },
  CANCELLED: { label: '취소', color: 'bg-gray-100 text-gray-800' },
}

const paymentStatusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: '결제 대기', color: 'bg-orange-100 text-orange-800' },
  PAID: { label: '결제 완료', color: 'bg-green-100 text-green-800' },
  PARTIALLY_REFUNDED: { label: '부분 환불', color: 'bg-yellow-100 text-yellow-800' },
  REFUNDED: { label: '환불 완료', color: 'bg-red-100 text-red-800' },
  FAILED: { label: '결제 실패', color: 'bg-red-100 text-red-800' },
}

export default function AdminBookingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'SETTLEMENT'>('PENDING')
  const [searchTerm, setSearchTerm] = useState('')
  const [confirmingPaymentId, setConfirmingPaymentId] = useState<string | null>(null)

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

    fetchBookings()
  }, [session, status, router])

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/admin/bookings')
      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings || [])
      }
    } catch (error) {
      console.error('예약 목록을 가져오는 중 오류 발생:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmPayment = async (bookingId: string) => {
    if (!confirm('결제를 승인하시겠습니까?')) return

    setConfirmingPaymentId(bookingId)
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/confirm-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        alert('결제가 승인되었습니다.')
        await fetchBookings()
      } else {
        const data = await response.json()
        alert(data.error || '결제 승인에 실패했습니다.')
      }
    } catch (error) {
      console.error('결제 승인 중 오류 발생:', error)
      alert('서버 오류가 발생했습니다.')
    } finally {
      setConfirmingPaymentId(null)
    }
  }

  const handleProcessSettlement = async (bookingId: string) => {
    const settlementNote = prompt('정산 메모를 입력하세요 (선택사항):')
    if (settlementNote === null) return // 취소 클릭

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/settlement`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settlementNote }),
      })

      if (response.ok) {
        alert('정산 처리가 완료되었습니다.')
        await fetchBookings()
      } else {
        const data = await response.json()
        alert(data.error || '정산 처리에 실패했습니다.')
      }
    } catch (error) {
      console.error('정산 처리 중 오류 발생:', error)
      alert('서버 오류가 발생했습니다.')
    }
  }

  const handleProcessRefund = async (bookingId: string, booking: Booking) => {
    const refundType = confirm('전액 환불하시겠습니까?\n확인 = 전액환불, 취소 = 부분환불')
      ? 'FULL'
      : 'PARTIAL'

    let refundAmount = booking.finalFee
    if (refundType === 'PARTIAL') {
      const amountStr = prompt(`부분 환불 금액을 입력하세요 (최대: ${booking.finalFee}원):`)
      if (!amountStr) return
      refundAmount = parseInt(amountStr)
      if (isNaN(refundAmount) || refundAmount <= 0 || refundAmount > booking.finalFee) {
        alert('올바른 금액을 입력해주세요.')
        return
      }
    }

    const refundNote = prompt('환불 사유를 입력하세요 (선택사항):')
    if (refundNote === null) return

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refundAmount, refundType, refundNote }),
      })

      if (response.ok) {
        alert('환불 처리가 완료되었습니다.')
        await fetchBookings()
      } else {
        const data = await response.json()
        alert(data.error || '환불 처리에 실패했습니다.')
      }
    } catch (error) {
      console.error('환불 처리 중 오류 발생:', error)
      alert('서버 오류가 발생했습니다.')
    }
  }

  const filteredBookings = bookings.filter((booking) => {
    const matchesFilter =
      filter === 'ALL' ||
      (filter === 'PENDING' && booking.paymentStatus === 'PENDING') ||
      (filter === 'SETTLEMENT' && booking.status === 'PENDING_SETTLEMENT')
    const matchesSearch =
      booking.parentUser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.parentUser.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.therapist.user.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const pendingPaymentCount = bookings.filter((b) => b.paymentStatus === 'PENDING').length
  const pendingSettlementCount = bookings.filter((b) => b.status === 'PENDING_SETTLEMENT').length

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
    <AdminLayout title="예약 관리">
      <div className="space-y-6">
        <div>
          <div className="mb-6">
            <p className="mt-2 text-gray-600">
              모든 예약 내역을 관리하고 결제를 승인할 수 있습니다.
            </p>
          </div>

          {/* Search and Filter */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="부모, 자녀, 치료사 이름 또는 이메일로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aipoten-green focus:border-transparent"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('PENDING')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  filter === 'PENDING'
                    ? 'bg-aipoten-green text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                결제 대기
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  filter === 'PENDING' ? 'bg-white text-aipoten-green' : 'bg-gray-200 text-gray-700'
                }`}>
                  {pendingPaymentCount}
                </span>
              </button>
              <button
                onClick={() => setFilter('SETTLEMENT')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  filter === 'SETTLEMENT'
                    ? 'bg-aipoten-green text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                정산 대기
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  filter === 'SETTLEMENT' ? 'bg-white text-aipoten-green' : 'bg-gray-200 text-gray-700'
                }`}>
                  {pendingSettlementCount}
                </span>
              </button>
              <button
                onClick={() => setFilter('ALL')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  filter === 'ALL'
                    ? 'bg-aipoten-green text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                전체
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  filter === 'ALL' ? 'bg-white text-aipoten-green' : 'bg-gray-200 text-gray-700'
                }`}>
                  {bookings.length}
                </span>
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">📋</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">전체 예약</p>
                  <p className="text-2xl font-bold text-gray-900">{bookings.length}건</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">⏳</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">결제 대기</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingPaymentCount}건</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">💵</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">정산 대기</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {bookings.filter((b) => b.status === 'PENDING_SETTLEMENT').length}건
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">✅</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">정산 완료</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {bookings.filter((b) => b.status === 'SETTLEMENT_COMPLETED').length}건
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">💰</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">총 결제액</p>
                  <p className="text-xl font-bold text-gray-900">
                    ₩{bookings
                      .filter((b) => b.paymentStatus === 'PAID')
                      .reduce((sum, b) => sum + b.finalFee, 0)
                      .toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bookings List */}
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm
                  ? '검색 결과가 없습니다'
                  : filter === 'PENDING'
                  ? '결제 대기 중인 예약이 없습니다'
                  : filter === 'SETTLEMENT'
                  ? '정산 대기 중인 예약이 없습니다'
                  : '예약이 없습니다'}
              </h3>
              <p className="text-gray-500">
                {searchTerm ? '다른 검색어를 시도해보세요.' : '새로운 예약을 기다리고 있습니다.'}
              </p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <li key={booking.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                statusLabels[booking.status]?.color || 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {statusLabels[booking.status]?.label || booking.status}
                            </span>
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                paymentStatusLabels[booking.paymentStatus]?.color || 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {paymentStatusLabels[booking.paymentStatus]?.label || booking.paymentStatus}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                👤 부모: {booking.parentUser.name}
                              </p>
                              <p className="text-xs text-gray-500">{booking.parentUser.email}</p>
                              <p className="text-sm text-gray-700 mt-1">
                                👶 자녀: {booking.child.name}
                              </p>
                              <p className="text-sm text-gray-700 mt-1">
                                👩‍⚕️ 치료사: {booking.therapist.user.name}
                              </p>
                            </div>

                            <div>
                              <p className="text-sm text-gray-700">
                                📅 예약일:{' '}
                                {new Date(booking.scheduledAt).toLocaleDateString('ko-KR', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  weekday: 'short',
                                })}
                              </p>
                              <p className="text-sm text-gray-700">
                                🕐 시간: {booking.timeSlot.startTime} - {booking.timeSlot.endTime}
                              </p>
                              <p className="text-sm text-gray-700">
                                💊 세션: {booking.sessionType === 'CONSULTATION' ? '방문 컨설팅' : '치료'} - {booking.sessionCount}회
                              </p>
                              <p className="text-sm font-semibold text-gray-900">
                                💰 금액: ₩{booking.finalFee.toLocaleString()}
                              </p>
                              {booking.paidAt && (
                                <p className="text-xs text-green-600 mt-1">
                                  결제 완료: {new Date(booking.paidAt).toLocaleDateString('ko-KR')}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="ml-4 flex flex-col gap-2">
                          {booking.paymentStatus === 'PENDING' && (
                            <button
                              onClick={() => handleConfirmPayment(booking.id)}
                              disabled={confirmingPaymentId === booking.id}
                              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium whitespace-nowrap"
                            >
                              {confirmingPaymentId === booking.id ? '처리 중...' : '💰 결제 승인'}
                            </button>
                          )}

                          {booking.status === 'PENDING_SETTLEMENT' && (
                            <button
                              onClick={() => handleProcessSettlement(booking.id)}
                              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm font-medium whitespace-nowrap"
                            >
                              💵 정산 처리
                            </button>
                          )}

                          {booking.paymentStatus === 'PAID' && booking.status !== 'REFUNDED' && (
                            <button
                              onClick={() => handleProcessRefund(booking.id, booking)}
                              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium whitespace-nowrap"
                            >
                              🔄 환불 처리
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="mt-2 text-xs text-gray-400">
                        예약 생성: {new Date(booking.createdAt).toLocaleString('ko-KR')}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
