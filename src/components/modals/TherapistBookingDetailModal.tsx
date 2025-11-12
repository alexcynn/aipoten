'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'
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

interface TherapistBookingDetailModalProps {
  isOpen: boolean
  onClose: () => void
  bookingId: string | null
  onUpdate?: () => void
}

export default function TherapistBookingDetailModal({
  isOpen,
  onClose,
  bookingId,
  onUpdate,
}: TherapistBookingDetailModalProps) {
  const router = useRouter()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isConfirming, setIsConfirming] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (isOpen && bookingId) {
      fetchBooking()
    }
  }, [isOpen, bookingId])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const fetchBooking = async () => {
    if (!bookingId) return

    setIsLoading(true)
    setError('')
    setMessage(null)
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

  const handleConfirm = async () => {
    if (!confirm('이 예약을 확인하시겠습니까?')) return

    if (!booking) return

    setIsConfirming(true)
    try {
      const response = await fetch(`/api/therapist/bookings/${booking.id}/confirm`, {
        method: 'POST',
      })

      if (response.ok) {
        setMessage({ type: 'success', text: '예약이 확인되었습니다.' })
        fetchBooking()
        onUpdate?.()
      } else {
        const data = await response.json()
        setMessage({ type: 'error', text: data.error || '예약 확인에 실패했습니다.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '서버 오류가 발생했습니다.' })
    } finally {
      setIsConfirming(false)
    }
  }

  const handleJournalClick = () => {
    if (booking) {
      onClose()
      router.push(`/therapist/bookings/${booking.id}/journal`)
    }
  }

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, { label: string; bgColor: string; textColor: string }> = {
      PENDING_CONFIRMATION: { label: '확인 대기', bgColor: '#FEF3C7', textColor: '#92400E' },
      CONFIRMED: { label: '확인 완료', bgColor: '#DBEAFE', textColor: '#1E40AF' },
      COMPLETED: { label: '완료', bgColor: '#D1FAE5', textColor: '#065F46' },
      CANCELLED: { label: '취소됨', bgColor: '#FEE2E2', textColor: '#991B1B' },
      PENDING_SETTLEMENT: { label: '정산 대기', bgColor: '#E9D5FF', textColor: '#6B21A8' },
      SETTLEMENT_COMPLETED: { label: '정산 완료', bgColor: '#F3F4F6', textColor: '#1F2937' },
    }
    return statusMap[status] || { label: status, bgColor: '#F3F4F6', textColor: '#1F2937' }
  }

  const getPaymentStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      PENDING_PAYMENT: '입금 대기',
      PAID: '결제 완료',
      REFUNDED: '환불 완료',
      PARTIALLY_REFUNDED: '부분 환불',
    }
    return statusMap[status] || status
  }

  if (!isOpen) return null

  const statusInfo = booking ? getStatusLabel(booking.status) : null
  const sessionTypeLabel = booking?.payment.sessionType === 'CONSULTATION' ? '언어 컨설팅' : '홈티'

  // 개인정보 공개 여부 판단
  const showContactInfo = booking ? shouldShowContactInfo(booking.status) : false

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 50,
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          overflow: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
        }}
      >
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            style={{
              padding: '24px',
              borderBottom: '1px solid #E5E7EB',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1c1917' }}>
                예약 상세 정보
              </h2>
              {booking && (
                <p style={{ fontSize: '14px', color: '#57534e', marginTop: '4px' }}>
                  {sessionTypeLabel} 예약
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              style={{
                padding: '8px',
                color: '#57534e',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FFE5E5'
                e.currentTarget.style.color = '#FF6A00'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = '#57534e'
              }}
            >
              <X style={{ width: '24px', height: '24px' }} />
            </button>
          </div>

          {/* Content */}
          <div
            style={{
              padding: '24px',
              overflowY: 'auto',
              flex: 1,
            }}
          >
            {isLoading && (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div
                  style={{
                    display: 'inline-block',
                    width: '48px',
                    height: '48px',
                    border: '4px solid #E5E7EB',
                    borderTopColor: '#FF6A00',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                />
                <p style={{ marginTop: '16px', color: '#57534e' }}>로딩 중...</p>
              </div>
            )}

            {error && (
              <div
                style={{
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: '6px',
                  padding: '16px',
                  color: '#991B1B',
                }}
              >
                {error}
              </div>
            )}

            {message && (
              <div
                style={{
                  marginBottom: '16px',
                  padding: '16px',
                  borderRadius: '6px',
                  backgroundColor: message.type === 'success' ? '#F0FDF4' : '#FEF2F2',
                  color: message.type === 'success' ? '#166534' : '#991B1B',
                  border: `1px solid ${message.type === 'success' ? '#BBF7D0' : '#FECACA'}`,
                }}
              >
                {message.text}
              </div>
            )}

            {booking && !isLoading && !error && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Status Badge */}
                  {statusInfo && (
                    <div>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '8px 16px',
                          borderRadius: '9999px',
                          fontSize: '14px',
                          fontWeight: '500',
                          backgroundColor: statusInfo.bgColor,
                          color: statusInfo.textColor,
                        }}
                      >
                        {statusInfo.label}
                      </span>
                    </div>
                  )}

                  {/* Booking Info */}
                  <div
                    style={{
                      backgroundColor: '#F5EFE7',
                      borderRadius: '10px',
                      padding: '20px',
                    }}
                  >
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1c1917', marginBottom: '16px' }}>
                      예약 정보
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#57534e' }}>세션 번호:</span>
                        <span style={{ fontWeight: '500', color: '#1c1917' }}>
                          {booking.sessionNumber} / {booking.payment.totalSessions}회
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#57534e' }}>예약 일시:</span>
                        <span style={{ fontWeight: '500', color: '#1c1917' }}>
                          {new Date(booking.scheduledAt).toLocaleString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#57534e' }}>세션 시간:</span>
                        <span style={{ fontWeight: '500', color: '#1c1917' }}>{booking.duration}분</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#57534e' }}>결제 상태:</span>
                        <span style={{ fontWeight: '500', color: '#1c1917' }}>
                          {getPaymentStatusLabel(booking.payment.status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Child Info */}
                  <div
                    style={{
                      backgroundColor: '#F5EFE7',
                      borderRadius: '10px',
                      padding: '20px',
                    }}
                  >
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1c1917', marginBottom: '16px' }}>
                      아동 정보
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#57534e' }}>이름:</span>
                        <span style={{ fontWeight: '500', color: '#1c1917' }}>{booking.child.name}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#57534e' }}>생년월일:</span>
                        <span style={{ fontWeight: '500', color: '#1c1917' }}>
                          {new Date(booking.child.birthDate).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#57534e' }}>성별:</span>
                        <span style={{ fontWeight: '500', color: '#1c1917' }}>
                          {booking.child.gender === 'MALE' ? '남' : '여'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Parent Info */}
                  <div
                    style={{
                      backgroundColor: '#F5EFE7',
                      borderRadius: '10px',
                      padding: '20px',
                    }}
                  >
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1c1917', marginBottom: '16px' }}>
                      부모 정보
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#57534e' }}>이름:</span>
                        <span style={{ fontWeight: '500', color: '#1c1917' }}>{booking.parentUser.name}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ color: '#57534e' }}>이메일:</span>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontWeight: '500', color: '#1c1917' }}>
                            {showContactInfo ? booking.parentUser.email : maskEmail(booking.parentUser.email)}
                          </span>
                          {!showContactInfo && (
                            <p style={{ fontSize: '12px', color: '#78716c', marginTop: '4px', fontStyle: 'italic' }}>
                              * 예약 확정 후 공개
                            </p>
                          )}
                        </div>
                      </div>
                      {booking.parentUser.phone && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <span style={{ color: '#57534e' }}>연락처:</span>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontWeight: '500', color: '#1c1917' }}>
                              {showContactInfo ? booking.parentUser.phone : maskPhone(booking.parentUser.phone)}
                            </span>
                            {!showContactInfo && (
                              <p style={{ fontSize: '12px', color: '#78716c', marginTop: '4px', fontStyle: 'italic' }}>
                                * 예약 확정 후 공개
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Visit Address */}
                  <div
                    style={{
                      backgroundColor: '#F5EFE7',
                      borderRadius: '10px',
                      padding: '20px',
                    }}
                  >
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1c1917', marginBottom: '16px' }}>
                      방문 주소
                    </h3>
                    <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
                      <p style={{ color: '#1c1917', fontWeight: '500' }}>
                        {showContactInfo
                          ? booking.visitAddress
                          : maskAddress(booking.visitAddress, booking.visitAddressDetail)}
                      </p>
                      {showContactInfo && booking.visitAddressDetail && (
                        <p style={{ color: '#57534e', marginTop: '4px' }}>{booking.visitAddressDetail}</p>
                      )}
                      {!showContactInfo && (
                        <p style={{ fontSize: '12px', color: '#78716c', marginTop: '8px', fontStyle: 'italic' }}>
                          * 예약 확정 후 공개됩니다
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div
                    style={{
                      backgroundColor: '#F5EFE7',
                      borderRadius: '10px',
                      padding: '20px',
                    }}
                  >
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1c1917', marginBottom: '16px' }}>
                      결제 정보
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#57534e' }}>원가:</span>
                        <span style={{ fontWeight: '500', color: '#1c1917' }}>
                          ₩{booking.payment.originalFee.toLocaleString()}
                        </span>
                      </div>
                      {booking.payment.discountRate > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#57534e' }}>할인율:</span>
                          <span style={{ fontWeight: '500', color: '#DC2626' }}>
                            {booking.payment.discountRate}%
                          </span>
                        </div>
                      )}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          paddingTop: '12px',
                          borderTop: '1px solid #E5E7EB',
                        }}
                      >
                        <span style={{ fontSize: '16px', fontWeight: '600', color: '#1c1917' }}>최종 금액:</span>
                        <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#FF6A00' }}>
                          ₩{booking.payment.finalFee.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Parent Note */}
                  {booking.parentNote && (
                    <div
                      style={{
                        backgroundColor: '#F5EFE7',
                        borderRadius: '10px',
                        padding: '20px',
                      }}
                    >
                      <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1c1917', marginBottom: '12px' }}>
                        부모님 메모
                      </h3>
                      <p style={{ fontSize: '14px', color: '#44403c', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                        {booking.parentNote}
                      </p>
                    </div>
                  )}

                  {/* Therapist Note */}
                  {booking.therapistNote && (
                    <div
                      style={{
                        backgroundColor: '#F0FDF4',
                        borderRadius: '8px',
                        padding: '20px',
                        border: '1px solid #BBF7D0',
                      }}
                    >
                      <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#065F46', marginBottom: '12px' }}>
                        상담일지
                      </h3>
                      <p style={{ fontSize: '14px', color: '#166534', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                        {booking.therapistNote}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer - Action Buttons */}
          {booking && !isLoading && (
            <div
              style={{
                padding: '24px',
                borderTop: '1px solid #E5E7EB',
                display: 'flex',
                gap: '12px',
              }}
            >
              {/* 예약 확인 버튼 */}
              {booking.status === 'PENDING_CONFIRMATION' && booking.payment.status === 'PAID' && (
                <button
                  onClick={handleConfirm}
                  disabled={isConfirming}
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    backgroundColor: isConfirming ? '#9CA3AF' : '#FF6A00',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: isConfirming ? 'not-allowed' : 'pointer',
                    opacity: isConfirming ? 0.5 : 1,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isConfirming) {
                      e.currentTarget.style.backgroundColor = '#E55F00'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isConfirming) {
                      e.currentTarget.style.backgroundColor = '#FF6A00'
                    }
                  }}
                >
                  {isConfirming ? '처리 중...' : '예약 확인'}
                </button>
              )}

              {/* 상담일지 작성 버튼 */}
              {booking.status === 'CONFIRMED' && !booking.therapistNote && (
                <button
                  onClick={handleJournalClick}
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    backgroundColor: '#FF6A00',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#E55F00'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FF6A00'
                  }}
                >
                  상담일지 작성
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  )
}
