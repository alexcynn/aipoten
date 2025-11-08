import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { getBookingStatus } from '@/lib/booking-status'

// GET - 홈티 내역 조회 (Payment 기반, 5단계 상태)
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
    const statusFilter = searchParams.get('status') // PENDING_PAYMENT, PENDING_CONFIRMATION, CONFIRMED, COMPLETED, CANCELLED, ALL

    // 홈티 결제만 조회 (sessionType = THERAPY)
    const where: any = {
      sessionType: 'THERAPY',
    }

    // 결제 상태 필터 (일부 상태는 Payment 레벨에서 필터링 가능)
    if (statusFilter === 'PENDING_PAYMENT') {
      where.status = 'PENDING_PAYMENT'
    } else if (statusFilter === 'CANCELLED') {
      where.OR = [
        { status: 'REFUNDED' },
        { status: 'PARTIALLY_REFUNDED' },
      ]
    } else if (statusFilter && statusFilter !== 'ALL') {
      // PENDING_CONFIRMATION, CONFIRMED, COMPLETED는 PAID 상태에서만 가능
      where.status = 'PAID'
    }

    const therapies = await prisma.payment.findMany({
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
            bank: true,
            accountNumber: true,
            accountHolder: true,
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
        bookings: {
          include: {
            timeSlot: true,
            review: true,
          },
          orderBy: {
            sessionNumber: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // 각 payment를 booking 리스트로 확장
    const allBookings = therapies.flatMap((payment) =>
      payment.bookings.map((booking) => ({
        id: booking.id,
        sessionNumber: booking.sessionNumber,
        scheduledAt: booking.scheduledAt?.toISOString() || payment.createdAt.toISOString(),
        status: booking.status,
        therapistNote: booking.therapistNote,
        parentUser: payment.parentUser,
        child: payment.child,
        therapist: payment.therapist,
        review: booking.review,
        timeSlot: booking.timeSlot,
        payment: {
          id: payment.id,
          sessionType: payment.sessionType,
          totalSessions: payment.totalSessions,
          finalFee: payment.finalFee,
          status: payment.status,
          originalFee: payment.originalFee,
          discountRate: payment.discountRate,
          paidAt: payment.paidAt?.toISOString() || null,
          settlementAmount: payment.settlementAmount,
          settledAt: payment.settledAt?.toISOString() || null,
          settlementNote: payment.settlementNote,
        },
        currentStatus: getBookingStatus(booking, payment),
      }))
    )

    // 상태 필터 적용
    const filteredTherapies = allBookings.filter((booking) => {
      if (!statusFilter || statusFilter === 'ALL') return true
      return booking.currentStatus === statusFilter
    })

    return NextResponse.json({
      therapies: filteredTherapies,
    })
  } catch (error) {
    console.error('홈티 내역 조회 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
