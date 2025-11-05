import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

// GET - 부모의 결제(Payment) 기반 예약 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') // PENDING, PAID

    // Payment 기반으로 조회
    const where: any = {
      parentUserId: session.user.id,
    }

    if (filter) {
      if (filter === 'PENDING') {
        where.status = 'PENDING_PAYMENT'
      } else if (filter === 'PAID') {
        where.status = 'PAID'
      }
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
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
          select: {
            id: true,
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
                id: true,
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
        bookings: {
          include: {
            timeSlot: true,
          },
          orderBy: {
            scheduledAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Payment를 그룹화된 형태로 변환
    const groupedBookings = payments.map((payment) => {
      const completedSessions = payment.bookings.filter(
        (b) => b.status === 'PENDING_SETTLEMENT' || b.status === 'SETTLEMENT_COMPLETED'
      ).length

      return {
        groupId: payment.id,
        paymentId: payment.id,
        bookingIds: payment.bookings.map((b) => b.id),
        sessionType: payment.sessionType,
        totalFee: payment.finalFee,
        originalFee: payment.originalFee,
        discountRate: payment.discountRate,
        totalSessions: payment.totalSessions,
        completedSessions,
        status: payment.status,
        paidAt: payment.paidAt,
        refundAmount: payment.refundAmount,
        child: payment.child,
        therapist: payment.therapist,
        scheduledAt: payment.bookings[0]?.scheduledAt || payment.createdAt,
        createdAt: payment.createdAt,
        bookingCount: payment.bookings.length,
        timeSlot: payment.bookings[0]?.timeSlot || null,
        bookings: payment.bookings,
      }
    })

    // 시스템 설정에서 계좌 정보 가져오기
    const settings = await prisma.systemSettings.findUnique({
      where: { id: 'system' },
      select: {
        bankName: true,
        accountNumber: true,
        accountHolder: true,
      },
    })

    return NextResponse.json({
      bookings: groupedBookings,
      accountInfo: settings,
    })
  } catch (error) {
    console.error('그룹화된 예약 조회 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
