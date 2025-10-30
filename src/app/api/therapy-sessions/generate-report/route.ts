/**
 * AI 상담일지 생성 API
 * POST /api/therapy-sessions/generate-report
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateSessionReport } from '@/lib/services/vertexAIService'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'THERAPIST') {
      return NextResponse.json(
        { error: '치료사만 상담일지를 생성할 수 있습니다.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      childName,
      sessionType,
      sessionNumber,
      sessionGoal,
      observation,
      activities,
      materials,
      strengths,
      concerns,
      homeCoaching,
      nextPlan,
    } = body

    // 필수 항목 검증
    if (!childName || !sessionType || !sessionNumber || !sessionGoal || !observation || !activities) {
      return NextResponse.json(
        { error: '필수 항목을 모두 입력해주세요. (이름, 세션 유형, 회차, 세션 목표, 아동 상태/관찰, 오늘 활동)' },
        { status: 400 }
      )
    }

    // AI로 상담일지 생성
    const report = await generateSessionReport({
      childName,
      sessionType,
      sessionNumber,
      sessionGoal,
      observation,
      activities,
      materials,
      strengths,
      concerns,
      homeCoaching,
      nextPlan,
    })

    return NextResponse.json({
      success: true,
      report,
    })
  } catch (error) {
    console.error('AI 상담일지 생성 오류:', error)
    return NextResponse.json(
      { error: 'AI 상담일지 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
