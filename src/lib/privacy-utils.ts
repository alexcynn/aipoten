/**
 * 개인정보 마스킹 및 공개 여부 판단 유틸리티
 */

/**
 * 이메일 주소를 마스킹 처리합니다
 * @param email - 원본 이메일 주소
 * @returns 마스킹된 이메일 (예: ***@***.com)
 */
export function maskEmail(email: string | null | undefined): string {
  if (!email) return '***@***.com'
  return '***@***.com'
}

/**
 * 전화번호를 마스킹 처리합니다
 * @param phone - 원본 전화번호
 * @returns 마스킹된 전화번호 (예: 010-****-****)
 */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return '010-****-****'

  // 숫자만 추출
  const numbers = phone.replace(/[^0-9]/g, '')

  if (numbers.length === 11) {
    // 010-1234-5678 형태
    return `${numbers.slice(0, 3)}-****-****`
  } else if (numbers.length === 10) {
    // 02-1234-5678 형태
    return `${numbers.slice(0, 2)}-****-****`
  }

  return '***-****-****'
}

/**
 * 주소를 마스킹 처리합니다
 * @param address - 원본 주소
 * @param addressDetail - 상세 주소 (선택)
 * @returns 마스킹된 주소 또는 안내 메시지
 */
export function maskAddress(
  address: string | null | undefined,
  addressDetail?: string | null | undefined
): string {
  if (!address) return '예약 확정 후 공개됩니다'

  // 시/도만 표시하고 나머지는 마스킹
  const parts = address.split(' ')
  if (parts.length > 0) {
    return `${parts[0]} *** *** (예약 확정 후 공개)`
  }

  return '예약 확정 후 공개됩니다'
}

/**
 * 예약 상태에 따라 연락처 정보를 공개할지 판단합니다
 * @param bookingStatus - 예약 상태
 * @returns 연락처 정보 공개 여부
 */
export function shouldShowContactInfo(
  bookingStatus: string | null | undefined
): boolean {
  if (!bookingStatus) return false

  // CONFIRMED 이상의 상태에서만 연락처 공개
  const allowedStatuses = [
    'CONFIRMED',
    'COMPLETED',
    'PENDING_SETTLEMENT',
    'SETTLEMENT_COMPLETED',
  ]

  return allowedStatuses.includes(bookingStatus)
}

/**
 * 예약 상태와 원본 값에 따라 적절한 값을 반환합니다 (마스킹 또는 원본)
 * @param bookingStatus - 예약 상태
 * @param value - 원본 값
 * @param maskFn - 마스킹 함수
 * @returns 마스킹된 값 또는 원본 값
 */
export function getProtectedValue<T>(
  bookingStatus: string | null | undefined,
  value: T,
  maskFn: (val: T) => string
): T | string {
  if (shouldShowContactInfo(bookingStatus)) {
    return value
  }
  return maskFn(value)
}

/**
 * 사용자 역할에 따라 모든 정보를 공개할지 판단합니다
 * @param userRole - 사용자 역할 (ADMIN, PARENT, THERAPIST)
 * @returns 모든 정보 공개 여부
 */
export function canViewAllInfo(userRole: string | null | undefined): boolean {
  // 관리자는 항상 모든 정보를 볼 수 있음
  return userRole === 'ADMIN'
}
