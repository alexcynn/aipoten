/**
 * 날짜 관련 유틸리티 함수들
 */

/**
 * 생년월일로부터 현재 월령을 계산합니다.
 */
export function calculateAgeInMonths(birthDate: Date): number {
  const today = new Date()
  const birth = new Date(birthDate)

  const yearDiff = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  const dayDiff = today.getDate() - birth.getDate()

  let ageInMonths = yearDiff * 12 + monthDiff

  // 생일이 아직 지나지 않았으면 1개월 빼기
  if (dayDiff < 0) {
    ageInMonths--
  }

  return Math.max(0, ageInMonths)
}

/**
 * 월령을 연령대 그룹으로 변환합니다.
 */
export function getAgeGroup(ageInMonths: number): string {
  if (ageInMonths < 6) return '0-6개월'
  if (ageInMonths < 12) return '6-12개월'
  if (ageInMonths < 24) return '1-2세'
  if (ageInMonths < 36) return '2-3세'
  if (ageInMonths < 48) return '3-4세'
  if (ageInMonths < 60) return '4-5세'
  return '5세 이상'
}

/**
 * 월령을 사람이 읽기 쉬운 형태로 변환합니다.
 */
export function formatAgeInMonths(ageInMonths: number): string {
  if (ageInMonths < 12) {
    return `${ageInMonths}개월`
  }

  const years = Math.floor(ageInMonths / 12)
  const months = ageInMonths % 12

  if (months === 0) {
    return `${years}세`
  }

  return `${years}세 ${months}개월`
}

/**
 * 날짜를 YYYY-MM-DD 형식의 문자열로 변환합니다.
 */
export function formatDateToString(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * 문자열을 Date 객체로 변환합니다.
 */
export function parseStringToDate(dateString: string): Date {
  return new Date(dateString)
}

/**
 * 날짜를 상대적인 시간으로 표시합니다 (예: "3일 전", "1주일 전")
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) {
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    if (diffInHours === 0) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
      return diffInMinutes <= 1 ? '방금 전' : `${diffInMinutes}분 전`
    }
    return diffInHours === 1 ? '1시간 전' : `${diffInHours}시간 전`
  }

  if (diffInDays === 1) return '어제'
  if (diffInDays < 7) return `${diffInDays}일 전`
  if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7)
    return weeks === 1 ? '1주일 전' : `${weeks}주일 전`
  }
  if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30)
    return months === 1 ? '1달 전' : `${months}달 전`
  }

  const years = Math.floor(diffInDays / 365)
  return years === 1 ? '1년 전' : `${years}년 전`
}

/**
 * 날짜를 한국어 형식으로 포맷합니다.
 */
export function formatDateToKorean(date: Date): string {
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * 날짜와 시간을 한국어 형식으로 포맷합니다.
 */
export function formatDateTimeToKorean(date: Date): string {
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * 다음 발달 체크 권장 날짜를 계산합니다.
 */
export function calculateNextAssessmentDate(lastAssessmentDate: Date, childAgeInMonths: number): Date {
  const nextDate = new Date(lastAssessmentDate)

  // 연령에 따른 체크 간격 설정
  let intervalMonths: number

  if (childAgeInMonths < 12) {
    intervalMonths = 3 // 0-12개월: 3개월마다
  } else if (childAgeInMonths < 36) {
    intervalMonths = 6 // 1-3세: 6개월마다
  } else {
    intervalMonths = 12 // 3세 이상: 1년마다
  }

  nextDate.setMonth(nextDate.getMonth() + intervalMonths)
  return nextDate
}

/**
 * 임신 주수를 만삭 여부로 판단합니다.
 */
export function isFullTerm(gestationalWeeks?: number): boolean {
  if (!gestationalWeeks) return true // 정보가 없으면 만삭으로 가정
  return gestationalWeeks >= 37
}

/**
 * 조산 정도를 분류합니다.
 */
export function getPrematureCategory(gestationalWeeks?: number): string {
  if (!gestationalWeeks || gestationalWeeks >= 37) return '만삭'
  if (gestationalWeeks >= 34) return '후기 조산'
  if (gestationalWeeks >= 32) return '중기 조산'
  if (gestationalWeeks >= 28) return '초기 조산'
  return '극초기 조산'
}

/**
 * 월령 범위가 겹치는지 확인합니다.
 */
export function isAgeInRange(ageInMonths: number, minAge: number, maxAge: number): boolean {
  return ageInMonths >= minAge && ageInMonths <= maxAge
}

/**
 * 두 날짜 사이의 일수를 계산합니다.
 */
export function getDaysBetweenDates(startDate: Date, endDate: Date): number {
  const timeDiff = endDate.getTime() - startDate.getTime()
  return Math.ceil(timeDiff / (1000 * 3600 * 24))
}