'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/layout/AdminLayout'
import ChildInfoModal from '@/components/modals/ChildInfoModal'
import TherapistInfoModal from '@/components/modals/TherapistInfoModal'

interface Payment {
  id: string
  sessionType: string
  totalSessions: number
  originalFee: number
  discountRate: number
  finalFee: number
  status: string
  paidAt: string | null
  refundAmount: number | null
  refundedAt: string | null
  completedSessions: number
  parentUser: {
    id: string
    name: string
    email: string
    phone: string | null
  }
  child: any
  therapist: any
  bookings: any[]
  refundRequests: any[]
  createdAt: string
}

interface AccountInfo {
  bankName: string | null
  accountNumber: string | null
  accountHolder: string | null
}

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING_PAYMENT: { label: '입금 대기', color: 'bg-orange-100 text-orange-800' },
  PAID: { label: '결제 완료', color: 'bg-green-100 text-green-800' },
  REFUNDED: { label: '전액 환불', color: 'bg-red-100 text-red-800' },
  PARTIALLY_REFUNDED: { label: '부분 환불', color: 'bg-yellow-100 text-yellow-800' },
  FAILED: { label: '결제 실패', color: 'bg-gray-100 text-gray-800' },
}

export default function AdminPaymentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [payments, setPayments] = useState<Payment[]>([])
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'PENDING_PAYMENT' | 'PAID' | 'REFUNDED'>('ALL')

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

    console.log('Current filter:', filter)
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

  const handleConfirmPayment = async (paymentId: string) => {
    if (!confirm('입금을 확인하고 결제를 승인하시겠습니까?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/payments/${paymentId}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        setMessage({ type: 'success', text: '입금이 확인되었습니다.' })
        fetchPayments()
      } else {
        const data = await response.json()
        setMessage({ type: 'error', text: data.error || '입금 확인에 실패했습니다.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '서버 오류가 발생했습니다.' })
    }

    setTimeout(() => setMessage(null), 3000)
  }

  const handleStartRefund = (payment: Payment) => {
    setRefundingGroupId(payment.id)
    // 이미 환불된 금액을 제외한 남은 금액을 기본값으로 설정
    const alreadyRefunded = payment.refundAmount || 0
    const remainingAmount = payment.finalFee - alreadyRefunded
    setRefundAmount(remainingAmount)
    setRefundReason('')
  }

  const handleProcessRefund = async (paymentId: string) => {
    if (!refundAmount || refundAmount <= 0) {
      setMessage({ type: 'error', text: '환불 금액을 입력해주세요.' })
      setTimeout(() => setMessage(null), 3000)
      return
    }

    if (!confirm(`₩${refundAmount.toLocaleString()} 환불 처리하시겠습니까?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/payments/${paymentId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refundAmount,
          refundReason,
        }),
      })

      console.log('환불 API 응답 상태:', response.status, response.ok)

      if (response.ok) {
        const data = await response.json()
        console.log('환불 성공 응답:', data)
        setMessage({ type: 'success', text: '환불이 완료되었습니다.' })
        setRefundingGroupId(null)
        setRefundAmount(0)
        setRefundReason('')
        await fetchPayments()
      } else {
        const data = await response.json().catch(() => ({ error: '응답 파싱 실패' }))
        console.error('환불 실패 응답:', data)
        setMessage({ type: 'error', text: data.error || '환불 처리에 실패했습니다.' })
      }
    } catch (error) {
      console.error('환불 처리 예외:', error)
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
  const paidCount = payments.filter((p) => p.status === 'PAID').length
  const refundedCount = payments.filter((p) => p.status === 'REFUNDED' || p.status === 'PARTIALLY_REFUNDED').length

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
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                console.log('Filter clicked: ALL')
                setFilter('ALL')
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: filter === 'ALL' ? '#386646' : '#F3F4F6',
                color: filter === 'ALL' ? '#FFFFFF' : '#374151',
              }}
            >
              전체 ({payments.length})
            </button>
            <button
              onClick={() => {
                console.log('Filter clicked: PENDING_PAYMENT')
                setFilter('PENDING_PAYMENT')
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: filter === 'PENDING_PAYMENT' ? '#386646' : '#F3F4F6',
                color: filter === 'PENDING_PAYMENT' ? '#FFFFFF' : '#374151',
              }}
            >
              입금 대기 ({pendingCount})
            </button>
            <button
              onClick={() => {
                console.log('Filter clicked: PAID')
                setFilter('PAID')
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: filter === 'PAID' ? '#386646' : '#F3F4F6',
                color: filter === 'PAID' ? '#FFFFFF' : '#374151',
              }}
            >
              결제 완료 ({paidCount})
            </button>
            <button
              onClick={() => {
                console.log('Filter clicked: REFUNDED')
                setFilter('REFUNDED')
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: filter === 'REFUNDED' ? '#386646' : '#F3F4F6',
                color: filter === 'REFUNDED' ? '#FFFFFF' : '#374151',
              }}
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
                    <tr key={payment.id}>
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
                        <div className="text-sm text-gray-500">{payment.totalSessions}회</div>
                        {payment.discountRate > 0 && (
                          <div className="text-xs text-red-600">{payment.discountRate}% 할인</div>
                        )}
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
                          ₩{payment.finalFee.toLocaleString()}
                        </div>
                        {payment.discountRate > 0 && (
                          <div className="text-xs text-gray-500 line-through">
                            ₩{payment.originalFee.toLocaleString()}
                          </div>
                        )}
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
                        {refundingGroupId === payment.id ? (
                          <div className="space-y-2">
                            <input
                              type="number"
                              value={refundAmount}
                              onChange={(e) => setRefundAmount(parseInt(e.target.value) || 0)}
                              className="w-32 px-2 py-1 border border-gray-300 rounded-md text-sm"
                              placeholder="환불 금액"
                              step="1000"
                            />
                            <input
                              type="text"
                              value={refundReason}
                              onChange={(e) => setRefundReason(e.target.value)}
                              className="w-48 px-2 py-1 border border-gray-300 rounded-md text-sm"
                              placeholder="환불 사유"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleProcessRefund(payment.id)}
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
                                onClick={() => handleConfirmPayment(payment.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                입금 확인
                              </button>
                            )}
                            {(payment.status === 'PAID' || payment.status === 'PARTIALLY_REFUNDED') && (
                              <button
                                onClick={() => handleStartRefund(payment)}
                                className="text-red-600 hover:text-red-900"
                              >
                                {payment.status === 'PARTIALLY_REFUNDED' ? '추가 환불' : '환불 처리'}
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
