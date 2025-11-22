/**
 * 예약 및 결제 상태 관리 유틸리티
 *
 * BOOKING_FLOW_GUIDE.md 기준으로 구현됨
 */

export type BookingStatus =
  | 'PENDING_PAYMENT'
  | 'PENDING_CONFIRMATION'
  | 'CONFIRMED'
  | 'PENDING_SETTLEMENT'
  | 'SETTLEMENT_COMPLETED'
  | 'REFUNDED'
  | 'CANCELLED'
  | 'REJECTED'
  | 'NO_SHOW'

export type PaymentStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'PARTIALLY_REFUNDED'
  | 'REFUNDED'
  | 'FAILED'

export interface StatusInfo {
  label: string
  color: string
  bgColor: string
}

/**
 * Booking 상태별 라벨 및 색상 정보
 */
export const BOOKING_STATUS_LABELS: Record<BookingStatus, StatusInfo> = {
  PENDING_PAYMENT: {
    label: '결제대기',
    color: '#F97316',
    bgColor: '#FED7AA'
  },
  PENDING_CONFIRMATION: {
    label: '예약대기',
    color: '#EAB308',
    bgColor: '#FEF08A'
  },
  CONFIRMED: {
    label: '예약확정',
    color: '#3B82F6',
    bgColor: '#BFDBFE'
  },
  PENDING_SETTLEMENT: {
    label: '완료',
    color: '#10B981',
    bgColor: '#A7F3D0'
  },
  SETTLEMENT_COMPLETED: {
    label: '완료',
    color: '#10B981',
    bgColor: '#A7F3D0'
  },
  REFUNDED: {
    label: '환불',
    color: '#EF4444',
    bgColor: '#FECACA'
  },
  CANCELLED: {
    label: '취소',
    color: '#6B7280',
    bgColor: '#E5E7EB'
  },
  REJECTED: {
    label: '거절',
    color: '#EF4444',
    bgColor: '#FECACA'
  },
  NO_SHOW: {
    label: '노쇼',
    color: '#EF4444',
    bgColor: '#FECACA'
  }
}

/**
 * Payment 상태별 라벨 및 색상 정보
 */
export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, StatusInfo> = {
  PENDING_PAYMENT: {
    label: '결제 대기',
    color: '#F97316',
    bgColor: '#FED7AA'
  },
  PAID: {
    label: '결제 완료',
    color: '#10B981',
    bgColor: '#A7F3D0'
  },
  PARTIALLY_REFUNDED: {
    label: '부분 환불',
    color: '#EAB308',
    bgColor: '#FEF08A'
  },
  REFUNDED: {
    label: '환불 완료',
    color: '#EF4444',
    bgColor: '#FECACA'
  },
  FAILED: {
    label: '결제 실패',
    color: '#6B7280',
    bgColor: '#E5E7EB'
  }
}

/**
 * Tailwind CSS 클래스명으로 상태 색상 정보
 */
export const BOOKING_STATUS_CLASSES: Record<BookingStatus, string> = {
  PENDING_PAYMENT: 'bg-orange-100 text-orange-800',
  PENDING_CONFIRMATION: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PENDING_SETTLEMENT: 'bg-green-100 text-green-800',
  SETTLEMENT_COMPLETED: 'bg-green-100 text-green-800',
  REFUNDED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
  REJECTED: 'bg-red-100 text-red-800',
  NO_SHOW: 'bg-red-100 text-red-800'
}

/**
 * 달력용 상태 점(dot) 색상
 * Figma 디자인 기준:
 * - 주황색(#ffa500): 예약대기
 * - 초록색(#4caf50): 예약확정
 * - 파란색(#2196f3): 완료
 * - 회색(#9e9e9e): 취소
 */
export const BOOKING_STATUS_DOT_COLORS: Record<BookingStatus, string> = {
  PENDING_PAYMENT: 'bg-[#ffa500]',      // 결제대기 -> 주황색
  PENDING_CONFIRMATION: 'bg-[#ffa500]', // 예약대기 -> 주황색
  CONFIRMED: 'bg-[#4caf50]',            // 예약확정 -> 초록색
  PENDING_SETTLEMENT: 'bg-[#2196f3]',   // 완료(정산대기) -> 파란색
  SETTLEMENT_COMPLETED: 'bg-[#2196f3]', // 완료(정산완료) -> 파란색
  REFUNDED: 'bg-[#9e9e9e]',             // 환불 -> 회색
  CANCELLED: 'bg-[#9e9e9e]',            // 취소 -> 회색
  REJECTED: 'bg-[#9e9e9e]',             // 거절 -> 회색
  NO_SHOW: 'bg-[#9e9e9e]'               // 노쇼 -> 회색
}

/**
 * Booking 상태 정보 가져오기
 */
export function getBookingStatusInfo(status: string): StatusInfo {
  return BOOKING_STATUS_LABELS[status as BookingStatus] || BOOKING_STATUS_LABELS.PENDING_PAYMENT
}

/**
 * Payment 상태 정보 가져오기
 */
export function getPaymentStatusInfo(status: string): StatusInfo {
  return PAYMENT_STATUS_LABELS[status as PaymentStatus] || PAYMENT_STATUS_LABELS.PENDING_PAYMENT
}

/**
 * 부모 화면에 표시할 상태 정보 결정
 *
 * 우선순위:
 * 1. Payment.status가 PENDING_PAYMENT → "결제대기"
 * 2. Payment.status가 PAID → Booking.status 기준
 * 3. 환불/취소 → Booking.status 기준
 */
export function getParentViewStatus(
  bookingStatus: string,
  paymentStatus?: string
): StatusInfo {
  // Payment 상태가 PENDING_PAYMENT이면 결제대기 우선 표시
  if (paymentStatus === 'PENDING_PAYMENT') {
    return BOOKING_STATUS_LABELS.PENDING_PAYMENT
  }

  // Booking 상태로 판단
  return getBookingStatusInfo(bookingStatus)
}

/**
 * Payment 진행 상태 정보 가져오기
 * (결제 내역 페이지용)
 */
export function getPaymentProgressStatus(payment: {
  status: string
  bookings: Array<{ status: string }>
}): StatusInfo {
  if (payment.status === 'REFUNDED') {
    return { label: '환불 완료', color: '#EF4444', bgColor: '#FECACA' }
  }
  if (payment.status === 'PARTIALLY_REFUNDED') {
    return { label: '부분 환불', color: '#F97316', bgColor: '#FED7AA' }
  }
  if (payment.status === 'PENDING_PAYMENT') {
    return { label: '결제 대기', color: '#F59E0B', bgColor: '#FEF3C7' }
  }
  if (payment.status === 'FAILED') {
    return { label: '결제 실패', color: '#6B7280', bgColor: '#E5E7EB' }
  }

  // PAID 상태 - booking 상태로 판단
  const allCompleted = payment.bookings.every(
    (b) => b.status === 'PENDING_SETTLEMENT' || b.status === 'SETTLEMENT_COMPLETED'
  )
  if (allCompleted && payment.bookings.length > 0) {
    return { label: '완료', color: '#10B981', bgColor: '#A7F3D0' }
  }

  return { label: '진행 중', color: '#3B82F6', bgColor: '#BFDBFE' }
}

/**
 * 달력용 상태 점 색상 가져오기
 */
export function getStatusDotColor(status: string): string {
  return BOOKING_STATUS_DOT_COLORS[status as BookingStatus] || 'bg-gray-500'
}

/**
 * Tailwind CSS 클래스명으로 상태 색상 가져오기
 */
export function getStatusClasses(status: string): string {
  return BOOKING_STATUS_CLASSES[status as BookingStatus] || 'bg-gray-100 text-gray-800'
}

/**
 * 예약(Booking)의 실제 상태 계산
 * Payment와 Booking 상태를 종합하여 현재 표시해야 할 상태 반환
 */
export function getBookingStatus(booking: any, payment: any): BookingStatus {
  // 1. 결제대기 (PENDING_PAYMENT)
  if (payment.status === 'PENDING_PAYMENT') {
    return 'PENDING_PAYMENT'
  }

  // 2. 환불/취소 (Payment level)
  if (payment.status === 'REFUNDED' || payment.status === 'PARTIALLY_REFUNDED') {
    return 'CANCELLED'
  }

  // 3. 취소/거절 (Booking level)
  if (booking.status === 'CANCELLED' || booking.status === 'REJECTED') {
    return 'CANCELLED'
  }

  // 4. 정산완료
  if (booking.status === 'SETTLEMENT_COMPLETED' || payment.settledAt) {
    return 'SETTLEMENT_COMPLETED'
  }

  // 5. 정산대기 (완료 후 정산 전)
  if (booking.status === 'PENDING_SETTLEMENT') {
    return 'PENDING_SETTLEMENT'
  }

  // 6. 완료 (레거시)
  if (booking.status === 'COMPLETED') {
    return 'PENDING_SETTLEMENT' // COMPLETED는 정산대기로 간주
  }

  // 7. 진행예정
  if (booking.status === 'CONFIRMED') {
    return 'CONFIRMED'
  }

  // 8. 예약대기
  if (booking.status === 'PENDING_CONFIRMATION') {
    return 'PENDING_CONFIRMATION'
  }

  // 9. 노쇼
  if (booking.status === 'NO_SHOW') {
    return 'NO_SHOW'
  }

  // 기본값: 예약대기
  return 'PENDING_CONFIRMATION'
}

/**
 * 언어 컨설팅(1회성)의 상태 계산
 * Payment에서 첫 번째 booking을 추출하여 상태 계산
 */
export function getConsultationStatus(payment: any): BookingStatus {
  // 1. 결제대기
  if (payment.status === 'PENDING_PAYMENT') {
    return 'PENDING_PAYMENT'
  }

  // 2. 환불
  if (payment.status === 'REFUNDED' || payment.status === 'PARTIALLY_REFUNDED') {
    return 'CANCELLED'
  }

  const booking = payment.bookings?.[0]
  if (!booking) {
    return 'PENDING_PAYMENT'
  }

  return getBookingStatus(booking, payment)
}
