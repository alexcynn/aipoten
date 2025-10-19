'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'

interface QuestionResponse {
  questionId: string
  questionText: string
  answer: string
  score: number
}

interface TrialQuestion {
  id: string
  level: 'Q1' | 'Q2'
  text: string
  category: string
  questionNumber: number
}

// 체험판용 언어 발달 질문 (Q1→Q2 흐름 포함)
const TRIAL_QUESTIONS: TrialQuestion[] = [
  // 질문 1
  { id: 'lang_1_q1', level: 'Q1', questionNumber: 1, text: '두 낱말을 함께 말하나요? (예: \'엄마 신발\', \'아빠 차\')', category: 'LANGUAGE' },
  { id: 'lang_1_q2', level: 'Q2', questionNumber: 1, text: '한 낱말을 말하나요?', category: 'LANGUAGE' },
  // 질문 2
  { id: 'lang_2_q1', level: 'Q1', questionNumber: 2, text: '자신의 이름을 알고 있나요?', category: 'LANGUAGE' },
  { id: 'lang_2_q2', level: 'Q2', questionNumber: 2, text: '자신의 이름을 들으면 반응하나요?', category: 'LANGUAGE' },
  // 질문 3
  { id: 'lang_3_q1', level: 'Q1', questionNumber: 3, text: '두 가지 이상의 지시사항을 기억하여 실행하나요? (예: \'신발을 벗어서 신발장에 넣어줘\')', category: 'LANGUAGE' },
  { id: 'lang_3_q2', level: 'Q2', questionNumber: 3, text: '한 가지 지시사항을 실행하나요? (예: \'신발 벗어줘\')', category: 'LANGUAGE' },
  // 질문 4
  { id: 'lang_4_q1', level: 'Q1', questionNumber: 4, text: '대화할 때 아이의 말을 이해할 수 있나요?', category: 'LANGUAGE' },
  { id: 'lang_4_q2', level: 'Q2', questionNumber: 4, text: '아이가 가리키거나 몸짓으로 의사를 표현하나요?', category: 'LANGUAGE' },
  // 질문 5
  { id: 'lang_5_q1', level: 'Q1', questionNumber: 5, text: '2가지 이상의 물건 이름을 말하나요? (예: 컵, 숟가락 등)', category: 'LANGUAGE' },
  { id: 'lang_5_q2', level: 'Q2', questionNumber: 5, text: '최소 1가지 물건 이름을 말하나요?', category: 'LANGUAGE' },
  // 질문 6
  { id: 'lang_6_q1', level: 'Q1', questionNumber: 6, text: '간단한 의문사 질문에 대답하나요? (예: \'뭐 하고 있어?\', \'뭐 먹었어?\' 등)', category: 'LANGUAGE' },
  { id: 'lang_6_q2', level: 'Q2', questionNumber: 6, text: '예/아니오로 대답하나요?', category: 'LANGUAGE' },
  // 질문 7
  { id: 'lang_7_q1', level: 'Q1', questionNumber: 7, text: '"크다", "작다" 등과 같은 형용사를 말하나요?', category: 'LANGUAGE' },
  { id: 'lang_7_q2', level: 'Q2', questionNumber: 7, text: '크기나 상태의 차이를 이해하나요?', category: 'LANGUAGE' },
  // 질문 8
  { id: 'lang_8_q1', level: 'Q1', questionNumber: 8, text: '색깔 이름을 말하나요? (예: 빨강, 노랑 등)', category: 'LANGUAGE' },
  { id: 'lang_8_q2', level: 'Q2', questionNumber: 8, text: '같은 색깔끼리 분류할 수 있나요?', category: 'LANGUAGE' },
]

const FOUR_POINT_OPTIONS = [
  { value: '잘함', score: 3, emoji: '😊' },
  { value: '대체로 잘함', score: 2, emoji: '🙂' },
  { value: '대체로 못함', score: 1, emoji: '😐' },
  { value: '전혀 못함', score: 0, emoji: '😟' },
]

const TWO_POINT_OPTIONS = [
  { value: '잘함', score: 1, emoji: '😊' },
  { value: '못함', score: 0, emoji: '😟' },
]

function TrialQuestionsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [childInfo, setChildInfo] = useState({
    ageInMonths: 0,
    gender: '',
    height: '',
    weight: '',
  })
  const [questionPath, setQuestionPath] = useState<TrialQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState<QuestionResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // URL에서 아이 정보 가져오기
    const ageInMonths = parseInt(searchParams.get('ageInMonths') || '0')
    const gender = searchParams.get('gender') || ''
    const height = searchParams.get('height') || ''
    const weight = searchParams.get('weight') || ''

    if (!ageInMonths || !gender) {
      router.push('/assessments/trial')
      return
    }

    setChildInfo({ ageInMonths, gender, height, weight })
    // 초기 질문 경로: 모든 Q1 질문
    const initialPath = TRIAL_QUESTIONS.filter(q => q.level === 'Q1')
    setQuestionPath(initialPath)
    setIsLoading(false)
  }, [searchParams, router])

  const currentQuestion = questionPath[currentQuestionIndex]
  const totalQ1Questions = TRIAL_QUESTIONS.filter(q => q.level === 'Q1').length
  const completedQ1 = responses.filter(r => {
    const question = TRIAL_QUESTIONS.find(q => q.id === r.questionId)
    return question?.level === 'Q1'
  }).length
  const progress = totalQ1Questions > 0 ? (completedQ1 / totalQ1Questions) * 100 : 0

  const handleAnswer = (answer: string, score: number) => {
    if (!currentQuestion) return

    const newResponse: QuestionResponse = {
      questionId: currentQuestion.id,
      questionText: currentQuestion.text,
      answer,
      score,
    }

    const newResponses = [...responses, newResponse]
    setResponses(newResponses)

    // Q1에서 "대체로 못함" 또는 "전혀 못함" 선택 시 Q2로
    if (currentQuestion.level === 'Q1' && (answer === '대체로 못함' || answer === '전혀 못함')) {
      const q2 = TRIAL_QUESTIONS.find(q => q.level === 'Q2' && q.questionNumber === currentQuestion.questionNumber)
      if (q2) {
        // Q2를 현재 경로에 추가
        setTimeout(() => {
          setQuestionPath(prev => {
            const newPath = [...prev]
            newPath.splice(currentQuestionIndex + 1, 0, q2)
            return newPath
          })
          setCurrentQuestionIndex(prev => prev + 1)
        }, 300)
        return
      }
    }

    // 다음 질문으로 이동 또는 완료
    if (currentQuestionIndex < questionPath.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1)
      }, 300)
    } else {
      // 모든 질문 완료 - 결과 페이지로 이동
      setTimeout(() => {
        const totalScore = newResponses.reduce((sum, r) => sum + r.score, 0)

        const params = new URLSearchParams({
          ageInMonths: childInfo.ageInMonths.toString(),
          gender: childInfo.gender,
          totalScore: totalScore.toString(),
          ...(childInfo.height && { height: childInfo.height }),
          ...(childInfo.weight && { weight: childInfo.weight }),
        })

        router.push(`/assessments/trial/result?${params.toString()}`)
      }, 300)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
      setResponses(prev => prev.slice(0, -1))
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aipoten-green mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return null
  }

  return (
    <div className="min-h-screen bg-neutral-light">
      <Header />

      {/* Main Content */}
      <main className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8">
            {/* Progress */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-brand-navy">
                  언어 발달 체크 {currentQuestion?.level && `(${currentQuestion.level})`}
                </span>
                <span className="text-sm text-gray-600">
                  {completedQ1} / {totalQ1Questions}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-brand-accent h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Question */}
            <div className="mb-8">
              <div className="bg-neutral-light rounded-lg p-6 mb-6 border-l-4 border-brand-accent">
                <h2 className="text-xl font-medium text-brand-navy mb-2">
                  질문 {currentQuestion?.questionNumber} {currentQuestion?.level === 'Q2' && '- 추가 질문'}
                </h2>
                <p className="text-lg text-gray-800">
                  {currentQuestion?.text}
                </p>
              </div>

              {/* Answer Options */}
              <div className="space-y-3">
                {(currentQuestion?.level === 'Q1' ? FOUR_POINT_OPTIONS : TWO_POINT_OPTIONS).map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(option.value, option.score)}
                    className="w-full p-4 border-2 border-gray-300 rounded-lg hover:border-brand-accent hover:bg-brand-accent hover:bg-opacity-10 transition-colors text-left group"
                  >
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{option.emoji}</span>
                      <span className="text-gray-900 font-medium group-hover:text-brand-green">
                        {option.value}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-4 border-t">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← 이전
              </button>

              <div className="text-sm text-gray-500">
                응답 완료: {responses.length}개
              </div>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-sm text-blue-800">
            💡 체험판은 언어 발달 영역만 평가합니다. 전체 5개 영역 진단을 원하시면{' '}
            <Link href="/signup" className="font-semibold underline hover:text-blue-900">
              회원가입
            </Link>
            을 해주세요!
          </p>
        </div>
      </main>
    </div>
  )
}

export default function TrialQuestionsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aipoten-green mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <TrialQuestionsContent />
    </Suspense>
  )
}
