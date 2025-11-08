import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// GET - 부모가 상담일지 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'PARENT') {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        payment: true,
        therapist: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        child: {
          select: {
            name: true,
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

    // 본인의 예약인지 확인
    if (booking.parentUserId !== session.user.id) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    // 상담일지가 없는 경우
    if (!booking.therapistNote) {
      return NextResponse.json(
        { error: '상담일지가 아직 작성되지 않았습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      journal: booking.therapistNote,
      bookingId: booking.id,
      sessionNumber: booking.sessionNumber,
      totalSessions: booking.payment.totalSessions,
      scheduledAt: booking.scheduledAt,
      completedAt: booking.completedAt,
      therapistName: booking.therapist.user.name,
      childName: booking.child.name,
    })
  } catch (error) {
    console.error('상담일지 조회 오류:', error)
    return NextResponse.json(
      { error: '상담일지 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
