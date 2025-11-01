import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

// GET - 부모의 예약(세션) 내역 조회 (Booking 기반)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'PARENT') {
      return NextResponse.json(
        { error: '부모 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // ALL, SCHEDULED, COMPLETED, CANCELLED
    const sessionType = searchParams.get('sessionType') // ALL, CONSULTATION, THERAPY

    // 본인의 예약만 조회 (결제 완료된 것만)
    const where: any = {
      parentUserId: session.user.id,
      payment: {
        status: 'PAID', // 결제 완료된 것만
      },
    }

    // 상태 필터
    if (status && status !== 'ALL') {
      where.status = status
    }

    // 세션 타입 필터
    if (sessionType && sessionType !== 'ALL') {
      where.payment = {
        ...where.payment,
        sessionType: sessionType,
      }
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        payment: {
          select: {
            id: true,
            sessionType: true,
            totalSessions: true,
            originalFee: true,
            discountRate: true,
            finalFee: true,
            status: true,
            paidAt: true,
          },
        },
        child: {
          select: {
            id: true,
            name: true,
            birthDate: true,
            gender: true,
          },
        },
        therapist: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
                phone: true,
              },
            },
            specialties: true,
            education: true,
            introduction: true,
          },
        },
        timeSlot: true,
      },
      orderBy: [
        { scheduledAt: 'desc' },
        { sessionNumber: 'asc' },
      ],
    })

    return NextResponse.json({
      bookings,
    })
  } catch (error) {
    console.error('부모 예약 내역 조회 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
