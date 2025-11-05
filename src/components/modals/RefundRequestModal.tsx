'use client'

import { useEffect, useState } from 'react'
import { X, AlertCircle } from 'lucide-react'

interface RefundRequestModalProps {
  paymentId: string | null
  paymentAmount: number
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function RefundRequestModal({
  paymentId,
  paymentAmount,
  isOpen,
  onClose,
  onSuccess
}: RefundRequestModalProps) {
  const [reason, setReason] = useState('')
  const [requestedAmount, setRequestedAmount] = useState(paymentAmount)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setReason('')
      setRequestedAmount(paymentAmount)
      setError(null)
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, paymentAmount])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!paymentId) {
      setError('결제 정보를 찾을 수 없습니다.')
      return
    }

    if (!reason.trim()) {
      setError('환불 사유를 입력해주세요.')
      return
    }

    if (requestedAmount <= 0 || requestedAmount > paymentAmount) {
      setError(`환불 요청 금액은 1원 이상 ${paymentAmount.toLocaleString()}원 이하여야 합니다.`)
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/parent/payments/${paymentId}/refund-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: reason.trim(),
          requestedAmount
        })
      })

      if (response.ok) {
        onSuccess()
        onClose()
      } else {
        const errorData = await response.json()
        setError(errorData.error || '환불 요청에 실패했습니다.')
      }
    } catch (error) {
      console.error('환불 요청 오류:', error)
      setError('환불 요청 중 오류가 발생했습니다.')
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
            <h2 className="text-xl font-bold text-gray-900">환불 요청</h2>
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

            {/* Warning Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="text-yellow-600 flex-shrink-0" size={20} />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">환불 요청 전 확인사항</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>환불 요청은 관리자 검토 후 승인됩니다.</li>
                    <li>승인된 환불은 3-5 영업일 이내에 처리됩니다.</li>
                    <li>세션 진행 상황에 따라 부분 환불이 적용될 수 있습니다.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 환불 요청 금액 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                환불 요청 금액 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={requestedAmount}
                  onChange={(e) => setRequestedAmount(Number(e.target.value))}
                  min={1}
                  max={paymentAmount}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  disabled={isSubmitting}
                  required
                />
                <span className="absolute right-3 top-2 text-gray-500">원</span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                결제 금액: {paymentAmount.toLocaleString()}원 (최대 환불 가능 금액)
              </p>
            </div>

            {/* 환불 사유 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                환불 사유 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={6}
                placeholder="환불을 요청하시는 자세한 사유를 입력해주세요..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                disabled={isSubmitting}
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                {reason.length}자 / 최소 10자 이상 입력해주세요
              </p>
            </div>

            {/* Info Message */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                환불 요청이 접수되면 담당자가 검토 후 연락드리겠습니다.
                궁금하신 사항은 1:1 문의를 통해 문의해주세요.
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
              disabled={isSubmitting || reason.length < 10}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '요청 중...' : '환불 요청하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
