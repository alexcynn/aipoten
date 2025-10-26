import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

// GET - 환불 요청 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'ALL'

    const where: any = {}
    if (status !== 'ALL') {
      where.status = status
    }

    const refundRequests = await prisma.refundRequest.findMany({
      where,
      include: {
        booking: {
          include: {
            parentUser: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
            child: {
              select: {
                name: true,
              },
            },
          },
        },
        requestedByUser: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ refundRequests })
  } catch (error) {
    console.error('❌ 환불 요청 조회 오류:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
