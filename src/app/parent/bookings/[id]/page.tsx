'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface Booking {
  id: string
  scheduledAt: string
  duration: number
  sessionType: string
  sessionCount: number
  completedSessions: number
  status: string
  confirmationDeadline: string | null
  confirmedAt: string | null
  rejectedAt: string | null
  rejectionReason: string | null
  cancelledAt: string | null
  cancellationReason: string | null
  refundAmount: number | null
  visitAddress: string | null
  visitAddressDetail: string | null
  originalFee: number
  discountRate: number
  finalFee: number
  paymentStatus: string
  paidAt: string | null
  parentNote: string | null
  therapistNote: string | null
  child: {
    id: string
    name: string
    birthDate: string
    gender: string
  }
  therapist: {
    id: string
    user: {
      name: string
      email: string
    }
    sessionFee: number
  }
  timeSlot: {
    date: string
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

export default function BookingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params?.id as string

  const [booking, setBooking] = useState<Booking | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancellationReason, setCancellationReason] = useState('')
  const [isCancelling, setIsCancelling] = useState(false)

  useEffect(() => {
    fetchBooking()
  }, [bookingId])

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`)
      const data = await response.json()

      if (response.ok) {
        setBooking(data.booking)
      } else {
        setError(data.error || '예약 정보를 불러올 수 없습니다.')
      }
    } catch (err) {
      setError('서버 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const calculateRefundAmount = () => {
    if (!booking) return { amount: 0, description: '' }

    const now = new Date()
    const scheduledAt = new Date(booking.scheduledAt)
    const hoursUntil = (scheduledAt.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursUntil >= 24) {
      return {
        amount: booking.finalFee,
        description: '100% 환불 (24시간 이전 취소)'
      }
    } else if (hoursUntil >= 12) {
      return {
        amount: Math.round(booking.finalFee * 0.5),
        description: '50% 환불 (12-24시간 이전 취소)'
      }
    } else {
      return {
        amount: 0,
        description: '환불 불가 (12시간 이내 취소)'
      }
    }
  }

  const handleCancel = async () => {
    if (!cancellationReason.trim()) {
      alert('취소 사유를 입력해주세요.')
      return
    }

    setIsCancelling(true)
    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancellationReason }),
      })

      const data = await response.json()

      if (response.ok) {
        alert('예약이 취소되었습니다.')
        setShowCancelModal(false)
        fetchBooking()
      } else {
        alert(data.error || '취소에 실패했습니다.')
      }
    } catch (err) {
      alert('서버 오류가 발생했습니다.')
    } finally {
      setIsCancelling(false)
    }
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

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800">{error || '예약 정보를 찾을 수 없습니다.'}</p>
            <Link
              href="/parent/bookings"
              className="mt-4 inline-block text-red-600 hover:text-red-800"
            >
              ← 목록으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const { amount: refundAmount, description: refundDescription } = calculateRefundAmount()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Link
          href="/parent/bookings"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          ← 목록으로 돌아가기
        </Link>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">예약 상세</h1>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  statusLabels[booking.status]?.color || 'bg-gray-100 text-gray-800'
                }`}
              >
                {statusLabels[booking.status]?.label || booking.status}
              </span>
            </div>
          </div>

          {/* 예약 정보 */}
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">예약 정보</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">예약 날짜:</span>
                  <p className="text-gray-900 font-medium">
                    {new Date(booking.scheduledAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      weekday: 'short',
                    })}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">예약 시간:</span>
                  <p className="text-gray-900 font-medium">
                    {booking.timeSlot.startTime} - {booking.timeSlot.endTime}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">세션 타입:</span>
                  <p className="text-gray-900 font-medium">
                    {booking.sessionType === 'CONSULTATION' ? '방문 컨설팅' : '치료'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">세션 회수:</span>
                  <p className="text-gray-900 font-medium">
                    {booking.completedSessions} / {booking.sessionCount}회
                  </p>
                </div>
              </div>
            </div>

            {/* 치료사 정보 */}
            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">치료사 정보</h2>
              <div className="text-sm">
                <p className="text-gray-900 font-medium text-lg mb-1">
                  {booking.therapist.user.name} 치료사
                </p>
                <p className="text-gray-600">{booking.therapist.user.email}</p>
              </div>
            </div>

            {/* 자녀 정보 */}
            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">자녀 정보</h2>
              <div className="text-sm">
                <p className="text-gray-900 font-medium">
                  {booking.child.name} ({booking.child.gender === 'MALE' ? '남' : '여'})
                </p>
              </div>
            </div>

            {/* 방문 주소 */}
            {booking.visitAddress && (
              <div className="border-b pb-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">방문 주소</h2>
                <p className="text-gray-900 text-sm">
                  {booking.visitAddress} {booking.visitAddressDetail}
                </p>
              </div>
            )}

            {/* 요청사항 */}
            {booking.parentNote && (
              <div className="border-b pb-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">요청사항</h2>
                <p className="text-gray-900 text-sm whitespace-pre-wrap">{booking.parentNote}</p>
              </div>
            )}

            {/* 결제 정보 */}
            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">결제 정보</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">원가:</span>
                  <span className="text-gray-900">₩{booking.originalFee.toLocaleString()}</span>
                </div>
                {booking.discountRate > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>할인 ({booking.discountRate}%):</span>
                    <span>-₩{(booking.originalFee - booking.finalFee).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                  <span>최종 금액:</span>
                  <span>₩{booking.finalFee.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* 결제 상태 */}
            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">결제 상태</h2>
              <div className="mb-3">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    paymentStatusLabels[booking.paymentStatus]?.color || 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {paymentStatusLabels[booking.paymentStatus]?.label || booking.paymentStatus}
                </span>
              </div>

              {/* 결제 대기 시 계좌 정보 표시 */}
              {booking.paymentStatus === 'PENDING' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-3">
                  <h3 className="font-semibold text-blue-900 mb-3">입금 계좌 정보</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-700">은행:</span>
                      <span className="text-blue-900 font-medium">
                        {process.env.NEXT_PUBLIC_PAYMENT_BANK_NAME || '국민은행'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">계좌번호:</span>
                      <span className="text-blue-900 font-medium">
                        {process.env.NEXT_PUBLIC_PAYMENT_ACCOUNT_NUMBER || '123-456-78901'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">예금주:</span>
                      <span className="text-blue-900 font-medium">
                        {process.env.NEXT_PUBLIC_PAYMENT_ACCOUNT_HOLDER || '아이포텐'}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-blue-300 pt-2 mt-2">
                      <span className="text-blue-700">입금 금액:</span>
                      <span className="text-blue-900 font-bold text-lg">
                        ₩{booking.finalFee.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-blue-700 mt-3">
                    * 위 계좌로 입금하시면 관리자 확인 후 결제가 승인됩니다.
                  </p>
                </div>
              )}

              {/* 결제 완료 시 결제 일시 표시 */}
              {booking.paymentStatus === 'PAID' && booking.paidAt && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-3">
                  <div className="flex items-center text-sm">
                    <span className="text-green-700">결제 일시:</span>
                    <span className="text-green-900 font-medium ml-2">
                      {new Date(booking.paidAt).toLocaleString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 거절 정보 */}
            {booking.status === 'REJECTED' && booking.rejectionReason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 mb-2">거절 사유</h3>
                <p className="text-red-800 text-sm">{booking.rejectionReason}</p>
              </div>
            )}

            {/* 취소 정보 */}
            {booking.status === 'CANCELLED' && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">취소 정보</h3>
                {booking.cancellationReason && (
                  <p className="text-gray-800 text-sm mb-2">
                    사유: {booking.cancellationReason}
                  </p>
                )}
                {booking.refundAmount !== null && (
                  <p className="text-gray-800 text-sm">
                    환불 금액: ₩{booking.refundAmount.toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 액션 버튼 */}
          <div className="mt-6 pt-6 border-t">
            {(booking.status === 'PENDING_CONFIRMATION' || booking.status === 'CONFIRMED') && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="w-full px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
              >
                예약 취소하기
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 취소 모달 */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">예약 취소</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                취소 사유 *
              </label>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                rows={3}
                placeholder="취소 사유를 입력해주세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800 font-medium mb-1">환불 정보</p>
              <p className="text-sm text-yellow-800">{refundDescription}</p>
              <p className="text-lg font-bold text-yellow-900 mt-2">
                환불 금액: ₩{refundAmount.toLocaleString()}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                닫기
              </button>
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {isCancelling ? '취소 중...' : '예약 취소'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
