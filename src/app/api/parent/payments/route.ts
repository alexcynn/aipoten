import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

// GET - 부모의 결제 내역 조회 (Payment 기반)
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
    const status = searchParams.get('status') // ALL, PENDING_PAYMENT, PAID, REFUNDED

    // 본인의 결제만 조회
    const where: any = {
      parentUserId: session.user.id,
    }

    if (status && status !== 'ALL') {
      if (status === 'PENDING_PAYMENT') {
        where.status = 'PENDING_PAYMENT'
      } else if (status === 'PAID') {
        where.status = 'PAID'
      } else if (status === 'REFUNDED') {
        where.OR = [
          { status: 'REFUNDED' },
          { status: 'PARTIALLY_REFUNDED' },
        ]
      }
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
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
          },
        },
        bookings: {
          include: {
            timeSlot: true,
          },
          orderBy: {
            sessionNumber: 'asc',
          },
        },
        refundRequests: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // 완료된 세션 수 계산 추가
    const paymentsWithProgress = payments.map((payment) => ({
      ...payment,
      completedSessions: payment.bookings.filter((b) => b.status === 'COMPLETED').length,
    }))

    // 시스템 설정에서 계좌 정보 가져오기 (결제 대기 시 필요)
    const settings = await prisma.systemSettings.findUnique({
      where: { id: 'system' },
      select: {
        bankName: true,
        accountNumber: true,
        accountHolder: true,
        consultationBaseFee: true,
      },
    })

    return NextResponse.json({
      payments: paymentsWithProgress,
      accountInfo: settings,
    })
  } catch (error) {
    console.error('부모 결제 내역 조회 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
