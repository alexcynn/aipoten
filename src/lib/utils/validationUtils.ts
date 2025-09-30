/**
 * 유효성 검사 관련 유틸리티 함수들
 */

/**
 * 이메일 형식을 검증합니다.
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 비밀번호 강도를 검증합니다.
 */
export function isValidPassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('비밀번호는 8자 이상이어야 합니다.')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('대문자가 최소 1개 포함되어야 합니다.')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('소문자가 최소 1개 포함되어야 합니다.')
  }

  if (!/\d/.test(password)) {
    errors.push('숫자가 최소 1개 포함되어야 합니다.')
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('특수문자가 최소 1개 포함되어야 합니다.')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * 한국 이름 형식을 검증합니다.
 */
export function isValidKoreanName(name: string): boolean {
  const koreanNameRegex = /^[가-힣]{2,5}$/
  return koreanNameRegex.test(name)
}

/**
 * 전화번호 형식을 검증합니다.
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^01[0-9]-?[0-9]{4}-?[0-9]{4}$/
  return phoneRegex.test(phone.replace(/-/g, ''))
}

/**
 * 생년월일이 유효한지 검증합니다.
 */
export function isValidBirthDate(birthDate: string | Date): {
  isValid: boolean
  error?: string
} {
  const date = typeof birthDate === 'string' ? new Date(birthDate) : birthDate
  const today = new Date()
  const maxAge = new Date()
  maxAge.setFullYear(maxAge.getFullYear() - 10) // 최대 10세

  if (isNaN(date.getTime())) {
    return { isValid: false, error: '올바른 날짜 형식이 아닙니다.' }
  }

  if (date > today) {
    return { isValid: false, error: '미래 날짜는 입력할 수 없습니다.' }
  }

  if (date < maxAge) {
    return { isValid: false, error: '10세 이하의 아이만 등록 가능합니다.' }
  }

  return { isValid: true }
}

/**
 * 몸무게가 유효한 범위인지 검증합니다.
 */
export function isValidWeight(weight: number, ageInMonths: number): {
  isValid: boolean
  error?: string
} {
  if (weight <= 0) {
    return { isValid: false, error: '몸무게는 0보다 커야 합니다.' }
  }

  // 연령별 대략적인 몸무게 범위 (kg)
  let minWeight: number, maxWeight: number

  if (ageInMonths < 12) {
    minWeight = 2.5
    maxWeight = 15
  } else if (ageInMonths < 24) {
    minWeight = 7
    maxWeight = 20
  } else if (ageInMonths < 36) {
    minWeight = 9
    maxWeight = 25
  } else {
    minWeight = 10
    maxWeight = 30
  }

  if (weight < minWeight || weight > maxWeight) {
    return {
      isValid: false,
      error: `해당 연령의 일반적인 몸무게 범위(${minWeight}-${maxWeight}kg)를 벗어납니다.`
    }
  }

  return { isValid: true }
}

/**
 * 키가 유효한 범위인지 검증합니다.
 */
export function isValidHeight(height: number, ageInMonths: number): {
  isValid: boolean
  error?: string
} {
  if (height <= 0) {
    return { isValid: false, error: '키는 0보다 커야 합니다.' }
  }

  // 연령별 대략적인 키 범위 (cm)
  let minHeight: number, maxHeight: number

  if (ageInMonths < 12) {
    minHeight = 45
    maxHeight = 85
  } else if (ageInMonths < 24) {
    minHeight = 70
    maxHeight = 100
  } else if (ageInMonths < 36) {
    minHeight = 80
    maxHeight = 115
  } else {
    minHeight = 85
    maxHeight = 130
  }

  if (height < minHeight || height > maxHeight) {
    return {
      isValid: false,
      error: `해당 연령의 일반적인 키 범위(${minHeight}-${maxHeight}cm)를 벗어납니다.`
    }
  }

  return { isValid: true }
}

/**
 * 임신 주수가 유효한지 검증합니다.
 */
export function isValidGestationalWeeks(weeks: number): {
  isValid: boolean
  error?: string
} {
  if (weeks < 20 || weeks > 45) {
    return {
      isValid: false,
      error: '임신 주수는 20주에서 45주 사이여야 합니다.'
    }
  }

  return { isValid: true }
}

/**
 * 출생 시 몸무게가 유효한지 검증합니다.
 */
export function isValidBirthWeight(weight: number): {
  isValid: boolean
  error?: string
} {
  if (weight < 0.5 || weight > 6) {
    return {
      isValid: false,
      error: '출생 시 몸무게는 0.5kg에서 6kg 사이여야 합니다.'
    }
  }

  return { isValid: true }
}

/**
 * URL이 유효한지 검증합니다.
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * YouTube URL에서 비디오 ID를 추출합니다.
 */
export function extractYouTubeId(url: string): string | null {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
  const match = url.match(regex)
  return match ? match[1] : null
}

/**
 * 점수가 유효한 범위인지 검증합니다.
 */
export function isValidScore(score: number): {
  isValid: boolean
  error?: string
} {
  if (score < 0 || score > 100) {
    return {
      isValid: false,
      error: '점수는 0에서 100 사이여야 합니다.'
    }
  }

  return { isValid: true }
}

/**
 * 텍스트 길이를 검증합니다.
 */
export function isValidTextLength(
  text: string,
  minLength: number,
  maxLength: number
): {
  isValid: boolean
  error?: string
} {
  if (text.length < minLength) {
    return {
      isValid: false,
      error: `최소 ${minLength}자 이상 입력해주세요.`
    }
  }

  if (text.length > maxLength) {
    return {
      isValid: false,
      error: `최대 ${maxLength}자까지 입력 가능합니다.`
    }
  }

  return { isValid: true }
}

/**
 * 파일 크기를 검증합니다.
 */
export function isValidFileSize(file: File, maxSizeMB: number): {
  isValid: boolean
  error?: string
} {
  const maxSizeBytes = maxSizeMB * 1024 * 1024

  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `파일 크기는 ${maxSizeMB}MB 이하여야 합니다.`
    }
  }

  return { isValid: true }
}

/**
 * 이미지 파일 형식을 검증합니다.
 */
export function isValidImageFile(file: File): {
  isValid: boolean
  error?: string
} {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'JPG, PNG, GIF, WebP 형식의 이미지만 업로드 가능합니다.'
    }
  }

  return { isValid: true }
}

/**
 * 여러 유효성 검사 결과를 합칩니다.
 */
export function combineValidationResults(
  results: { isValid: boolean; error?: string }[]
): {
  isValid: boolean
  errors: string[]
} {
  const errors = results
    .filter(result => !result.isValid)
    .map(result => result.error!)
    .filter(Boolean)

  return {
    isValid: errors.length === 0,
    errors
  }
}