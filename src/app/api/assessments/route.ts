import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'

// 발달 체크 생성
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    const { childId, ageInMonths } = await request.json()

    if (!childId || !ageInMonths) {
      return NextResponse.json(
        { error: '아이 ID와 연령은 필수입니다.' },
        { status: 400 }
      )
    }

    // 본인의 아이인지 확인
    const child = await prisma.child.findUnique({
      where: {
        id: childId,
        userId: session.user.id
      }
    })

    if (!child) {
      return NextResponse.json(
        { error: '아이 정보를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 이미 진행 중인 발달 체크가 있는지 확인
    const existingAssessment = await prisma.developmentAssessment.findFirst({
      where: {
        childId,
        ageInMonths,
        status: 'IN_PROGRESS'
      }
    })

    if (existingAssessment) {
      return NextResponse.json({
        message: '진행 중인 발달 체크를 이어서 진행하세요.',
        assessment: existingAssessment
      })
    }

    const assessment = await prisma.developmentAssessment.create({
      data: {
        childId,
        ageInMonths,
        status: 'IN_PROGRESS'
      }
    })

    return NextResponse.json({
      message: '발달 체크가 시작되었습니다.',
      assessment
    })
  } catch (error) {
    console.error('발달 체크 생성 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 사용자별 발달 체크 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const childId = searchParams.get('childId')

    let whereCondition: any = {
      child: {
        userId: session.user.id
      }
    }

    if (childId) {
      whereCondition.childId = childId
    }

    const assessments = await prisma.developmentAssessment.findMany({
      where: whereCondition,
      include: {
        child: {
          select: {
            id: true,
            name: true
          }
        },
        results: {
          select: {
            id: true,
            category: true,
            score: true,
            level: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ assessments })
  } catch (error) {
    console.error('발달 체크 목록 조회 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}