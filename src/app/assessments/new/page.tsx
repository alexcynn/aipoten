'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AssessmentsNewRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.push('/parent/assessments/new')
  }, [router])

  return (
    <div className="min-h-screen bg-neutral-light flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aipoten-green mx-auto"></div>
        <p className="mt-4 text-gray-600">페이지 이동 중...</p>
      </div>
    </div>
  )
}
