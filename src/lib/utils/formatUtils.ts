/**
 * 데이터 포맷팅 관련 유틸리티 함수들
 */

/**
 * 숫자를 천 단위 콤마로 포맷팅합니다.
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('ko-KR')
}

/**
 * 몸무게를 포맷팅합니다.
 */
export function formatWeight(weight: number): string {
  return `${weight.toFixed(1)}kg`
}

/**
 * 키를 포맷팅합니다.
 */
export function formatHeight(height: number): string {
  return `${height.toFixed(1)}cm`
}

/**
 * 점수를 포맷팅합니다.
 */
export function formatScore(score: number): string {
  return `${Math.round(score)}점`
}

/**
 * 백분위를 포맷팅합니다.
 */
export function formatPercentile(percentile: number): string {
  return `${percentile}%`
}

/**
 * 동영상 재생 시간을 포맷팅합니다.
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (minutes === 0) {
    return `${remainingSeconds}초`
  }

  if (remainingSeconds === 0) {
    return `${minutes}분`
  }

  return `${minutes}분 ${remainingSeconds}초`
}

/**
 * 조회수를 포맷팅합니다.
 */
export function formatViewCount(count: number): string {
  if (count < 1000) {
    return count.toString()
  }

  if (count < 10000) {
    return `${(count / 1000).toFixed(1)}천`
  }

  if (count < 100000) {
    return `${Math.round(count / 1000)}천`
  }

  if (count < 1000000) {
    return `${(count / 10000).toFixed(1)}만`
  }

  return `${Math.round(count / 10000)}만`
}

/**
 * 파일 크기를 포맷팅합니다.
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 텍스트를 지정된 길이로 자르고 말줄임표를 추가합니다.
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text
  }

  return text.slice(0, maxLength) + '...'
}

/**
 * HTML 태그를 제거합니다.
 */
export function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}

/**
 * 줄바꿈을 BR 태그로 변환합니다.
 */
export function convertNewlinesToBr(text: string): string {
  return text.replace(/\n/g, '<br>')
}

/**
 * 전화번호를 포맷팅합니다.
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')

  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
  }

  return phone
}

/**
 * 성별을 한글로 포맷팅합니다.
 */
export function formatGender(gender: 'MALE' | 'FEMALE'): string {
  return gender === 'MALE' ? '남아' : '여아'
}

/**
 * 사용자 역할을 한글로 포맷팅합니다.
 */
export function formatUserRole(role: 'PARENT' | 'THERAPIST' | 'ADMIN'): string {
  const roleMap = {
    PARENT: '부모',
    THERAPIST: '치료사',
    ADMIN: '관리자'
  }

  return roleMap[role]
}

/**
 * 뉴스 카테고리를 한글로 포맷팅합니다.
 */
export function formatNewsCategory(
  category: 'PARENTING_INFO' | 'DEVELOPMENT_GUIDE' | 'ANNOUNCEMENT' | 'RESEARCH' | 'EVENT'
): string {
  const categoryMap = {
    PARENTING_INFO: '육아정보',
    DEVELOPMENT_GUIDE: '발달가이드',
    ANNOUNCEMENT: '공지사항',
    RESEARCH: '연구소식',
    EVENT: '이벤트'
  }

  return categoryMap[category]
}

/**
 * 비디오 플랫폼을 한글로 포맷팅합니다.
 */
export function formatVideoPlatform(
  platform: 'YOUTUBE' | 'NAVER_TV' | 'KAKAO_TV' | 'VIMEO' | 'OTHER'
): string {
  const platformMap = {
    YOUTUBE: '유튜브',
    NAVER_TV: '네이버TV',
    KAKAO_TV: '카카오TV',
    VIMEO: '비메오',
    OTHER: '기타'
  }

  return platformMap[platform]
}

/**
 * 난이도를 한글로 포맷팅합니다.
 */
export function formatDifficulty(difficulty: 'EASY' | 'MEDIUM' | 'HARD'): string {
  const difficultyMap = {
    EASY: '쉬움',
    MEDIUM: '보통',
    HARD: '어려움'
  }

  return difficultyMap[difficulty]
}

/**
 * 발달 영역을 한글로 포맷팅합니다.
 */
export function formatDevelopmentCategory(
  category: 'GROSS_MOTOR' | 'FINE_MOTOR' | 'COGNITIVE' | 'LANGUAGE' | 'SOCIAL' | 'EMOTIONAL'
): string {
  const categoryMap = {
    GROSS_MOTOR: '대근육',
    FINE_MOTOR: '소근육',
    COGNITIVE: '인지',
    LANGUAGE: '언어',
    SOCIAL: '사회성',
    EMOTIONAL: '정서'
  }

  return categoryMap[category]
}

/**
 * 발달 수준을 한글로 포맷팅합니다.
 */
export function formatDevelopmentLevel(
  level: 'EXCELLENT' | 'GOOD' | 'CAUTION' | 'NEEDS_OBSERVATION'
): string {
  const levelMap = {
    EXCELLENT: '우수',
    GOOD: '양호',
    CAUTION: '주의',
    NEEDS_OBSERVATION: '관찰 필요'
  }

  return levelMap[level]
}

/**
 * 평가 상태를 한글로 포맷팅합니다.
 */
export function formatAssessmentStatus(status: 'IN_PROGRESS' | 'COMPLETED'): string {
  return status === 'IN_PROGRESS' ? '진행 중' : '완료'
}

/**
 * 태그 배열을 문자열로 포맷팅합니다.
 */
export function formatTags(tags: string[]): string {
  return tags.map(tag => `#${tag}`).join(' ')
}

/**
 * 우선순위를 별점으로 포맷팅합니다.
 */
export function formatPriority(priority: number): string {
  const stars = '★'.repeat(priority) + '☆'.repeat(10 - priority)
  return stars
}

/**
 * 임신 주수에 따른 분류를 포맷팅합니다.
 */
export function formatPrematureStatus(gestationalWeeks?: number): string {
  if (!gestationalWeeks) return '정보 없음'
  if (gestationalWeeks >= 37) return '만삭'
  if (gestationalWeeks >= 34) return '후기 조산'
  if (gestationalWeeks >= 32) return '중기 조산'
  if (gestationalWeeks >= 28) return '초기 조산'
  return '극초기 조산'
}

/**
 * 성장 백분위를 색상과 함께 포맷팅합니다.
 */
export function formatGrowthPercentile(percentile: number): {
  text: string
  color: string
  description: string
} {
  if (percentile >= 90) {
    return {
      text: `${percentile}%`,
      color: 'green',
      description: '평균보다 큼'
    }
  } else if (percentile >= 75) {
    return {
      text: `${percentile}%`,
      color: 'blue',
      description: '평균 상위'
    }
  } else if (percentile >= 25) {
    return {
      text: `${percentile}%`,
      color: 'gray',
      description: '평균 범위'
    }
  } else if (percentile >= 10) {
    return {
      text: `${percentile}%`,
      color: 'orange',
      description: '평균 하위'
    }
  } else {
    return {
      text: `${percentile}%`,
      color: 'red',
      description: '평균보다 작음'
    }
  }
}