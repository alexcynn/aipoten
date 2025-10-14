/**
 * ADMIN 전용 API 테스트
 *
 * 테스트 방법:
 * 1. 로그인하지 않고 접근 → 401 Unauthorized
 * 2. PARENT로 로그인하고 접근 → 403 Forbidden
 * 3. THERAPIST로 로그인하고 접근 → 403 Forbidden
 * 4. ADMIN으로 로그인하고 접근 → 200 OK
 */

import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'

export async function GET() {
  const { error, user } = await requireAdmin()

  if (error) {
    return error
  }

  return NextResponse.json({
    message: 'ADMIN 권한 확인 완료!',
    user: {
      id: user?.id,
      email: user?.email,
      name: user?.name,
      role: user?.role,
    },
  })
}
