'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-neutral-light flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">💥</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          문제가 발생했습니다
        </h1>
        <p className="text-gray-600 mb-6">
          페이지를 불러오는 중 오류가 발생했습니다.
          <br />
          잠시 후 다시 시도해주세요.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <details className="mb-6 text-left bg-gray-50 p-4 rounded-md">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
              개발자 정보 (개발 모드에서만 표시)
            </summary>
            <pre className="text-xs text-red-600 overflow-auto">
              {error.message}
            </pre>
            {error.digest && (
              <p className="text-xs text-gray-500 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </details>
        )}

        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full bg-aipoten-green text-white py-3 px-6 rounded-md hover:bg-aipoten-navy transition-colors font-medium"
          >
            다시 시도
          </button>
          <Link
            href="/dashboard"
            className="block w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-300 transition-colors font-medium"
          >
            대시보드로 이동
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-50 transition-colors font-medium"
          >
            페이지 새로고침
          </button>
        </div>
      </div>
    </div>
  )
}