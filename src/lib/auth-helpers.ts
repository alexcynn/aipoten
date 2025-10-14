import { getServerSession } from 'next-auth'
import { authOptions } from './auth-config'
import { NextResponse } from 'next/server'

/**
 * 현재 사용자의 세션 가져오기
 * API 라우트에서 사용
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user
}

/**
 * 인증된 사용자인지 확인
 */
export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized', message: '로그인이 필요합니다.' },
        { status: 401 }
      ),
      user: null,
    }
  }

  return { error: null, user }
}

/**
 * 특정 역할을 가진 사용자인지 확인
 */
export async function requireRole(allowedRoles: string[]) {
  const { error, user } = await requireAuth()

  if (error) {
    return { error, user: null }
  }

  if (!user?.role || !allowedRoles.includes(user.role)) {
    return {
      error: NextResponse.json(
        {
          error: 'Forbidden',
          message: '권한이 없습니다.',
          requiredRoles: allowedRoles,
        },
        { status: 403 }
      ),
      user: null,
    }
  }

  return { error: null, user }
}

/**
 * ADMIN 권한 확인
 */
export async function requireAdmin() {
  return requireRole(['ADMIN'])
}

/**
 * THERAPIST 또는 ADMIN 권한 확인
 */
export async function requireTherapist() {
  return requireRole(['THERAPIST', 'ADMIN'])
}

/**
 * PARENT 권한 확인 (부모 또는 관리자)
 */
export async function requireParent() {
  return requireRole(['PARENT', 'ADMIN'])
}
