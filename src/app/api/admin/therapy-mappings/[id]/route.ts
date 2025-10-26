import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

// DELETE - 치료사 매핑 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const resolvedParams = await params

    await prisma.therapyMapping.delete({
      where: { id: resolvedParams.id },
    })

    return NextResponse.json({
      message: '치료사 매핑이 삭제되었습니다.',
    })
  } catch (error) {
    console.error('치료사 매핑 삭제 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// PUT - 치료사 매핑 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const resolvedParams = await params
    const body = await request.json()
    const { priority, isActive } = body

    const mapping = await prisma.therapyMapping.update({
      where: { id: resolvedParams.id },
      data: {
        priority,
        isActive,
      },
    })

    return NextResponse.json({
      message: '치료사 매핑이 수정되었습니다.',
      mapping,
    })
  } catch (error) {
    console.error('치료사 매핑 수정 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
