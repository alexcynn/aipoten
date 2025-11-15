import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/settings
 * 시스템 설정 조회 (공개 API - 계좌 정보 등)
 * 인증 불필요
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📥 [API] 시스템 설정 조회 시작... (공개 API)')

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
    console.error('❌ 시스템 설정 조회 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
