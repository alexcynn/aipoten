import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

// 치료사의 상담 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'THERAPIST') {
      return NextResponse.json(
        { error: '치료사 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    // 치료사 프로필 확인
    const therapistProfile = await prisma.therapistProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!therapistProfile) {
      return NextResponse.json(
        { error: '치료사 프로필을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const consultations = await prisma.consultation.findMany({
      where: { therapistId: therapistProfile.id },
      include: {
        parentUser: {
          select: {
            name: true,
            email: true
          }
        },
        child: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        scheduledAt: 'desc'
      }
    })

    // 데이터 포맷팅
    const formattedConsultations = consultations.map(consultation => ({
      id: consultation.id,
      childName: consultation.child.name,
      parentName: consultation.parentUser.name,
      parentEmail: consultation.parentUser.email,
      scheduledAt: consultation.scheduledAt.toISOString(),
      duration: consultation.duration,
      type: consultation.type,
      status: consultation.status,
      fee: consultation.fee,
      paymentStatus: consultation.paymentStatus,
      notes: consultation.notes,
      feedback: consultation.feedback
    }))

    return NextResponse.json(formattedConsultations)
  } catch (error) {
    console.error('상담 목록 조회 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}