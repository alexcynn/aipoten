import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

export async function GET(
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

    const therapist = await prisma.therapistProfile.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            createdAt: true
          }
        },
        certifications: true,
        experiences: true,
        consultations: {
          select: {
            id: true,
            status: true,
            scheduledAt: true,
            fee: true
          }
        }
      }
    })

    if (!therapist) {
      return NextResponse.json(
        { error: '치료사를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const formattedTherapist = {
      id: therapist.id,
      user: therapist.user,
      gender: therapist.gender,
      birthYear: therapist.birthYear,
      address: therapist.address,
      addressDetail: therapist.addressDetail,
      specialties: therapist.specialties ? JSON.parse(therapist.specialties) : [],
      childAgeRanges: therapist.childAgeRanges ? JSON.parse(therapist.childAgeRanges) : [],
      serviceAreas: therapist.serviceAreas ? JSON.parse(therapist.serviceAreas) : [],
      sessionFee: therapist.sessionFee,

      // 레거시 필드 (하위 호환성)
      specialty: therapist.specialty,
      experience: therapist.experience,
      consultationFee: therapist.consultationFee,
      licenseNumber: therapist.licenseNumber,

      education: therapist.education,
      introduction: therapist.introduction,
      description: therapist.introduction, // 별칭
      certifications: therapist.certifications,
      experiences: therapist.experiences,
      approvalStatus: therapist.approvalStatus,
      status: therapist.status,
      approvedAt: therapist.approvedAt?.toISOString(),
      approvedBy: therapist.approvedBy,
      rejectedAt: therapist.rejectedAt?.toISOString(),
      rejectionReason: therapist.rejectionReason,
      additionalInfoRequested: therapist.additionalInfoRequested,
      createdAt: therapist.createdAt.toISOString(),
      consultations: therapist.consultations
    }

    return NextResponse.json(formattedTherapist)
  } catch (error) {
    console.error('치료사 상세 조회 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function PUT(
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

    const { status } = await request.json()

    if (!status || !['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: '유효한 상태가 필요합니다.' },
        { status: 400 }
      )
    }

    const therapist = await prisma.therapistProfile.findUnique({
      where: { id: params.id }
    })

    if (!therapist) {
      return NextResponse.json(
        { error: '치료사를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const updatedTherapist = await prisma.therapistProfile.update({
      where: { id: params.id },
      data: { status }
    })

    return NextResponse.json({
      message: '치료사 상태가 업데이트되었습니다.',
      therapist: updatedTherapist
    })
  } catch (error) {
    console.error('치료사 상태 업데이트 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}