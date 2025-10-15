'use client'

import { useState, useEffect } from 'react'
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

export default function TherapistsSearchPage() {
  const searchParams = useSearchParams()
  const bookingType = searchParams.get('type') || 'therapy' // 'consultation' | 'therapy'
  const isConsultation = bookingType === 'consultation'

  const [therapists, setTherapists] = useState<Therapist[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // 필터 상태
  const [specialty, setSpecialty] = useState(isConsultation ? 'SPEECH_THERAPY' : '')
  const [serviceArea, setServiceArea] = useState('')
  const [maxFee, setMaxFee] = useState('')
  const [dayOfWeek, setDayOfWeek] = useState('')
  const [timeRange, setTimeRange] = useState('')

  const router = useRouter()

  const fetchTherapists = async () => {
    setIsLoading(true)
    setError('')

    try {
      const params = new URLSearchParams()
      if (specialty) params.append('specialty', specialty)
      if (serviceArea) params.append('serviceArea', serviceArea)
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

  const specialtyOptions = [
    { value: '', label: '전체' },
    { value: 'SPEECH_THERAPY', label: '언어치료' },
    { value: 'SENSORY_INTEGRATION', label: '감각통합' },
    { value: 'PLAY_THERAPY', label: '놀이치료' },
    { value: 'ART_THERAPY', label: '미술치료' },
    { value: 'MUSIC_THERAPY', label: '음악치료' },
  ]

  const areaOptions = [
    { value: '', label: '전체' },
    { value: 'GANGNAM', label: '강남구' },
    { value: 'SEOCHO', label: '서초구' },
    { value: 'SONGPA', label: '송파구' },
    { value: 'GANGDONG', label: '강동구' },
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
        </div>

        {/* 검색 필터 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                전문 분야 {isConsultation && <span className="text-xs text-gray-500">(언어치료 고정)</span>}
              </label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                disabled={isConsultation}
                className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                {specialtyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                서비스 지역
              </label>
              <select
                value={serviceArea}
                onChange={(e) => setServiceArea(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                {areaOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

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
