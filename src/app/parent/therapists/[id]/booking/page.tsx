'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Calendar from '@/components/booking/Calendar'
import AddressSearchInput from '@/components/common/AddressSearchInput'

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

interface Therapist {
  id: string
  user: {
    name: string
  }
  sessionFee: number | null
  consultationFee: number | null
  consultationSettlementAmount: number | null
}

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const therapistId = params?.id as string

  // URL에서 type 파라미터 읽기 ('consultation' | 'therapy')
  const bookingType = searchParams.get('type') || 'therapy'
  const isConsultation = bookingType === 'consultation'

  // 날짜 문자열을 로컬 시간대로 파싱하는 헬퍼 함수
  const parseLocalDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  const [step, setStep] = useState(1)
  const [children, setChildren] = useState<Child[]>([])
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [groupedSlots, setGroupedSlots] = useState<Record<string, TimeSlot[]>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [therapist, setTherapist] = useState<Therapist | null>(null)

  // 폼 데이터 - type에 따라 자동 설정
  const [selectedTimeSlotIds, setSelectedTimeSlotIds] = useState<string[]>([])
  const [selectedChildId, setSelectedChildId] = useState('')
  const sessionType: 'CONSULTATION' | 'THERAPY' = isConsultation ? 'CONSULTATION' : 'THERAPY'
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [visitAddress, setVisitAddress] = useState('')
  const [visitAddressDetail, setVisitAddressDetail] = useState('')
  const [parentNote, setParentNote] = useState('')
  const [userInfo, setUserInfo] = useState<any>(null)
  const [depositName, setDepositName] = useState('')
  const [depositDate, setDepositDate] = useState('')
  const [systemSettings, setSystemSettings] = useState<any>(null)

  // 치료사 정보 가져오기
  useEffect(() => {
    const fetchTherapist = async () => {
      try {
        const response = await fetch(`/api/therapists/${therapistId}`)
        if (response.ok) {
          const data = await response.json()
          setTherapist(data)
        }
      } catch (err) {
        console.error('치료사 정보 조회 실패:', err)
      }
    }
    if (therapistId) {
      fetchTherapist()
    }
  }, [therapistId])

  // 사용자 정보 및 시스템 설정 가져오기
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
          // 입금자명 기본값 설정
          if (data.name) {
            setDepositName(data.name)
          }
        }
      } catch (err) {
        console.error('사용자 정보 조회 실패:', err)
      }
    }

    const fetchSystemSettings = async () => {
      try {
        const response = await fetch('/api/admin/system-settings')
        if (response.ok) {
          const data = await response.json()
          setSystemSettings(data.settings)
        }
      } catch (err) {
        console.error('시스템 설정 조회 실패:', err)
      }
    }

    fetchUserInfo()
    fetchSystemSettings()
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
    // 치료사별 가격 사용
    const baseFee = isConsultation
      ? (therapist?.consultationFee || 0)
      : (therapist?.sessionFee || 80000)

    // 실제 선택한 슬롯 개수 사용
    const count = isConsultation ? 1 : selectedTimeSlotIds.length

    const totalFee = baseFee * count

    return { totalFee, count, baseFee }
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

    if (!depositName || !depositDate) {
      setError('입금자명과 입금 예정일을 입력해주세요.')
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
          depositName,
          depositDate,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // 예약 생성 완료 - 대시보드로 이동
        router.push('/parent/dashboard')
      } else {
        setError(data.error || '예약 생성에 실패했습니다.')
      }
    } catch (err) {
      setError('서버 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const { totalFee, count: calculatedCount, baseFee } = calculateFee()

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
    <div className="min-h-screen bg-[#F5EFE7] font-pretendard">
      <Header />
      <div className="py-8 md:py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Link
            href={`/parent/therapists/${therapistId}`}
            className="inline-flex items-center text-stone-600 hover:text-[#FF6A00] mb-6 transition-colors"
          >
            ← 치료사 정보로 돌아가기
          </Link>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-stone-900 mb-6 md:mb-8">예약하기</h1>

        {/* 진행 단계 표시 */}
        <div className="mb-8 bg-white rounded-xl md:rounded-2xl p-6 md:p-8 shadow-lg">
          <div className="relative flex justify-between items-center px-4 md:px-8 mb-4">
            {/* 배경 연결선 */}
            <div className="absolute left-0 right-0 top-1/2 h-1 bg-gray-200 -translate-y-1/2" style={{ left: 'calc(1rem + 28px)', right: 'calc(1rem + 28px)' }}></div>

            {/* 진행된 연결선 */}
            {step > 1 && (
              <div className="absolute top-1/2 h-1 bg-[#FF6A00] -translate-y-1/2 transition-all duration-300" style={{
                left: 'calc(1rem + 28px)',
                width: step === 2 ? 'calc(50% - 1rem - 28px)' : 'calc(100% - 2rem - 56px)'
              }}></div>
            )}

            {/* 단계 원들 */}
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`relative w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center font-bold text-base md:text-lg border-2 transition-all leading-none z-10 ${
                  step >= s
                    ? 'bg-[#FF6A00] text-white border-[#FF6A00] shadow-lg'
                    : 'bg-white text-stone-400 border-gray-300'
                }`}
              >
                {s}
              </div>
            ))}
          </div>
          <div className="flex justify-between px-2 md:px-4">
            <span className={`text-xs md:text-sm text-left flex-1 ${step >= 1 ? 'text-[#FF6A00] font-semibold' : 'text-stone-500'}`}>날짜/시간</span>
            <span className={`text-xs md:text-sm text-center flex-1 ${step >= 2 ? 'text-[#FF6A00] font-semibold' : 'text-stone-500'}`}>예약 정보</span>
            <span className={`text-xs md:text-sm text-right flex-1 ${step >= 3 ? 'text-[#FF6A00] font-semibold' : 'text-stone-500'}`}>확인</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-6 md:p-8">
          {/* Step 1: 날짜/시간 선택 */}
          {step === 1 && (
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-stone-900 mb-4 md:mb-6">
                {isConsultation ? '방문 컨설팅 예약' : '정기 치료 예약'}
              </h2>

              {/* 치료사 정보 및 가격 */}
              {therapist && (
                <div className="bg-white border-2 border-[#FF6A00]/20 rounded-xl p-4 md:p-6 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-base md:text-lg font-bold text-stone-900">{therapist.user.name} 선생님</h3>
                      <p className="text-sm text-stone-600 mt-1">
                        {isConsultation ? '언어 컨설팅' : '정기 치료'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-stone-500">세션 비용</div>
                      <div className="text-lg md:text-xl font-bold text-[#FF6A00]">
                        ₩{(isConsultation ? therapist.consultationFee : therapist.sessionFee)?.toLocaleString() || '-'}
                      </div>
                      <div className="text-xs text-stone-500">/ 50분</div>
                    </div>
                  </div>
                </div>
              )}

              {/* 안내 메시지 */}
              <div className={`border rounded-xl p-4 mb-6 ${isConsultation ? 'bg-[#FFE5E5] border-[#FF9999]/30' : 'bg-blue-50 border-blue-200'}`}>
                <p className={`text-sm ${isConsultation ? 'text-stone-700' : 'text-blue-800'}`}>
                  {isConsultation
                    ? '💡 언어치료 전문가의 1회 방문 컨설팅을 예약합니다. 아래에서 원하는 날짜와 시간을 선택해주세요.'
                    : '💡 원하는 만큼 치료 세션을 추가해주세요. 여러 날짜의 슬롯을 자유롭게 선택할 수 있습니다.'}
                </p>
              </div>

              {/* 정기 치료 모드: 선택한 슬롯 목록 */}
              {!isConsultation && selectedTimeSlotIds.length > 0 && (
                <div className="mb-6 p-4 md:p-6 bg-[#FFE5E5] rounded-xl border border-[#FF9999]/20">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-stone-900">
                      선택한 슬롯 ({selectedTimeSlotIds.length}개)
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {selectedTimeSlotIds.map((slotId) => {
                      const slot = availableSlots.find(s => s.id === slotId)
                      if (!slot) return null
                      return (
                        <div key={slotId} className="flex items-center justify-between bg-white p-3 md:p-4 rounded-lg border border-gray-200">
                          <div className="flex-1">
                            <div className="font-semibold text-stone-900 text-sm md:text-base">
                              {parseLocalDate(slot.date.split('T')[0]).toLocaleDateString('ko-KR', {
                                month: 'long',
                                day: 'numeric',
                                weekday: 'short'
                              })}
                            </div>
                            <div className="text-xs md:text-sm text-stone-600">
                              {slot.startTime} - {slot.endTime}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveSlot(slotId)}
                            className="ml-3 px-3 py-1.5 text-xs md:text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
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
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6A00] mx-auto"></div>
                  <p className="mt-4 text-stone-600">가용 시간 조회 중...</p>
                </div>
              ) : availableDates.length === 0 ? (
                <p className="text-stone-500 text-center py-12">
                  현재 예약 가능한 시간이 없습니다.
                </p>
              ) : (
                <div className="space-y-6">
                  {/* 달력 */}
                  <div>
                    <h3 className="text-sm font-semibold text-stone-700 mb-3">
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
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-sm font-semibold text-stone-700 mb-4">
                        {parseLocalDate(selectedDate).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          weekday: 'short',
                        })} - 시간 선택
                      </h3>
                      {selectedDateSlots.length === 0 ? (
                        <p className="text-stone-500 text-center py-8 text-sm">
                          이 날짜에 예약 가능한 시간이 없습니다.
                        </p>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                          {selectedDateSlots.map((slot) => (
                            <button
                              key={slot.id}
                              type="button"
                              onClick={() => handleSlotToggle(slot.id)}
                              className={`px-3 md:px-4 py-2.5 md:py-3 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                                selectedTimeSlotIds.includes(slot.id)
                                  ? 'bg-[#FF6A00] text-white shadow-md'
                                  : 'bg-gray-100 text-stone-700 hover:bg-gray-200'
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

              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={selectedTimeSlotIds.length === 0}
                  className="px-8 md:px-10 py-3 md:py-4 bg-[#FF6A00] text-white rounded-[10px] font-semibold text-sm md:text-base hover:bg-[#E55F00] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
                >
                  다음
                </button>
              </div>
            </div>
          )}

          {/* Step 2: 예약 정보 입력 */}
          {step === 2 && (
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-stone-900 mb-4 md:mb-6">
                예약 정보를 입력하세요
              </h2>

              <div className="space-y-4 md:space-y-6">
                {/* 선택한 예약 정보 요약 */}
                <div className="bg-[#FFE5E5] p-4 md:p-6 rounded-xl border border-[#FF9999]/20">
                  <h3 className="text-sm font-semibold text-stone-900 mb-3">선택한 예약 정보</h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-stone-900">
                      <span className="text-stone-600">세션 타입:</span>{' '}
                      {isConsultation ? '방문 컨설팅 (1회)' : `정기 치료 (${calculatedCount}회)`}
                    </p>
                    <p className="text-stone-900">
                      <span className="text-stone-600">선택한 슬롯:</span>{' '}
                      {selectedTimeSlotIds.length}개
                    </p>
                  </div>
                </div>

                {/* 자녀 선택 */}
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">
                    자녀 선택 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedChildId}
                    onChange={(e) => setSelectedChildId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6A00] focus:border-transparent"
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
                  {!userInfo?.address && (
                    <p className="text-sm text-amber-700 mb-3 bg-amber-50 p-3 rounded-lg border border-amber-200">
                      ℹ️ 회원 정보에 주소가 등록되지 않았습니다. 주소를 입력해주세요.
                    </p>
                  )}
                  <AddressSearchInput
                    address={visitAddress}
                    addressDetail={visitAddressDetail}
                    onAddressChange={setVisitAddress}
                    onAddressDetailChange={setVisitAddressDetail}
                  />
                </div>

                {/* 요청사항 */}
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">
                    요청사항
                  </label>
                  <textarea
                    value={parentNote}
                    onChange={(e) => setParentNote(e.target.value)}
                    rows={4}
                    placeholder="치료사에게 전달할 메시지를 입력하세요"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6A00] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-between gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 md:px-8 py-3 md:py-4 border-2 border-gray-300 text-stone-700 rounded-[10px] font-semibold text-sm md:text-base hover:bg-gray-50 transition-colors"
                >
                  이전
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="px-8 md:px-10 py-3 md:py-4 bg-[#FF6A00] text-white rounded-[10px] font-semibold text-sm md:text-base hover:bg-[#E55F00] transition-colors shadow-lg"
                >
                  다음
                </button>
              </div>
            </div>
          )}

          {/* Step 3: 예약 확인 */}
          {step === 3 && (
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-stone-900 mb-4 md:mb-6">
                예약 정보를 확인하세요
              </h2>

              <div className="space-y-4 md:space-y-6 mb-6">
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-sm font-semibold text-stone-500 mb-2">예약 날짜/시간</h3>
                  <div className="space-y-1.5">
                    {selectedTimeSlotIds.map((slotId) => {
                      const slot = availableSlots.find(s => s.id === slotId)
                      if (!slot) return null
                      return (
                        <p key={slotId} className="text-stone-900 text-sm md:text-base">
                          {parseLocalDate(slot.date.split('T')[0]).toLocaleDateString('ko-KR')} {slot.startTime} - {slot.endTime}
                        </p>
                      )
                    })}
                  </div>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-sm font-semibold text-stone-500 mb-2">자녀</h3>
                  <p className="text-stone-900 text-sm md:text-base">
                    {children.find(c => c.id === selectedChildId)?.name}
                  </p>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-sm font-semibold text-stone-500 mb-2">세션 정보</h3>
                  <p className="text-stone-900 text-sm md:text-base">
                    {isConsultation ? '방문 컨설팅' : '정기 치료'} - {calculatedCount}회
                  </p>
                </div>

                {visitAddress && (
                  <div className="border-b border-gray-200 pb-4">
                    <h3 className="text-sm font-semibold text-stone-500 mb-2">방문 주소</h3>
                    <p className="text-stone-900 text-sm md:text-base">
                      {visitAddress} {visitAddressDetail}
                    </p>
                  </div>
                )}

                <div className="bg-[#FFE5E5] p-4 md:p-6 rounded-xl border border-[#FF9999]/20">
                  <h3 className="font-bold text-stone-900 mb-3 text-base md:text-lg">결제 정보</h3>
                  <div className="space-y-2 text-sm md:text-base">
                    <div className="flex justify-between">
                      <span className="text-stone-600">세션당 비용</span>
                      <span className="text-stone-900 font-medium">₩{baseFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-600">세션 수</span>
                      <span className="text-stone-900 font-medium">{calculatedCount}회</span>
                    </div>
                    <div className="flex justify-between text-base md:text-lg font-bold text-stone-900 pt-3 border-t border-[#FF9999]/20">
                      <span>총 금액</span>
                      <span className="text-[#FF6A00]">₩{totalFee.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* 입금 안내 */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 md:p-6">
                  <h3 className="font-bold text-blue-900 mb-3 md:mb-4 flex items-center text-base md:text-lg">
                    <span className="mr-2">🏦</span>
                    입금 계좌 안내
                  </h3>
                  {systemSettings ? (
                    <div className="space-y-2 md:space-y-3 text-sm md:text-base">
                      <div className="flex items-center">
                        <span className="text-blue-700 font-semibold w-20 md:w-24">은행:</span>
                        <span className="text-blue-900">{systemSettings.bankName || '-'}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-blue-700 font-semibold w-20 md:w-24">계좌번호:</span>
                        <span className="text-blue-900 font-mono">{systemSettings.accountNumber || '-'}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-blue-700 font-semibold w-20 md:w-24">예금주:</span>
                        <span className="text-blue-900">{systemSettings.accountHolder || '-'}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-blue-700">계좌 정보를 불러오는 중...</p>
                  )}
                </div>

                {/* 입금 정보 입력 */}
                <div className="space-y-4 md:space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      입금자명 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={depositName}
                      onChange={(e) => setDepositName(e.target.value)}
                      placeholder="입금하실 분의 성함"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6A00] focus:border-transparent"
                      required
                    />
                    <p className="text-xs text-stone-500 mt-2">입금자명이 다를 경우 입금 확인이 지연될 수 있습니다.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      입금 예정일 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={depositDate}
                      onChange={(e) => setDepositDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6A00] focus:border-transparent"
                      required
                    />
                    <p className="text-xs text-stone-500 mt-2">입금 예정일을 선택해주세요. 예정일 이후 입금 확인이 진행됩니다.</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 md:mb-8">
                <p className="text-sm text-yellow-800">
                  ⚠️ 예약 후 치료사의 확인이 필요합니다. 48시간 이내에 확인 결과를 알려드립니다.
                </p>
              </div>

              <div className="flex justify-between gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 md:px-8 py-3 md:py-4 border-2 border-gray-300 text-stone-700 rounded-[10px] font-semibold text-sm md:text-base hover:bg-gray-50 transition-colors"
                >
                  이전
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="px-8 md:px-10 py-3 md:py-4 bg-[#FF6A00] text-white rounded-[10px] font-semibold text-sm md:text-base hover:bg-[#E55F00] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
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
