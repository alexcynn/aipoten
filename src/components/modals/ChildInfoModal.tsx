'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'

interface Child {
  id: string
  name: string
  birthDate: string
  gender: string
  gestationalWeeks: number | null
  birthWeight: number | null
  currentHeight: number | null
  currentWeight: number | null
  medicalHistory: string | null
  familyHistory: string | null
  treatmentHistory: string | null
  notes: string | null
}

interface ChildInfoModalProps {
  child: Child | null
  isOpen: boolean
  onClose: () => void
}

export default function ChildInfoModal({ child, isOpen, onClose }: ChildInfoModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen || !child) return null

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate)
    const today = new Date()
    const months = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth())
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12

    if (years > 0) {
      return `${years}세 ${remainingMonths}개월`
    }
    return `${months}개월`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">아이 상세 정보</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-6">
          {/* 기본 정보 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">기본 정보</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">이름</p>
                <p className="text-base font-medium text-gray-900">{child.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">성별</p>
                <p className="text-base font-medium text-gray-900">
                  {child.gender === 'MALE' ? '남' : '여'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">생년월일</p>
                <p className="text-base font-medium text-gray-900">
                  {new Date(child.birthDate).toLocaleDateString('ko-KR')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">나이</p>
                <p className="text-base font-medium text-gray-900">
                  {calculateAge(child.birthDate)}
                </p>
              </div>
            </div>
          </div>

          {/* 출생 정보 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">출생 정보</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">출산 주수</p>
                <p className="text-base font-medium text-gray-900">
                  {child.gestationalWeeks ? `${child.gestationalWeeks}주` : '정보 없음'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">출생 시 몸무게</p>
                <p className="text-base font-medium text-gray-900">
                  {child.birthWeight ? `${child.birthWeight}kg` : '정보 없음'}
                </p>
              </div>
            </div>
          </div>

          {/* 현재 신체 정보 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">현재 신체 정보</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">키</p>
                <p className="text-base font-medium text-gray-900">
                  {child.currentHeight ? `${child.currentHeight}cm` : '정보 없음'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">몸무게</p>
                <p className="text-base font-medium text-gray-900">
                  {child.currentWeight ? `${child.currentWeight}kg` : '정보 없음'}
                </p>
              </div>
            </div>
          </div>

          {/* 의료 정보 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">의료 정보</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 mb-1">병력/수술력</p>
                <p className="text-base text-gray-900 whitespace-pre-wrap">
                  {child.medicalHistory || '정보 없음'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">가족력</p>
                <p className="text-base text-gray-900 whitespace-pre-wrap">
                  {child.familyHistory || '정보 없음'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">치료력</p>
                <p className="text-base text-gray-900 whitespace-pre-wrap">
                  {child.treatmentHistory || '정보 없음'}
                </p>
              </div>
            </div>
          </div>

          {/* 특이사항 */}
          {child.notes && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">특이사항</h3>
              <p className="text-base text-gray-900 whitespace-pre-wrap">{child.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}
