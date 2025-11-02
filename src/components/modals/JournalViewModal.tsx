'use client'

import { useEffect, useState } from 'react'
import { X, FileText } from 'lucide-react'

interface JournalData {
  journal: string | null
  booking: {
    id: string
    sessionNumber: number
    status: string
    scheduledAt: string
    therapist: {
      name: string
      email: string
    }
    parent: {
      name: string
      email: string
    }
    child: {
      name: string
    }
    sessionType: string
  }
}

interface JournalViewModalProps {
  bookingId: string | null
  isOpen: boolean
  onClose: () => void
}

export default function JournalViewModal({ bookingId, isOpen, onClose }: JournalViewModalProps) {
  const [data, setData] = useState<JournalData | null>(null)
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
      fetchJournal()
    }
  }, [isOpen, bookingId])

  const fetchJournal = async () => {
    if (!bookingId) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/journal`)
      if (response.ok) {
        const journalData = await response.json()
        setData(journalData)
      } else {
        const errorData = await response.json()
        setError(errorData.error || '상담일지를 불러오는데 실패했습니다.')
      }
    } catch (error) {
      console.error('상담일지 조회 오류:', error)
      setError('상담일지를 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  const sessionTypeLabel = data?.booking.sessionType === 'CONSULTATION' ? '언어 컨설팅' : '홈티'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="text-aipoten-green" size={24} />
              <h2 className="text-xl font-bold text-gray-900">상담일지</h2>
            </div>
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
          ) : !data?.journal ? (
            <div className="text-center py-12">
              <FileText className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">작성된 상담일지가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* 세션 정보 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">세션 정보</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">세션 유형:</span>
                    <span className="ml-2 font-medium text-gray-900">{sessionTypeLabel}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">세션 번호:</span>
                    <span className="ml-2 font-medium text-gray-900">{data.booking.sessionNumber}회차</span>
                  </div>
                  <div>
                    <span className="text-gray-500">치료사:</span>
                    <span className="ml-2 font-medium text-gray-900">{data.booking.therapist.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">아이:</span>
                    <span className="ml-2 font-medium text-gray-900">{data.booking.child.name}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">세션 일시:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {new Date(data.booking.scheduledAt).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* 상담일지 내용 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">상담일지 내용</h3>
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                    {data.journal}
                  </p>
                </div>
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
