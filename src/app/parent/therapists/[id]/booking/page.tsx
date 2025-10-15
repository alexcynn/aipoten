'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Calendar from '@/components/booking/Calendar'

interface TimeSlot {
  id: string
  date: string
  startTime: string
  endTime: string
  isAvailable: boolean
}

interface Child {
  id: string
  name: string
  birthDate: string
  gender: string
}

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const therapistId = params?.id as string

  // URL에서 type 파라미터 읽기 ('consultation' | 'therapy')
  const bookingType = searchParams.get('type') || 'therapy'
  const isConsultation = bookingType === 'consultation'

  const [step, setStep] = useState(1)
  const [children, setChildren] = useState<Child[]>([])
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [groupedSlots, setGroupedSlots] = useState<Record<string, TimeSlot[]>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // 폼 데이터 - type에 따라 자동 설정
  const [selectedTimeSlotIds, setSelectedTimeSlotIds] = useState<string[]>([])
  const [selectedChildId, setSelectedChildId] = useState('')
  const sessionType: 'CONSULTATION' | 'THERAPY' = isConsultation ? 'CONSULTATION' : 'THERAPY'
  const [sessionCount, setSessionCount] = useState(1)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [visitAddress, setVisitAddress] = useState('')
  const [visitAddressDetail, setVisitAddressDetail] = useState('')
  const [parentNote, setParentNote] = useState('')
  const [userInfo, setUserInfo] = useState<any>(null)

  // 사용자 정보 가져오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/users/me')
        if (response.ok) {
          const data = await response.json()
          setUserInfo(data)
          if (data.address) {
            setVisitAddress(data.address)
          }
          if (data.addressDetail) {
            setVisitAddressDetail(data.addressDetail)
          }
        }
      } catch (err) {
        console.error('사용자 정보 조회 실패:', err)
      }
    }
    fetchUserInfo()
  }, [])

  // 자녀 목록 가져오기
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const response = await fetch('/api/children')
        if (response.ok) {
          const data = await response.json()
          const childrenArray = Array.isArray(data) ? data : (data.children || [])
          setChildren(childrenArray)
          if (childrenArray.length > 0) {
            setSelectedChildId(childrenArray[0].id)
          }
        }
      } catch (err) {
        console.error('자녀 목록 조회 실패:', err)
      }
    }
    fetchChildren()
  }, [])

  // 가용 슬롯 가져오기
  useEffect(() => {
    const fetchSlots = async () => {
      setIsLoading(true)
      try {
        const today = new Date()
        const endDate = new Date()
        endDate.setMonth(endDate.getMonth() + 1)

        const startStr = today.toISOString().split('T')[0]
        const endStr = endDate.toISOString().split('T')[0]

        const response = await fetch(
          `/api/therapists/${therapistId}/available-slots?startDate=${startStr}&endDate=${endStr}`
        )

        if (response.ok) {
          const data = await response.json()
          setAvailableSlots(data.slots || [])
          setGroupedSlots(data.groupedByDate || {})
        }
      } catch (err) {
        console.error('슬롯 조회 실패:', err)
      } finally {
        setIsLoading(false)
      }
    }
    if (therapistId) {
      fetchSlots()
    }
  }, [therapistId])

  // 슬롯 선택/해제 처리
  const handleSlotToggle = (slotId: string) => {
    if (isConsultation) {
      // 컨설팅은 1개만 선택
      setSelectedTimeSlotIds([slotId])
    } else {
      // 치료는 제한 없이 선택 가능
      if (selectedTimeSlotIds.includes(slotId)) {
        setSelectedTimeSlotIds(selectedTimeSlotIds.filter(id => id !== slotId))
      } else {
        setSelectedTimeSlotIds([...selectedTimeSlotIds, slotId])
      }
    }
    setError('') // 에러 메시지 초기화
  }

  // 선택한 슬롯 제거
  const handleRemoveSlot = (slotId: string) => {
    setSelectedTimeSlotIds(selectedTimeSlotIds.filter(id => id !== slotId))
  }

  // 요금 계산
  const calculateFee = () => {
    const baseFee = 80000 // 기본 세션 비용
    let discountRate = 0

    // 실제 선택한 슬롯 개수 사용
    const count = isConsultation ? 1 : selectedTimeSlotIds.length

    if (count >= 12) discountRate = 20
    else if (count >= 8) discountRate = 15
    else if (count >= 4) discountRate = 10

    const originalFee = baseFee * count
    const finalFee = Math.round(originalFee * (1 - discountRate / 100))

    return { originalFee, discountRate, finalFee, count }
  }

  // 예약 생성
  const handleSubmit = async () => {
    if (selectedTimeSlotIds.length === 0 || !selectedChildId) {
      setError('필수 정보를 모두 입력해주세요.')
      return
    }

    if (!visitAddress) {
      setError('방문 주소를 입력해주세요.')
      return
    }

    setIsLoading(true)
    setError('')

    // 실제 선택한 슬롯 개수를 sessionCount로 사용
    const actualSessionCount = selectedTimeSlotIds.length

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeSlotIds: selectedTimeSlotIds,
          childId: selectedChildId,
          sessionType,
          sessionCount: actualSessionCount,
          visitAddress,
          visitAddressDetail: visitAddressDetail || undefined,
          parentNote: parentNote || undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // 첫 번째 예약 ID로 이동
        const firstBookingId = data.bookings?.[0]?.id || data.booking?.id
        router.push(`/parent/bookings/${firstBookingId}`)
      } else {
        setError(data.error || '예약 생성에 실패했습니다.')
      }
    } catch (err) {
      setError('서버 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const { originalFee, discountRate, finalFee, count: calculatedCount } = calculateFee()

  // 예약 가능한 날짜 목록
  const availableDates = Object.keys(groupedSlots)

  // 날짜 선택 핸들러
  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    // 방문 컨설팅인 경우에만 슬롯 초기화 (1개만 선택 가능)
    // 정기 치료는 여러 날짜의 슬롯을 계속 추가할 수 있으므로 유지
    if (isConsultation) {
      setSelectedTimeSlotIds([])
    }
    setError('')
  }

  // 선택한 날짜의 슬롯
  const selectedDateSlots = selectedDate ? groupedSlots[selectedDate] || [] : []

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="py-8">
        <div className="max-w-3xl mx-auto px-4">
          <Link
            href={`/parent/therapists/${therapistId}`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            ← 치료사 정보로 돌아가기
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-8">예약하기</h1>

        {/* 진행 단계 표시 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1 flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step >= s
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      step > s ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className={step >= 1 ? 'text-green-600 font-medium' : 'text-gray-500'}>
              날짜/시간
            </span>
            <span className={step >= 2 ? 'text-green-600 font-medium' : 'text-gray-500'}>
              예약 정보
            </span>
            <span className={step >= 3 ? 'text-green-600 font-medium' : 'text-gray-500'}>
              확인
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          {/* Step 1: 날짜/시간 선택 */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {isConsultation ? '방문 컨설팅 예약' : '정기 치료 예약'}
              </h2>

              {/* 안내 메시지 */}
              <div className={`border rounded-lg p-4 mb-6 ${isConsultation ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'}`}>
                <p className={`text-sm ${isConsultation ? 'text-blue-800' : 'text-green-800'}`}>
                  {isConsultation
                    ? '💡 언어치료 전문가의 1회 방문 컨설팅을 예약합니다. 아래에서 원하는 날짜와 시간을 선택해주세요.'
                    : '💡 원하는 만큼 치료 세션을 추가해주세요. 여러 날짜의 슬롯을 자유롭게 선택할 수 있습니다.'}
                </p>
              </div>

              {/* 정기 치료 모드: 선택한 슬롯 목록 */}
              {!isConsultation && selectedTimeSlotIds.length > 0 && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-300">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">
                      선택한 슬롯 ({selectedTimeSlotIds.length}개)
                    </h3>
                    {calculatedCount >= 4 && (
                      <span className="text-sm text-green-600 font-medium">
                        {discountRate}% 할인 적용
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {selectedTimeSlotIds.map((slotId) => {
                      const slot = availableSlots.find(s => s.id === slotId)
                      if (!slot) return null
                      return (
                        <div key={slotId} className="flex items-center justify-between bg-white p-3 rounded-md border border-gray-200">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {new Date(slot.date).toLocaleDateString('ko-KR', {
                                month: 'long',
                                day: 'numeric',
                                weekday: 'short'
                              })}
                            </div>
                            <div className="text-sm text-gray-600">
                              {slot.startTime} - {slot.endTime}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveSlot(slotId)}
                            className="ml-3 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          >
                            제거
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">가용 시간 조회 중...</p>
                </div>
              ) : availableDates.length === 0 ? (
                <p className="text-gray-500 text-center py-12">
                  현재 예약 가능한 시간이 없습니다.
                </p>
              ) : (
                <div className="space-y-6">
                  {/* 달력 */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      날짜 선택
                    </h3>
                    <Calendar
                      availableDates={availableDates}
                      selectedDate={selectedDate}
                      onDateSelect={handleDateSelect}
                    />
                  </div>

                  {/* 선택한 날짜의 슬롯 */}
                  {selectedDate && (
                    <div className="border-t pt-6">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">
                        {new Date(selectedDate).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          weekday: 'short',
                        })} - 시간 선택
                      </h3>
                      {selectedDateSlots.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">
                          이 날짜에 예약 가능한 시간이 없습니다.
                        </p>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          {selectedDateSlots.map((slot) => (
                            <button
                              key={slot.id}
                              type="button"
                              onClick={() => handleSlotToggle(slot.id)}
                              className={`px-4 py-3 rounded-md text-sm font-medium transition-all ${
                                selectedTimeSlotIds.includes(slot.id)
                                  ? 'bg-green-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {slot.startTime} - {slot.endTime}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={selectedTimeSlotIds.length === 0}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  다음
                </button>
              </div>
            </div>
          )}

          {/* Step 2: 예약 정보 입력 */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                예약 정보를 입력하세요
              </h2>

              <div className="space-y-4">
                {/* 선택한 예약 정보 요약 */}
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">선택한 예약 정보</h3>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-900">
                      <span className="text-gray-600">세션 타입:</span>{' '}
                      {isConsultation ? '방문 컨설팅 (1회)' : `정기 치료 (${calculatedCount}회)`}
                    </p>
                    <p className="text-gray-900">
                      <span className="text-gray-600">선택한 슬롯:</span>{' '}
                      {selectedTimeSlotIds.length}개
                    </p>
                    {calculatedCount >= 4 && (
                      <p className="text-green-600 font-medium">
                        <span className="text-gray-600">할인:</span> {discountRate}% 적용
                      </p>
                    )}
                  </div>
                </div>

                {/* 자녀 선택 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    자녀 선택 *
                  </label>
                  <select
                    value={selectedChildId}
                    onChange={(e) => setSelectedChildId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {children.map((child) => (
                      <option key={child.id} value={child.id}>
                        {child.name} ({child.gender === 'MALE' ? '남' : '여'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 방문 주소 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    방문 주소 *
                  </label>
                  {!userInfo?.address && (
                    <p className="text-sm text-amber-600 mb-2">
                      ℹ️ 회원 정보에 주소가 등록되지 않았습니다. 주소를 입력해주세요.
                    </p>
                  )}
                  <input
                    type="text"
                    value={visitAddress}
                    onChange={(e) => setVisitAddress(e.target.value)}
                    placeholder="예: 서울시 강남구 테헤란로 123"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    상세 주소
                  </label>
                  <input
                    type="text"
                    value={visitAddressDetail}
                    onChange={(e) => setVisitAddressDetail(e.target.value)}
                    placeholder="예: 101동 1234호"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                {/* 요청사항 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    요청사항
                  </label>
                  <textarea
                    value={parentNote}
                    onChange={(e) => setParentNote(e.target.value)}
                    rows={3}
                    placeholder="치료사에게 전달할 메시지를 입력하세요"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  이전
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  다음
                </button>
              </div>
            </div>
          )}

          {/* Step 3: 예약 확인 */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                예약 정보를 확인하세요
              </h2>

              <div className="space-y-4 mb-6">
                <div className="border-b pb-3">
                  <h3 className="text-sm font-medium text-gray-500">예약 날짜/시간</h3>
                  <div className="space-y-1">
                    {selectedTimeSlotIds.map((slotId) => {
                      const slot = availableSlots.find(s => s.id === slotId)
                      if (!slot) return null
                      return (
                        <p key={slotId} className="text-gray-900">
                          {new Date(slot.date).toLocaleDateString('ko-KR')} {slot.startTime} - {slot.endTime}
                        </p>
                      )
                    })}
                  </div>
                </div>

                <div className="border-b pb-3">
                  <h3 className="text-sm font-medium text-gray-500">자녀</h3>
                  <p className="text-gray-900">
                    {children.find(c => c.id === selectedChildId)?.name}
                  </p>
                </div>

                <div className="border-b pb-3">
                  <h3 className="text-sm font-medium text-gray-500">세션 정보</h3>
                  <p className="text-gray-900">
                    {isConsultation ? '방문 컨설팅' : '정기 치료'} - {calculatedCount}회
                  </p>
                </div>

                {visitAddress && (
                  <div className="border-b pb-3">
                    <h3 className="text-sm font-medium text-gray-500">방문 주소</h3>
                    <p className="text-gray-900">
                      {visitAddress} {visitAddressDetail}
                    </p>
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">결제 정보</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">원가</span>
                      <span className="text-gray-900">₩{originalFee.toLocaleString()}</span>
                    </div>
                    {discountRate > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>할인 ({discountRate}%)</span>
                        <span>-₩{(originalFee - finalFee).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                      <span>최종 금액</span>
                      <span>₩{finalFee.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  ⚠️ 예약 후 치료사의 확인이 필요합니다. 48시간 이내에 확인 결과를 알려드립니다.
                </p>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  이전
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {isLoading ? '예약 중...' : '예약하기'}
                </button>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  )
}
