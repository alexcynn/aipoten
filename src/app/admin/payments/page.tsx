'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/layout/AdminLayout'
import ChildInfoModal from '@/components/modals/ChildInfoModal'
import TherapistInfoModal from '@/components/modals/TherapistInfoModal'

interface PaymentGroup {
  groupId: string
  bookingIds: string[]
  sessionType: string
  totalFee: number
  totalSessions: number
  completedSessions: number
  status: string
  paidAt: string | null
  refundAmount: number | null
  parentUser: {
    id: string
    name: string
    email: string
    phone: string | null
  }
  child: any
  therapist: any
  scheduledAt: string
  createdAt: string
  bookingCount: number
}

interface AccountInfo {
  bankName: string | null
  accountNumber: string | null
  accountHolder: string | null
}

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING_PAYMENT: { label: '결제대기', color: 'bg-orange-100 text-orange-800' },
  BOOKING_IN_PROGRESS: { label: '예약 중', color: 'bg-yellow-100 text-yellow-800' },
  CONFIRMED: { label: '예약 확인', color: 'bg-blue-100 text-blue-800' },
  SESSION_COMPLETED: { label: '세션 완료', color: 'bg-green-100 text-green-800' },
  SETTLEMENT_COMPLETED: { label: '정산 완료', color: 'bg-purple-100 text-purple-800' },
  REFUNDED: { label: '환불', color: 'bg-red-100 text-red-800' },
  CANCELLED: { label: '취소', color: 'bg-red-100 text-red-800' },
}

export default function AdminPaymentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [payments, setPayments] = useState<PaymentGroup[]>([])
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'PAID' | 'REFUNDED'>('ALL')

  // 모달 상태
  const [selectedChild, setSelectedChild] = useState<any>(null)
  const [selectedTherapist, setSelectedTherapist] = useState<any>(null)
  const [isChildModalOpen, setIsChildModalOpen] = useState(false)
  const [isTherapistModalOpen, setIsTherapistModalOpen] = useState(false)

  // 환불 처리 상태
  const [refundingGroupId, setRefundingGroupId] = useState<string | null>(null)
  const [refundAmount, setRefundAmount] = useState<number>(0)
  const [refundReason, setRefundReason] = useState<string>('')

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

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

    fetchPayments()
  }, [session, status, router, filter])

  const fetchPayments = async () => {
    try {
      const response = await fetch(`/api/admin/payments?filter=${filter}`)
      if (response.ok) {
        const data = await response.json()
        setPayments(data.payments || [])
        setAccountInfo(data.accountInfo || null)
      }
    } catch (error) {
      console.error('결제 내역 조회 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmPayment = async (groupId: string) => {
    if (!confirm('입금을 확인하고 결제를 승인하시겠습니까?')) {
      return
    }

    try {
      const payment = payments.find((p) => p.groupId === groupId)
      if (!payment) return

      const response = await fetch(`/api/admin/bookings/${payment.bookingIds[0]}/confirm-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        setMessage({ type: 'success', text: '결제가 승인되었습니다.' })
        fetchPayments()
      } else {
        const data = await response.json()
        setMessage({ type: 'error', text: data.error || '결제 승인에 실패했습니다.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '서버 오류가 발생했습니다.' })
    }

    setTimeout(() => setMessage(null), 3000)
  }

  const handleStartRefund = (payment: PaymentGroup) => {
    setRefundingGroupId(payment.groupId)
    setRefundAmount(payment.totalFee)
    setRefundReason('')
  }

  const handleProcessRefund = async (groupId: string) => {
    if (!refundAmount || refundAmount <= 0) {
      setMessage({ type: 'error', text: '환불 금액을 입력해주세요.' })
      setTimeout(() => setMessage(null), 3000)
      return
    }

    if (!confirm(`₩${refundAmount.toLocaleString()} 환불 처리하시겠습니까?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/payments/${groupId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refundAmount,
          refundReason,
        }),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: '환불이 완료되었습니다.' })
        setRefundingGroupId(null)
        setRefundAmount(0)
        setRefundReason('')
        fetchPayments()
      } else {
        const data = await response.json()
        setMessage({ type: 'error', text: data.error || '환불 처리에 실패했습니다.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '서버 오류가 발생했습니다.' })
    }

    setTimeout(() => setMessage(null), 3000)
  }

  const handleOpenChildModal = (child: any) => {
    setSelectedChild(child)
    setIsChildModalOpen(true)
  }

  const handleOpenTherapistModal = (therapist: any) => {
    setSelectedTherapist(therapist)
    setIsTherapistModalOpen(true)
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

  const pendingCount = payments.filter((p) => p.status === 'PENDING_PAYMENT').length
  const paidCount = payments.filter((p) => p.paidAt && p.status !== 'REFUNDED').length
  const refundedCount = payments.filter((p) => p.status === 'REFUNDED').length

  return (
    <AdminLayout title="결제 관리">
      <div className="space-y-6">
        {/* 메시지 */}
        {message && (
          <div
            className={`p-4 rounded-md ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* 계좌 정보 */}
        {accountInfo && (accountInfo.bankName || accountInfo.accountNumber) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">아이포텐 입금 계좌 정보</h3>
            <p className="text-sm text-blue-800">
              {accountInfo.bankName} {accountInfo.accountNumber} ({accountInfo.accountHolder})
            </p>
          </div>
        )}

        {/* 필터 */}
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'ALL'
                  ? 'bg-aipoten-green text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              전체 ({payments.length})
            </button>
            <button
              onClick={() => setFilter('PENDING')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'PENDING'
                  ? 'bg-aipoten-green text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              결제 대기 ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('PAID')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'PAID'
                  ? 'bg-aipoten-green text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              결제 완료 ({paidCount})
            </button>
            <button
              onClick={() => setFilter('REFUNDED')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'REFUNDED'
                  ? 'bg-aipoten-green text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              환불 ({refundedCount})
            </button>
          </div>
        </div>

        {/* 결제 목록 */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">결제 내역이 없습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      부모/아이
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      치료사
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      유형/세션
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      진행 상황
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      금액
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.groupId}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenChildModal(payment.child)}
                          className="text-left hover:bg-gray-50 p-1 rounded"
                        >
                          <div className="text-sm font-medium text-gray-900">
                            {payment.parentUser.name}
                          </div>
                          <div className="text-sm text-aipoten-green hover:text-aipoten-navy cursor-pointer">
                            {payment.child.name} ({payment.child.gender === 'MALE' ? '남' : '여'})
                          </div>
                          <div className="text-xs text-gray-400">
                            {payment.parentUser.phone || payment.parentUser.email}
                          </div>
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenTherapistModal(payment.therapist)}
                          className="text-left hover:bg-gray-50 p-1 rounded"
                        >
                          <div className="text-sm text-aipoten-green hover:text-aipoten-navy cursor-pointer">
                            {payment.therapist.user.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {payment.therapist.user.phone}
                          </div>
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {payment.sessionType === 'CONSULTATION' ? '언어 컨설팅' : '홈티'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.totalSessions}회
                          {payment.bookingCount > 1 && ` (${payment.bookingCount}건 묶음)`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {payment.completedSessions} / {payment.totalSessions} 회
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-aipoten-green h-2 rounded-full"
                            style={{
                              width: `${(payment.completedSessions / payment.totalSessions) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          ₩{payment.totalFee.toLocaleString()}
                        </div>
                        {payment.refundAmount && (
                          <div className="text-xs text-red-600">
                            환불: ₩{payment.refundAmount.toLocaleString()}
                          </div>
                        )}
                        {payment.paidAt && (
                          <div className="text-xs text-gray-500">
                            결제: {new Date(payment.paidAt).toLocaleDateString('ko-KR')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            statusLabels[payment.status]?.color || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {statusLabels[payment.status]?.label || payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {refundingGroupId === payment.groupId ? (
                          <div className="space-y-2">
                            <input
                              type="number"
                              value={refundAmount}
                              onChange={(e) => setRefundAmount(parseInt(e.target.value) || 0)}
                              className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                              placeholder="환불 금액"
                              step="1000"
                            />
                            <input
                              type="text"
                              value={refundReason}
                              onChange={(e) => setRefundReason(e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                              placeholder="환불 사유"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleProcessRefund(payment.groupId)}
                                className="text-red-600 hover:text-red-900"
                              >
                                확인
                              </button>
                              <button
                                onClick={() => {
                                  setRefundingGroupId(null)
                                  setRefundAmount(0)
                                  setRefundReason('')
                                }}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                취소
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1">
                            {payment.status === 'PENDING_PAYMENT' && (
                              <button
                                onClick={() => handleConfirmPayment(payment.groupId)}
                                className="text-green-600 hover:text-green-900"
                              >
                                입금 확인
                              </button>
                            )}
                            {payment.paidAt && payment.status !== 'REFUNDED' && (
                              <button
                                onClick={() => handleStartRefund(payment)}
                                className="text-red-600 hover:text-red-900"
                              >
                                환불 처리
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 모달 */}
      <ChildInfoModal
        child={selectedChild}
        isOpen={isChildModalOpen}
        onClose={() => setIsChildModalOpen(false)}
      />
      <TherapistInfoModal
        therapist={selectedTherapist}
        isOpen={isTherapistModalOpen}
        onClose={() => setIsTherapistModalOpen(false)}
      />
    </AdminLayout>
  )
}
