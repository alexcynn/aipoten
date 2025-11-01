/**
 * 사용자 문의 메시지 API
 * GET: 메시지 목록 조회
 * POST: 새 메시지 전송
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// GET - 문의 메시지 목록 조회 (사용자용)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    const { id } = await params

    // 문의 존재 여부 및 권한 확인
    const inquiry = await prisma.inquiry.findUnique({
      where: { id: id },
    })

    if (!inquiry) {
      return NextResponse.json(
        { error: '문의를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    console.log('=== 사용자 메시지 조회 권한 체크 ===')
    console.log('Session User ID:', session.user.id)
    console.log('Session User Role:', session.user.role)
    console.log('Inquiry User ID:', inquiry.userId)
    console.log('Match:', session.user.id === inquiry.userId)

    // 권한 확인: 본인 또는 관리자만 조회 가능
    if (session.user.role !== 'ADMIN' && inquiry.userId !== session.user.id) {
      console.error('권한 없음 - 403 반환')
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    // 메시지 목록 조회
    const messages = await prisma.inquiryMessage.findMany({
      where: { inquiryId: id },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('메시지 조회 오류:', error)
    return NextResponse.json(
      { error: '메시지 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// POST - 새 메시지 전송 (사용자용)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    const { id } = await params

    const body = await request.json()
    const { content } = body

    if (!content?.trim()) {
      return NextResponse.json(
        { error: '메시지 내용을 입력해주세요.' },
        { status: 400 }
      )
    }

    // 문의 존재 여부 및 권한 확인
    const inquiry = await prisma.inquiry.findUnique({
      where: { id: id },
    })

    if (!inquiry) {
      return NextResponse.json(
        { error: '문의를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    console.log('=== 사용자 메시지 전송 권한 체크 ===')
    console.log('Session User ID:', session.user.id)
    console.log('Session User Role:', session.user.role)
    console.log('Inquiry User ID:', inquiry.userId)
    console.log('Match:', session.user.id === inquiry.userId)

    // 권한 확인: 본인 또는 관리자만 메시지 전송 가능
    if (session.user.role !== 'ADMIN' && inquiry.userId !== session.user.id) {
      console.error('권한 없음 - 403 반환')
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    // 메시지 생성
    const message = await prisma.inquiryMessage.create({
      data: {
        inquiryId: id,
        senderId: session.user.id,
        senderType: session.user.role === 'ADMIN' ? 'ADMIN' : 'USER',
        content: content.trim(),
      },
    })

    // 문의 상태 업데이트
    await prisma.inquiry.update({
      where: { id: id },
      data: {
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message,
    })
  } catch (error) {
    console.error('메시지 전송 오류:', error)
    return NextResponse.json(
      { error: '메시지 전송 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
