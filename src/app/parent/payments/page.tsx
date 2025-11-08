'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import { CreditCard, Calendar } from 'lucide-react'
import { getPaymentProgressStatus } from '@/lib/booking-status'

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
    name: string
  }
  therapist: {
    user: {
      name: string
    }
  }
  bookings: Array<{
    id: string
    status: string
  }>
}

interface PaginationInfo {
  total: number
  page: number
  limit: number
  totalPages: number
}

interface AccountInfo {
  bankName: string
  accountNumber: string
  accountHolder: string
}

export default function ParentPaymentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [payments, setPayments] = useState<Payment[]>([])
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null)
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
  const [statusFilter, setStatusFilter] = useState('ALL')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
    fetchPayments()
  }, [session, status, router, pagination.page, startDate, endDate, statusFilter])

  const fetchPayments = async () => {
    try {
      setIsLoading(true)

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      if (statusFilter !== 'ALL') params.append('status', statusFilter)

      const response = await fetch(`/api/parent/payments?${params}`)
      if (response.ok) {
        const data = await response.json()
        setPayments(data.payments || [])
        setAccountInfo(data.accountInfo || null)
        if (data.pagination) {
          setPagination(data.pagination)
        }
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
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


  const totalPaid = payments
    .filter((p: Payment) => p.status === 'PAID')
    .reduce((sum: number, p: Payment) => sum + (p.finalFee || 0), 0)

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
            <h1 className="text-3xl font-bold text-gray-900">결제 내역</h1>
            <p className="mt-2 text-gray-600">
              언어 컨설팅 및 홈티 프로그램의 결제 내역을 관리하세요.
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-2">
                <CreditCard className="text-green-600" size={24} />
                <h3 className="text-sm font-medium text-gray-500">총 결제 금액</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">{totalPaid.toLocaleString()}원</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 시작일 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  등록일 (시작)
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

              {/* 종료일 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  등록일 (종료)
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

              {/* 상태 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상태
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value)
                    handleFilterChange()
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="ALL">전체</option>
                  <option value="PENDING_PAYMENT">결제 대기</option>
                  <option value="PAID">진행 중</option>
                  <option value="REFUNDED">환불</option>
                </select>
              </div>
            </div>
          </div>

          {/* 입금 계좌 정보 - 결제 대기 건이 있을 때만 표시 */}
          {payments.some(p => p.status === 'PENDING_PAYMENT') && accountInfo && (
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
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
              </div>
              <p className="mt-4 text-sm text-gray-600">
                입금 확인 후 치료사에게 예약 가능 일정을 문의드립니다.
              </p>
            </div>
          )}

          {/* Payments List */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                결제 목록 ({pagination.total}건)
              </h2>
            </div>

            {payments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">결제 내역이 없습니다.</p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          유형
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          아이명
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          치료사
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          금액
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          등록일
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
                      {payments.map((payment) => {
                        const statusInfo = getPaymentProgressStatus(payment)
                        return (
                          <tr key={payment.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {payment.sessionType === 'CONSULTATION'
                                ? '언어 컨설팅'
                                : `홈티 ${payment.totalSessions}회`}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {payment.child.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {payment.therapist.user.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex flex-col">
                                {payment.originalFee !== payment.finalFee && (
                                  <span className="text-xs text-gray-400 line-through">
                                    {payment.originalFee.toLocaleString()}원
                                  </span>
                                )}
                                <span className="font-bold text-gray-900">
                                  {payment.finalFee.toLocaleString()}원
                                </span>
                                {payment.discountRate > 0 && (
                                  <span className="text-xs text-red-600">
                                    {payment.discountRate}% 할인
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {new Date(payment.createdAt).toLocaleDateString('ko-KR', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit'
                              })}
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
                              <Link
                                href={`/parent/payments/${payment.id}`}
                                className="text-green-600 hover:text-green-700 font-medium"
                              >
                                상세보기 →
                              </Link>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-gray-200">
                  {payments.map((payment) => {
                    const statusInfo = getPaymentProgressStatus(payment)
                    return (
                      <div key={payment.id} className="px-6 py-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900">
                              {payment.sessionType === 'CONSULTATION'
                                ? '언어 컨설팅'
                                : `홈티 ${payment.totalSessions}회`}
                            </h3>
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
                              <span className="font-medium">아이:</span> {payment.child.name}
                            </p>
                            <p>
                              <span className="font-medium">치료사:</span> {payment.therapist.user.name}
                            </p>
                            <p>
                              <span className="font-medium">등록일:</span> {new Date(payment.createdAt).toLocaleDateString('ko-KR', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit'
                              })}
                            </p>
                            <p>
                              <span className="font-medium">금액:</span>{' '}
                              <span className="font-bold text-gray-900">
                                {payment.finalFee.toLocaleString()}원
                              </span>
                              {payment.discountRate > 0 && (
                                <span className="ml-2 text-red-600">
                                  ({payment.discountRate}% 할인)
                                </span>
                              )}
                            </p>
                          </div>

                          <Link
                            href={`/parent/payments/${payment.id}`}
                            className="inline-block w-full text-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium text-sm"
                          >
                            상세보기 →
                          </Link>
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
    </div>
  )
}
