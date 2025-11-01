/**
 * 특정 문의 조회 API
 * GET /api/inquiry/[id]
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const { id } = await params

    const inquiry = await prisma.inquiry.findUnique({
      where: {
        id: id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    })

    if (!inquiry) {
      return NextResponse.json(
        { error: '문의를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 본인의 문의이거나 관리자인 경우에만 조회 가능
    if (inquiry.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '문의를 조회할 권한이 없습니다.' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      inquiry,
    })
  } catch (error) {
    console.error('문의 조회 오류:', error)
    return NextResponse.json(
      { error: '문의 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
