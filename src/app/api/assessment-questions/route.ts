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

    // 해당 월령에 맞는 질문들 가져오기
    console.log('Fetching questions for age:', ageInMonths)
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

    console.log('Found questions:', questions.length)

    // 질문이 없으면 모든 질문 반환 (fallback)
    if (questions.length === 0) {
      console.log('No questions found for age, returning all questions')
      const allQuestions = await prisma.assessmentQuestion.findMany({
        orderBy: {
          order: 'asc'
        }
      })
      console.log('All questions count:', allQuestions.length)
      return NextResponse.json(allQuestions)
    }

    return NextResponse.json(questions)

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
