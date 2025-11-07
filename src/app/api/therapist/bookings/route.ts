import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireTherapist } from '@/lib/auth-helpers'

/**
 * GET /api/therapist/bookings
 * 치료사의 예약 목록 조회
 *
 * Query Parameters:
 * - status: BookingStatus (선택)
 * - startDate: "2025-11-01" (선택)
 * - endDate: "2025-11-30" (선택)
 */
export async function GET(request: NextRequest) {
  try {
    // RBAC: THERAPIST 또는 ADMIN 권한 확인
    const { error, user } = await requireTherapist()
    if (error) return error

    console.log('📥 치료사 예약 목록 조회:', user.id)

    // 치료사 프로필 확인
    const therapistProfile = await prisma.therapistProfile.findUnique({
      where: { userId: user.id }
    })

    if (!therapistProfile) {
      return NextResponse.json(
        { error: '치료사 프로필을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    console.log('📋 조회 조건:', { status, startDate, endDate })

    const where: any = {
      therapistId: therapistProfile.id
    }

    // 상태 필터
    if (status) {
      where.status = status
    }

    // 날짜 범위 필터
    if (startDate || endDate) {
      where.scheduledAt = {}

      if (startDate) {
        const [year, month, day] = startDate.split('-').map(Number)
        where.scheduledAt.gte = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
      }

      if (endDate) {
        const [year, month, day] = endDate.split('-').map(Number)
        where.scheduledAt.lte = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999))
      }
    }

    console.log('🔍 조회 조건:', JSON.stringify(where, null, 2))

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        timeSlot: true,
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
        payment: {
          select: {
            id: true,
            sessionType: true,
            totalSessions: true,
            status: true,
            paidAt: true,
            originalFee: true,
            discountRate: true,
            finalFee: true
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
        }
      },
      orderBy: {
        scheduledAt: 'asc'
      }
    })

    console.log(`✅ ${bookings.length}개의 예약 조회 완료`)

    // 통계 계산
    const stats = {
      total: bookings.length,
      pendingConfirmation: bookings.filter(b => b.status === 'PENDING_CONFIRMATION').length,
      confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
      inProgress: bookings.filter(b => b.status === 'IN_PROGRESS').length,
      completed: bookings.filter(b => b.status === 'COMPLETED').length,
      cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
      rejected: bookings.filter(b => b.status === 'REJECTED').length,
      noShow: bookings.filter(b => b.status === 'NO_SHOW').length
    }

    return NextResponse.json({
      bookings,
      stats,
      count: bookings.length
    })

  } catch (error) {
    console.error('❌ 치료사 예약 목록 조회 오류:', error)
    return NextResponse.json(
      {
        error: '서버 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
