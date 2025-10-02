import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

// 치료사의 매칭 요청 목록 조회
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

    const matchingRequests = await prisma.matchingRequest.findMany({
      where: { therapistId: therapistProfile.id },
      include: {
        parentUser: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        },
        child: {
          select: {
            name: true,
            birthDate: true,
            gender: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // 데이터 포맷팅
    const formattedRequests = matchingRequests.map(request => ({
      id: request.id,
      childName: request.child.name,
      parentName: request.parentUser.name,
      parentEmail: request.parentUser.email,
      parentPhone: request.parentUser.phone,
      childAge: Math.floor((new Date().getTime() - new Date(request.child.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 30.44)),
      childGender: request.child.gender,
      preferredDates: JSON.parse(request.preferredDates || '[]'),
      notes: request.notes,
      status: request.status,
      therapistResponse: request.therapistResponse,
      createdAt: request.createdAt.toISOString()
    }))

    return NextResponse.json(formattedRequests)
  } catch (error) {
    console.error('매칭 요청 조회 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}