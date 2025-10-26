import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST - 언어 컨설팅 권한 변경
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { canDoConsultation } = body

    if (typeof canDoConsultation !== 'boolean') {
      return NextResponse.json({ error: '유효하지 않은 요청입니다.' }, { status: 400 })
    }

    const therapistProfile = await prisma.therapistProfile.findUnique({
      where: { id },
    })

    if (!therapistProfile) {
      return NextResponse.json({ error: '치료사를 찾을 수 없습니다.' }, { status: 404 })
    }

    const updated = await prisma.therapistProfile.update({
      where: { id },
      data: {
        canDoConsultation,
      },
    })

    return NextResponse.json({
      therapistProfile: updated,
      message: canDoConsultation
        ? '언어 컨설팅 권한이 부여되었습니다.'
        : '언어 컨설팅 권한이 제거되었습니다.'
    })
  } catch (error) {
    console.error('❌ 언어 컨설팅 권한 변경 오류:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
