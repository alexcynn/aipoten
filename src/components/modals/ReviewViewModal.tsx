'use client'

import { useEffect, useState } from 'react'
import { X, Star } from 'lucide-react'

interface Review {
  id: string
  rating: number
  content: string | null
  createdAt: string
}

interface ReviewViewModalProps {
  bookingId: string | null
  isOpen: boolean
  onClose: () => void
}

export default function ReviewViewModal({ bookingId, isOpen, onClose }: ReviewViewModalProps) {
  const [review, setReview] = useState<Review | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  useEffect(() => {
    if (isOpen && bookingId) {
      fetchReview()
    }
  }, [isOpen, bookingId])

  const fetchReview = async () => {
    if (!bookingId) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/review`)
      if (response.ok) {
        const data = await response.json()
        setReview(data.review)
      } else {
        const errorData = await response.json()
        setError(errorData.error || '리뷰를 불러오는데 실패했습니다.')
      }
    } catch (error) {
      console.error('리뷰 조회 오류:', error)
      setError('리뷰를 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
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
            <h2 className="text-xl font-bold text-gray-900">리뷰 보기</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aipoten-green mx-auto"></div>
              <p className="mt-4 text-gray-600">로딩 중...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
            </div>
          ) : !review ? (
            <div className="text-center py-12">
              <p className="text-gray-500">작성된 리뷰가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* 평점 */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">평점</h3>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={32}
                      className={
                        star <= review.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }
                    />
                  ))}
                  <span className="ml-3 text-2xl font-bold text-gray-900">
                    {review.rating}.0
                  </span>
                </div>
              </div>

              {/* 리뷰 내용 */}
              {review.content && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">리뷰 내용</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                      {review.content}
                    </p>
                  </div>
                </div>
              )}

              {/* 작성일 */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">작성일</h3>
                <p className="text-gray-900">
                  {new Date(review.createdAt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
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
