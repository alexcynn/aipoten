'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getParentViewStatus, getStatusDotColor } from '@/lib/booking-status'

interface Session {
  id: string
  scheduledAt: string
  sessionType: 'CONSULTATION' | 'THERAPY'
  status: string
  child: {
    id: string
    name: string
  }
  therapist?: {
    user: {
      name: string
    }
  }
  payment?: {
    status: string
  }
}

interface SessionsCalendarProps {
  sessions: Session[]
  onEventClick?: (sessionId: string) => void
}

export default function SessionsCalendar({ sessions, onEventClick }: SessionsCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // 달력에 표시할 날짜들 생성
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    // 이번 달의 첫날과 마지막날
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    // 달력 시작일 (이전 달 날짜 포함)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    // 달력 종료일 (다음 달 날짜 포함)
    const endDate = new Date(lastDay)
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()))

    const days = []
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      days.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return days
  }

  // 날짜를 YYYY-MM-DD 형식으로 변환
  const formatDate = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // 특정 날짜의 세션 가져오기
  const getSessionsForDate = (date: Date): Session[] => {
    const dateStr = formatDate(date)
    return sessions.filter(session => {
      const sessionDate = formatDate(new Date(session.scheduledAt))
      return sessionDate === dateStr
    })
  }

  // 오늘 날짜
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // 이전 달로 이동
  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  // 다음 달로 이동
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const days = getDaysInMonth()
  const weekDays = ['일', '월', '화', '수', '목', '금', '토']

  return (
    <div className="w-full font-pretendard">
      {/* 월 네비게이션 */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-[#FFE5E5] rounded-[10px] transition-colors"
          type="button"
        >
          <ChevronLeft className="w-5 h-5 text-stone-600 hover:text-[#FF6A00]" />
        </button>

        <h3 className="text-base sm:text-lg md:text-xl font-bold text-stone-900">
          {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
        </h3>

        <button
          onClick={nextMonth}
          className="p-2 hover:bg-[#FFE5E5] rounded-[10px] transition-colors"
          type="button"
        >
          <ChevronRight className="w-5 h-5 text-stone-600 hover:text-[#FF6A00]" />
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day, index) => (
          <div
            key={day}
            className={`text-center text-xs sm:text-sm font-bold py-2 ${
              index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-stone-700'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          const isCurrentMonth = date.getMonth() === currentMonth.getMonth()
          const dateObj = new Date(date)
          dateObj.setHours(0, 0, 0, 0)
          const isToday = formatDate(today) === formatDate(date)
          const isSunday = date.getDay() === 0
          const isSaturday = date.getDay() === 6
          const daySessions = getSessionsForDate(date)
          const hasSession = daySessions.length > 0

          return (
            <div
              key={index}
              className={`
                relative min-h-[80px] p-1 text-sm border border-gray-200 rounded-md transition-all
                ${!isCurrentMonth ? 'bg-gray-50' : 'bg-white'}
                ${isToday ? 'border-2 border-[#FF6A00] bg-[#FFE5E5]/30' : ''}
              `}
            >
              {/* 날짜 */}
              <div
                className={`text-xs font-bold mb-1 ${
                  !isCurrentMonth ? 'text-gray-300' :
                  isToday ? 'text-[#FF6A00]' :
                  isSunday ? 'text-red-600' :
                  isSaturday ? 'text-blue-600' :
                  'text-stone-900'
                }`}
              >
                {date.getDate()}
              </div>

              {/* 세션 목록 */}
              {hasSession && (
                <div className="space-y-0.5">
                  {daySessions.slice(0, 3).map((session) => {
                    const sessionTypeColor = session.sessionType === 'CONSULTATION'
                      ? 'bg-blue-100 text-blue-800 border-blue-300'
                      : 'bg-green-100 text-green-800 border-green-300'

                    const statusInfo = getParentViewStatus(session.status, session.payment?.status)
                    const dotColor = getStatusDotColor(session.payment?.status === 'PENDING_PAYMENT' ? 'PENDING_PAYMENT' : session.status)

                    return (
                      <div
                        key={session.id}
                        className={`text-xs px-1 py-0.5 rounded border ${sessionTypeColor} truncate flex items-center gap-1 ${
                          onEventClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
                        }`}
                        title={`${session.child.name} - ${session.therapist?.user.name || '치료사'} (${session.sessionType === 'CONSULTATION' ? '언어컨설팅' : '홈티'}) [${statusInfo.label}]`}
                        onClick={() => onEventClick?.(session.id)}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor}`}></span>
                        <span className="truncate">{session.child.name}</span>
                      </div>
                    )
                  })}
                  {daySessions.length > 3 && (
                    <div className="text-xs text-gray-500 px-1">
                      +{daySessions.length - 3}개 더
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* 범례 */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-center gap-4 text-xs text-stone-600">
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></span>
            <span>언어컨설팅</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 bg-green-100 border border-green-300 rounded"></span>
            <span>홈티</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 border-2 border-[#FF6A00] bg-[#FFE5E5]/30 rounded"></span>
            <span>오늘</span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-3 text-xs text-stone-600 flex-wrap">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
            <span>결제대기</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
            <span>예약대기</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span>예약확정</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>완료</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            <span>환불/취소</span>
          </div>
        </div>
      </div>
    </div>
  )
}
