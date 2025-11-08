'use client'

import { useState, useEffect } from 'react'
import { X, FileText, Star } from 'lucide-react'
import { getParentViewStatus, getStatusClasses } from '@/lib/booking-status'
import { maskEmail, maskAddress, shouldShowContactInfo } from '@/lib/privacy-utils'
import ReviewModal from './ReviewModal'
import JournalViewModal from './JournalViewModal'

interface Booking {
  id: string
  sessionNumber: number
  scheduledAt: string
  duration: number
  status: string
  confirmedAt: string | null
  completedAt: string | null
  cancelledAt: string | null
  cancellationReason: string | null
  rejectionReason?: string | null
  visitAddress: string | null
  visitAddressDetail: string | null
  parentNote: string | null
  therapistNote: string | null
  payment: {
    id: string
    sessionType: string
    totalSessions: number
    originalFee: number
    discountRate: number
    finalFee: number
    platformFee: number | null
    status: string
    paidAt: string | null
    refundedAt: string | null
    refundAmount: number | null
  }
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
    sessionFee: number | null
  }
  timeSlot: {
    date: string
    startTime: string
    endTime: string
  }
  review: {
    id: string
    rating: number
    content: string | null
  } | null
}

interface ParentBookingDetailModalProps {
  isOpen: boolean
  onClose: () => void
  bookingId: string | null
  onUpdate?: () => void
}

export default function ParentBookingDetailModal({
  isOpen,
  onClose,
  bookingId,
  onUpdate,
}: ParentBookingDetailModalProps) {
  const [booking, setBooking] = useState<Booking | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancellationReason, setCancellationReason] = useState('')
  const [isCancelling, setIsCancelling] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [showJournalModal, setShowJournalModal] = useState(false)

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
        amount: booking.payment.finalFee,
        description: '100% 환불 (24시간 이전 취소)',
      }
    } else if (hoursUntil >= 12) {
      return {
        amount: Math.round(booking.payment.finalFee * 0.5),
        description: '50% 환불 (12-24시간 이전 취소)',
      }
    } else {
      return {
        amount: 0,
        description: '환불 불가 (12시간 이내 취소)',
      }
    }
  }

  const handleCancel = async () => {
    if (!cancellationReason.trim()) {
      alert('취소 사유를 입력해주세요.')
      return
    }

    if (!booking) return

    setIsCancelling(true)
    try {
      const response = await fetch(`/api/bookings/${booking.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancellationReason }),
      })

      const data = await response.json()

      if (response.ok) {
        alert('예약이 취소되었습니다.')
        setShowCancelModal(false)
        setCancellationReason('')
        fetchBooking()
        onUpdate?.()
      } else {
        alert(data.error || '취소에 실패했습니다.')
      }
    } catch (err) {
      alert('서버 오류가 발생했습니다.')
    } finally {
      setIsCancelling(false)
    }
  }

  if (!isOpen) return null

  const { amount: refundAmount, description: refundDescription } = booking
    ? calculateRefundAmount()
    : { amount: 0, description: '' }

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
        }}
      >
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            maxWidth: '800px',
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
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
              예약 상세
            </h2>
            <button
              onClick={onClose}
              style={{
                padding: '8px',
                color: '#6B7280',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F3F4F6'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
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
                    borderTopColor: '#10B981',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                />
                <p style={{ marginTop: '16px', color: '#6B7280' }}>로딩 중...</p>
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

            {booking && !isLoading && !error && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Status Badge */}
                <div>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '8px 12px',
                      borderRadius: '9999px',
                      fontSize: '14px',
                      fontWeight: '500',
                      ...getStatusBadgeStyles(
                        booking.payment?.status === 'PENDING_PAYMENT'
                          ? 'PENDING_PAYMENT'
                          : booking.status
                      ),
                    }}
                  >
                    {getParentViewStatus(booking.status, booking.payment?.status).label}
                  </span>
                </div>

                {/* 예약 정보 */}
                <div style={{ borderBottom: '1px solid #E5E7EB', paddingBottom: '16px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>
                    예약 정보
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '14px' }}>
                    <div>
                      <span style={{ color: '#6B7280' }}>예약 날짜:</span>
                      <p style={{ color: '#111827', fontWeight: '500', marginTop: '4px' }}>
                        {new Date(booking.scheduledAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          weekday: 'short',
                        })}
                      </p>
                    </div>
                    <div>
                      <span style={{ color: '#6B7280' }}>예약 시간:</span>
                      <p style={{ color: '#111827', fontWeight: '500', marginTop: '4px' }}>
                        {booking.timeSlot.startTime} - {booking.timeSlot.endTime}
                      </p>
                    </div>
                    <div>
                      <span style={{ color: '#6B7280' }}>세션 타입:</span>
                      <p style={{ color: '#111827', fontWeight: '500', marginTop: '4px' }}>
                        {booking.payment.sessionType === 'CONSULTATION' ? '방문 컨설팅' : '치료'}
                      </p>
                    </div>
                    <div>
                      <span style={{ color: '#6B7280' }}>세션 회수:</span>
                      <p style={{ color: '#111827', fontWeight: '500', marginTop: '4px' }}>
                        {booking.sessionNumber} / {booking.payment.totalSessions}회
                      </p>
                    </div>
                  </div>
                </div>

                {/* 치료사 정보 */}
                <div style={{ borderBottom: '1px solid #E5E7EB', paddingBottom: '16px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>
                    치료사 정보
                  </h3>
                  <p style={{ fontSize: '16px', color: '#111827', fontWeight: '500', marginBottom: '4px' }}>
                    {booking.therapist.user.name} 치료사
                  </p>
                  <p style={{ fontSize: '14px', color: '#6B7280' }}>
                    {showContactInfo
                      ? booking.therapist.user.email
                      : maskEmail(booking.therapist.user.email)}
                  </p>
                  {!showContactInfo && (
                    <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px', fontStyle: 'italic' }}>
                      * 예약 확정 후 공개됩니다
                    </p>
                  )}
                </div>

                {/* 자녀 정보 */}
                <div style={{ borderBottom: '1px solid #E5E7EB', paddingBottom: '16px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>
                    자녀 정보
                  </h3>
                  <p style={{ fontSize: '14px', color: '#111827', fontWeight: '500' }}>
                    {booking.child.name} ({booking.child.gender === 'MALE' ? '남' : '여'})
                  </p>
                </div>

                {/* 방문 주소 */}
                {booking.visitAddress && (
                  <div style={{ borderBottom: '1px solid #E5E7EB', paddingBottom: '16px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>
                      방문 주소
                    </h3>
                    <p style={{ fontSize: '14px', color: '#111827' }}>
                      {showContactInfo
                        ? `${booking.visitAddress} ${booking.visitAddressDetail || ''}`
                        : maskAddress(booking.visitAddress, booking.visitAddressDetail)}
                    </p>
                    {!showContactInfo && (
                      <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px', fontStyle: 'italic' }}>
                        * 예약 확정 후 공개됩니다
                      </p>
                    )}
                  </div>
                )}

                {/* 요청사항 */}
                {booking.parentNote && (
                  <div style={{ borderBottom: '1px solid #E5E7EB', paddingBottom: '16px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>
                      요청사항
                    </h3>
                    <p style={{ fontSize: '14px', color: '#111827', whiteSpace: 'pre-wrap' }}>
                      {booking.parentNote}
                    </p>
                  </div>
                )}

                {/* 거절 정보 */}
                {booking.status === 'REJECTED' && booking.rejectionReason && (
                  <div
                    style={{
                      backgroundColor: '#FEF2F2',
                      border: '1px solid #FECACA',
                      borderRadius: '6px',
                      padding: '16px',
                    }}
                  >
                    <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#991B1B', marginBottom: '8px' }}>
                      거절 사유
                    </h4>
                    <p style={{ fontSize: '14px', color: '#991B1B' }}>{booking.rejectionReason}</p>
                  </div>
                )}

                {/* 취소 정보 */}
                {booking.status === 'CANCELLED' && (
                  <div
                    style={{
                      backgroundColor: '#F9FAFB',
                      border: '1px solid #E5E7EB',
                      borderRadius: '6px',
                      padding: '16px',
                    }}
                  >
                    <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                      취소 정보
                    </h4>
                    {booking.cancellationReason && (
                      <p style={{ fontSize: '14px', color: '#374151', marginBottom: '12px' }}>
                        사유: {booking.cancellationReason}
                      </p>
                    )}
                    <p style={{ fontSize: '14px', color: '#6B7280' }}>
                      환불 금액은 결제 상세 페이지에서 확인하실 수 있습니다.
                    </p>
                  </div>
                )}
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
                flexWrap: 'wrap',
              }}
            >
              {/* 상담일지 보기 버튼 */}
              {booking.therapistNote && (
                <button
                  onClick={() => setShowJournalModal(true)}
                  style={{
                    flex: 1,
                    minWidth: '150px',
                    padding: '12px 24px',
                    backgroundColor: '#10B981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#059669'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#10B981'
                  }}
                >
                  <FileText style={{ width: '20px', height: '20px' }} />
                  상담일지 보기
                </button>
              )}

              {/* 후기 작성 버튼 - 완료된 예약이고 리뷰가 없는 경우 */}
              {(booking.status === 'PENDING_SETTLEMENT' ||
                booking.status === 'SETTLEMENT_COMPLETED') &&
                !booking.review && (
                <button
                  onClick={() => setShowReviewModal(true)}
                  style={{
                    flex: 1,
                    minWidth: '150px',
                    padding: '12px 24px',
                    backgroundColor: '#F59E0B',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#D97706'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#F59E0B'
                  }}
                >
                  <Star style={{ width: '20px', height: '20px' }} />
                  후기 작성하기
                </button>
              )}

              {/* 예약 취소 버튼 */}
              {(booking.status === 'PENDING_CONFIRMATION' || booking.status === 'CONFIRMED') && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  style={{
                    flex: 1,
                    minWidth: '150px',
                    padding: '12px 24px',
                    backgroundColor: '#DC2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#B91C1C'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#DC2626'
                  }}
                >
                  예약 취소하기
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 취소 모달 */}
      {showCancelModal && booking && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 60,
          }}
          onClick={() => setShowCancelModal(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '24px',
              maxWidth: '500px',
              width: '100%',
              margin: '16px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>
              예약 취소
            </h3>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                취소 사유 *
              </label>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                rows={3}
                placeholder="취소 사유를 입력해주세요"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>

            <div
              style={{
                backgroundColor: '#FFFBEB',
                border: '1px solid #FDE68A',
                borderRadius: '6px',
                padding: '16px',
                marginBottom: '16px',
              }}
            >
              <p style={{ fontSize: '14px', color: '#92400E', fontWeight: '500', marginBottom: '4px' }}>
                환불 정보
              </p>
              <p style={{ fontSize: '14px', color: '#92400E' }}>{refundDescription}</p>
              <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#78350F', marginTop: '8px' }}>
                환불 금액: ₩{refundAmount.toLocaleString()}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowCancelModal(false)}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  border: '1px solid #D1D5DB',
                  backgroundColor: 'white',
                  color: '#374151',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F9FAFB'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white'
                }}
              >
                닫기
              </button>
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  backgroundColor: isCancelling ? '#9CA3AF' : '#DC2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: isCancelling ? 'not-allowed' : 'pointer',
                  opacity: isCancelling ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isCancelling) {
                    e.currentTarget.style.backgroundColor = '#B91C1C'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isCancelling) {
                    e.currentTarget.style.backgroundColor = '#DC2626'
                  }
                }}
              >
                {isCancelling ? '취소 중...' : '예약 취소'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      <ReviewModal
        bookingId={booking?.id || null}
        existingReview={booking?.review || null}
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSuccess={() => {
          fetchBooking()
          onUpdate?.()
        }}
      />

      {/* Journal View Modal */}
      <JournalViewModal
        bookingId={booking?.id || null}
        isOpen={showJournalModal}
        onClose={() => setShowJournalModal(false)}
      />

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

// Helper function to get status badge styles
function getStatusBadgeStyles(status: string) {
  const classes = getStatusClasses(status)

  // Parse Tailwind classes to inline styles
  if (classes.includes('bg-orange-100')) {
    return { backgroundColor: '#FFEDD5', color: '#9A3412' }
  } else if (classes.includes('bg-yellow-100')) {
    return { backgroundColor: '#FEF3C7', color: '#92400E' }
  } else if (classes.includes('bg-blue-100')) {
    return { backgroundColor: '#DBEAFE', color: '#1E40AF' }
  } else if (classes.includes('bg-green-100')) {
    return { backgroundColor: '#D1FAE5', color: '#065F46' }
  } else if (classes.includes('bg-purple-100')) {
    return { backgroundColor: '#E9D5FF', color: '#6B21A8' }
  } else if (classes.includes('bg-gray-100')) {
    return { backgroundColor: '#F3F4F6', color: '#374151' }
  } else if (classes.includes('bg-red-100')) {
    return { backgroundColor: '#FEE2E2', color: '#991B1B' }
  }

  return { backgroundColor: '#F3F4F6', color: '#374151' }
}
