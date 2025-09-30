import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'

// 아이 상세 정보 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    const { id } = await params

    const child = await prisma.child.findUnique({
      where: {
        id,
        userId: session.user.id  // 본인의 아이만 조회 가능
      },
      include: {
        assessments: {
          include: {
            results: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!child) {
      return NextResponse.json(
        { error: '아이 정보를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 현재 월령 계산
    const birthDate = new Date(child.birthDate)
    const today = new Date()
    const ageInMonths = Math.floor(
      (today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
    )

    return NextResponse.json({
      child: {
        ...child,
        ageInMonths
      }
    })
  } catch (error) {
    console.error('아이 정보 조회 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 아이 정보 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    const { id } = await params
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

    // 본인의 아이인지 확인
    const existingChild = await prisma.child.findUnique({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!existingChild) {
      return NextResponse.json(
        { error: '아이 정보를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const child = await prisma.child.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(birthDate && { birthDate: new Date(birthDate) }),
        ...(gender && { gender }),
        ...(gestationalWeeks !== undefined && { gestationalWeeks }),
        ...(birthWeight !== undefined && { birthWeight }),
        ...(currentHeight !== undefined && { currentHeight }),
        ...(currentWeight !== undefined && { currentWeight }),
        ...(medicalHistory !== undefined && { medicalHistory }),
        ...(familyHistory !== undefined && { familyHistory }),
        ...(treatmentHistory !== undefined && { treatmentHistory }),
        ...(notes !== undefined && { notes })
      }
    })

    return NextResponse.json({
      message: '아이 정보가 수정되었습니다.',
      child
    })
  } catch (error) {
    console.error('아이 정보 수정 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 아이 정보 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    const { id } = await params

    // 본인의 아이인지 확인
    const existingChild = await prisma.child.findUnique({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!existingChild) {
      return NextResponse.json(
        { error: '아이 정보를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    await prisma.child.delete({
      where: { id }
    })

    return NextResponse.json({
      message: '아이 정보가 삭제되었습니다.'
    })
  } catch (error) {
    console.error('아이 정보 삭제 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}