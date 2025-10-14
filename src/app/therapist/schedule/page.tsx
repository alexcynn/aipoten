'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Header from '@/components/layout/Header'

type WeeklyPattern = {
  [key: string]: string[]
}

interface TimeSlot {
  id: string
  date: Date
  startTime: string
  endTime: string
  isAvailable: boolean
  isHoliday: boolean
  isBufferBlocked: boolean
  currentBookings: number
}

interface Holiday {
  id: string
  date: Date
  reason: string | null
  isRecurring: boolean
}

interface CalendarDay {
  date: Date
  slots: TimeSlot[]
  isCurrentMonth: boolean
}

const DAYS_OF_WEEK_KR = ['일', '월', '화', '수', '목', '금', '토']
const DAYS_OF_WEEK_EN = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

// 기본 날짜 계산: 오늘 ~ 다음달 말일
const getDefaultDates = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const nextMonthEnd = new Date(today.getFullYear(), today.getMonth() + 2, 0) // 다음달 마지막 날

  return {
    startDate: today.toISOString().split('T')[0],
    endDate: nextMonthEnd.toISOString().split('T')[0]
  }
}

export default function TherapistSchedulePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // State
  const [activeTab, setActiveTab] = useState<'calendar' | 'bulk-create' | 'bulk-delete' | 'holidays'>('calendar')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date())
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([])

  // Bulk create state - 기본값 설정
  const defaultDates = getDefaultDates()
  const [selectedDays, setSelectedDays] = useState<string[]>(['monday', 'tuesday', 'wednesday', 'thursday', 'friday'])
  const [bulkCreateForm, setBulkCreateForm] = useState({
    startDate: defaultDates.startDate,
    endDate: defaultDates.endDate,
    excludeHolidays: true,
    weeklyPattern: {
      monday: [] as string[],
      tuesday: [] as string[],
      wednesday: [] as string[],
      thursday: [] as string[],
      friday: [] as string[],
      saturday: [] as string[],
      sunday: [] as string[]
    }
  })

  // Bulk delete state
  const [bulkDeleteForm, setBulkDeleteForm] = useState({
    startDate: '',
    endDate: '',
    onlyEmpty: true
  })

  // Holiday state
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [newHoliday, setNewHoliday] = useState({
    date: '',
    reason: ''
  })

  // Auth check
  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
    if (session.user?.role !== 'THERAPIST') {
      router.push('/dashboard')
      return
    }

    fetchData()
  }, [session, status, router])

  // Fetch all data
  const fetchData = async () => {
    setIsLoading(true)
    await Promise.all([
      fetchTimeSlots(),
      fetchHolidays()
    ])
    setIsLoading(false)
  }

  // Fetch time slots for calendar
  const fetchTimeSlots = async () => {
    try {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth()

      // Get first and last day of month
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)

      console.log('📅 달력 조회 시작:', {
        year,
        month: month + 1,
        firstDay: firstDay.toISOString().split('T')[0],
        lastDay: lastDay.toISOString().split('T')[0]
      })

      const response = await fetch(
        `/api/therapist/time-slots?startDate=${firstDay.toISOString().split('T')[0]}&endDate=${lastDay.toISOString().split('T')[0]}`
      )

      console.log('📡 API 응답 상태:', response.status, response.ok)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ API 응답 데이터:', {
          slots: data.slots?.length || 0,
          firstSlot: data.slots?.[0],
          stats: data.stats
        })
        setTimeSlots(data.slots || [])
        generateCalendar(data.slots || [])
      } else {
        console.error('❌ API 응답 실패:', await response.text())
        // 에러가 나도 빈 달력 생성
        setTimeSlots([])
        generateCalendar([])
      }
    } catch (error) {
      console.error('❌ 스케줄 조회 오류:', error)
      // 에러가 나도 빈 달력 생성
      setTimeSlots([])
      generateCalendar([])
    }
  }

  // Fetch holidays
  const fetchHolidays = async () => {
    try {
      const response = await fetch('/api/therapist/holidays?includePublic=true')
      if (response.ok) {
        const data = await response.json()
        setHolidays(data.holidays || [])
      }
    } catch (error) {
      console.error('휴일 조회 오류:', error)
    }
  }

  // Generate calendar - 항상 달력 생성
  const generateCalendar = (slots: TimeSlot[]) => {
    console.log('🗓️ 달력 생성 시작:', { totalSlots: slots.length })

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const prevMonthLastDay = new Date(year, month, 0)

    const startDayOfWeek = firstDay.getDay()
    const daysInMonth = lastDay.getDate()

    const days: CalendarDay[] = []

    // Previous month days
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay.getDate() - i)
      days.push({
        date,
        slots: [],
        isCurrentMonth: false
      })
    }

    // Current month days
    let matchCount = 0
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i)
      // 로컬 날짜 문자열 직접 생성 (시간대 변환 없음)
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`

      const daySlots = slots.filter(slot => {
        // 슬롯 날짜도 로컬 기준으로 파싱
        const slotDateObj = new Date(slot.date)
        const slotYear = slotDateObj.getUTCFullYear()
        const slotMonth = slotDateObj.getUTCMonth() + 1
        const slotDay = slotDateObj.getUTCDate()
        const slotDate = `${slotYear}-${String(slotMonth).padStart(2, '0')}-${String(slotDay).padStart(2, '0')}`

        const match = slotDate === dateStr
        if (i === 1 && slots.length > 0) { // 1일에 샘플 로그
          console.log(`  🔍 슬롯 날짜 샘플:`, {
            slotDateRaw: slot.date,
            slotDateParsed: slotDate,
            comparing: dateStr,
            match
          })
        }
        if (match) matchCount++
        return match
      })

      days.push({
        date,
        slots: daySlots,
        isCurrentMonth: true
      })
    }
    console.log(`  ✓ 매칭된 슬롯 총 ${matchCount}개`)

    // Next month days
    const remainingDays = 7 - (days.length % 7)
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        const date = new Date(year, month + 1, i)
        days.push({
          date,
          slots: [],
          isCurrentMonth: false
        })
      }
    }

    const daysWithSlots = days.filter(d => d.slots.length > 0).length
    console.log('✅ 달력 생성 완료:', {
      totalDays: days.length,
      daysWithSlots,
      sample: days.slice(startDayOfWeek, startDayOfWeek + 3).map(d => ({
        date: d.date.getDate(),
        slotsCount: d.slots.length
      }))
    })

    setCalendarDays(days)
  }

  // Toggle day selection
  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day))
    } else {
      setSelectedDays([...selectedDays, day])
    }
  }

  // Handle bulk create
  const handleBulkCreate = async () => {
    if (!bulkCreateForm.startDate || !bulkCreateForm.endDate) {
      alert('⚠️ 시작일과 종료일을 입력해주세요.')
      return
    }

    // 선택된 요일만 필터링
    const filteredPattern: any = {}
    selectedDays.forEach(day => {
      if (bulkCreateForm.weeklyPattern[day as keyof typeof bulkCreateForm.weeklyPattern].length > 0) {
        filteredPattern[day] = bulkCreateForm.weeklyPattern[day as keyof typeof bulkCreateForm.weeklyPattern]
      }
    })

    // Check if at least one day has time ranges
    if (Object.keys(filteredPattern).length === 0) {
      alert('⚠️ 최소 한 개의 요일에 시간대를 추가해주세요.')
      return
    }

    const requestData = {
      ...bulkCreateForm,
      weeklyPattern: filteredPattern
    }

    console.log('🚀 스케줄 생성 요청:', requestData)

    setIsSaving(true)
    try {
      const response = await fetch('/api/therapist/schedule/bulk-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })

      console.log('📡 응답 상태:', response.status)

      if (response.ok) {
        const result = await response.json()
        console.log('✅ 응답 결과:', result)
        setMessage(`${result.created}개 슬롯이 생성되었습니다. (${result.skipped}개 중복 건너뜀)`)
        // Reset form
        setBulkCreateForm({
          ...bulkCreateForm,
          weeklyPattern: {
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
            saturday: [],
            sunday: []
          }
        })
        fetchTimeSlots()
      } else {
        const result = await response.json()
        console.error('❌ 에러 응답:', result)
        setMessage(result.error || '스케줄 생성 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('❌ 네트워크 에러:', error)
      setMessage('스케줄 생성 중 오류가 발생했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (!bulkDeleteForm.startDate || !bulkDeleteForm.endDate) {
      alert('⚠️ 시작일과 종료일을 입력해주세요.')
      return
    }

    if (!confirm(`${bulkDeleteForm.onlyEmpty ? '예약 없는 ' : '모든 '}슬롯을 삭제하시겠습니까?`)) {
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/therapist/schedule/bulk-delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bulkDeleteForm)
      })

      if (response.ok) {
        const result = await response.json()
        setMessage(result.message)
        fetchTimeSlots()
      } else {
        const result = await response.json()
        setMessage(result.error || '스케줄 삭제 중 오류가 발생했습니다.')
      }
    } catch (error) {
      setMessage('스케줄 삭제 중 오류가 발생했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle add holiday
  const handleAddHoliday = async () => {
    if (!newHoliday.date || !newHoliday.reason) {
      alert('⚠️ 날짜와 사유를 모두 입력해주세요.')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/therapist/holidays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newHoliday)
      })

      if (response.ok) {
        setMessage('휴일이 추가되었습니다.')
        setNewHoliday({ date: '', reason: '' })
        fetchHolidays()
      } else {
        const result = await response.json()
        setMessage(result.error || '휴일 추가 중 오류가 발생했습니다.')
      }
    } catch (error) {
      setMessage('휴일 추가 중 오류가 발생했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle delete holiday
  const handleDeleteHoliday = async (id: string) => {
    if (!confirm('이 휴일을 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/therapist/holidays/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setMessage('휴일이 삭제되었습니다.')
        fetchHolidays()
      } else {
        const result = await response.json()
        setMessage(result.error || '휴일 삭제 중 오류가 발생했습니다.')
      }
    } catch (error) {
      setMessage('휴일 삭제 중 오류가 발생했습니다.')
    }
  }

  // Add time range to weekly pattern
  const addTimeRange = (day: string, startTime: string, endTime: string) => {
    if (!startTime || !endTime) {
      alert('⚠️ 시작 시간과 종료 시간을 입력해주세요.')
      return
    }

    if (startTime >= endTime) {
      alert('⚠️ 종료 시간은 시작 시간보다 늦어야 합니다.')
      return
    }

    // 시간을 분 단위로 변환
    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin

    // 1시간(60분) 단위로 자동 분할
    const newRanges: string[] = []
    for (let minutes = startMinutes; minutes < endMinutes; minutes += 60) {
      const slotStartHour = Math.floor(minutes / 60)
      const slotStartMin = minutes % 60
      const slotEndMinutes = Math.min(minutes + 60, endMinutes)
      const slotEndHour = Math.floor(slotEndMinutes / 60)
      const slotEndMin = slotEndMinutes % 60

      const slotStart = `${String(slotStartHour).padStart(2, '0')}:${String(slotStartMin).padStart(2, '0')}`
      const slotEnd = `${String(slotEndHour).padStart(2, '0')}:${String(slotEndMin).padStart(2, '0')}`
      const timeRange = `${slotStart}-${slotEnd}`

      newRanges.push(timeRange)
    }

    const currentRanges = bulkCreateForm.weeklyPattern[day as keyof typeof bulkCreateForm.weeklyPattern]

    // 중복 체크
    const duplicates = newRanges.filter(range => currentRanges.includes(range))
    if (duplicates.length > 0) {
      alert(`⚠️ 다음 시간대는 이미 추가되어 있습니다:\n${duplicates.join(', ')}`)
      return
    }

    console.log(`➕ ${day}에 ${newRanges.length}개 시간대 추가:`, newRanges)

    setBulkCreateForm({
      ...bulkCreateForm,
      weeklyPattern: {
        ...bulkCreateForm.weeklyPattern,
        [day]: [...currentRanges, ...newRanges]
      }
    })
  }

  // Remove time range from weekly pattern
  const removeTimeRange = (day: string, index: number) => {
    const currentRanges = bulkCreateForm.weeklyPattern[day as keyof typeof bulkCreateForm.weeklyPattern]
    console.log(`➖ ${day}에서 시간대 삭제:`, currentRanges[index])

    setBulkCreateForm({
      ...bulkCreateForm,
      weeklyPattern: {
        ...bulkCreateForm.weeklyPattern,
        [day]: currentRanges.filter((_, i) => i !== index)
      }
    })
  }

  // Navigation
  const prevMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    setCurrentDate(newDate)
  }

  const nextMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    setCurrentDate(newDate)
  }

  useEffect(() => {
    if (activeTab === 'calendar' && !isLoading) {
      fetchTimeSlots()
    }
  }, [currentDate])

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-neutral-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aipoten-green mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-neutral-light">
      <Header />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">스케줄 관리</h1>

          {message && (
            <div
              style={{
                marginBottom: '1rem',
                padding: '1rem',
                borderRadius: '0.375rem',
                backgroundColor: message.includes('오류') || message.includes('실패') ? '#fef2f2' : '#f0fdf4',
                color: message.includes('오류') || message.includes('실패') ? '#991b1b' : '#166534'
              }}
            >
              {message}
              <button
                onClick={() => setMessage('')}
                style={{
                  float: 'right',
                  fontSize: '0.875rem',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  color: 'inherit'
                }}
              >
                닫기
              </button>
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'calendar', label: '캘린더 보기' },
                { key: 'bulk-create', label: '일괄 생성' },
                { key: 'bulk-delete', label: '일괄 삭제' },
                { key: 'holidays', label: '휴일 관리' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  style={{
                    whiteSpace: 'nowrap',
                    paddingTop: '1rem',
                    paddingBottom: '1rem',
                    paddingLeft: '0.25rem',
                    paddingRight: '0.25rem',
                    borderBottom: '2px solid',
                    borderColor: activeTab === tab.key ? '#10b981' : 'transparent',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    color: activeTab === tab.key ? '#10b981' : '#6b7280',
                    cursor: 'pointer',
                    background: 'none'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Calendar Tab */}
          {activeTab === 'calendar' && (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={prevMonth}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    이전
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    오늘
                  </button>
                  <button
                    onClick={nextMonth}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    다음
                  </button>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '1px',
                backgroundColor: '#e5e7eb',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                overflow: 'hidden'
              }}>
                {DAYS_OF_WEEK_KR.map(day => (
                  <div key={day} style={{
                    backgroundColor: '#f9fafb',
                    padding: '0.5rem',
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#374151'
                  }}>
                    {day}
                  </div>
                ))}

                {calendarDays.map((day, index) => {
                  const availableSlotsData = day.slots.filter(s => s.isAvailable && s.currentBookings === 0)
                  const bookedSlotsData = day.slots.filter(s => s.currentBookings > 0)
                  const blockedSlotsData = day.slots.filter(s => s.isBufferBlocked)

                  return (
                    <div
                      key={index}
                      style={{
                        backgroundColor: 'white',
                        padding: '0.5rem',
                        minHeight: '120px',
                        opacity: !day.isCurrentMonth ? 0.4 : 1,
                        overflow: 'auto',
                        maxHeight: '180px'
                      }}
                    >
                      <div style={{
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        marginBottom: '0.5rem',
                        color: '#111827'
                      }}>
                        {day.date.getDate()}
                      </div>

                      {day.slots.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          {availableSlotsData.map((slot, idx) => (
                            <div key={idx} style={{
                              backgroundColor: '#d1fae5',
                              color: '#065f46',
                              padding: '0.25rem 0.375rem',
                              borderRadius: '0.25rem',
                              fontSize: '0.625rem',
                              fontWeight: 500
                            }}>
                              ✓ {slot.startTime}
                            </div>
                          ))}
                          {bookedSlotsData.map((slot, idx) => (
                            <div key={idx} style={{
                              backgroundColor: '#fee2e2',
                              color: '#991b1b',
                              padding: '0.25rem 0.375rem',
                              borderRadius: '0.25rem',
                              fontSize: '0.625rem',
                              fontWeight: 500
                            }}>
                              ✕ {slot.startTime}
                            </div>
                          ))}
                          {blockedSlotsData.map((slot, idx) => (
                            <div key={idx} style={{
                              backgroundColor: '#f3f4f6',
                              color: '#6b7280',
                              padding: '0.25rem 0.375rem',
                              borderRadius: '0.25rem',
                              fontSize: '0.625rem',
                              fontWeight: 500
                            }}>
                              🚫 {slot.startTime}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{
                          fontSize: '0.75rem',
                          color: '#9ca3af',
                          fontStyle: 'italic'
                        }}>
                          슬롯 없음
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div style={{
                marginTop: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1.5rem',
                fontSize: '0.875rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    width: '1rem',
                    height: '1rem',
                    backgroundColor: '#d1fae5',
                    border: '1px solid #a7f3d0',
                    borderRadius: '0.25rem',
                    marginRight: '0.5rem'
                  }}></div>
                  <span>✓ 예약 가능</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    width: '1rem',
                    height: '1rem',
                    backgroundColor: '#fee2e2',
                    border: '1px solid #fecaca',
                    borderRadius: '0.25rem',
                    marginRight: '0.5rem'
                  }}></div>
                  <span>✕ 예약됨</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    width: '1rem',
                    height: '1rem',
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.25rem',
                    marginRight: '0.5rem'
                  }}></div>
                  <span>🚫 차단됨</span>
                </div>
              </div>
            </div>
          )}

          {/* Bulk Create Tab */}
          {activeTab === 'bulk-create' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">스케줄 일괄 생성</h2>

              <div className="space-y-6">
                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      시작일
                    </label>
                    <input
                      type="date"
                      value={bulkCreateForm.startDate}
                      onChange={(e) => setBulkCreateForm({...bulkCreateForm, startDate: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      style={{ fontSize: '1rem' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      종료일 (최대 3개월)
                    </label>
                    <input
                      type="date"
                      value={bulkCreateForm.endDate}
                      onChange={(e) => setBulkCreateForm({...bulkCreateForm, endDate: e.target.value})}
                      min={bulkCreateForm.startDate || new Date().toISOString().split('T')[0]}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      style={{ fontSize: '1rem' }}
                    />
                  </div>
                </div>

                {/* Holiday Exclusion */}
                <div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bulkCreateForm.excludeHolidays}
                      onChange={(e) => setBulkCreateForm({...bulkCreateForm, excludeHolidays: e.target.checked})}
                      className="w-4 h-4"
                      style={{ accentColor: '#10b981' }}
                    />
                    <span className="ml-2 text-sm text-gray-700">공휴일 제외</span>
                  </label>
                </div>

                {/* Day Selection */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">요일 선택</h3>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_OF_WEEK_EN.map((day, index) => (
                      <label key={day} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedDays.includes(day)}
                          onChange={() => toggleDay(day)}
                          className="w-4 h-4"
                          style={{ accentColor: '#10b981' }}
                        />
                        <span className="ml-2 text-sm text-gray-700">{DAYS_OF_WEEK_KR[index]}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Weekly Pattern */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">요일별 시간 설정</h3>
                  <div className="space-y-4">
                    {DAYS_OF_WEEK_EN.filter(day => selectedDays.includes(day)).map((day, index) => (
                      <WeeklyPatternInput
                        key={day}
                        day={day}
                        dayKr={DAYS_OF_WEEK_KR[DAYS_OF_WEEK_EN.indexOf(day)]}
                        timeRanges={bulkCreateForm.weeklyPattern[day as keyof typeof bulkCreateForm.weeklyPattern]}
                        onAdd={addTimeRange}
                        onRemove={removeTimeRange}
                      />
                    ))}
                  </div>
                </div>

                {/* Summary */}
                {selectedDays.length > 0 && (
                  <div
                    style={{
                      backgroundColor: '#eff6ff',
                      border: '1px solid #3b82f6',
                      borderRadius: '0.375rem',
                      padding: '1rem'
                    }}
                  >
                    <h4 className="text-sm font-medium text-gray-900 mb-2">📊 생성 요약</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• 선택된 요일: {selectedDays.length}개</li>
                      <li>
                        • 총 시간대: {Object.values(bulkCreateForm.weeklyPattern).reduce((sum, ranges) => sum + ranges.length, 0)}개
                      </li>
                      {Object.entries(bulkCreateForm.weeklyPattern).map(([day, ranges]) => {
                        if (ranges.length > 0) {
                          const dayKr = DAYS_OF_WEEK_KR[DAYS_OF_WEEK_EN.indexOf(day)]
                          return (
                            <li key={day} className="ml-4">
                              ◦ {dayKr}: {ranges.length}개 시간대
                            </li>
                          )
                        }
                        return null
                      })}
                    </ul>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  onClick={handleBulkCreate}
                  disabled={isSaving}
                  style={{
                    width: '100%',
                    backgroundColor: isSaving ? '#9ca3af' : '#10b981',
                    color: 'white',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.375rem',
                    fontWeight: 500,
                    fontSize: '1rem',
                    border: 'none',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSaving) {
                      e.currentTarget.style.backgroundColor = '#059669'
                      e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.15)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSaving) {
                      e.currentTarget.style.backgroundColor = '#10b981'
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  {isSaving ? '생성 중...' : '🚀 스케줄 생성'}
                </button>
              </div>
            </div>
          )}

          {/* Bulk Delete Tab */}
          {activeTab === 'bulk-delete' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">스케줄 일괄 삭제</h2>

              <div className="space-y-6">
                <div
                  style={{
                    backgroundColor: '#fef3c7',
                    border: '1px solid #fbbf24',
                    borderRadius: '0.375rem',
                    padding: '1rem'
                  }}
                >
                  <p style={{ fontSize: '0.875rem', color: '#78350f' }}>
                    ⚠️ 주의: 선택한 기간의 스케줄이 삭제됩니다. "예약 없는 슬롯만" 옵션을 사용하면 안전하게 삭제할 수 있습니다.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      시작일
                    </label>
                    <input
                      type="date"
                      value={bulkDeleteForm.startDate}
                      onChange={(e) => setBulkDeleteForm({...bulkDeleteForm, startDate: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      style={{ fontSize: '1rem' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      종료일
                    </label>
                    <input
                      type="date"
                      value={bulkDeleteForm.endDate}
                      onChange={(e) => setBulkDeleteForm({...bulkDeleteForm, endDate: e.target.value})}
                      min={bulkDeleteForm.startDate}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      style={{ fontSize: '1rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bulkDeleteForm.onlyEmpty}
                      onChange={(e) => setBulkDeleteForm({...bulkDeleteForm, onlyEmpty: e.target.checked})}
                      className="w-4 h-4"
                      style={{ accentColor: '#10b981' }}
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      예약 없는 슬롯만 삭제 (권장)
                    </span>
                  </label>
                </div>

                <button
                  onClick={handleBulkDelete}
                  disabled={isSaving}
                  style={{
                    width: '100%',
                    backgroundColor: isSaving ? '#9ca3af' : '#dc2626',
                    color: 'white',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.375rem',
                    fontWeight: 500,
                    fontSize: '1rem',
                    border: 'none',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSaving) {
                      e.currentTarget.style.backgroundColor = '#b91c1c'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSaving) {
                      e.currentTarget.style.backgroundColor = '#dc2626'
                    }
                  }}
                >
                  {isSaving ? '삭제 중...' : '스케줄 삭제'}
                </button>
              </div>
            </div>
          )}

          {/* Holidays Tab */}
          {activeTab === 'holidays' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Add Holiday Form */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">휴일 추가</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      날짜
                    </label>
                    <input
                      type="date"
                      value={newHoliday.date}
                      onChange={(e) => setNewHoliday({...newHoliday, date: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      style={{ fontSize: '1rem' }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      사유
                    </label>
                    <input
                      type="text"
                      value={newHoliday.reason}
                      onChange={(e) => setNewHoliday({...newHoliday, reason: e.target.value})}
                      placeholder="예: 개인 일정"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      style={{ fontSize: '1rem' }}
                    />
                  </div>

                  <button
                    onClick={handleAddHoliday}
                    disabled={isSaving}
                    style={{
                      width: '100%',
                      backgroundColor: isSaving ? '#9ca3af' : '#10b981',
                      color: 'white',
                      padding: '0.75rem 1rem',
                      borderRadius: '0.375rem',
                      fontWeight: 500,
                      fontSize: '1rem',
                      border: 'none',
                      cursor: isSaving ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isSaving ? '추가 중...' : '휴일 추가'}
                  </button>
                </div>
              </div>

              {/* Holidays List */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">등록된 휴일</h2>

                {holidays.length === 0 ? (
                  <p className="text-sm text-gray-500">등록된 휴일이 없습니다.</p>
                ) : (
                  <div className="space-y-3" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    {holidays
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map(holiday => (
                        <div
                          key={holiday.id}
                          className="flex items-center justify-between bg-gray-50 p-3 rounded-md border border-gray-200"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(holiday.date).toLocaleDateString('ko-KR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                weekday: 'short'
                              })}
                            </p>
                            <p className="text-xs text-gray-600">{holiday.reason || '-'}</p>
                            {holiday.isRecurring && (
                              <span
                                style={{
                                  display: 'inline-block',
                                  marginTop: '0.25rem',
                                  padding: '0.125rem 0.5rem',
                                  fontSize: '0.75rem',
                                  backgroundColor: '#dbeafe',
                                  color: '#1e40af',
                                  borderRadius: '0.25rem'
                                }}
                              >
                                반복
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteHoliday(holiday.id)}
                            className="text-sm text-red-600 hover:text-red-800"
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '0.875rem'
                            }}
                          >
                            삭제
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

// Weekly Pattern Input Component
function WeeklyPatternInput({
  day,
  dayKr,
  timeRanges,
  onAdd,
  onRemove
}: {
  day: string
  dayKr: string
  timeRanges: string[]
  onAdd: (day: string, start: string, end: string) => void
  onRemove: (day: string, index: number) => void
}) {
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('18:00')

  const handleAdd = () => {
    console.log(`🔘 ${dayKr} 추가 버튼 클릭: ${startTime} - ${endTime}`)
    onAdd(day, startTime, endTime)
    // Reset은 onAdd 성공 후에만 (현재는 항상)
    setStartTime('09:00')
    setEndTime('18:00')
  }

  return (
    <div
      className="border border-gray-200 rounded-md p-4"
      style={{ backgroundColor: timeRanges.length > 0 ? '#f0fdf4' : 'white' }}
    >
      <h4 className="font-medium text-gray-900 mb-3">
        {dayKr} {timeRanges.length > 0 && <span className="text-xs text-green-600">({timeRanges.length}개 시간대)</span>}
      </h4>

      <div className="flex items-end space-x-2 mb-3">
        <div className="flex-1">
          <label className="block text-xs text-gray-600 mb-1">시작</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
            style={{ fontSize: '0.875rem' }}
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-gray-600 mb-1">종료</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
            style={{ fontSize: '0.875rem' }}
          />
        </div>
        <button
          onClick={handleAdd}
          style={{
            padding: '0.375rem 0.875rem',
            backgroundColor: '#10b981',
            color: 'white',
            fontSize: '0.875rem',
            fontWeight: 500,
            borderRadius: '0.375rem',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#059669'
            e.currentTarget.style.transform = 'scale(1.05)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#10b981'
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          + 추가
        </button>
      </div>

      {timeRanges.length > 0 ? (
        <div className="space-y-2">
          <div className="text-xs text-gray-600 mb-2 font-medium">추가된 시간대:</div>
          {timeRanges.map((range, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-green-100 px-3 py-2 rounded"
              style={{
                border: '1px solid #86efac',
                transition: 'all 0.2s'
              }}
            >
              <span className="text-sm font-medium text-green-900">{range}</span>
              <button
                onClick={() => onRemove(day, index)}
                style={{
                  fontSize: '0.75rem',
                  color: '#dc2626',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#991b1b'
                  e.currentTarget.style.textDecoration = 'underline'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#dc2626'
                  e.currentTarget.style.textDecoration = 'none'
                }}
              >
                ✕ 삭제
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-xs text-gray-400 italic">
          시간대를 추가해주세요
        </div>
      )}
    </div>
  )
}
