/**
 * 주소 유틸리티 함수
 * 부모 주소와 치료사 서비스 지역 매칭을 위한 함수들
 */

/**
 * 전체 주소에서 "시/도 + 시/군/구" 형식을 추출합니다.
 *
 * @param fullAddress 전체 주소 (예: "서울특별시 강남구 역삼동 123-45")
 * @returns "서울특별시 강남구" 형식의 주소, 추출 실패 시 null
 *
 * @example
 * extractCityDistrict("서울특별시 강남구 역삼동 123-45") // "서울특별시 강남구"
 * extractCityDistrict("서울 강남구 역삼동 123-45") // "서울특별시 강남구"
 * extractCityDistrict("경기도 성남시 분당구 정자동") // "경기도 성남시 분당구"
 * extractCityDistrict("인천광역시 남동구 구월동") // "인천광역시 남동구"
 */
export function extractCityDistrict(fullAddress: string): string | null {
  if (!fullAddress || typeof fullAddress !== 'string') {
    return null
  }

  // 주소 정규화 (공백 정리)
  const normalized = fullAddress.trim().replace(/\s+/g, ' ')

  // 패턴 1: 서울특별시 + 구
  // 예: "서울특별시 강남구", "서울 강남구", "서울시 강남구"
  const seoulMatch = normalized.match(/(서울특별시|서울시|서울)\s+([가-힣]+구)/)
  if (seoulMatch) {
    return `서울특별시 ${seoulMatch[2]}`
  }

  // 패턴 2: 광역시 + 구
  // 예: "부산광역시 해운대구", "인천광역시 남동구"
  const metropolitanMatch = normalized.match(/(부산|대구|인천|광주|대전|울산)(?:광역시)?\s+([가-힣]+구)/)
  if (metropolitanMatch) {
    return `${metropolitanMatch[1]}광역시 ${metropolitanMatch[2]}`
  }

  // 패턴 3: 경기도 + 시 + 구 (선택)
  // 예: "경기도 성남시 분당구", "경기도 수원시"
  const gyeonggiMatch = normalized.match(/경기도?\s+([가-힣]+시)(?:\s+([가-힣]+구))?/)
  if (gyeonggiMatch) {
    if (gyeonggiMatch[2]) {
      // 구까지 있는 경우
      return `경기도 ${gyeonggiMatch[1]} ${gyeonggiMatch[2]}`
    } else {
      // 시까지만 있는 경우
      return `경기도 ${gyeonggiMatch[1]}`
    }
  }

  // 패턴 4: 기타 도 + 시/군
  // 예: "강원도 춘천시", "충청남도 천안시", "전라북도 전주시"
  const provinceMatch = normalized.match(/(강원|충청남|충청북|전라남|전라북|경상남|경상북|제주)(?:도|특별자치도)?\s+([가-힣]+[시군])/)
  if (provinceMatch) {
    const provinceName = provinceMatch[1] === '제주' ? '제주특별자치도' : `${provinceMatch[1]}도`
    return `${provinceName} ${provinceMatch[2]}`
  }

  // 패턴 5: 세종특별자치시
  if (normalized.includes('세종')) {
    return '세종특별자치시'
  }

  return null
}

/**
 * 부모의 전체 주소가 치료사의 서비스 지역과 매칭되는지 확인합니다.
 *
 * @param parentAddress 부모의 전체 주소 (예: "서울특별시 강남구 역삼동 123-45")
 * @param therapistServiceAreas 치료사의 서비스 지역 배열 (예: ["서울특별시 강남구", "서울특별시 서초구"])
 * @returns 매칭 여부 (true/false)
 *
 * @example
 * matchesServiceArea("서울특별시 강남구 역삼동 123-45", ["서울특별시 강남구"]) // true
 * matchesServiceArea("서울 강남구 역삼동 123-45", ["서울특별시 강남구"]) // true
 * matchesServiceArea("서울특별시 송파구 잠실동", ["서울특별시 강남구"]) // false
 */
export function matchesServiceArea(
  parentAddress: string,
  therapistServiceAreas: string[]
): boolean {
  if (!parentAddress || !therapistServiceAreas || therapistServiceAreas.length === 0) {
    return false
  }

  // 부모 주소에서 "시/도 + 시/군/구" 추출
  const parentCityDistrict = extractCityDistrict(parentAddress)

  if (!parentCityDistrict) {
    return false
  }

  // 치료사 서비스 지역과 비교
  return therapistServiceAreas.some(serviceArea => {
    // 정확히 일치하는 경우
    if (serviceArea === parentCityDistrict) {
      return true
    }

    // 경기도의 경우 "경기도 성남시"와 "경기도 성남시 분당구" 매칭 허용
    // 부모: "경기도 성남시 분당구 정자동" → "경기도 성남시 분당구"
    // 치료사: "경기도 성남시" → 매칭 성공
    if (serviceArea.startsWith('경기도') && parentCityDistrict.startsWith('경기도')) {
      const serviceCityPart = serviceArea.split(' ').slice(0, 2).join(' ') // "경기도 성남시"
      const parentCityPart = parentCityDistrict.split(' ').slice(0, 2).join(' ') // "경기도 성남시"
      return serviceCityPart === parentCityPart
    }

    return false
  })
}

/**
 * Daum 주소 API 응답을 표준 형식으로 변환합니다.
 *
 * @param daumAddress Daum Postcode API의 주소 데이터
 * @returns "서울특별시 강남구" 형식의 주소
 *
 * @example
 * formatDaumAddress({ sido: "서울", sigungu: "강남구" }) // "서울특별시 강남구"
 * formatDaumAddress({ sido: "경기", sigungu: "성남시 분당구" }) // "경기도 성남시 분당구"
 */
export function formatDaumAddress(daumAddress: {
  sido: string
  sigungu: string
}): string {
  const { sido, sigungu } = daumAddress

  // 서울 처리
  if (sido === '서울' || sido === '서울시' || sido === '서울특별시') {
    return `서울특별시 ${sigungu}`
  }

  // 광역시 처리
  const metropolitanCities = ['부산', '대구', '인천', '광주', '대전', '울산']
  for (const city of metropolitanCities) {
    if (sido.includes(city)) {
      return `${city}광역시 ${sigungu}`
    }
  }

  // 경기도 처리
  if (sido === '경기' || sido === '경기도') {
    return `경기도 ${sigungu}`
  }

  // 세종특별자치시
  if (sido.includes('세종')) {
    return '세종특별자치시'
  }

  // 제주특별자치도
  if (sido.includes('제주')) {
    return `제주특별자치도 ${sigungu}`
  }

  // 기타 도
  const provinces = ['강원', '충청북', '충청남', '전라북', '전라남', '경상북', '경상남']
  for (const province of provinces) {
    if (sido.includes(province)) {
      return `${province}도 ${sigungu}`
    }
  }

  // 매칭 실패 시 그대로 반환
  return `${sido} ${sigungu}`
}

/**
 * 서비스 지역 배열이 유효한지 검증합니다.
 *
 * @param serviceAreas 서비스 지역 배열
 * @returns 유효성 검증 결과 { valid: boolean, errors: string[] }
 */
export function validateServiceAreas(serviceAreas: string[]): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!Array.isArray(serviceAreas)) {
    errors.push('서비스 지역은 배열이어야 합니다.')
    return { valid: false, errors }
  }

  if (serviceAreas.length === 0) {
    errors.push('최소 1개 이상의 서비스 지역을 선택해주세요.')
    return { valid: false, errors }
  }

  // 각 지역이 올바른 형식인지 검증
  const validPrefixes = [
    '서울특별시',
    '부산광역시',
    '대구광역시',
    '인천광역시',
    '광주광역시',
    '대전광역시',
    '울산광역시',
    '세종특별자치시',
    '경기도',
    '강원도',
    '충청북도',
    '충청남도',
    '전라북도',
    '전라남도',
    '경상북도',
    '경상남도',
    '제주특별자치도'
  ]

  serviceAreas.forEach((area, index) => {
    if (!area || typeof area !== 'string' || area.trim().length === 0) {
      errors.push(`${index + 1}번째 서비스 지역이 비어있습니다.`)
      return
    }

    const hasValidPrefix = validPrefixes.some(prefix => area.startsWith(prefix))
    if (!hasValidPrefix) {
      errors.push(`"${area}"는 올바른 형식이 아닙니다. (예: 서울특별시 강남구)`)
    }
  })

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 주소 문자열을 정규화합니다 (공백 정리, 구버전 호환)
 *
 * @param address 원본 주소
 * @returns 정규화된 주소
 */
export function normalizeAddress(address: string): string {
  if (!address || typeof address !== 'string') {
    return ''
  }

  return address
    .trim()
    .replace(/\s+/g, ' ') // 연속된 공백을 하나로
    .replace(/서울시/g, '서울특별시') // 구버전 호환
    .replace(/부산시/g, '부산광역시')
    .replace(/대구시/g, '대구광역시')
    .replace(/인천시/g, '인천광역시')
    .replace(/광주시/g, '광주광역시')
    .replace(/대전시/g, '대전광역시')
    .replace(/울산시/g, '울산광역시')
}
