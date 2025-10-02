'use client'

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-light flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-6xl">🔍</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          페이지를 찾을 수 없습니다
        </h2>
        <p className="text-gray-600 mb-8">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          <br />
          주소를 다시 확인하거나 아래 버튼을 이용해 주세요.
        </p>
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full bg-aipoten-green text-white py-3 px-6 rounded-md hover:bg-aipoten-navy transition-colors font-medium"
          >
            홈으로 돌아가기
          </Link>
          <Link
            href="/dashboard"
            className="block w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-300 transition-colors font-medium"
          >
            대시보드로 이동
          </Link>
          <button
            onClick={() => window.history.back()}
            className="block w-full bg-white border border-gray-300 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-50 transition-colors font-medium"
          >
            이전 페이지로
          </button>
        </div>
      </div>
    </div>
  )
}