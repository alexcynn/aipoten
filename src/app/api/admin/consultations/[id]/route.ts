import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

// PUT - 언어 컨설팅 비용 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    const resolvedParams = await params
    const body = await request.json()
    const { finalFee, originalFee } = body

    // 예약 확인
    const booking = await prisma.booking.findUnique({
      where: { id: resolvedParams.id },
    })

    if (!booking) {
      return NextResponse.json(
        { error: '예약을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (booking.sessionType !== 'CONSULTATION') {
      return NextResponse.json(
        { error: '언어 컨설팅 예약이 아닙니다.' },
        { status: 400 }
      )
    }

    // 비용 업데이트
    const updatedBooking = await prisma.booking.update({
      where: { id: resolvedParams.id },
      data: {
        finalFee: finalFee || originalFee,
        originalFee: originalFee,
      },
    })

    return NextResponse.json({
      message: '컨설팅 비용이 수정되었습니다.',
      booking: updatedBooking,
    })
  } catch (error) {
    console.error('컨설팅 비용 수정 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
