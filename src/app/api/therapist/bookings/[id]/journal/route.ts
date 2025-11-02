import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// GET - 상담일지 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'THERAPIST') {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        payment: {
          include: {
            therapist: true,
          },
        },
      },
    })

    if (!booking) {
      return NextResponse.json(
        { error: '예약을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 본인의 세션인지 확인
    if (booking.payment.therapist.userId !== session.user.id) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      journal: booking.therapistNote,
      bookingId: booking.id,
      status: booking.status,
    })
  } catch (error) {
    console.error('상담일지 조회 오류:', error)
    return NextResponse.json(
      { error: '상담일지 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// POST - 상담일지 작성
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'THERAPIST') {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    const { journal } = await request.json()

    if (!journal || journal.trim().length === 0) {
      return NextResponse.json(
        { error: '상담일지 내용을 입력해주세요.' },
        { status: 400 }
      )
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        payment: {
          include: {
            therapist: true,
          },
        },
      },
    })

    if (!booking) {
      return NextResponse.json(
        { error: '예약을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 본인의 세션인지 확인
    if (booking.payment.therapist.userId !== session.user.id) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    // 상담일지 작성 및 완료 상태로 변경
    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: {
        therapistNote: journal,
        status: 'COMPLETED', // 상담일지 작성 시 자동 완료
      },
    })

    return NextResponse.json({
      booking: updatedBooking,
      message: '상담일지가 저장되었습니다.',
    })
  } catch (error) {
    console.error('상담일지 작성 오류:', error)
    return NextResponse.json(
      { error: '상담일지 작성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
