import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

// 5단계 상태 계산 함수
function getTherapyStatus(payment: any) {
  // 1. 결제대기 (PENDING_PAYMENT)
  if (payment.status === 'PENDING_PAYMENT') {
    return 'PENDING_PAYMENT'
  }

  // 5. 취소 (CANCELLED/REFUNDED)
  if (payment.status === 'REFUNDED' || payment.status === 'PARTIALLY_REFUNDED') {
    return 'CANCELLED'
  }

  // booking 상태 확인 (1회 세션이므로 첫 번째 booking 사용)
  const booking = payment.bookings?.[0]

  if (!booking) {
    return 'PENDING_PAYMENT' // booking이 없으면 결제대기
  }

  // 5. 취소 (CANCELLED/REJECTED)
  if (booking.status === 'CANCELLED' || booking.status === 'REJECTED') {
    return 'CANCELLED'
  }

  // 4. 완료 (COMPLETED)
  if (booking.status === 'COMPLETED') {
    return 'COMPLETED'
  }

  // 3. 진행예정 (CONFIRMED)
  if (booking.status === 'CONFIRMED') {
    return 'CONFIRMED'
  }

  // 2. 예약대기 (PENDING_CONFIRMATION)
  if (booking.status === 'PENDING_CONFIRMATION') {
    return 'PENDING_CONFIRMATION'
  }

  // 기본값
  return 'PENDING_CONFIRMATION'
}

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

    // 상태 필터 적용 (booking 상태 기반 필터링)
    const filteredTherapies = therapies.filter((payment) => {
      if (!statusFilter || statusFilter === 'ALL') return true

      const currentStatus = getTherapyStatus(payment)
      return currentStatus === statusFilter
    })

    // 각 payment에 현재 상태 추가
    const therapiesWithStatus = filteredTherapies.map((payment) => ({
      ...payment,
      currentStatus: getTherapyStatus(payment),
    }))

    return NextResponse.json({
      therapies: therapiesWithStatus,
    })
  } catch (error) {
    console.error('홈티 내역 조회 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
