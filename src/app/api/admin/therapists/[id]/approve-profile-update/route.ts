import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const resolvedParams = await params

    const therapistProfile = await prisma.therapistProfile.findUnique({
      where: { id: resolvedParams.id },
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

    if (!therapistProfile.profileUpdateRequested) {
      return NextResponse.json(
        { error: '프로필 수정 요청이 없습니다.' },
        { status: 400 }
      )
    }

    // 프로필 수정 요청 승인
    const updatedProfile = await prisma.therapistProfile.update({
      where: { id: resolvedParams.id },
      data: {
        profileUpdateRequested: false,
        profileUpdateApprovedAt: new Date(),
        profileUpdateApprovedBy: session.user.id,
        profileUpdateNote: null, // 승인 후 메모 초기화
      }
    })

    // TODO: Send notifications
    // - Send approval email to therapist
    // - Send SMS notification

    return NextResponse.json({
      message: '프로필 수정 요청이 승인되었습니다.',
      therapistProfile: updatedProfile
    })

  } catch (error) {
    console.error('프로필 수정 승인 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
