'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface Child {
  id: string
  name: string
  gender: string
  birthDate: string
}

interface ChildEditModalProps {
  child: Child
  isOpen: boolean
  onClose: () => void
  onSave: (updatedChild: Child) => void
}

export default function ChildEditModal({ child, isOpen, onClose, onSave }: ChildEditModalProps) {
  const [name, setName] = useState(child.name)
  const [gender, setGender] = useState(child.gender)
  const [birthDate, setBirthDate] = useState(child.birthDate.split('T')[0])
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setName(child.name)
      setGender(child.gender)
      setBirthDate(child.birthDate.split('T')[0])
      setError('')
    }
  }, [isOpen, child])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSaving(true)

    try {
      const response = await fetch(`/api/children/${child.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          gender,
          birthDate: new Date(birthDate).toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error('아이 정보 수정에 실패했습니다.')
      }

      const updatedChild = await response.json()
      onSave(updatedChild)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">아이 정보 수정</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* 이름 */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aipoten-green focus:border-transparent"
              placeholder="아이 이름을 입력하세요"
            />
          </div>

          {/* 성별 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              성별 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="MALE"
                  checked={gender === 'MALE'}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-4 h-4 text-aipoten-green focus:ring-aipoten-green"
                />
                <span className="ml-2 text-sm text-gray-700">남아</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="FEMALE"
                  checked={gender === 'FEMALE'}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-4 h-4 text-aipoten-green focus:ring-aipoten-green"
                />
                <span className="ml-2 text-sm text-gray-700">여아</span>
              </label>
            </div>
          </div>

          {/* 생년월일 */}
          <div>
            <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
              생년월일 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="birthDate"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aipoten-green focus:border-transparent"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-4 py-2 bg-aipoten-green text-white rounded-md hover:bg-aipoten-navy transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
