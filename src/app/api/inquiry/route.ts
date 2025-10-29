/**
 * 사용자 문의 API
 * - POST: 새 문의 등록
 * - GET: 사용자의 문의 목록 조회
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { InquiryCategory } from '@prisma/client'

/**
 * POST /api/inquiry
 * 새 문의 등록
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { category, title, content } = body

    // 유효성 검증
    if (!category || !title || !content) {
      return NextResponse.json(
        { error: '카테고리, 제목, 내용을 모두 입력해주세요.' },
        { status: 400 }
      )
    }

    // 카테고리 검증
    if (!Object.values(InquiryCategory).includes(category)) {
      return NextResponse.json(
        { error: '올바른 카테고리를 선택해주세요.' },
        { status: 400 }
      )
    }

    // 문의 생성
    const inquiry = await prisma.inquiry.create({
      data: {
        userId: session.user.id,
        category,
        title,
        content,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      inquiry,
    })
  } catch (error) {
    console.error('문의 등록 오류:', error)
    return NextResponse.json(
      { error: '문의 등록 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/inquiry
 * 사용자의 문의 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    const skip = (page - 1) * limit

    // 필터 조건 구성
    const where: any = {
      userId: session.user.id,
    }

    if (status) {
      where.status = status
    }

    // 문의 목록 조회
    const [inquiries, total] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      }),
      prisma.inquiry.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      inquiries,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('문의 목록 조회 오류:', error)
    return NextResponse.json(
      { error: '문의 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
