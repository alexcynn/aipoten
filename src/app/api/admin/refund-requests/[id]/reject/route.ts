import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST - 환불 거부
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { rejectionReason, adminNote } = body

    if (!rejectionReason) {
      return NextResponse.json({ error: '거부 사유가 필요합니다.' }, { status: 400 })
    }

    const refundRequest = await prisma.refundRequest.findUnique({
      where: { id },
    })

    if (!refundRequest) {
      return NextResponse.json({ error: '환불 요청을 찾을 수 없습니다.' }, { status: 404 })
    }

    if (refundRequest.status !== 'PENDING') {
      return NextResponse.json({ error: '이미 처리된 요청입니다.' }, { status: 400 })
    }

    // 환불 거부 처리
    const updated = await prisma.refundRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason,
        adminNote,
        processedBy: session.user.id,
        processedAt: new Date(),
      },
    })

    return NextResponse.json({ refundRequest: updated })
  } catch (error) {
    console.error('❌ 환불 거부 오류:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
