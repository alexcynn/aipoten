import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// GET - 치료사 프로필 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    console.log('=== 프로필 조회 시작 ===')
    console.log('Session:', session?.user)

    if (!session?.user?.id) {
      console.log('인증 실패: 세션 없음')
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'THERAPIST') {
      console.log('권한 실패: THERAPIST 아님, role:', session.user.role)
      return NextResponse.json(
        { error: '치료사만 접근할 수 있습니다.' },
        { status: 403 }
      )
    }

    console.log('프로필 조회 중, userId:', session.user.id)

    const profile = await prisma.therapistProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        certifications: true,
        experiences: true,
        educations: true,
      },
    })

    console.log('프로필 조회 결과:', profile ? '찾음' : '없음')

    if (!profile) {
      console.log('❌ 프로필이 존재하지 않습니다. userId:', session.user.id)
      return NextResponse.json(
        { error: '프로필을 찾을 수 없습니다. 관리자에게 문의하세요.' },
        { status: 404 }
      )
    }

    // JSON 파싱 및 응답 포맷팅
    const response = {
      id: profile.id,
      user: profile.user,
      gender: profile.gender,
      birthYear: profile.birthYear,
      address: profile.address,
      addressDetail: profile.addressDetail,
      specialties: profile.specialties ? JSON.parse(profile.specialties as string) : [],
      childAgeRanges: profile.childAgeRanges ? JSON.parse(profile.childAgeRanges as string) : [],
      serviceAreas: profile.serviceAreas ? JSON.parse(profile.serviceAreas as string) : [],
      sessionFee: profile.sessionFee,
      bank: profile.bank,
      accountNumber: profile.accountNumber,
      accountHolder: profile.accountHolder,
      isPreTherapist: profile.isPreTherapist,
      specialty: profile.specialty,
      licenseNumber: profile.licenseNumber,
      experience: profile.experience,
      education: profile.education,
      introduction: profile.introduction,
      consultationFee: profile.consultationFee,
      approvalStatus: profile.approvalStatus,
      status: profile.status,
      profileUpdateRequested: profile.profileUpdateRequested,
      certifications: profile.certifications,
      experiences: profile.experiences,
      educations: profile.educations,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('프로필 조회 오류:', error)
    return NextResponse.json(
      { error: '프로필 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
