import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

// GET - 홈티 내역 조회
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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // ALL, PENDING, IN_PROGRESS, COMPLETED

    // 홈티 예약만 조회 (sessionType = THERAPY)
    const where: any = {
      sessionType: 'THERAPY',
    }

    if (status && status !== 'ALL') {
      if (status === 'PENDING') {
        where.paidAt = null
      } else if (status === 'IN_PROGRESS') {
        where.paidAt = { not: null }
        where.completedSessions = { lt: prisma.booking.fields.sessionCount }
      } else if (status === 'COMPLETED') {
        where.OR = [
          { status: 'COMPLETED' },
          { status: 'CANCELLED' },
        ]
      }
    }

    const therapies = await prisma.booking.findMany({
      where,
      include: {
        parentUser: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        child: {
          select: {
            id: true,
            name: true,
            birthDate: true,
            gender: true,
            gestationalWeeks: true,
            birthWeight: true,
            currentHeight: true,
            currentWeight: true,
            medicalHistory: true,
            familyHistory: true,
            treatmentHistory: true,
            notes: true,
          },
        },
        therapist: {
          include: {
            userId: true,
            gender: true,
            birthYear: true,
            address: true,
            addressDetail: true,
            specialties: true,
            childAgeRanges: true,
            serviceAreas: true,
            sessionFee: true,
            isPreTherapist: true,
            canDoConsultation: true,
            education: true,
            introduction: true,
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
            certifications: {
              select: {
                id: true,
                name: true,
                issuingOrganization: true,
                issueDate: true,
              },
            },
            experiences: {
              select: {
                id: true,
                employmentType: true,
                institutionName: true,
                specialty: true,
                startDate: true,
                endDate: true,
                description: true,
              },
            },
            educations: {
              select: {
                id: true,
                degree: true,
                school: true,
                major: true,
                graduationYear: true,
              },
            },
          },
        },
        timeSlot: true,
      },
      orderBy: [
        { bookingGroupId: 'asc' },
        { scheduledAt: 'asc' },
      ],
    })

    return NextResponse.json({
      therapies,
    })
  } catch (error) {
    console.error('홈티 내역 조회 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
