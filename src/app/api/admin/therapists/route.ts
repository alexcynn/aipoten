import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

export async function GET(request: NextRequest) {
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

    const { status } = Object.fromEntries(request.nextUrl.searchParams)

    const therapists = await prisma.therapistProfile.findMany({
      where: status ? { approvalStatus: status as any } : undefined,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        },
        certifications: true,
        experiences: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedTherapists = therapists.map(therapist => ({
      id: therapist.id,
      user: therapist.user,
      gender: therapist.gender,
      birthYear: therapist.birthYear,
      address: therapist.address,
      specialties: therapist.specialties ? JSON.parse(therapist.specialties) : [],
      childAgeRanges: therapist.childAgeRanges ? JSON.parse(therapist.childAgeRanges) : [],
      serviceAreas: therapist.serviceAreas ? JSON.parse(therapist.serviceAreas) : [],
      sessionFee: therapist.sessionFee,
      education: therapist.education,
      certifications: therapist.certifications,
      experiences: therapist.experiences,
      approvalStatus: therapist.approvalStatus,
      status: therapist.status,
      approvedAt: therapist.approvedAt?.toISOString(),
      rejectedAt: therapist.rejectedAt?.toISOString(),
      rejectionReason: therapist.rejectionReason,
      additionalInfoRequested: therapist.additionalInfoRequested,
      createdAt: therapist.createdAt.toISOString()
    }))

    return NextResponse.json(formattedTherapists)
  } catch (error) {
    console.error('치료사 목록 조회 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}