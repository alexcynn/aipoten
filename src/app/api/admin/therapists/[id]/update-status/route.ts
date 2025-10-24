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
    const { status } = body

    if (!status || !['PENDING', 'WAITING', 'APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: '유효하지 않은 상태입니다.' },
        { status: 400 }
      )
    }

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

    // 상태 업데이트
    const updateData: any = {
      approvalStatus: status,
    }

    // 레거시 status 필드는 TherapistStatus enum에 WAITING이 없으므로 매핑 필요
    // WAITING -> PENDING으로 매핑
    if (status === 'WAITING') {
      updateData.status = 'PENDING'
    } else {
      updateData.status = status
    }

    // 상태별 추가 필드 설정
    if (status === 'APPROVED') {
      updateData.approvedAt = new Date()
      updateData.approvedBy = session.user.id
      updateData.rejectedAt = null
      updateData.rejectionReason = null
    } else if (status === 'REJECTED') {
      updateData.rejectedAt = new Date()
      updateData.approvedAt = null
      updateData.approvedBy = null
    } else if (status === 'PENDING' || status === 'WAITING') {
      // PENDING이나 WAITING으로 되돌릴 때는 승인/거절 정보 초기화
      updateData.approvedAt = null
      updateData.approvedBy = null
      updateData.rejectedAt = null
      updateData.rejectionReason = null
    }

    const updatedProfile = await prisma.therapistProfile.update({
      where: { id: resolvedParams.id },
      data: updateData
    })

    return NextResponse.json({
      message: '상태가 변경되었습니다.',
      therapistProfile: updatedProfile
    })

  } catch (error) {
    console.error('상태 변경 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
