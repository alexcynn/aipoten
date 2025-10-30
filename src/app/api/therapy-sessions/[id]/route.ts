/**
 * 세션 관리 API
 * GET /api/therapy-sessions/[id] - 세션 조회
 * PUT /api/therapy-sessions/[id] - 세션 업데이트 (상담일지 작성)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/therapy-sessions/[id]
 * 특정 세션 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const therapySession = await prisma.therapySession.findUnique({
      where: { id: params.id },
      include: {
        booking: {
          include: {
            child: true,
            parentUser: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            therapist: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!therapySession) {
      return NextResponse.json(
        { error: '세션을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 권한 확인: 치료사, 부모, 관리자만 조회 가능
    const isTherapist = therapySession.booking.therapistId === session.user.therapistProfileId
    const isParent = therapySession.booking.parentUserId === session.user.id
    const isAdmin = session.user.role === 'ADMIN'

    if (!isTherapist && !isParent && !isAdmin) {
      return NextResponse.json(
        { error: '세션을 조회할 권한이 없습니다.' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      session: therapySession,
    })
  } catch (error) {
    console.error('세션 조회 오류:', error)
    return NextResponse.json(
      { error: '세션 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/therapy-sessions/[id]
 * 세션 업데이트 (상담일지 작성/수정)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { therapistNote, status, completedAt, parentFeedback } = body

    // 세션 존재 및 권한 확인
    const therapySession = await prisma.therapySession.findUnique({
      where: { id: params.id },
      include: {
        booking: true,
      },
    })

    if (!therapySession) {
      return NextResponse.json(
        { error: '세션을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 치료사만 상담일지 작성 가능 (부모는 피드백만 작성 가능)
    const isTherapist = therapySession.booking.therapistId === session.user.therapistProfileId
    const isParent = therapySession.booking.parentUserId === session.user.id

    // 업데이트 데이터 구성
    const updateData: any = {}

    if (isTherapist) {
      if (therapistNote !== undefined) updateData.therapistNote = therapistNote
      if (status !== undefined) updateData.status = status
      if (completedAt !== undefined) updateData.completedAt = completedAt ? new Date(completedAt) : null
    } else if (isParent) {
      // 부모는 피드백만 수정 가능
      if (parentFeedback !== undefined) updateData.parentFeedback = parentFeedback
    } else {
      return NextResponse.json(
        { error: '세션을 수정할 권한이 없습니다.' },
        { status: 403 }
      )
    }

    // 세션 업데이트
    const updatedSession = await prisma.therapySession.update({
      where: { id: params.id },
      data: updateData,
      include: {
        booking: {
          include: {
            child: true,
            parentUser: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            therapist: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    // 세션 완료 시 Booking의 completedSessions 카운트 업데이트
    if (status === 'COMPLETED' && therapySession.status !== 'COMPLETED') {
      await prisma.booking.update({
        where: { id: therapySession.bookingId },
        data: {
          completedSessions: {
            increment: 1,
          },
        },
      })
    }

    return NextResponse.json({
      success: true,
      session: updatedSession,
    })
  } catch (error) {
    console.error('세션 업데이트 오류:', error)
    return NextResponse.json(
      { error: '세션 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
