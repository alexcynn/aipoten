'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Child {
  id: string
  name: string
  birthDate: string
  gender: string
}

interface ChildSelectorProps {
  children: Child[]
  selectedChildId: string
  onSelectChild: (childId: string) => void
}

export default function ChildSelector({
  children,
  selectedChildId,
  onSelectChild,
}: ChildSelectorProps) {
  // 1명이면 선택기 숨김 (화살표 없이 정보만 표시)
  if (children.length === 0) return null

  const selectedIndex = children.findIndex((child) => child.id === selectedChildId)
  const selectedChild = children[selectedIndex] || children[0]

  // 나이 계산 (개월수)
  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate)
    const today = new Date()
    const ageInMonths =
      (today.getFullYear() - birth.getFullYear()) * 12 +
      (today.getMonth() - birth.getMonth())

    if (ageInMonths < 12) {
      return `${ageInMonths}개월`
    } else {
      const years = Math.floor(ageInMonths / 12)
      const months = ageInMonths % 12
      return months > 0 ? `${years}세 ${months}개월` : `${years}세`
    }
  }

  const handlePrevious = () => {
    const prevIndex = selectedIndex > 0 ? selectedIndex - 1 : children.length - 1
    onSelectChild(children[prevIndex].id)
  }

  const handleNext = () => {
    const nextIndex = selectedIndex < children.length - 1 ? selectedIndex + 1 : 0
    onSelectChild(children[nextIndex].id)
  }

  // 1명만 있으면 화살표 없이 정보만 표시
  if (children.length === 1) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="text-center">
          <div className="text-xl font-bold text-gray-900">{selectedChild.name}</div>
          <div className="text-sm text-gray-600">
            {calculateAge(selectedChild.birthDate)} •{' '}
            {selectedChild.gender === 'MALE' ? '남아' : '여아'}
          </div>
        </div>
      </div>
    )
  }

  // 2명 이상이면 화살표와 함께 표시
  return (
    <div className="flex items-center justify-center py-4 space-x-4">
      {/* 이전 버튼 */}
      <button
        onClick={handlePrevious}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="이전 아이"
      >
        <ChevronLeft className="w-6 h-6 text-gray-600" />
      </button>

      {/* 선택된 아이 정보 */}
      <div className="text-center min-w-[200px]">
        <div className="text-xl font-bold text-gray-900">{selectedChild.name}</div>
        <div className="text-sm text-gray-600">
          {calculateAge(selectedChild.birthDate)} •{' '}
          {selectedChild.gender === 'MALE' ? '남아' : '여아'}
        </div>
        <div className="text-xs text-gray-400 mt-1">
          {selectedIndex + 1} / {children.length}
        </div>
      </div>

      {/* 다음 버튼 */}
      <button
        onClick={handleNext}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="다음 아이"
      >
        <ChevronRight className="w-6 h-6 text-gray-600" />
      </button>
    </div>
  )
}
