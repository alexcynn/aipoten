import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { getConsultationStatus } from '@/lib/booking-status'

// GET - 언어 컨설팅 내역 조회 (Payment 기반, 5단계 상태)
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
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    console.log('📥 [관리자 API] 언어 컨설팅 조회 요청, 필터:', statusFilter, '날짜:', startDate, '~', endDate)

    // 언어 컨설팅 결제만 조회 (sessionType = CONSULTATION)
    const where: any = {
      sessionType: 'CONSULTATION',
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

    // 날짜 필터 (bookings 테이블의 scheduledAt 기준)
    if (startDate || endDate) {
      where.bookings = {
        some: {}
      }

      if (startDate || endDate) {
        where.bookings.some.scheduledAt = {}

        if (startDate) {
          const [year, month, day] = startDate.split('-').map(Number)
          where.bookings.some.scheduledAt.gte = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
        }

        if (endDate) {
          const [year, month, day] = endDate.split('-').map(Number)
          where.bookings.some.scheduledAt.lte = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999))
        }
      }
    }

    const consultations = await prisma.payment.findMany({
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

    console.log('✅ [관리자 API] 조회된 컨설팅:', consultations.length, '건')

    // 상태 필터 적용 (booking 상태 기반 필터링)
    const filteredConsultations = consultations.filter((payment) => {
      if (!statusFilter || statusFilter === 'ALL') return true

      const currentStatus = getConsultationStatus(payment)
      return currentStatus === statusFilter
    })

    console.log('✅ [관리자 API] 필터 후 컨설팅:', filteredConsultations.length, '건')

    // 각 payment에 현재 상태 추가하고 booking 형식으로 변환
    const consultationsWithStatus = filteredConsultations.map((payment) => {
      const booking = payment.bookings[0] // 컨설팅은 1회 세션
      return {
        id: booking?.id || payment.id,
        scheduledAt: booking?.scheduledAt?.toISOString() || payment.createdAt.toISOString(),
        status: booking?.status || 'PENDING_CONFIRMATION',
        therapistNote: booking?.therapistNote || null,
        parentUser: payment.parentUser,
        child: payment.child,
        therapist: payment.therapist,
        review: booking?.review || null,
        payment: {
          id: payment.id,
          finalFee: payment.finalFee,
          status: payment.status,
          sessionType: payment.sessionType,
          totalSessions: payment.totalSessions,
          originalFee: payment.originalFee,
          discountRate: payment.discountRate,
          paidAt: payment.paidAt?.toISOString() || null,
          settlementAmount: payment.settlementAmount,
          settledAt: payment.settledAt?.toISOString() || null,
          settlementNote: payment.settlementNote,
        },
        currentStatus: getConsultationStatus(payment),
      }
    })

    return NextResponse.json({
      consultations: consultationsWithStatus,
    })
  } catch (error) {
    console.error('언어 컨설팅 조회 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
