/**
 * 관리자 문의 관리 API
 * GET /api/admin/inquiries - 모든 문의 목록 조회
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/inquiries
 * 모든 문의 목록 조회 (관리자 전용)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // 관리자 권한 확인
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const userId = searchParams.get('userId')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // 필터 조건 구성
    const where: any = {}

    if (status) {
      where.status = status
    }

    if (category) {
      where.category = category
    }

    if (userId) {
      where.userId = userId
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ]
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
              phone: true,
              address: true,
              addressDetail: true,
              therapistProfile: true,
            },
          },
        },
      }),
      prisma.inquiry.count({ where }),
    ])

    // 통계 정보
    const stats = await prisma.inquiry.groupBy({
      by: ['status'],
      _count: true,
    })

    return NextResponse.json({
      success: true,
      inquiries,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      stats: stats.reduce((acc: any, curr: any) => {
        acc[curr.status] = curr._count
        return acc
      }, {}),
    })
  } catch (error) {
    console.error('문의 목록 조회 오류:', error)
    return NextResponse.json(
      { error: '문의 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
