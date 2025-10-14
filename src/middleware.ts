import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

/**
 * Role-Based Access Control (RBAC) Middleware
 *
 * 역할별 API 접근 제어:
 * - /api/therapist/* → THERAPIST, ADMIN만
 * - /api/admin/* → ADMIN만
 * - /api/my/* → 인증된 모든 사용자
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // API 경로가 아니면 통과
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // 인증이 필요 없는 공개 API
  const publicPaths = [
    '/api/auth',
    '/api/health',
    '/api/public',
  ]

  // 공개 API는 통과
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // JWT 토큰 가져오기
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // 인증되지 않은 사용자
  if (!token) {
    return NextResponse.json(
      {
        error: 'Unauthorized',
        message: '로그인이 필요합니다.',
      },
      { status: 401 }
    )
  }

  const userRole = token.role as string

  // ADMIN 전용 API
  if (pathname.startsWith('/api/admin/')) {
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: '관리자만 접근할 수 있습니다.',
        },
        { status: 403 }
      )
    }
  }

  // THERAPIST 전용 API (ADMIN도 접근 가능)
  if (pathname.startsWith('/api/therapist/')) {
    if (userRole !== 'THERAPIST' && userRole !== 'ADMIN') {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: '치료사만 접근할 수 있습니다.',
        },
        { status: 403 }
      )
    }
  }

  // /api/my/* - 인증된 모든 사용자 접근 가능 (role 체크 없음)
  // 토큰이 있으면 통과

  return NextResponse.next()
}

// 미들웨어가 실행될 경로 설정
export const config = {
  matcher: [
    // API 경로만 매칭
    '/api/:path*',
    // 인증 관련 경로는 제외
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
