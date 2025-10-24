import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'THERAPIST') {
      return NextResponse.json(
        { error: '치료사 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      name,
      gender,
      birthYear,
      phone,
      address,
      addressDetail,
      specialties,
      childAgeRanges,
      serviceAreas,
      sessionFee,
      education,
      isPreTherapist,
      certifications,
      experiences,
      memo,
    } = body

    // Find therapist profile
    const therapistProfile = await prisma.therapistProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!therapistProfile) {
      return NextResponse.json(
        { error: '치료사 프로필을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // Check if there's already a pending update request
    const existingRequest = await prisma.profileUpdateRequest.findFirst({
      where: {
        therapistProfileId: therapistProfile.id,
        status: 'PENDING',
      },
    })

    if (existingRequest) {
      return NextResponse.json(
        { error: '이미 처리 중인 수정 요청이 있습니다.' },
        { status: 400 }
      )
    }

    // Prepare request data
    const requestData = {
      name,
      gender,
      birthYear,
      phone,
      address,
      addressDetail,
      specialties,
      childAgeRanges,
      serviceAreas,
      sessionFee,
      education,
      isPreTherapist,
      certifications,
      experiences,
    }

    // Create profile update request
    await prisma.profileUpdateRequest.create({
      data: {
        therapistProfileId: therapistProfile.id,
        requestData: JSON.stringify(requestData),
        memo,
        status: 'PENDING',
      },
    })

    // Update profileUpdateRequested flag
    await prisma.therapistProfile.update({
      where: { id: therapistProfile.id },
      data: {
        profileUpdateRequested: true,
        profileUpdateRequestedAt: new Date(),
        profileUpdateNote: memo,
      },
    })

    return NextResponse.json({
      message: '프로필 수정 요청이 성공적으로 제출되었습니다.',
    })
  } catch (error) {
    console.error('프로필 수정 요청 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
