import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// GET - 리뷰 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'PARENT') {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        payment: true,
        review: true,
      },
    })

    if (!booking) {
      return NextResponse.json(
        { error: '예약을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 본인의 예약인지 확인
    if (booking.payment.parentUserId !== session.user.id) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    return NextResponse.json({ review: booking.review })
  } catch (error) {
    console.error('리뷰 조회 오류:', error)
    return NextResponse.json(
      { error: '리뷰 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// POST - 리뷰 작성
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'PARENT') {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    const { rating, content } = await request.json()

    // 평점 유효성 검사
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: '평점은 1~5점 사이여야 합니다.' },
        { status: 400 }
      )
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        payment: true,
        review: true,
      },
    })

    if (!booking) {
      return NextResponse.json(
        { error: '예약을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 본인의 예약인지 확인
    if (booking.payment.parentUserId !== session.user.id) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    // 완료된 세션인지 확인
    if (booking.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: '완료된 세션만 리뷰를 작성할 수 있습니다.' },
        { status: 400 }
      )
    }

    // 이미 리뷰가 있는지 확인
    if (booking.review) {
      return NextResponse.json(
        { error: '이미 리뷰를 작성하셨습니다.' },
        { status: 400 }
      )
    }

    // 세션 날짜로부터 7일 이내인지 확인
    const sessionDate = new Date(booking.scheduledAt)
    const now = new Date()
    const daysSinceSession = Math.floor(
      (now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysSinceSession > 7) {
      return NextResponse.json(
        { error: '세션 종료 후 7일 이내에만 리뷰를 작성할 수 있습니다.' },
        { status: 400 }
      )
    }

    // 리뷰 생성
    const review = await prisma.review.create({
      data: {
        bookingId: params.id,
        parentUserId: session.user.id,
        rating: parseInt(rating),
        content: content || null,
      },
    })

    return NextResponse.json({ review }, { status: 201 })
  } catch (error) {
    console.error('리뷰 작성 오류:', error)
    return NextResponse.json(
      { error: '리뷰 작성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
