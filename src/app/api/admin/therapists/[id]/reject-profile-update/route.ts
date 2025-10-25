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
    const body = await request.json()
    const { reason } = body

    if (!reason) {
      return NextResponse.json(
        { error: '거부 사유를 입력해주세요.' },
        { status: 400 }
      )
    }

    const therapistProfile = await prisma.therapistProfile.findUnique({
      where: { id: resolvedParams.id },
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

    // Find pending profile update request
    const updateRequest = await prisma.profileUpdateRequest.findFirst({
      where: {
        therapistProfileId: resolvedParams.id,
        status: 'PENDING',
      },
    })

    if (!updateRequest) {
      return NextResponse.json(
        { error: '수정 요청 데이터를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // Update request status to REJECTED
    await prisma.profileUpdateRequest.update({
      where: { id: updateRequest.id },
      data: {
        status: 'REJECTED',
        processedAt: new Date(),
        processedBy: session.user.id,
        processedNote: reason,
      },
    })

    // Update therapist profile flags
    await prisma.therapistProfile.update({
      where: { id: resolvedParams.id },
      data: {
        profileUpdateRequested: false,
        profileUpdateNote: null,
      },
    })

    // TODO: Send notifications
    // - Send rejection email to therapist with reason
    // - Send SMS notification

    return NextResponse.json({
      message: '프로필 수정 요청이 거부되었습니다.',
    })

  } catch (error) {
    console.error('프로필 수정 거부 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
