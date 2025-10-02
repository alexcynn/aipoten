'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface TimeSlot {
  id?: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive: boolean
}

interface BlockedDate {
  id?: string
  date: string
  reason: string
}

const DAYS_OF_WEEK = [
  { value: 0, label: '일요일' },
  { value: 1, label: '월요일' },
  { value: 2, label: '화요일' },
  { value: 3, label: '수요일' },
  { value: 4, label: '목요일' },
  { value: 5, label: '금요일' },
  { value: 6, label: '토요일' }
]

const TIME_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0')
  return `${hour}:00`
})

export default function TherapistSchedulePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [schedule, setSchedule] = useState<TimeSlot[]>([])
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')

  // New time slot form
  const [newSlot, setNewSlot] = useState({
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '10:00'
  })

  // Blocked date form
  const [newBlockedDate, setNewBlockedDate] = useState({
    date: '',
    reason: ''
  })

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

    fetchSchedule()
  }, [session, status, router])

  const fetchSchedule = async () => {
    try {
      const [scheduleRes, blockedRes] = await Promise.all([
        fetch('/api/therapist/schedule'),
        fetch('/api/therapist/blocked-dates')
      ])

      if (scheduleRes.ok) {
        const scheduleData = await scheduleRes.json()
        setSchedule(scheduleData)
      }

      if (blockedRes.ok) {
        const blockedData = await blockedRes.json()
        setBlockedDates(blockedData)
      }
    } catch (error) {
      console.error('스케줄 조회 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddTimeSlot = async () => {
    if (newSlot.startTime >= newSlot.endTime) {
      setMessage('종료 시간은 시작 시간보다 늦어야 합니다.')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/therapist/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSlot)
      })

      if (response.ok) {
        setMessage('시간대가 추가되었습니다.')
        setNewSlot({ dayOfWeek: 1, startTime: '09:00', endTime: '10:00' })
        fetchSchedule()
      } else {
        const result = await response.json()
        setMessage(result.error || '시간대 추가 중 오류가 발생했습니다.')
      }
    } catch (error) {
      setMessage('시간대 추가 중 오류가 발생했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleSlot = async (slotId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/therapist/schedule/${slotId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive })
      })

      if (response.ok) {
        fetchSchedule()
      }
    } catch (error) {
      console.error('스케줄 토글 오류:', error)
    }
  }

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm('이 시간대를 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/therapist/schedule/${slotId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setMessage('시간대가 삭제되었습니다.')
        fetchSchedule()
      }
    } catch (error) {
      console.error('스케줄 삭제 오류:', error)
    }
  }

  const handleAddBlockedDate = async () => {
    if (!newBlockedDate.date || !newBlockedDate.reason) {
      setMessage('날짜와 사유를 모두 입력해주세요.')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/therapist/blocked-dates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBlockedDate)
      })

      if (response.ok) {
        setMessage('휴무일이 추가되었습니다.')
        setNewBlockedDate({ date: '', reason: '' })
        fetchSchedule()
      } else {
        const result = await response.json()
        setMessage(result.error || '휴무일 추가 중 오류가 발생했습니다.')
      }
    } catch (error) {
      setMessage('휴무일 추가 중 오류가 발생했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteBlockedDate = async (dateId: string) => {
    if (!confirm('이 휴무일을 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/therapist/blocked-dates/${dateId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setMessage('휴무일이 삭제되었습니다.')
        fetchSchedule()
      }
    } catch (error) {
      console.error('휴무일 삭제 오류:', error)
    }
  }

  const getScheduleByDay = (dayOfWeek: number) => {
    return schedule
      .filter(slot => slot.dayOfWeek === dayOfWeek)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }

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

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/therapist" className="text-aipoten-green hover:text-aipoten-navy">
                ← 대시보드
              </Link>
              <h1 className="text-xl font-bold text-aipoten-navy">일정 관리</h1>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-gray-700">안녕하세요, {session.user?.name}님</span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-gray-600 hover:text-aipoten-green"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {message && (
            <div className={`mb-4 p-4 rounded-md ${
              message.includes('성공') || message.includes('추가') || message.includes('삭제')
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}>
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Weekly Schedule */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
                    주간 스케줄
                  </h3>

                  <div className="space-y-6">
                    {DAYS_OF_WEEK.map(day => (
                      <div key={day.value} className="border-b border-gray-200 pb-4 last:border-b-0">
                        <h4 className="text-md font-medium text-gray-900 mb-3">
                          {day.label}
                        </h4>

                        <div className="space-y-2">
                          {getScheduleByDay(day.value).length === 0 ? (
                            <p className="text-sm text-gray-500">설정된 시간이 없습니다.</p>
                          ) : (
                            getScheduleByDay(day.value).map(slot => (
                              <div key={slot.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                                <div className="flex items-center space-x-3">
                                  <span className="text-sm font-medium">
                                    {slot.startTime} - {slot.endTime}
                                  </span>
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    slot.isActive
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {slot.isActive ? '활성' : '비활성'}
                                  </span>
                                </div>

                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleToggleSlot(slot.id!, !slot.isActive)}
                                    className="text-sm text-aipoten-green hover:text-aipoten-navy"
                                  >
                                    {slot.isActive ? '비활성화' : '활성화'}
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSlot(slot.id!)}
                                    className="text-sm text-red-600 hover:text-red-800"
                                  >
                                    삭제
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Add Time Slot */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    시간대 추가
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">요일</label>
                      <select
                        value={newSlot.dayOfWeek}
                        onChange={(e) => setNewSlot({...newSlot, dayOfWeek: parseInt(e.target.value)})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-aipoten-green focus:border-aipoten-green"
                      >
                        {DAYS_OF_WEEK.map(day => (
                          <option key={day.value} value={day.value}>
                            {day.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">시작 시간</label>
                      <select
                        value={newSlot.startTime}
                        onChange={(e) => setNewSlot({...newSlot, startTime: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-aipoten-green focus:border-aipoten-green"
                      >
                        {TIME_OPTIONS.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">종료 시간</label>
                      <select
                        value={newSlot.endTime}
                        onChange={(e) => setNewSlot({...newSlot, endTime: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-aipoten-green focus:border-aipoten-green"
                      >
                        {TIME_OPTIONS.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={handleAddTimeSlot}
                      disabled={isSaving}
                      className="w-full bg-aipoten-green text-white py-2 px-4 rounded-md hover:bg-aipoten-navy disabled:opacity-50"
                    >
                      {isSaving ? '추가 중...' : '시간대 추가'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Add Blocked Date */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    휴무일 추가
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">날짜</label>
                      <input
                        type="date"
                        value={newBlockedDate.date}
                        onChange={(e) => setNewBlockedDate({...newBlockedDate, date: e.target.value})}
                        min={new Date().toISOString().split('T')[0]}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-aipoten-green focus:border-aipoten-green"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">사유</label>
                      <input
                        type="text"
                        value={newBlockedDate.reason}
                        onChange={(e) => setNewBlockedDate({...newBlockedDate, reason: e.target.value})}
                        placeholder="예: 개인 일정"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-aipoten-green focus:border-aipoten-green"
                      />
                    </div>

                    <button
                      onClick={handleAddBlockedDate}
                      disabled={isSaving}
                      className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      {isSaving ? '추가 중...' : '휴무일 추가'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Blocked Dates List */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    설정된 휴무일
                  </h3>

                  {blockedDates.length === 0 ? (
                    <p className="text-sm text-gray-500">설정된 휴무일이 없습니다.</p>
                  ) : (
                    <div className="space-y-3">
                      {blockedDates.map(blocked => (
                        <div key={blocked.id} className="flex items-center justify-between bg-red-50 p-3 rounded-md">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(blocked.date).toLocaleDateString('ko-KR')}
                            </p>
                            <p className="text-xs text-gray-600">{blocked.reason}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteBlockedDate(blocked.id!)}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            삭제
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}