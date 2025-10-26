import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

// GET - 언어 컨설팅 내역 조회
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // ALL, PENDING, IN_PROGRESS, COMPLETED

    // 언어 컨설팅 예약만 조회 (sessionType = CONSULTATION)
    const where: any = {
      sessionType: 'CONSULTATION',
    }

    if (status && status !== 'ALL') {
      if (status === 'PENDING') {
        where.paidAt = null
      } else if (status === 'IN_PROGRESS') {
        where.paidAt = { not: null }
        where.completedSessions = { lt: prisma.booking.fields.sessionCount }
      } else if (status === 'COMPLETED') {
        where.OR = [
          { status: 'COMPLETED' },
          { status: 'CANCELLED' },
        ]
      }
    }

    const consultations = await prisma.booking.findMany({
      where,
      include: {
        parentUser: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
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
          include: {
            user: {
              select: {
                name: true,
                phone: true,
              },
            },
          },
        },
        timeSlot: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // 시스템 설정에서 계좌 정보 가져오기
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
      consultations,
      accountInfo: settings,
    })
  } catch (error) {
    console.error('언어 컨설팅 조회 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
