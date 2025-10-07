'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function BoardsPage() {
  const router = useRouter()

  useEffect(() => {
    // /boards로 직접 접근 시 community로 리다이렉트
    router.replace('/boards/community')
  }, [router])

  return null
}
