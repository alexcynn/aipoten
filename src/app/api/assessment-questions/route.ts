import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ageInMonths = parseInt(searchParams.get('ageInMonths') || '0')

    console.log('Assessment Questions API - ageInMonths:', ageInMonths)

    if (!ageInMonths) {
      return NextResponse.json(
        { error: '월령 정보가 필요합니다.' },
        { status: 400 }
      )
    }

    // Prisma 연결 확인
    if (!prisma) {
      console.error('Prisma client is not initialized')
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 }
      )
    }

    // 모든 질문 가져오기 (나이 제한 없음)
    console.log('Fetching all questions (age filtering disabled)')
    const allQuestions = await prisma.assessmentQuestion.findMany({
      orderBy: {
        order: 'asc'
      }
    })

    console.log('Found questions:', allQuestions.length)
    return NextResponse.json(allQuestions)

  } catch (error: any) {
    console.error('평가 질문 조회 오류 상세:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.', details: error.message },
      { status: 500 }
    )
  }
}
