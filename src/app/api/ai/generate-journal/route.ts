import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { generateSessionReport } from '@/lib/services/vertexAIService'

// Vertex AI를 사용하여 상담일지 생성
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'THERAPIST') {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    const {
      childName,
      sessionType,
      sessionGoal,
      childObservation,
      todayActivities,
      materials,
      strengths,
      concerns,
      homework,
      nextPlan,
      customPrompt, // 커스텀 프롬프트 추가
    } = await request.json()

    // 커스텀 프롬프트가 있으면 그것을 사용, 없으면 기본 서비스 사용
    let journal: string

    if (customPrompt) {
      // 커스텀 프롬프트로 직접 생성
      const { generateText } = await import('@/lib/services/vertexAIService')
      journal = await generateText(customPrompt, {
        temperature: 0.7,
        maxOutputTokens: 4000,
      })
    } else {
      // 기존 Vertex AI 서비스 사용
      journal = await generateSessionReport({
        childName,
        sessionType,
        sessionNumber: 1, // 테스트용으로 1회차로 설정
        sessionGoal,
        observation: childObservation,
        activities: todayActivities,
        materials,
        strengths,
        concerns,
        homeCoaching: homework,
        nextPlan,
      })
    }

    return NextResponse.json({ journal })
  } catch (error) {
    console.error('상담일지 생성 오류:', error)
    return NextResponse.json(
      { error: '상담일지 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
