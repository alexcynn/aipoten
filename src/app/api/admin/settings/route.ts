import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

// GET - 시스템 설정 조회 (공개 API - 계좌 정보 등을 위해 인증 불필요)
export async function GET(request: NextRequest) {
  try {
    console.log('📥 [API] 시스템 설정 조회 시작...')

    // 시스템 설정 조회 (없으면 기본값으로 생성)
    let settings = await prisma.systemSettings.findUnique({
      where: { id: 'system' },
    })

    console.log('📥 [API] 조회 결과:', settings ? '데이터 있음' : '데이터 없음')

    if (!settings) {
      console.log('📥 [API] 시스템 설정이 없어 새로 생성합니다...')
      settings = await prisma.systemSettings.create({
        data: {
          id: 'system',
        },
      })
      console.log('📥 [API] 시스템 설정 생성 완료:', settings)
    }

    console.log('📥 [API] 응답 데이터:', JSON.stringify(settings, null, 2))
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
    const {
      bankName,
      accountNumber,
      accountHolder,
      settlementRate,
    } = body

    // 검증
    if (settlementRate !== undefined && settlementRate !== null) {
      if (typeof settlementRate !== 'number' || settlementRate < 0 || settlementRate > 100) {
        return NextResponse.json(
          { error: '정산율은 0~100 사이의 값이어야 합니다.' },
          { status: 400 }
        )
      }
    }

    // 시스템 설정 업데이트 (없으면 생성)
    const updateData: any = {
      updatedBy: session.user.id,
    }

    if (bankName !== undefined) updateData.bankName = bankName
    if (accountNumber !== undefined) updateData.accountNumber = accountNumber
    if (accountHolder !== undefined) updateData.accountHolder = accountHolder
    if (settlementRate !== undefined) updateData.settlementRate = settlementRate

    const settings = await prisma.systemSettings.upsert({
      where: { id: 'system' },
      update: updateData,
      create: {
        id: 'system',
        ...updateData,
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
