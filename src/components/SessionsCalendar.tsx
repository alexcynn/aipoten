'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getParentViewStatus, getStatusDotColor } from '@/lib/booking-status'
import Image from 'next/image'

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
  variant?: 'default' | 'parent' // 부모용 스타일 옵션
}

export default function SessionsCalendar({ sessions, onEventClick, variant = 'default' }: SessionsCalendarProps) {
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
      <div className={`flex items-center justify-between ${variant === 'parent' ? 'mb-6' : 'mb-4'}`}>
        <button
          onClick={previousMonth}
          className={`${variant === 'parent' ? 'w-[50px] h-[50px]' : 'p-2'} hover:bg-[#FFE5E5] rounded-[10px] transition-colors flex items-center justify-center`}
          type="button"
        >
          <ChevronLeft className={`${variant === 'parent' ? 'w-6 h-6' : 'w-5 h-5'} text-stone-600 hover:text-[#FF6A00]`} />
        </button>

        <h3 className={`${variant === 'parent' ? 'text-[24px]' : 'text-base sm:text-lg md:text-xl'} font-semibold text-[#1e1307]`}>
          {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
        </h3>

        <button
          onClick={nextMonth}
          className={`${variant === 'parent' ? 'w-[50px] h-[50px]' : 'p-2'} hover:bg-[#FFE5E5] rounded-[10px] transition-colors flex items-center justify-center`}
          type="button"
        >
          <ChevronRight className={`${variant === 'parent' ? 'w-6 h-6' : 'w-5 h-5'} text-stone-600 hover:text-[#FF6A00]`} />
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className={`grid grid-cols-7 ${variant === 'parent' ? 'gap-0' : 'gap-1'} mb-2`}>
        {weekDays.map((day, index) => (
          <div
            key={day}
            className={`text-center ${variant === 'parent' ? 'text-[24px] py-4 w-[80px]' : 'text-xs sm:text-sm py-2'} font-normal ${
              index === 0 ? 'text-[#eb2e2e]' : 'text-[#1e1307]'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className={`grid grid-cols-7 ${variant === 'parent' ? 'gap-0' : 'gap-1'}`}>
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
                relative ${variant === 'parent' ? 'min-h-[140px] w-[80px] p-2' : 'min-h-[80px] p-1'} text-sm ${variant === 'parent' ? '' : 'border border-gray-200 rounded-md'} transition-all
                ${!isCurrentMonth ? (variant === 'parent' ? 'opacity-20' : 'bg-gray-50') : (variant === 'parent' ? '' : 'bg-white')}
                ${isToday && variant !== 'parent' ? 'border-2 border-[#FF6A00] bg-[#FFE5E5]/30' : ''}
              `}
            >
              {/* 날짜 */}
              {isToday && variant === 'parent' ? (
                <div className="flex items-center justify-center mb-2">
                  <div className="bg-[#FF6A00] rounded-full w-[40px] h-[40px] flex items-center justify-center">
                    <span className="text-[24px] font-bold text-white">{date.getDate()}</span>
                  </div>
                </div>
              ) : (
                <div
                  className={`${variant === 'parent' ? 'text-[24px] text-center mb-2' : 'text-xs mb-1'} font-normal ${
                    !isCurrentMonth ? (variant === 'parent' ? 'text-[#1e1307]' : 'text-gray-300') :
                    isToday && variant !== 'parent' ? 'text-[#FF6A00]' :
                    isSunday ? 'text-[#eb2e2e]' :
                    'text-[#1e1307]'
                  }`}
                >
                  {date.getDate()}
                </div>
              )}

              {/* 세션 목록 */}
              {hasSession && (
                <div className={`${variant === 'parent' ? 'space-y-1' : 'space-y-0.5'} flex flex-col items-center`}>
                  {daySessions.slice(0, variant === 'parent' ? 3 : 2).map((session) => {
                    const sessionTypeBg = session.sessionType === 'CONSULTATION'
                      ? 'bg-[#ffdbdb]'
                      : 'bg-[#ffeacd]'

                    const sessionIcon = session.sessionType === 'CONSULTATION'
                      ? '/images/icon-language-consulting-16.svg'
                      : '/images/icon-home-therapy-16.svg'

                    const statusInfo = getParentViewStatus(session.status, session.payment?.status)
                    const dotColor = getStatusDotColor(session.payment?.status === 'PENDING_PAYMENT' ? 'PENDING_PAYMENT' : session.status)

                    // 시간 추출
                    const sessionTime = new Date(session.scheduledAt).toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    })

                    if (variant === 'parent') {
                      return (
                        <div
                          key={session.id}
                          className={`text-[14px] px-[7px] h-[24px] rounded-[10px] ${sessionTypeBg} text-[#1e1307] tracking-[-0.28px] flex items-center gap-1 ${
                            onEventClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
                          }`}
                          title={`${session.child.name} - ${session.therapist?.user.name || '치료사'} (${session.sessionType === 'CONSULTATION' ? '언어컨설팅' : '홈티'}) [${statusInfo.label}]`}
                          onClick={() => onEventClick?.(session.id)}
                        >
                          <span className={`w-[9px] h-[9px] rounded-full flex-shrink-0 ${dotColor}`}></span>
                          <Image
                            src={sessionIcon}
                            alt=""
                            width={14}
                            height={14}
                            className="flex-shrink-0"
                          />
                          <span className="whitespace-nowrap">{sessionTime}</span>
                        </div>
                      )
                    }

                    return (
                      <div
                        key={session.id}
                        className={`text-[11px] px-2 py-0.5 rounded-full ${sessionTypeBg} text-[#1e1307] truncate flex items-center gap-0.5 ${
                          onEventClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
                        }`}
                        title={`${session.child.name} - ${session.therapist?.user.name || '치료사'} (${session.sessionType === 'CONSULTATION' ? '언어컨설팅' : '홈티'}) [${statusInfo.label}]`}
                        onClick={() => onEventClick?.(session.id)}
                      >
                        <span className={`w-[6.75px] h-[6.75px] rounded-full flex-shrink-0 ${dotColor}`}></span>
                        <Image
                          src={sessionIcon}
                          alt=""
                          width={12}
                          height={12}
                          className="flex-shrink-0"
                        />
                        <span className="truncate">{sessionTime} | {session.child.name}</span>
                      </div>
                    )
                  })}
                  {daySessions.length > (variant === 'parent' ? 3 : 2) && (
                    <div className={`${variant === 'parent' ? 'text-[15px] tracking-[-0.3px] px-[10px] h-[24px] rounded-[10px]' : 'text-[11px] px-2 py-0.5 rounded-full'} text-[#1e1307] bg-[#f3f3f3] text-center flex items-center justify-center`}>
                      +{daySessions.length - (variant === 'parent' ? 3 : 2)}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
