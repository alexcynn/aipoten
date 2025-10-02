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

    const therapists = await prisma.therapistProfile.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedTherapists = therapists.map(therapist => ({
      id: therapist.id,
      user: therapist.user,
      specialty: therapist.specialty,
      experience: therapist.experience,
      education: therapist.education,
      certifications: JSON.parse(therapist.certifications || '[]'),
      consultationFee: therapist.consultationFee,
      description: therapist.description,
      status: therapist.status,
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