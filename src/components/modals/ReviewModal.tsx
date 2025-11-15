'use client'

import { useEffect, useState } from 'react'
import { X, Star } from 'lucide-react'

interface Review {
  id: string
  rating: number
  content: string | null
  createdAt: string
}

interface ReviewModalProps {
  bookingId: string | null
  existingReview: Review | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function ReviewModal({
  bookingId,
  existingReview,
  isOpen,
  onClose,
  onSuccess
}: ReviewModalProps) {
  const [rating, setRating] = useState(5)
  const [content, setContent] = useState('')
  const [hoveredRating, setHoveredRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditMode = !!existingReview

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'

      // Pre-fill existing review data
      if (existingReview) {
        setRating(existingReview.rating)
        setContent(existingReview.content || '')
      } else {
        setRating(5)
        setContent('')
      }
      setError(null)
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, existingReview])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!bookingId) {
      setError('예약 정보를 찾을 수 없습니다.')
      return
    }

    if (rating < 1 || rating > 5) {
      setError('별점을 선택해주세요.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/parent/bookings/${bookingId}/review`, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          content: content.trim() || undefined
        })
      })

      if (response.ok) {
        onSuccess()
        onClose()
      } else {
        const errorData = await response.json()
        setError(errorData.error || '후기 작성에 실패했습니다.')
      }
    } catch (error) {
      console.error('후기 작성 오류:', error)
      setError('후기 작성 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

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
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {isEditMode ? '후기 수정' : '후기 작성'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isSubmitting}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-6">
          <div className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* 평점 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                별점 <span className="text-red-500">*</span>
              </label>
              <div
                className="flex items-center space-x-2"
                onMouseLeave={() => setHoveredRating(0)}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      size={40}
                      className={
                        star <= (hoveredRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }
                    />
                  </button>
                ))}
                <span className="ml-3 text-2xl font-bold text-gray-900">
                  {rating}.0
                </span>
              </div>
            </div>

            {/* 후기 내용 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                후기 내용 (선택)
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                placeholder="치료 경험을 자유롭게 작성해주세요..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6A00] resize-none"
                disabled={isSubmitting}
              />
              <p className="mt-1 text-sm text-gray-500">
                {content.length}자
              </p>
            </div>

            {/* Info Message */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                작성하신 후기는 다른 부모님들께 큰 도움이 됩니다.
                {isEditMode && ' 수정 후에는 수정일이 표시됩니다.'}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white pt-6 mt-6 border-t border-gray-200 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting || rating < 1}
              className="flex-1 px-4 py-2 bg-[#FF6A00] text-white rounded-md hover:bg-[#E55F00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '저장 중...' : isEditMode ? '수정하기' : '작성하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
