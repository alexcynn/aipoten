import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

// GET - 결제 내역 조회 (bookingGroupId로 그룹화)
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
    const filter = searchParams.get('filter') // ALL, PENDING, PAID, REFUNDED

    // 모든 예약 조회
    const where: any = {}

    if (filter && filter !== 'ALL') {
      if (filter === 'PENDING') {
        where.status = 'PENDING_PAYMENT'
      } else if (filter === 'PAID') {
        where.paidAt = { not: null }
        where.status = { not: 'REFUNDED' }
      } else if (filter === 'REFUNDED') {
        where.status = 'REFUNDED'
      }
    }

    const bookings = await prisma.booking.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
    })

    // bookingGroupId로 그룹화 (원래대로)
    const groupedPayments: any[] = []
    const processedGroups = new Set<string>()

    for (const booking of bookings) {
      const groupId = booking.bookingGroupId || booking.id

      // 이미 처리한 그룹이면 스킵
      if (processedGroups.has(groupId)) {
        continue
      }

      processedGroups.add(groupId)

      // 같은 그룹의 모든 예약 찾기
      const groupBookings = bookings.filter(
        (b) => (b.bookingGroupId || b.id) === groupId
      )

      // 그룹 정보 계산
      const totalFee = groupBookings.reduce((sum, b) => sum + b.finalFee, 0)
      const totalSessions = groupBookings.reduce((sum, b) => sum + b.sessionCount, 0)
      const completedSessions = groupBookings.reduce((sum, b) => sum + b.completedSessions, 0)

      // 대표 예약 정보 사용
      const representative = groupBookings[0]

      groupedPayments.push({
        groupId,
        bookingIds: groupBookings.map((b) => b.id),
        sessionType: representative.sessionType,
        totalFee,
        totalSessions,
        completedSessions,
        status: representative.status,
        paidAt: representative.paidAt,
        refundAmount: representative.refundAmount,
        parentUser: representative.parentUser,
        child: representative.child,
        therapist: representative.therapist,
        scheduledAt: representative.scheduledAt,
        createdAt: representative.createdAt,
        bookingCount: groupBookings.length,
      })
    }

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
      payments: groupedPayments,
      accountInfo: settings,
    })
  } catch (error) {
    console.error('결제 내역 조회 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
