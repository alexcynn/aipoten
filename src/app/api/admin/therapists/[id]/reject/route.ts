import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { reason } = await request.json()

    if (!reason) {
      return NextResponse.json(
        { error: '반려 사유가 필요합니다.' },
        { status: 400 }
      )
    }

    const therapistProfile = await prisma.therapistProfile.findUnique({
      where: { id: params.id },
      include: {
        user: true
      }
    })

    if (!therapistProfile) {
      return NextResponse.json(
        { error: '치료사 프로필을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // Update approval status
    const updatedProfile = await prisma.therapistProfile.update({
      where: { id: params.id },
      data: {
        approvalStatus: 'REJECTED',
        rejectedAt: new Date(),
        rejectionReason: reason,
        status: 'REJECTED', // Update legacy status too
      }
    })

    // TODO: Send notifications
    // - Send rejection email to therapist with reason
    // - Send SMS notification

    return NextResponse.json({
      message: '치료사 신청이 반려되었습니다.',
      therapistProfile: updatedProfile
    })

  } catch (error) {
    console.error('치료사 반려 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
