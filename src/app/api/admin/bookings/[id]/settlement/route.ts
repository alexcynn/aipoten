import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// POST - 정산 처리
export async function POST(request: NextRequest, { params }: RouteParams) {
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

    const { id } = await params
    const body = await request.json()
    const { settlementAmount, settlementNote } = body

    if (!settlementAmount || settlementAmount <= 0) {
      return NextResponse.json(
        { error: '정산 금액이 필요합니다.' },
        { status: 400 }
      )
    }

    // 예약 조회
    const booking = await prisma.booking.findUnique({
      where: { id },
    })

    if (!booking) {
      return NextResponse.json(
        { error: '예약을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 정산 처리
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        settlementAmount,
        settlementNote,
        settledAt: new Date(),
        status: 'SETTLEMENT_COMPLETED',
      },
    })

    return NextResponse.json({ booking: updatedBooking })
  } catch (error) {
    console.error('❌ 정산 처리 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
