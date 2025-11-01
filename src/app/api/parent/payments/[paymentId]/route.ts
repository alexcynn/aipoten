import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

// GET - 특정 결제 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'PARENT') {
      return NextResponse.json(
        { error: '부모 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    const payment = await prisma.payment.findUnique({
      where: {
        id: params.paymentId,
      },
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
            user: {
              select: {
                name: true,
                phone: true,
                email: true,
              },
            },
            specialties: true,
            education: true,
            introduction: true,
            experience: true,
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
        refundRequests: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    if (!payment) {
      return NextResponse.json(
        { error: '결제 정보를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 본인의 결제인지 확인
    if (payment.parentUserId !== session.user.id) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    // 완료된 세션 수 계산
    const paymentWithProgress = {
      ...payment,
      completedSessions: payment.bookings.filter((b) => b.status === 'COMPLETED').length,
    }

    // 시스템 설정에서 계좌 정보 가져오기 (결제 대기 시 필요)
    const settings = await prisma.systemSettings.findUnique({
      where: { id: 'system' },
      select: {
        bankName: true,
        accountNumber: true,
        accountHolder: true,
      },
    })

    return NextResponse.json({
      payment: paymentWithProgress,
      accountInfo: settings,
    })
  } catch (error) {
    console.error('결제 상세 조회 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
