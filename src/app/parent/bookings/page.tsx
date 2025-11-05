'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * 레거시 페이지 - 언어컨설팅 페이지로 리다이렉트
 *
 * 이전: /parent/bookings - 통합 예약 목록
 * 현재: /parent/consultations - 언어컨설팅
 *       /parent/therapies - 홈티
 *       /parent/payments - 결제 내역
 */
export default function BookingsRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    // 언어컨설팅 페이지로 리다이렉트
    router.replace('/parent/consultations')
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">페이지 이동 중...</p>
      </div>
    </div>
  )
}
