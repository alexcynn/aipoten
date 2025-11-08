'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import RefundRequestModal from '@/components/modals/RefundRequestModal'
import { AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react'
import { getPaymentProgressStatus, getParentViewStatus } from '@/lib/booking-status'

interface Payment {
  id: string
  sessionType: 'CONSULTATION' | 'THERAPY'
  totalSessions: number
  originalFee: number
  discountRate: number
  finalFee: number
  status: string
  paidAt: string | null
  refundedAt: string | null
  refundAmount: number | null
  createdAt: string
  child: {
    id: string
    name: string
    birthDate: string
  }
  therapist: {
    id: string
    user: {
      name: string
    }
  }
  bookings: Array<{
    id: string
    sessionNumber: number
    scheduledAt: string
    status: string
    completedAt: string | null
  }>
  refundRequests: Array<{
    id: string
    reason: string
    requestedAmount: number
    status: 'PENDING' | 'APPROVED' | 'REJECTED'
    approvedAmount: number | null
    rejectionReason: string | null
    adminNote: string | null
    createdAt: string
    processedAt: string | null
  }>
}

interface AccountInfo {
  bankName: string
  accountNumber: string
  accountHolder: string
}

export default function PaymentDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const paymentId = params.id as string

  const [payment, setPayment] = useState<Payment | null>(null)
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showRefundModal, setShowRefundModal] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
    fetchPayment()
  }, [session, status, router, paymentId])

  const fetchPayment = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/parent/payments/${paymentId}`)
      if (response.ok) {
        const data = await response.json()
        setPayment(data.payment)
        setAccountInfo(data.accountInfo || null)
      } else {
        alert('결제 정보를 불러오는데 실패했습니다.')
        router.push('/parent/payments')
      }
    } catch (error) {
      console.error('Error fetching payment:', error)
      alert('결제 정보를 불러오는데 실패했습니다.')
      router.push('/parent/payments')
    } finally {
      setIsLoading(false)
    }
  }


  const canRequestRefund = (payment: Payment) => {
    // 이미 환불된 건
    if (payment.status === 'REFUNDED' || payment.status === 'PARTIALLY_REFUNDED') {
      return false
    }

    // 대기 중인 환불 요청이 있는 경우
    const hasPendingRequest = payment.refundRequests.some((r: any) => r.status === 'PENDING')
    if (hasPendingRequest) {
      return false
    }

    // 모든 세션이 완료된 경우 환불 불가
    const allCompleted = payment.bookings.every(
      (b: any) => b.status === 'PENDING_SETTLEMENT' || b.status === 'SETTLEMENT_COMPLETED'
    )
    if (allCompleted && payment.bookings.length > 0) {
      return false
    }

    return true
  }

  const getRefundRequestStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="text-green-600" size={20} />
      case 'REJECTED':
        return <XCircle className="text-red-600" size={20} />
      case 'PENDING':
        return <Clock className="text-yellow-600" size={20} />
      default:
        return <AlertCircle className="text-gray-600" size={20} />
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

  if (!payment) {
    return (
      <div className="min-h-screen bg-neutral-light flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">결제 정보를 찾을 수 없습니다.</p>
          <Link
            href="/parent/payments"
            className="text-blue-600 hover:text-blue-700 mt-4 inline-block"
          >
            결제 목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  const statusInfo = getPaymentProgressStatus(payment)
  const isPendingPayment = payment.status === 'PENDING_PAYMENT'

  return (
    <div className="min-h-screen bg-neutral-light">
      <Header />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Back Button */}
          <Link
            href="/parent/payments"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
          >
            ← 결제 목록으로 돌아가기
          </Link>

          {/* Payment Header */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {payment.sessionType === 'CONSULTATION'
                    ? '언어 컨설팅'
                    : `홈티 ${payment.totalSessions}회`}
                </h1>
                <div className="flex items-center gap-3">
                  <span
                    className="px-3 py-1 text-sm rounded-full font-medium"
                    style={{
                      backgroundColor: statusInfo.bgColor,
                      color: statusInfo.color
                    }}
                  >
                    {statusInfo.label}
                  </span>
                  {payment.discountRate > 0 && (
                    <span className="px-2 py-1 text-sm rounded bg-red-100 text-red-700 font-medium">
                      {payment.discountRate}% 할인
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                {payment.originalFee !== payment.finalFee && (
                  <p className="text-lg text-gray-400 line-through">
                    {payment.originalFee.toLocaleString()}원
                  </p>
                )}
                <p className="text-3xl font-bold text-gray-900">
                  {payment.finalFee.toLocaleString()}원
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">아이</p>
                <p className="font-medium text-gray-900">{payment.child.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">치료사</p>
                <p className="font-medium text-gray-900">{payment.therapist.user.name}</p>
              </div>
              {payment.paidAt && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">결제일</p>
                  <p className="font-medium text-gray-900">
                    {new Date(payment.paidAt).toLocaleString('ko-KR')}
                  </p>
                </div>
              )}
              {payment.refundedAt && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">환불일</p>
                  <p className="font-medium text-red-600">
                    {new Date(payment.refundedAt).toLocaleString('ko-KR')}
                    {payment.refundAmount && ` (${payment.refundAmount.toLocaleString()}원)`}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 입금 계좌 정보 (결제 대기 시) */}
          {isPendingPayment && accountInfo && (
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="text-yellow-600" size={24} />
                💳 입금 계좌 정보
              </h2>
              <div className="bg-white rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">은행</span>
                  <span className="font-medium text-gray-900">{accountInfo.bankName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">계좌번호</span>
                  <span className="font-medium text-gray-900">{accountInfo.accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">예금주</span>
                  <span className="font-medium text-gray-900">{accountInfo.accountHolder}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="font-medium text-gray-900">입금액</span>
                  <span className="font-bold text-red-600 text-lg">
                    {payment.finalFee.toLocaleString()}원
                  </span>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                입금 확인 후 치료사에게 예약 가능 일정을 문의드립니다.
              </p>
            </div>
          )}

          {/* 세션 목록 */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">세션 목록</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {payment.bookings.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  세션 정보가 없습니다.
                </div>
              ) : (
                payment.bookings.map((booking) => {
                  // Payment 상태가 PENDING_PAYMENT이면 결제대기 우선 표시
                  const bookingStatusInfo = getParentViewStatus(booking.status, payment.status)
                  return (
                    <div key={booking.id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">
                              {booking.sessionNumber}/{payment.totalSessions}회차
                            </span>
                            <span
                              className="px-2 py-1 text-xs rounded-full font-medium"
                              style={{
                                backgroundColor: bookingStatusInfo.bgColor,
                                color: bookingStatusInfo.color
                              }}
                            >
                              {bookingStatusInfo.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {booking.scheduledAt
                              ? new Date(booking.scheduledAt).toLocaleString('ko-KR')
                              : '일정 미정'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* 환불 요청 */}
          {canRequestRefund(payment) && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">환불 요청</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  서비스 이용에 불편함이 있으셨다면 환불을 요청하실 수 있습니다.
                  환불 요청은 관리자 검토 후 처리됩니다.
                </p>
              </div>
              <button
                onClick={() => setShowRefundModal(true)}
                className="w-full px-4 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
              >
                환불 요청하기
              </button>
            </div>
          )}

          {/* 환불 요청 이력 */}
          {payment.refundRequests.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">환불 요청 이력</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {payment.refundRequests.map((request) => (
                  <div key={request.id} className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      {getRefundRequestStatusIcon(request.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-gray-900">
                            {request.status === 'PENDING' && '검토 중'}
                            {request.status === 'APPROVED' && '승인됨'}
                            {request.status === 'REJECTED' && '거절됨'}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(request.createdAt).toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          요청 금액: {request.requestedAmount.toLocaleString()}원
                        </p>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                          {request.reason}
                        </p>
                        {request.status === 'APPROVED' && request.approvedAmount && (
                          <p className="text-sm text-green-600 mt-2">
                            승인 금액: {request.approvedAmount.toLocaleString()}원
                          </p>
                        )}
                        {request.status === 'REJECTED' && request.rejectionReason && (
                          <p className="text-sm text-red-600 mt-2">
                            거절 사유: {request.rejectionReason}
                          </p>
                        )}
                        {request.adminNote && (
                          <p className="text-sm text-gray-600 mt-2">
                            관리자 메모: {request.adminNote}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Refund Request Modal */}
      <RefundRequestModal
        paymentId={payment.id}
        paymentAmount={payment.finalFee}
        isOpen={showRefundModal}
        onClose={() => setShowRefundModal(false)}
        onSuccess={fetchPayment}
      />
    </div>
  )
}
