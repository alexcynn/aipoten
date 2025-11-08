'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Header from '@/components/layout/Header'
import { ArrowLeft } from 'lucide-react'
import { maskEmail, maskPhone, maskAddress, shouldShowContactInfo } from '@/lib/privacy-utils'

interface Booking {
  id: string
  sessionNumber: number
  scheduledAt: string
  status: string
  duration: number
  visitAddress: string
  visitAddressDetail: string | null
  parentNote: string | null
  therapistNote: string | null
  completedAt: string | null
  confirmedAt: string | null
  timeSlot: {
    date: string
    startTime: string
    endTime: string
  }
  payment: {
    id: string
    sessionType: string
    totalSessions: number
    originalFee: number
    discountRate: number
    finalFee: number
    status: string
    paidAt: string | null
  }
  parentUser: {
    id: string
    name: string
    email: string
    phone: string | null
  }
  child: {
    id: string
    name: string
    birthDate: string
    gender: string
  }
  therapist: {
    user: {
      name: string
      email: string
    }
  }
}

export default function TherapistBookingDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const bookingId = params.id as string

  const [booking, setBooking] = useState<Booking | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isConfirming, setIsConfirming] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

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

    fetchBooking()
  }, [session, status, router, bookingId])

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`)
      if (response.ok) {
        const data = await response.json()
        setBooking(data.booking)
      } else {
        setMessage({ type: 'error', text: '예약 정보를 불러올 수 없습니다.' })
      }
    } catch (error) {
      console.error('예약 조회 오류:', error)
      setMessage({ type: 'error', text: '서버 오류가 발생했습니다.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirm = async () => {
    if (!confirm('이 예약을 확인하시겠습니까?')) return

    setIsConfirming(true)
    try {
      const response = await fetch(`/api/therapist/bookings/${bookingId}/confirm`, {
        method: 'POST'
      })

      if (response.ok) {
        setMessage({ type: 'success', text: '예약이 확인되었습니다.' })
        fetchBooking() // 새로고침
      } else {
        const data = await response.json()
        setMessage({ type: 'error', text: data.error || '예약 확인에 실패했습니다.' })
      }
    } catch (error) {
      console.error('예약 확인 오류:', error)
      setMessage({ type: 'error', text: '서버 오류가 발생했습니다.' })
    } finally {
      setIsConfirming(false)
    }
  }

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, { label: string; bgColor: string; textColor: string }> = {
      PENDING_CONFIRMATION: { label: '확인 대기', bgColor: '#FEF3C7', textColor: '#92400E' },
      CONFIRMED: { label: '확인 완료', bgColor: '#DBEAFE', textColor: '#1E40AF' },
      COMPLETED: { label: '완료', bgColor: '#D1FAE5', textColor: '#065F46' },
      CANCELLED: { label: '취소됨', bgColor: '#FEE2E2', textColor: '#991B1B' },
      PENDING_SETTLEMENT: { label: '정산 대기', bgColor: '#E9D5FF', textColor: '#6B21A8' },
      SETTLEMENT_COMPLETED: { label: '정산 완료', bgColor: '#F3F4F6', textColor: '#1F2937' }
    }
    return statusMap[status] || { label: status, bgColor: '#F3F4F6', textColor: '#1F2937' }
  }

  const getPaymentStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      PENDING_PAYMENT: '입금 대기',
      PAID: '결제 완료',
      REFUNDED: '환불 완료',
      PARTIALLY_REFUNDED: '부분 환불'
    }
    return statusMap[status] || status
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

  if (!booking) {
    return (
      <div className="min-h-screen bg-neutral-light">
        <Header />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px', textAlign: 'center' }}>
              <p style={{ color: '#6B7280', marginBottom: '16px' }}>예약 정보를 찾을 수 없습니다.</p>
              <button
                onClick={() => router.back()}
                style={{
                  marginTop: '16px',
                  padding: '8px 16px',
                  backgroundColor: '#10B981',
                  color: 'white',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#059669'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#10B981'
                }}
              >
                돌아가기
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const statusInfo = getStatusLabel(booking.status)
  const sessionTypeLabel = booking.payment.sessionType === 'CONSULTATION' ? '언어 컨설팅' : '홈티'

  return (
    <div className="min-h-screen bg-neutral-light">
      <Header />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            style={{
              display: 'flex',
              alignItems: 'center',
              color: '#4B5563',
              background: 'none',
              border: 'none',
              fontSize: '16px',
              cursor: 'pointer',
              marginBottom: '24px',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#111827'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#4B5563'
            }}
          >
            <ArrowLeft style={{ width: '20px', height: '20px', marginRight: '8px' }} />
            돌아가기
          </button>

          {/* Message */}
          {message && (
            <div
              style={{
                marginBottom: '24px',
                padding: '16px',
                borderRadius: '6px',
                backgroundColor: message.type === 'success' ? '#F0FDF4' : '#FEF2F2',
                color: message.type === 'success' ? '#166534' : '#991B1B',
                border: `1px solid ${message.type === 'success' ? '#BBF7D0' : '#FECACA'}`
              }}
            >
              {message.text}
            </div>
          )}

          {/* Title */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">예약 상세 정보</h1>
            <p className="mt-2 text-gray-600">{sessionTypeLabel} 예약</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Booking Info */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">예약 정보</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">세션 번호:</span>
                    <span className="font-medium">
                      {booking.sessionNumber} / {booking.payment.totalSessions}회
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">예약 일시:</span>
                    <span className="font-medium">
                      {new Date(booking.scheduledAt).toLocaleString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">세션 시간:</span>
                    <span className="font-medium">{booking.duration}분</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">예약 상태:</span>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      fontSize: '14px',
                      fontWeight: '500',
                      backgroundColor: statusInfo.bgColor,
                      color: statusInfo.textColor
                    }}>
                      {statusInfo.label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">결제 상태:</span>
                    <span className="font-medium">{getPaymentStatusLabel(booking.payment.status)}</span>
                  </div>
                </div>
              </div>

              {/* Child Info */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">아동 정보</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">이름:</span>
                    <span className="font-medium">{booking.child.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">생년월일:</span>
                    <span className="font-medium">
                      {new Date(booking.child.birthDate).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">성별:</span>
                    <span className="font-medium">{booking.child.gender === 'MALE' ? '남' : '여'}</span>
                  </div>
                </div>
              </div>

              {/* Parent Info */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">부모 정보</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">이름:</span>
                    <span className="font-medium">{booking.parentUser.name}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex justify-between w-full">
                      <span className="text-gray-600">이메일:</span>
                      <span className="font-medium">
                        {shouldShowContactInfo(booking.status)
                          ? booking.parentUser.email
                          : maskEmail(booking.parentUser.email)}
                      </span>
                    </div>
                    {!shouldShowContactInfo(booking.status) && (
                      <p className="text-xs text-gray-500 mt-1 italic">
                        * 예약 확정 후 공개
                      </p>
                    )}
                  </div>
                  {booking.parentUser.phone && (
                    <div className="flex flex-col items-end">
                      <div className="flex justify-between w-full">
                        <span className="text-gray-600">연락처:</span>
                        <span className="font-medium">
                          {shouldShowContactInfo(booking.status)
                            ? booking.parentUser.phone
                            : maskPhone(booking.parentUser.phone)}
                        </span>
                      </div>
                      {!shouldShowContactInfo(booking.status) && (
                        <p className="text-xs text-gray-500 mt-1 italic">
                          * 예약 확정 후 공개
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Visit Address */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">방문 주소</h2>
                <div className="space-y-2">
                  <p className="text-gray-900">
                    {shouldShowContactInfo(booking.status)
                      ? booking.visitAddress
                      : maskAddress(booking.visitAddress, booking.visitAddressDetail)}
                  </p>
                  {shouldShowContactInfo(booking.status) && booking.visitAddressDetail && (
                    <p className="text-gray-600">{booking.visitAddressDetail}</p>
                  )}
                  {!shouldShowContactInfo(booking.status) && (
                    <p className="text-xs text-gray-500 mt-1 italic">
                      * 예약 확정 후 공개됩니다
                    </p>
                  )}
                </div>
              </div>

              {/* Notes */}
              {booking.parentNote && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">부모님 메모</h2>
                  <p className="text-gray-700 whitespace-pre-wrap">{booking.parentNote}</p>
                </div>
              )}

              {booking.therapistNote && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">상담일지</h2>
                  <p className="text-gray-700 whitespace-pre-wrap">{booking.therapistNote}</p>
                </div>
              )}
            </div>

            {/* Right Column - Actions */}
            <div className="space-y-6">
              {/* Payment Info */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">결제 정보</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">원가:</span>
                    <span className="font-medium">₩{booking.payment.originalFee.toLocaleString()}</span>
                  </div>
                  {booking.payment.discountRate > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">할인율:</span>
                      <span className="font-medium text-red-600">{booking.payment.discountRate}%</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-3 border-t">
                    <span className="text-gray-900 font-semibold">최종 금액:</span>
                    <span className="text-xl font-bold text-aipoten-green">
                      ₩{booking.payment.finalFee.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {booking.status === 'PENDING_CONFIRMATION' && booking.payment.status === 'PAID' && (
                <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>예약 확인</h2>
                  <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '16px' }}>
                    부모님이 결제를 완료했습니다. 예약을 확인하시겠습니까?
                  </p>
                  <button
                    onClick={handleConfirm}
                    disabled={isConfirming}
                    style={{
                      width: '100%',
                      padding: '8px 16px',
                      backgroundColor: isConfirming ? '#9CA3AF' : '#10B981',
                      color: 'white',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '16px',
                      fontWeight: '500',
                      cursor: isConfirming ? 'not-allowed' : 'pointer',
                      opacity: isConfirming ? 0.5 : 1,
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (!isConfirming) {
                        e.currentTarget.style.backgroundColor = '#059669'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isConfirming) {
                        e.currentTarget.style.backgroundColor = '#10B981'
                      }
                    }}
                  >
                    {isConfirming ? '처리 중...' : '예약 확인'}
                  </button>
                </div>
              )}

              {booking.status === 'CONFIRMED' && !booking.therapistNote && (
                <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>상담일지</h2>
                  <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '16px' }}>
                    세션 완료 후 상담일지를 작성해주세요.
                  </p>
                  <button
                    onClick={() => router.push(`/therapist/bookings/${bookingId}/journal`)}
                    style={{
                      width: '100%',
                      padding: '8px 16px',
                      backgroundColor: '#3B82F6',
                      color: 'white',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '16px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#2563EB'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#3B82F6'
                    }}
                  >
                    상담일지 작성
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
