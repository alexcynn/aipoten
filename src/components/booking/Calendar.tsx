'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CalendarProps {
  availableDates: string[] // YYYY-MM-DD 형식의 예약 가능한 날짜들
  selectedDate: string | null
  onDateSelect: (date: string) => void
}

export default function Calendar({ availableDates, selectedDate, onDateSelect }: CalendarProps) {
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

  // 날짜 클릭 핸들러
  const handleDateClick = (date: Date) => {
    const dateStr = formatDate(date)
    const dateObj = new Date(date)
    dateObj.setHours(0, 0, 0, 0)

    // 과거 날짜는 선택 불가
    if (dateObj < today) return

    // 예약 가능한 날짜만 선택 가능
    if (!availableDates.includes(dateStr)) return

    onDateSelect(dateStr)
  }

  const days = getDaysInMonth()
  const weekDays = ['일', '월', '화', '수', '목', '금', '토']

  return (
    <div className="w-full max-w-md mx-auto">
      {/* 월 네비게이션 */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          type="button"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>

        <h3 className="text-lg font-semibold text-gray-900">
          {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
        </h3>

        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          type="button"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day, index) => (
          <div
            key={day}
            className={`text-center text-sm font-medium py-2 ${
              index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-gray-700'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          const dateStr = formatDate(date)
          const isCurrentMonth = date.getMonth() === currentMonth.getMonth()
          const dateObj = new Date(date)
          dateObj.setHours(0, 0, 0, 0)
          const isPast = dateObj < today
          const isAvailable = availableDates.includes(dateStr)
          const isSelected = dateStr === selectedDate
          const isToday = formatDate(today) === dateStr
          const isSunday = date.getDay() === 0
          const isSaturday = date.getDay() === 6

          return (
            <button
              key={index}
              onClick={() => handleDateClick(date)}
              disabled={isPast || !isAvailable}
              type="button"
              className={`
                relative aspect-square p-2 text-sm rounded-md transition-all
                ${!isCurrentMonth ? 'text-gray-300' : ''}
                ${isPast || !isAvailable ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}
                ${isAvailable && !isPast ? 'hover:bg-[#FFE5E5]' : ''}
                ${isSelected ? 'bg-[#FF6A00] text-white font-bold hover:bg-[#E55F00]' : ''}
                ${!isSelected && isToday ? 'border-2 border-[#FF6A00]' : ''}
                ${!isSelected && isSunday && isCurrentMonth ? 'text-red-600' : ''}
                ${!isSelected && isSaturday && isCurrentMonth ? 'text-blue-600' : ''}
                ${!isSelected && !isSunday && !isSaturday && isCurrentMonth ? 'text-gray-900' : ''}
              `}
            >
              {date.getDate()}

              {/* 예약 가능한 날짜 표시 */}
              {isAvailable && !isSelected && !isPast && (
                <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#FF6A00] rounded-full"></span>
              )}
            </button>
          )
        })}
      </div>

      {/* 범례 */}
      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-[#FF6A00] rounded-full"></span>
          <span>예약 가능</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-4 h-4 border-2 border-[#FF6A00] rounded"></span>
          <span>오늘</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-4 h-4 bg-[#FF6A00] rounded"></span>
          <span>선택됨</span>
        </div>
      </div>
    </div>
  )
}
