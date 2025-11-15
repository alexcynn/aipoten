'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'

interface Therapist {
  id: string
  user: {
    id: string
    name: string
    email: string
  }
  gender: string | null
  specialties: string[]
  childAgeRanges: string[]
  serviceAreas: string[]
  sessionFee: number | null
  consultationFee: number | null
  consultationSettlementAmount: number | null
  canDoConsultation: boolean | null
  education: string | null
  introduction: string | null
  approvedAt: string
}

interface Child {
  id: string
  name: string
  birthDate: string
  ageInMonths: number
}

function TherapistsSearchPageContent() {
  const searchParams = useSearchParams()
  const bookingType = searchParams.get('type') || 'therapy' // 'consultation' | 'therapy'
  const isConsultation = bookingType === 'consultation'

  // URL 파라미터에서 자동 필터 읽기
  const urlSpecialties = searchParams.get('specialties')
  const urlAgeRange = searchParams.get('ageRange')
  const isAutoFilter = searchParams.get('autoFilter') === 'true'

  const [therapists, setTherapists] = useState<Therapist[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // 필터 상태 (다중 선택 지원)
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(() => {
    if (isConsultation) return ['SPEECH_THERAPY']
    if (urlSpecialties) return urlSpecialties.split(',').filter(Boolean)
    return []
  })
  const [selectedAgeRanges, setSelectedAgeRanges] = useState<string[]>(() => {
    if (urlAgeRange) return [urlAgeRange]
    return []
  })
  const [maxFee, setMaxFee] = useState('')
  const [dayOfWeek, setDayOfWeek] = useState('')
  const [timeRange, setTimeRange] = useState('')
  const [parentAddress, setParentAddress] = useState<string>('')
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChildId, setSelectedChildId] = useState<string>('')

  const router = useRouter()

  // 연령(개월) -> 연령 범위로 변환하는 헬퍼 함수
  const getAgeRangeFromMonths = (ageInMonths: number): string => {
    if (ageInMonths <= 12) return 'AGE_0_12'
    if (ageInMonths <= 24) return 'AGE_13_24'
    if (ageInMonths <= 36) return 'AGE_25_36'
    if (ageInMonths <= 48) return 'AGE_37_48'
    if (ageInMonths <= 60) return 'AGE_49_60'
    return 'AGE_5_7'
  }

  // 전문분야 영문 -> 한글 변환 함수
  const getSpecialtyLabel = (specialty: string): string => {
    const specialtyMap: { [key: string]: string } = {
      'SPEECH_THERAPY': '언어치료',
      'SENSORY_INTEGRATION': '감각통합',
      'PLAY_THERAPY': '놀이치료',
      'ART_THERAPY': '미술치료',
      'MUSIC_THERAPY': '음악치료',
      'OCCUPATIONAL_THERAPY': '작업치료',
      'COGNITIVE_THERAPY': '인지치료',
      'BEHAVIORAL_THERAPY': '행동치료',
    }
    return specialtyMap[specialty] || specialty
  }

  // 연령 범위 영문 -> 한글 변환 함수
  const getAgeRangeLabel = (ageRange: string): string => {
    const ageRangeMap: { [key: string]: string } = {
      'AGE_0_12': '0-12개월',
      'AGE_13_24': '13-24개월',
      'AGE_25_36': '2-3세',
      'AGE_37_48': '3-4세',
      'AGE_49_60': '4-5세',
      'AGE_5_7': '5-7세',
    }
    return ageRangeMap[ageRange] || ageRange
  }

  // 부모 주소 가져오기
  useEffect(() => {
    const fetchParentAddress = async () => {
      try {
        const response = await fetch('/api/parent/profile')
        if (response.ok) {
          const data = await response.json()
          if (data.address) {
            setParentAddress(data.address)
          }
        }
      } catch (error) {
        console.error('주소 조회 실패:', error)
      }
    }
    fetchParentAddress()
  }, [])

  // 자녀 데이터 가져오기
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const response = await fetch('/api/children')
        if (response.ok) {
          const data = await response.json()
          console.log('자녀 데이터:', data)
          // API는 { children: [...] } 형태로 반환
          setChildren(data.children || [])
          // 첫 번째 자녀를 자동 선택
          if (data.children && data.children.length > 0) {
            setSelectedChildId(data.children[0].id)
          }
        }
      } catch (error) {
        console.error('자녀 정보 조회 실패:', error)
      }
    }
    fetchChildren()
  }, [])

  const fetchTherapists = async () => {
    setIsLoading(true)
    setError('')

    try {
      const params = new URLSearchParams()
      if (isConsultation) params.append('type', 'consultation')
      if (selectedSpecialties.length > 0) params.append('specialty', selectedSpecialties.join(','))
      if (parentAddress) params.append('parentAddress', parentAddress)
      if (selectedAgeRanges.length > 0) params.append('childAgeRange', selectedAgeRanges.join(','))
      if (maxFee) params.append('maxFee', maxFee)
      if (dayOfWeek) params.append('dayOfWeek', dayOfWeek)
      if (timeRange) params.append('timeRange', timeRange)

      const response = await fetch(`/api/therapists/search?${params}`)
      const data = await response.json()

      if (response.ok) {
        setTherapists(data.therapists)
      } else {
        setError(data.error || '검색에 실패했습니다.')
      }
    } catch (err) {
      setError('서버 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 선택된 자녀 연령 자동 설정 (언어컨설팅 및 홈티 모두)
  useEffect(() => {
    if (selectedChildId && children.length > 0) {
      const selectedChild = children.find(child => child.id === selectedChildId)
      if (selectedChild) {
        const ageRange = getAgeRangeFromMonths(selectedChild.ageInMonths)
        setSelectedAgeRanges([ageRange])
      }
    }
  }, [selectedChildId, children])

  useEffect(() => {
    // 주소가 로드되면 검색 실행
    if (parentAddress) {
      fetchTherapists()
    }
  }, [parentAddress])

  // 체크박스 토글 핸들러
  const toggleSpecialty = (value: string) => {
    if (isConsultation) return // 언어 컨설팅에서는 변경 불가
    setSelectedSpecialties(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    )
  }

  const toggleAgeRange = (value: string) => {
    setSelectedAgeRanges(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    )
  }

  const specialtyOptions = [
    { value: 'SPEECH_THERAPY', label: '언어치료' },
    { value: 'SENSORY_INTEGRATION', label: '감각통합' },
    { value: 'PLAY_THERAPY', label: '놀이치료' },
    { value: 'ART_THERAPY', label: '미술치료' },
    { value: 'MUSIC_THERAPY', label: '음악치료' },
    { value: 'OCCUPATIONAL_THERAPY', label: '작업치료' },
    { value: 'COGNITIVE_THERAPY', label: '인지치료' },
    { value: 'BEHAVIORAL_THERAPY', label: '행동치료' },
  ]

  const ageRangeOptions = [
    { value: 'AGE_0_12', label: '0-12개월' },
    { value: 'AGE_13_24', label: '13-24개월' },
    { value: 'AGE_25_36', label: '2-3세' },
    { value: 'AGE_37_48', label: '3-4세' },
    { value: 'AGE_49_60', label: '4-5세' },
    { value: 'AGE_5_7', label: '5-7세' },
  ]

  const dayOfWeekOptions = [
    { value: '', label: '전체' },
    { value: '0', label: '일요일' },
    { value: '1', label: '월요일' },
    { value: '2', label: '화요일' },
    { value: '3', label: '수요일' },
    { value: '4', label: '목요일' },
    { value: '5', label: '금요일' },
    { value: '6', label: '토요일' },
  ]

  const timeRangeOptions = [
    { value: '', label: '전체' },
    { value: 'MORNING', label: '오전 (06:00-12:00)' },
    { value: 'AFTERNOON', label: '오후 (12:00-18:00)' },
    { value: 'EVENING', label: '저녁 (18:00-22:00)' },
  ]

  return (
    <div className="min-h-screen bg-[#F5EFE7] font-pretendard">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-stone-900 mb-2 md:mb-3">
            {isConsultation ? '방문 컨설팅 치료사 찾기' : '치료사 찾기'}
          </h1>
          {isConsultation && (
            <p className="text-sm md:text-base text-stone-700">
              언어치료 전문가의 1회 방문 컨설팅을 예약하세요
            </p>
          )}
          {isAutoFilter && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800">
                ✅ 발달체크 결과를 바탕으로 추천 치료 분야가 자동으로 선택되었습니다.
              </p>
            </div>
          )}
        </div>

        {/* 검색 필터 */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-6 md:p-8 mb-6">
          <div className="space-y-6">
            {/* 전문 분야 (체크박스) */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-3">
                전문 분야 {isConsultation && <span className="text-xs text-stone-500">(언어치료 고정)</span>}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {specialtyOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center space-x-2 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedSpecialties.includes(option.value)
                        ? isConsultation
                          ? 'bg-[#FFE5E5] border-[#FF9999]'
                          : 'bg-blue-50 border-blue-500'
                        : 'border-gray-300 hover:bg-gray-50'
                    } ${isConsultation ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedSpecialties.includes(option.value)}
                      onChange={() => toggleSpecialty(option.value)}
                      disabled={isConsultation}
                      className={`h-4 w-4 border-gray-300 rounded ${
                        isConsultation ? 'text-[#FF6A00] focus:ring-[#FF6A00]' : 'text-blue-600 focus:ring-blue-500'
                      }`}
                    />
                    <span className="text-sm text-stone-700 font-medium">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 서비스 지역은 자동으로 부모 주소를 기반으로 매칭됩니다 */}
            {parentAddress && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">📍 현재 설정된 주소:</span> {parentAddress}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  이 주소를 기반으로 서비스 가능한 치료사를 검색합니다.
                </p>
              </div>
            )}

            {/* 자녀 선택 (공통) */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-3">
                자녀 선택
              </label>
              {children.length > 0 ? (
                <div className="space-y-3">
                  <select
                    value={selectedChildId}
                    onChange={(e) => setSelectedChildId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6A00] focus:border-transparent font-medium"
                  >
                    <option value="">자녀를 선택해주세요</option>
                    {children.map((child) => (
                      <option key={child.id} value={child.id}>
                        {child.name} ({ageRangeOptions.find(opt => opt.value === getAgeRangeFromMonths(child.ageInMonths))?.label || `${child.ageInMonths}개월`})
                      </option>
                    ))}
                  </select>

                  {selectedChildId && (
                    <div className={`${isConsultation ? 'bg-[#FFE5E5] border-[#FF9999]' : 'bg-blue-50 border-blue-200'} border rounded-xl p-4`}>
                      <p className="text-sm text-stone-800">
                        <span className="font-semibold">👶 선택된 자녀:</span> {children.find(c => c.id === selectedChildId)?.name} ({ageRangeOptions.find(opt => opt.value === getAgeRangeFromMonths(children.find(c => c.id === selectedChildId)?.ageInMonths || 0))?.label})
                      </p>
                      <p className="text-xs text-stone-600 mt-1">
                        자녀의 연령이 자동으로 설정되어 검색됩니다.
                      </p>
                    </div>
                  )}

                  {!selectedChildId && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <p className="text-sm text-blue-800">
                        <span className="font-semibold">ℹ️ 자녀를 선택해주세요.</span>
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        선택한 자녀의 연령에 맞는 치료사를 검색합니다.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <p className="text-sm text-yellow-800">
                    <span className="font-semibold">⚠️ 등록된 자녀가 없습니다.</span>
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    마이페이지에서 자녀 정보를 등록해주세요.
                  </p>
                </div>
              )}
            </div>

            {/* 기타 필터 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">
                  요일
                </label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6A00] focus:border-transparent"
                >
                  {dayOfWeekOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">
                  시간대
                </label>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6A00] focus:border-transparent"
                >
                  {timeRangeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">
                  최대 상담료
                </label>
                <input
                  type="number"
                  value={maxFee}
                  onChange={(e) => setMaxFee(e.target.value)}
                  placeholder="예: 100000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6A00] focus:border-transparent"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={fetchTherapists}
                  disabled={isLoading}
                  className="w-full px-6 py-3 bg-[#FF6A00] text-white rounded-[10px] font-semibold hover:bg-[#E55F00] disabled:opacity-50 transition-colors shadow-lg"
                >
                  {isLoading ? '검색 중...' : '검색'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 md:p-6 mb-6 shadow-md">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* 검색 결과 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {therapists.length === 0 && !isLoading ? (
            <div className="col-span-full text-center py-16">
              <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-8 md:p-12">
                <p className="text-stone-500 text-base md:text-lg font-medium">검색 결과가 없습니다.</p>
                <p className="text-stone-400 text-sm mt-2">다른 조건으로 검색해보세요.</p>
              </div>
            </div>
          ) : (
            therapists.map((therapist) => (
              <div
                key={therapist.id}
                className="bg-white rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 md:p-8 border border-stone-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-stone-900">
                      {therapist.user.name}
                    </h3>
                    <p className="text-sm text-stone-500 font-medium mt-1">{therapist.education}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex flex-wrap gap-2">
                    {therapist.specialties.map((spec, idx) => (
                      <span
                        key={idx}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-full ${
                          isConsultation
                            ? 'bg-[#FFE5E5] text-[#FF6A00]'
                            : 'bg-[#FF6A00]/10 text-[#FF6A00]'
                        }`}
                      >
                        {getSpecialtyLabel(spec)}
                      </span>
                    ))}
                  </div>

                  <div className="text-sm text-stone-600 font-medium">
                    📍 {therapist.serviceAreas.join(', ')}
                  </div>

                  {((isConsultation && therapist.consultationFee) || (!isConsultation && therapist.sessionFee)) && (
                    <div className="text-lg md:text-xl font-bold text-[#FF6A00]">
                      ₩{(isConsultation ? therapist.consultationFee : therapist.sessionFee)?.toLocaleString()}
                      <span className="text-sm text-stone-500 font-normal"> / 50분</span>
                    </div>
                  )}
                </div>

                {therapist.introduction && (
                  <p className="text-sm text-stone-600 mb-4 line-clamp-2 leading-relaxed">
                    {therapist.introduction}
                  </p>
                )}

                <div className="flex gap-2 md:gap-3">
                  <Link
                    href={`/parent/therapists/${therapist.id}`}
                    className="flex-1 text-center px-4 py-2.5 bg-stone-100 text-stone-700 rounded-[10px] hover:bg-stone-200 transition-colors font-semibold border border-stone-200"
                  >
                    상세보기
                  </Link>
                  <Link
                    href={`/parent/therapists/${therapist.id}/booking?type=${bookingType}`}
                    className="flex-1 text-center px-4 py-2.5 bg-[#FF6A00] text-white rounded-[10px] hover:bg-[#E55F00] transition-colors font-semibold shadow-md"
                  >
                    예약하기
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default function TherapistsSearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F5EFE7] font-pretendard">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-b-4 border-[#FF6A00] mx-auto"></div>
            <p className="mt-4 text-stone-600 font-medium text-base md:text-lg">로딩 중...</p>
          </div>
        </div>
      </div>
    }>
      <TherapistsSearchPageContent />
    </Suspense>
  )
}
