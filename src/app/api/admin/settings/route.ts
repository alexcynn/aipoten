import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

// GET - 시스템 설정 조회
export async function GET(request: NextRequest) {
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

    // 시스템 설정 조회 (없으면 기본값으로 생성)
    let settings = await prisma.systemSettings.findUnique({
      where: { id: 'system' },
    })

    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          id: 'system',
        },
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('시스템 설정 조회 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// PUT - 시스템 설정 수정
export async function PUT(request: NextRequest) {
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

    const body = await request.json()
    const { bankName, accountNumber, accountHolder, consultationBaseFee } = body

    // 시스템 설정 업데이트 (없으면 생성)
    const settings = await prisma.systemSettings.upsert({
      where: { id: 'system' },
      update: {
        bankName,
        accountNumber,
        accountHolder,
        consultationBaseFee,
        updatedBy: session.user.id,
      },
      create: {
        id: 'system',
        bankName,
        accountNumber,
        accountHolder,
        consultationBaseFee,
        updatedBy: session.user.id,
      },
    })

    return NextResponse.json({
      message: '시스템 설정이 업데이트되었습니다.',
      settings,
    })
  } catch (error) {
    console.error('시스템 설정 수정 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
