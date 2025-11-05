import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

/**
 * GET /api/bookings/[id]
 * 특정 예약의 상세 정보 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 인증 확인
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const { id: bookingId } = await params

    console.log('📥 예약 상세 조회:', { bookingId, userId })

    // 예약 조회
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        timeSlot: true,
        payment: {
          select: {
            id: true,
            sessionType: true,
            totalSessions: true,
            originalFee: true,
            discountRate: true,
            finalFee: true,
            platformFee: true,
            status: true,
            paidAt: true,
            refundedAt: true,
            refundAmount: true
          }
        },
        parentUser: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        child: {
          select: {
            id: true,
            name: true,
            birthDate: true,
            gender: true
          }
        },
        therapist: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        review: true
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: '예약을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 치료사 프로필 확인 (치료사인 경우)
    const therapistProfile = await prisma.therapistProfile.findUnique({
      where: { userId: userId }
    })

    // 권한 확인: 본인의 예약이거나 담당 치료사이거나 관리자여야 함
    const isParent = booking.parentUserId === userId
    const isTherapist = therapistProfile && booking.therapistId === therapistProfile.id
    const isAdmin = session.user.role === 'ADMIN'

    if (!isParent && !isTherapist && !isAdmin) {
      return NextResponse.json(
        { error: '접근 권한이 없습니다.' },
        { status: 403 }
      )
    }

    console.log('✅ 예약 조회 완료:', {
      booking: booking.id,
      isParent,
      isTherapist,
      isAdmin
    })

    return NextResponse.json({ booking })

  } catch (error) {
    console.error('❌ 예약 상세 조회 오류:', error)
    return NextResponse.json(
      {
        error: '서버 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
