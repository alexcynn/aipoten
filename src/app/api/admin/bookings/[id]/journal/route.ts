import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// GET - 상담일지 조회 (관리자용)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
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
            therapist: {
              include: {
                user: true,
              },
            },
            parentUser: true,
            child: true,
          },
        },
        timeSlot: true,
      },
    })

    if (!booking) {
      return NextResponse.json(
        { error: '예약을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      journal: booking.therapistNote,
      booking: {
        id: booking.id,
        sessionNumber: booking.sessionNumber,
        status: booking.status,
        scheduledAt: booking.scheduledAt,
        therapist: {
          name: booking.payment.therapist.user.name,
          email: booking.payment.therapist.user.email,
        },
        parent: {
          name: booking.payment.parentUser.name,
          email: booking.payment.parentUser.email,
        },
        child: {
          name: booking.payment.child.name,
        },
        sessionType: booking.payment.sessionType,
      },
    })
  } catch (error) {
    console.error('상담일지 조회 오류:', error)
    return NextResponse.json(
      { error: '상담일지 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
