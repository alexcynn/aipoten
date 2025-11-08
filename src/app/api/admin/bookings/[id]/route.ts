import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

/**
 * GET /api/admin/bookings/[id]
 * 관리자용 예약 상세 정보 조회
 * 치료사 계좌 정보, 정산 정보 포함
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 인증 확인
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    // 관리자 권한 확인
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    const { id: bookingId } = await params

    console.log('📥 [관리자] 예약 상세 조회:', bookingId)

    // 예약 조회 (모든 정보 포함)
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
            refundAmount: true,
            settlementAmount: true,
            settledAt: true,
            settlementNote: true,
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
          select: {
            id: true,
            sessionFee: true,
            bank: true,
            accountNumber: true,
            accountHolder: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            }
          }
        },
        review: {
          select: {
            id: true,
            rating: true,
            content: true,
            createdAt: true
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: '예약을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    console.log('✅ [관리자] 예약 조회 완료:', booking.id)

    return NextResponse.json({ booking })

  } catch (error) {
    console.error('❌ [관리자] 예약 상세 조회 오류:', error)
    return NextResponse.json(
      {
        error: '서버 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
