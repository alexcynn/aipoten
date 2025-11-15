import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/therapists/[id]
 * 특정 치료사의 상세 정보 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const therapistId = params.id

    console.log('📥 치료사 상세 조회:', therapistId)

    // 승인된 치료사만 조회
    const therapist = await prisma.therapistProfile.findFirst({
      where: {
        id: therapistId,
        approvalStatus: 'APPROVED'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        certifications: {
          orderBy: {
            issueDate: 'desc'
          }
        },
        experiences: {
          orderBy: {
            startDate: 'desc'
          }
        }
      }
    })

    if (!therapist) {
      console.error('❌ 치료사를 찾을 수 없음:', therapistId)
      return NextResponse.json(
        { error: '치료사를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    console.log('✅ 치료사 조회 완료:', therapist.user.name)

    // 응답 데이터 가공
    const response = {
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
      consultationFee: therapist.consultationFee,
      consultationSettlementAmount: therapist.consultationSettlementAmount,
      canDoConsultation: therapist.canDoConsultation,
      education: therapist.education,
      introduction: therapist.introduction,
      approvedAt: therapist.approvedAt,
      certifications: therapist.certifications,
      experiences: therapist.experiences,
      createdAt: therapist.createdAt,
      updatedAt: therapist.updatedAt
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ 치료사 상세 조회 오류:', error)
    return NextResponse.json(
      {
        error: '서버 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
