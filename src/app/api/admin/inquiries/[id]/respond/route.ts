/**
 * 관리자 문의 답변 API
 * POST /api/admin/inquiries/[id]/respond
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    // 관리자 권한 확인
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { response, status } = body

    // 유효성 검증
    if (!response) {
      return NextResponse.json(
        { error: '답변 내용을 입력해주세요.' },
        { status: 400 }
      )
    }

    // 문의 존재 여부 확인
    const inquiry = await prisma.inquiry.findUnique({
      where: { id: params.id },
    })

    if (!inquiry) {
      return NextResponse.json(
        { error: '문의를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 답변 저장
    const updatedInquiry = await prisma.inquiry.update({
      where: { id: params.id },
      data: {
        response,
        respondedBy: session.user.id,
        respondedAt: new Date(),
        status: status || 'RESOLVED',
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

    return NextResponse.json({
      success: true,
      inquiry: updatedInquiry,
    })
  } catch (error) {
    console.error('답변 등록 오류:', error)
    return NextResponse.json(
      { error: '답변 등록 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
