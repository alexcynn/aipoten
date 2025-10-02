import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

// 아이 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    const children = await prisma.child.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        birthDate: true,
        gender: true,
        currentHeight: true,
        currentWeight: true,
        medicalHistory: true,
        familyHistory: true,
        treatmentHistory: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            assessments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // 각 아이의 현재 월령 계산
    const childrenWithAge = children.map(child => {
      const birthDate = new Date(child.birthDate)
      const today = new Date()
      const ageInMonths = Math.floor(
        (today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
      )

      return {
        ...child,
        ageInMonths
      }
    })

    return NextResponse.json({ children: childrenWithAge })
  } catch (error) {
    console.error('아이 목록 조회 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 아이 정보 등록
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    const {
      name,
      birthDate,
      gender,
      gestationalWeeks,
      birthWeight,
      currentHeight,
      currentWeight,
      medicalHistory,
      familyHistory,
      treatmentHistory,
      notes
    } = await request.json()

    if (!name || !birthDate || !gender) {
      return NextResponse.json(
        { error: '이름, 생년월일, 성별은 필수입니다.' },
        { status: 400 }
      )
    }

    const child = await prisma.child.create({
      data: {
        userId: session.user.id,
        name,
        birthDate: new Date(birthDate),
        gender,
        gestationalWeeks,
        birthWeight,
        currentHeight,
        currentWeight,
        medicalHistory,
        familyHistory,
        treatmentHistory,
        notes
      }
    })

    return NextResponse.json({
      message: '아이 정보가 등록되었습니다.',
      child
    })
  } catch (error) {
    console.error('아이 정보 등록 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}