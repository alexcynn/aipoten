import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

// 매칭 요청 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const matchingRequest = await prisma.matchingRequest.findFirst({
      where: {
        id: params.id,
        therapist: {
          userId: session.user.id
        }
      },
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
      }
    })

    if (!matchingRequest) {
      return NextResponse.json(
        { error: '매칭 요청을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const formattedRequest = {
      id: matchingRequest.id,
      childName: matchingRequest.child.name,
      parentName: matchingRequest.parentUser.name,
      parentEmail: matchingRequest.parentUser.email,
      parentPhone: matchingRequest.parentUser.phone,
      childAge: Math.floor((new Date().getTime() - new Date(matchingRequest.child.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 30.44)),
      childGender: matchingRequest.child.gender,
      preferredDates: JSON.parse(matchingRequest.preferredDates || '[]'),
      notes: matchingRequest.notes,
      status: matchingRequest.status,
      therapistResponse: matchingRequest.therapistResponse,
      createdAt: matchingRequest.createdAt.toISOString()
    }

    return NextResponse.json(formattedRequest)
  } catch (error) {
    console.error('매칭 요청 상세 조회 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 매칭 요청 응답
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { status, response } = await request.json()

    if (!status || !response) {
      return NextResponse.json(
        { error: '상태와 응답 메시지는 필수입니다.' },
        { status: 400 }
      )
    }

    // 치료사 본인의 요청인지 확인
    const existingRequest = await prisma.matchingRequest.findFirst({
      where: {
        id: params.id,
        therapist: {
          userId: session.user.id
        }
      }
    })

    if (!existingRequest) {
      return NextResponse.json(
        { error: '권한이 없거나 요청을 찾을 수 없습니다.' },
        { status: 403 }
      )
    }

    if (existingRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: '이미 처리된 요청입니다.' },
        { status: 400 }
      )
    }

    const updatedRequest = await prisma.matchingRequest.update({
      where: { id: params.id },
      data: {
        status,
        therapistResponse: response
      }
    })

    // 승인된 경우 상담 예약 생성 (임시로 첫 번째 희망 날짜 사용)
    if (status === 'APPROVED') {
      const preferredDates = JSON.parse(existingRequest.preferredDates || '[]')
      if (preferredDates.length > 0) {
        const therapistProfile = await prisma.therapistProfile.findUnique({
          where: { userId: session.user.id }
        })

        if (therapistProfile) {
          await prisma.consultation.create({
            data: {
              matchingRequestId: params.id,
              parentUserId: existingRequest.parentUserId,
              childId: existingRequest.childId,
              therapistId: therapistProfile.id,
              scheduledAt: new Date(preferredDates[0] + ' 10:00:00'), // 임시로 10시 설정
              fee: therapistProfile.consultationFee,
              type: 'ONLINE', // 기본값
              status: 'SCHEDULED',
              paymentStatus: 'PENDING'
            }
          })
        }
      }
    }

    return NextResponse.json({
      message: '매칭 요청이 처리되었습니다.',
      request: updatedRequest
    })
  } catch (error) {
    console.error('매칭 요청 처리 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}