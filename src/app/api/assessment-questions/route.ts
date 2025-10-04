import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ageInMonths = parseInt(searchParams.get('ageInMonths') || '0')

    if (!ageInMonths) {
      return NextResponse.json(
        { error: '월령 정보가 필요합니다.' },
        { status: 400 }
      )
    }

    // 해당 월령에 맞는 질문들 가져오기
    const questions = await prisma.assessmentQuestion.findMany({
      where: {
        ageMin: {
          lte: ageInMonths
        },
        ageMax: {
          gte: ageInMonths
        }
      },
      orderBy: {
        order: 'asc'
      }
    })

    // 질문이 없으면 모든 질문 반환 (fallback)
    if (questions.length === 0) {
      const allQuestions = await prisma.assessmentQuestion.findMany({
        orderBy: {
          order: 'asc'
        }
      })
      return NextResponse.json(allQuestions)
    }

    return NextResponse.json(questions)

  } catch (error) {
    console.error('평가 질문 조회 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
