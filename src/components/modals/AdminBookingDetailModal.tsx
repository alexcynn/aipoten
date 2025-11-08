'use client'

import { useState, useEffect } from 'react'
import { X, FileText, Star, CreditCard } from 'lucide-react'
import { getParentViewStatus, getStatusClasses } from '@/lib/booking-status'
import JournalViewModal from './JournalViewModal'
import ReviewViewModal from './ReviewViewModal'

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
    settlementAmount: number | null
    settledAt: string | null
    settlementNote: string | null
  }
  child: {
    id: string
    name: string
    birthDate: string
    gender: string
  }
  parentUser: {
    id: string
    name: string
    email: string
    phone: string | null
  }
  therapist: {
    id: string
    user: {
      name: string
      email: string
      phone: string | null
    }
    sessionFee: number | null
    bank: string | null
    accountNumber: string | null
    accountHolder: string | null
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

interface AdminBookingDetailModalProps {
  isOpen: boolean
  onClose: () => void
  bookingId: string | null
  onUpdate?: () => void
}

export default function AdminBookingDetailModal({
  isOpen,
  onClose,
  bookingId,
  onUpdate,
}: AdminBookingDetailModalProps) {
  const [booking, setBooking] = useState<Booking | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showSettlementModal, setShowSettlementModal] = useState(false)
  const [settlementNote, setSettlementNote] = useState('')
  const [isSettling, setIsSettling] = useState(false)
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
      const response = await fetch(`/api/admin/bookings/${bookingId}`)
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

  const handleSettle = async () => {
    if (!booking) return

    setIsSettling(true)
    try {
      const response = await fetch(`/api/admin/bookings/${booking.id}/settlement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settlementNote: settlementNote.trim() || undefined }),
      })

      const data = await response.json()

      if (response.ok) {
        alert('정산이 완료되었습니다.')
        setShowSettlementModal(false)
        setSettlementNote('')
        fetchBooking()
        onUpdate?.()
      } else {
        alert(data.error || '정산에 실패했습니다.')
      }
    } catch (err) {
      alert('서버 오류가 발생했습니다.')
    } finally {
      setIsSettling(false)
    }
  }

  if (!isOpen) return null

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
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
              예약 상세 (관리자)
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
                        {booking.payment.sessionType === 'CONSULTATION' ? '언어 컨설팅' : '홈티'}
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

                {/* 부모 정보 */}
                <div style={{ borderBottom: '1px solid #E5E7EB', paddingBottom: '16px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>
                    부모 정보
                  </h3>
                  <p style={{ fontSize: '16px', color: '#111827', fontWeight: '500', marginBottom: '4px' }}>
                    {booking.parentUser.name}
                  </p>
                  <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '2px' }}>
                    이메일: {booking.parentUser.email}
                  </p>
                  {booking.parentUser.phone && (
                    <p style={{ fontSize: '14px', color: '#6B7280' }}>
                      전화번호: {booking.parentUser.phone}
                    </p>
                  )}
                </div>

                {/* 치료사 정보 */}
                <div style={{ borderBottom: '1px solid #E5E7EB', paddingBottom: '16px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>
                    치료사 정보
                  </h3>
                  <p style={{ fontSize: '16px', color: '#111827', fontWeight: '500', marginBottom: '4px' }}>
                    {booking.therapist.user.name} 치료사
                  </p>
                  <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '2px' }}>
                    이메일: {booking.therapist.user.email}
                  </p>
                  {booking.therapist.user.phone && (
                    <p style={{ fontSize: '14px', color: '#6B7280' }}>
                      전화번호: {booking.therapist.user.phone}
                    </p>
                  )}
                </div>

                {/* 치료사 계좌 정보 */}
                {(booking.therapist.bank || booking.therapist.accountNumber) && (
                  <div
                    style={{
                      borderBottom: '1px solid #E5E7EB',
                      paddingBottom: '16px',
                      backgroundColor: '#FEF3C7',
                      padding: '16px',
                      borderRadius: '6px',
                      border: '1px solid #FDE68A',
                    }}
                  >
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#78350F', marginBottom: '12px' }}>
                      💳 치료사 계좌 정보
                    </h3>
                    <div style={{ fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {booking.therapist.bank && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#92400E' }}>은행:</span>
                          <span style={{ color: '#78350F', fontWeight: '600' }}>{booking.therapist.bank}</span>
                        </div>
                      )}
                      {booking.therapist.accountNumber && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#92400E' }}>계좌번호:</span>
                          <span style={{ color: '#78350F', fontWeight: '600' }}>{booking.therapist.accountNumber}</span>
                        </div>
                      )}
                      {booking.therapist.accountHolder && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#92400E' }}>예금주:</span>
                          <span style={{ color: '#78350F', fontWeight: '600' }}>{booking.therapist.accountHolder}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 자녀 정보 */}
                <div style={{ borderBottom: '1px solid #E5E7EB', paddingBottom: '16px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>
                    자녀 정보
                  </h3>
                  <p style={{ fontSize: '14px', color: '#111827', fontWeight: '500' }}>
                    {booking.child.name} ({booking.child.gender === 'MALE' ? '남' : '여'})
                  </p>
                  <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '4px' }}>
                    생년월일: {new Date(booking.child.birthDate).toLocaleDateString('ko-KR')}
                  </p>
                </div>

                {/* 방문 주소 */}
                {booking.visitAddress && (
                  <div style={{ borderBottom: '1px solid #E5E7EB', paddingBottom: '16px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>
                      방문 주소
                    </h3>
                    <p style={{ fontSize: '14px', color: '#111827' }}>
                      {booking.visitAddress} {booking.visitAddressDetail || ''}
                    </p>
                  </div>
                )}

                {/* 부모 요청사항 */}
                {booking.parentNote && (
                  <div style={{ borderBottom: '1px solid #E5E7EB', paddingBottom: '16px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>
                      부모 요청사항
                    </h3>
                    <p style={{ fontSize: '14px', color: '#111827', whiteSpace: 'pre-wrap' }}>
                      {booking.parentNote}
                    </p>
                  </div>
                )}

                {/* 결제 정보 */}
                <div style={{ borderBottom: '1px solid #E5E7EB', paddingBottom: '16px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>
                    결제 정보
                  </h3>
                  <div style={{ fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6B7280' }}>원가:</span>
                      <span style={{ color: '#111827' }}>₩{booking.payment.originalFee.toLocaleString()}</span>
                    </div>
                    {booking.payment.discountRate > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6B7280' }}>할인율:</span>
                        <span style={{ color: '#DC2626' }}>{booking.payment.discountRate}%</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6B7280', fontWeight: '600' }}>최종 결제 금액:</span>
                      <span style={{ color: '#111827', fontWeight: '700', fontSize: '16px' }}>
                        ₩{booking.payment.finalFee.toLocaleString()}
                      </span>
                    </div>
                    {booking.payment.platformFee && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6B7280' }}>플랫폼 수수료:</span>
                        <span style={{ color: '#111827' }}>₩{booking.payment.platformFee.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 정산 정보 */}
                {booking.payment.settlementAmount && (
                  <div
                    style={{
                      borderBottom: '1px solid #E5E7EB',
                      paddingBottom: '16px',
                      backgroundColor: '#D1FAE5',
                      padding: '16px',
                      borderRadius: '6px',
                      border: '1px solid #6EE7B7',
                    }}
                  >
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#065F46', marginBottom: '12px' }}>
                      ✅ 정산 완료
                    </h3>
                    <div style={{ fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#047857' }}>정산 금액:</span>
                        <span style={{ color: '#065F46', fontWeight: '700', fontSize: '16px' }}>
                          ₩{booking.payment.settlementAmount.toLocaleString()}
                        </span>
                      </div>
                      {booking.payment.settledAt && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#047857' }}>정산일:</span>
                          <span style={{ color: '#065F46', fontWeight: '500' }}>
                            {new Date(booking.payment.settledAt).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      )}
                      {booking.payment.settlementNote && (
                        <div style={{ marginTop: '8px' }}>
                          <span style={{ color: '#047857', fontWeight: '500' }}>정산 메모:</span>
                          <p style={{ color: '#065F46', marginTop: '4px', whiteSpace: 'pre-wrap' }}>
                            {booking.payment.settlementNote}
                          </p>
                        </div>
                      )}
                    </div>
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
                      <p style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>
                        사유: {booking.cancellationReason}
                      </p>
                    )}
                    {booking.cancelledAt && (
                      <p style={{ fontSize: '14px', color: '#6B7280' }}>
                        취소일: {new Date(booking.cancelledAt).toLocaleDateString('ko-KR')}
                      </p>
                    )}
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

              {/* 후기 보기 버튼 */}
              {booking.review && (
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
                  후기 보기
                </button>
              )}

              {/* 정산하기 버튼 - PENDING_SETTLEMENT 상태일 때만 */}
              {booking.status === 'PENDING_SETTLEMENT' && !booking.payment.settlementAmount && (
                <button
                  onClick={() => setShowSettlementModal(true)}
                  style={{
                    flex: 1,
                    minWidth: '150px',
                    padding: '12px 24px',
                    backgroundColor: '#3B82F6',
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
                    e.currentTarget.style.backgroundColor = '#2563EB'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#3B82F6'
                  }}
                >
                  <CreditCard style={{ width: '20px', height: '20px' }} />
                  정산하기
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 정산 확인 모달 */}
      {showSettlementModal && booking && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 70,
          }}
          onClick={() => setShowSettlementModal(false)}
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
              정산 확인
            </h3>

            {/* 정산 정보 요약 */}
            <div
              style={{
                backgroundColor: '#DBEAFE',
                border: '1px solid #93C5FD',
                borderRadius: '6px',
                padding: '16px',
                marginBottom: '16px',
              }}
            >
              <p style={{ fontSize: '14px', color: '#1E40AF', marginBottom: '8px' }}>
                <strong>치료사:</strong> {booking.therapist.user.name}
              </p>
              {booking.therapist.bank && (
                <p style={{ fontSize: '14px', color: '#1E40AF', marginBottom: '4px' }}>
                  <strong>은행:</strong> {booking.therapist.bank}
                </p>
              )}
              {booking.therapist.accountNumber && (
                <p style={{ fontSize: '14px', color: '#1E40AF', marginBottom: '4px' }}>
                  <strong>계좌번호:</strong> {booking.therapist.accountNumber}
                </p>
              )}
              {booking.therapist.accountHolder && (
                <p style={{ fontSize: '14px', color: '#1E40AF', marginBottom: '12px' }}>
                  <strong>예금주:</strong> {booking.therapist.accountHolder}
                </p>
              )}
              <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#1E3A8A' }}>
                정산 예정 금액: ₩{calculateSettlementAmount(booking).toLocaleString()}
              </p>
            </div>

            {/* 정산 메모 */}
            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px',
                }}
              >
                정산 메모 (선택)
              </label>
              <textarea
                value={settlementNote}
                onChange={(e) => setSettlementNote(e.target.value)}
                rows={3}
                placeholder="정산 관련 메모를 입력하세요 (선택사항)"
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

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowSettlementModal(false)}
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
                취소
              </button>
              <button
                onClick={handleSettle}
                disabled={isSettling}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  backgroundColor: isSettling ? '#9CA3AF' : '#3B82F6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: isSettling ? 'not-allowed' : 'pointer',
                  opacity: isSettling ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isSettling) {
                    e.currentTarget.style.backgroundColor = '#2563EB'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSettling) {
                    e.currentTarget.style.backgroundColor = '#3B82F6'
                  }
                }}
              >
                {isSettling ? '정산 처리 중...' : '정산 확정'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Journal View Modal */}
      <JournalViewModal
        bookingId={booking?.id || null}
        isOpen={showJournalModal}
        onClose={() => setShowJournalModal(false)}
      />

      {/* Review View Modal */}
      <ReviewViewModal
        bookingId={booking?.id || null}
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
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

// Helper function to calculate settlement amount
function calculateSettlementAmount(booking: Booking): number {
  if (booking.payment.sessionType === 'CONSULTATION') {
    // For consultation, use system default or therapist setting (typically 100,000)
    // This will be auto-calculated by the API, showing estimate here
    return booking.payment.finalFee - (booking.payment.platformFee || 50000)
  } else {
    // For therapy, finalFee - platformFee
    return booking.payment.finalFee - (booking.payment.platformFee || 0)
  }
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
