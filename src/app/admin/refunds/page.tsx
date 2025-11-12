'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/layout/AdminLayout'

interface RefundRequest {
  id: string
  reason: string
  requestedAmount: number
  status: string
  processedAt: string | null
  approvedAmount: number | null
  rejectionReason: string | null
  adminNote: string | null
  createdAt: string
  booking: {
    id: string
    finalFee: number
    status: string
    parentUser: {
      name: string
      email: string
      phone: string | null
    }
    child: {
      name: string
    }
  }
  requestedByUser: {
    name: string
  }
}

export default function AdminRefundsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING')

  // 승인/거부 상태
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [approvedAmount, setApprovedAmount] = useState<number>(0)
  const [rejectionReason, setRejectionReason] = useState<string>('')
  const [adminNote, setAdminNote] = useState<string>('')

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

    fetchRefundRequests()
  }, [session, status, router, filter])

  const fetchRefundRequests = async () => {
    try {
      const response = await fetch(`/api/admin/refund-requests?status=${filter}`)
      if (response.ok) {
        const data = await response.json()
        setRefundRequests(data.refundRequests || [])
      }
    } catch (error) {
      console.error('환불 요청 조회 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = (request: RefundRequest) => {
    setProcessingId(request.id)
    setApprovedAmount(request.requestedAmount)
    setAdminNote('')
  }

  const handleReject = (request: RefundRequest) => {
    setProcessingId(request.id)
    setRejectionReason('')
    setAdminNote('')
  }

  const submitApproval = async (id: string) => {
    if (approvedAmount <= 0) {
      alert('환불 금액을 입력해주세요.')
      return
    }

    try {
      const response = await fetch(`/api/admin/refund-requests/${id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          approvedAmount,
          adminNote,
        }),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: '환불이 승인되었습니다.' })
        setProcessingId(null)
        fetchRefundRequests()
      } else {
        const data = await response.json()
        setMessage({ type: 'error', text: data.error || '승인 중 오류가 발생했습니다.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '서버 오류가 발생했습니다.' })
    }

    setTimeout(() => setMessage(null), 3000)
  }

  const submitRejection = async (id: string) => {
    if (!rejectionReason) {
      alert('거부 사유를 입력해주세요.')
      return
    }

    try {
      const response = await fetch(`/api/admin/refund-requests/${id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rejectionReason,
          adminNote,
        }),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: '환불이 거부되었습니다.' })
        setProcessingId(null)
        fetchRefundRequests()
      } else {
        const data = await response.json()
        setMessage({ type: 'error', text: data.error || '거부 중 오류가 발생했습니다.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '서버 오류가 발생했습니다.' })
    }

    setTimeout(() => setMessage(null), 3000)
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6A00] mx-auto"></div>
          <p className="mt-4 text-stone-600 font-pretendard">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <AdminLayout title="환불 요청 관리">
      <div className="space-y-6">
        {/* 메시지 */}
        {message && (
          <div
            className={`p-4 rounded-xl font-pretendard ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* 필터 */}
        <div className="bg-white shadow rounded-xl p-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('PENDING')}
              className={`px-4 py-2 rounded-[10px] text-sm font-medium font-pretendard transition-colors ${
                filter === 'PENDING'
                  ? 'bg-[#FF6A00] text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              대기 중
            </button>
            <button
              onClick={() => setFilter('APPROVED')}
              className={`px-4 py-2 rounded-[10px] text-sm font-medium font-pretendard transition-colors ${
                filter === 'APPROVED'
                  ? 'bg-[#FF6A00] text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              승인됨
            </button>
            <button
              onClick={() => setFilter('REJECTED')}
              className={`px-4 py-2 rounded-[10px] text-sm font-medium font-pretendard transition-colors ${
                filter === 'REJECTED'
                  ? 'bg-[#FF6A00] text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              거부됨
            </button>
            <button
              onClick={() => setFilter('ALL')}
              className={`px-4 py-2 rounded-[10px] text-sm font-medium font-pretendard transition-colors ${
                filter === 'ALL'
                  ? 'bg-[#FF6A00] text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              전체
            </button>
          </div>
        </div>

        {/* 환불 요청 목록 */}
        <div className="bg-white shadow rounded-xl overflow-hidden">
          {refundRequests.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-stone-500 font-pretendard">환불 요청이 없습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#F9F9F9]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase font-pretendard">
                      요청자/예약
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase font-pretendard">
                      요청 내용
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase font-pretendard">
                      요청 금액
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase font-pretendard">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase font-pretendard">
                      처리 결과
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase font-pretendard">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {refundRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-[#FFF5F0]">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-stone-900 font-pretendard">
                          {request.requestedByUser.name}
                        </div>
                        <div className="text-sm text-stone-500 font-pretendard">
                          아이: {request.booking.child.name}
                        </div>
                        <div className="text-xs text-stone-400 font-pretendard">
                          예약금: ₩{request.booking.finalFee.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-stone-900 font-pretendard">{request.reason}</div>
                        <div className="text-xs text-stone-500 font-pretendard">
                          {new Date(request.createdAt).toLocaleDateString('ko-KR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-stone-900 font-pretendard">
                          ₩{request.requestedAmount.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full font-pretendard ${
                            request.status === 'PENDING'
                              ? 'bg-stone-100 text-stone-800'
                              : request.status === 'APPROVED'
                              ? 'bg-[#FFE5E5] text-[#FF6A00]'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {request.status === 'PENDING'
                            ? '대기중'
                            : request.status === 'APPROVED'
                            ? '승인'
                            : '거부'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {request.status !== 'PENDING' && (
                          <div>
                            {request.approvedAmount && (
                              <div className="text-sm text-[#FF6A00] font-medium font-pretendard">
                                승인 금액: ₩{request.approvedAmount.toLocaleString()}
                              </div>
                            )}
                            {request.rejectionReason && (
                              <div className="text-sm text-red-600 font-pretendard">
                                거부 사유: {request.rejectionReason}
                              </div>
                            )}
                            {request.adminNote && (
                              <div className="text-xs text-stone-500 font-pretendard">메모: {request.adminNote}</div>
                            )}
                            <div className="text-xs text-stone-400 font-pretendard">
                              {new Date(request.processedAt!).toLocaleDateString('ko-KR')}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {request.status === 'PENDING' && (
                          processingId === request.id ? (
                            <div className="space-y-2">
                              <input
                                type="number"
                                value={approvedAmount}
                                onChange={(e) => setApprovedAmount(parseInt(e.target.value))}
                                className="w-full px-2 py-1 border border-gray-300 rounded-[10px] text-sm font-pretendard focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
                                placeholder="승인 금액"
                                step="1000"
                              />
                              <input
                                type="text"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded-[10px] text-sm font-pretendard focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
                                placeholder="거부 사유 (선택)"
                              />
                              <input
                                type="text"
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded-[10px] text-sm font-pretendard focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
                                placeholder="관리자 메모"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => submitApproval(request.id)}
                                  className="flex-1 px-3 py-1 bg-[#FF6A00] text-white rounded-[10px] hover:bg-[#E55F00] transition-colors font-pretendard"
                                >
                                  승인
                                </button>
                                <button
                                  onClick={() => submitRejection(request.id)}
                                  className="flex-1 px-3 py-1 bg-red-600 text-white rounded-[10px] hover:bg-red-700 transition-colors font-pretendard"
                                >
                                  거부
                                </button>
                                <button
                                  onClick={() => setProcessingId(null)}
                                  className="px-3 py-1 bg-stone-600 text-white rounded-[10px] hover:bg-stone-700 transition-colors font-pretendard"
                                >
                                  취소
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => handleApprove(request)}
                                className="text-[#FF6A00] hover:text-[#E55F00] font-pretendard transition-colors"
                              >
                                승인 처리
                              </button>
                              <button
                                onClick={() => handleReject(request)}
                                className="text-red-600 hover:text-red-900 font-pretendard transition-colors"
                              >
                                거부 처리
                              </button>
                            </div>
                          )
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
    </AdminLayout>
  )
}
