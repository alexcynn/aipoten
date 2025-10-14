/**
 * RBAC 미들웨어 테스트용 API
 *
 * 테스트 방법:
 * 1. 로그인하지 않고 접근 → 401 Unauthorized
 * 2. PARENT로 로그인하고 접근 → 200 OK (인증된 사용자)
 * 3. THERAPIST로 로그인하고 접근 → 200 OK
 * 4. ADMIN으로 로그인하고 접근 → 200 OK
 */

import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-helpers'

export async function GET() {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized', message: '로그인이 필요합니다.' },
      { status: 401 }
    )
  }

  return NextResponse.json({
    message: '인증 성공!',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  })
}
