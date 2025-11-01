/**
 * 문의 메시지 관련 API
 * GET: 메시지 목록 조회
 * POST: 새 메시지 전송
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// GET - 문의 메시지 목록 조회
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

    console.log('=== 메시지 조회 권한 체크 ===')
    console.log('Session User ID:', session.user.id)
    console.log('Session User Role:', session.user.role)
    console.log('Inquiry User ID:', inquiry.userId)
    console.log('Match:', session.user.id === inquiry.userId)

    // 권한 확인: 관리자 또는 본인만 조회 가능
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

// POST - 새 메시지 전송
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

    console.log('=== 메시지 전송 권한 체크 ===')
    console.log('Session User ID:', session.user.id)
    console.log('Session User Role:', session.user.role)
    console.log('Inquiry User ID:', inquiry.userId)
    console.log('Match:', session.user.id === inquiry.userId)

    // 권한 확인: 관리자 또는 본인만 메시지 전송 가능
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
    const updateData: any = {
      updatedAt: new Date(),
    }

    // 관리자가 답변한 경우
    if (session.user.role === 'ADMIN') {
      updateData.respondedBy = session.user.id
      updateData.respondedAt = new Date()
      // 상태가 PENDING이면 IN_PROGRESS로 변경
      if (inquiry.status === 'PENDING') {
        updateData.status = 'IN_PROGRESS'
      }
    }

    await prisma.inquiry.update({
      where: { id: id },
      data: updateData,
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
