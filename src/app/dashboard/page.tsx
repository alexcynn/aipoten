'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardRedirectPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    // 역할에 따른 리다이렉트
    if (session.user?.role === 'PARENT') {
      router.push('/parent/dashboard')
    } else if (session.user?.role === 'THERAPIST') {
      router.push('/therapist/dashboard')
    } else if (session.user?.role === 'ADMIN') {
      router.push('/admin/dashboard')
    } else {
      router.push('/parent/dashboard')
    }
  }, [session, status, router])

  return (
    <div className="min-h-screen bg-neutral-light flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aipoten-green mx-auto"></div>
        <p className="mt-4 text-gray-600">대시보드로 이동 중...</p>
      </div>
    </div>
  )
}
