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
  education: string | null
  introduction: string | null
  approvedAt: string
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
  const [selectedServiceAreas, setSelectedServiceAreas] = useState<string[]>([])
  const [selectedAgeRanges, setSelectedAgeRanges] = useState<string[]>(() => {
    if (urlAgeRange) return [urlAgeRange]
    return []
  })
  const [maxFee, setMaxFee] = useState('')
  const [dayOfWeek, setDayOfWeek] = useState('')
  const [timeRange, setTimeRange] = useState('')

  const router = useRouter()

  const fetchTherapists = async () => {
    setIsLoading(true)
    setError('')

    try {
      const params = new URLSearchParams()
      if (selectedSpecialties.length > 0) params.append('specialty', selectedSpecialties.join(','))
      if (selectedServiceAreas.length > 0) params.append('serviceArea', selectedServiceAreas.join(','))
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

  useEffect(() => {
    fetchTherapists()
  }, [])

  // 체크박스 토글 핸들러
  const toggleSpecialty = (value: string) => {
    if (isConsultation) return // 언어 컨설팅에서는 변경 불가
    setSelectedSpecialties(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    )
  }

  const toggleServiceArea = (value: string) => {
    setSelectedServiceAreas(prev =>
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

  const areaOptions = [
    { value: 'GANGNAM', label: '강남구' },
    { value: 'SEOCHO', label: '서초구' },
    { value: 'SONGPA', label: '송파구' },
    { value: 'GANGDONG', label: '강동구' },
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isConsultation ? '방문 컨설팅 치료사 찾기' : '치료사 찾기'}
          </h1>
          {isConsultation && (
            <p className="text-gray-600">
              언어치료 전문가의 1회 방문 컨설팅을 예약하세요
            </p>
          )}
          {isAutoFilter && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800">
                ✅ 발달체크 결과를 바탕으로 추천 치료 분야가 자동으로 선택되었습니다.
              </p>
            </div>
          )}
        </div>

        {/* 검색 필터 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="space-y-6">
            {/* 전문 분야 (체크박스) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                전문 분야 {isConsultation && <span className="text-xs text-gray-500">(언어치료 고정)</span>}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {specialtyOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center space-x-2 p-2 border rounded-md cursor-pointer transition-colors ${
                      selectedSpecialties.includes(option.value)
                        ? 'bg-green-50 border-green-500'
                        : 'border-gray-300 hover:bg-gray-50'
                    } ${isConsultation ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedSpecialties.includes(option.value)}
                      onChange={() => toggleSpecialty(option.value)}
                      disabled={isConsultation}
                      className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 서비스 지역 (체크박스) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                서비스 지역
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {areaOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center space-x-2 p-2 border rounded-md cursor-pointer transition-colors ${
                      selectedServiceAreas.includes(option.value)
                        ? 'bg-green-50 border-green-500'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedServiceAreas.includes(option.value)}
                      onChange={() => toggleServiceArea(option.value)}
                      className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 아이 연령 (체크박스) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                아이 연령
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {ageRangeOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center space-x-2 p-2 border rounded-md cursor-pointer transition-colors ${
                      selectedAgeRanges.includes(option.value)
                        ? 'bg-green-50 border-green-500'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedAgeRanges.includes(option.value)}
                      onChange={() => toggleAgeRange(option.value)}
                      className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 기타 필터 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  요일
                </label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {dayOfWeekOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  시간대
                </label>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {timeRangeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  최대 상담료
                </label>
                <input
                  type="number"
                  value={maxFee}
                  onChange={(e) => setMaxFee(e.target.value)}
                  placeholder="예: 100000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={fetchTherapists}
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {isLoading ? '검색 중...' : '검색'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* 검색 결과 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {therapists.length === 0 && !isLoading ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">검색 결과가 없습니다.</p>
            </div>
          ) : (
            therapists.map((therapist) => (
              <div
                key={therapist.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {therapist.user.name}
                    </h3>
                    <p className="text-sm text-gray-500">{therapist.education}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex flex-wrap gap-2">
                    {therapist.specialties.map((spec, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>

                  <div className="text-sm text-gray-600">
                    📍 {therapist.serviceAreas.join(', ')}
                  </div>

                  {therapist.sessionFee && (
                    <div className="text-lg font-semibold text-gray-900">
                      ₩{therapist.sessionFee.toLocaleString()}
                      <span className="text-sm text-gray-500 font-normal"> / 50분</span>
                    </div>
                  )}
                </div>

                {therapist.introduction && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {therapist.introduction}
                  </p>
                )}

                <div className="flex gap-2">
                  <Link
                    href={`/parent/therapists/${therapist.id}`}
                    className="flex-1 text-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    상세보기
                  </Link>
                  <Link
                    href={`/parent/therapists/${therapist.id}/booking?type=${bookingType}`}
                    className="flex-1 text-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
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
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">로딩 중...</p>
          </div>
        </div>
      </div>
    }>
      <TherapistsSearchPageContent />
    </Suspense>
  )
}
