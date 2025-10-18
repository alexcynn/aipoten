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

// 체험판용 언어 발달 질문 (Q1 레벨만, 간소화)
const TRIAL_QUESTIONS = [
  { id: 'lang_1', text: '두 낱말을 함께 말하나요? (예: \'엄마 신발\', \'아빠 차\')', category: 'LANGUAGE' },
  { id: 'lang_2', text: '자신의 이름을 알고 있나요?', category: 'LANGUAGE' },
  { id: 'lang_3', text: '두 가지 이상의 지시사항을 기억하여 실행하나요? (예: \'신발을 벗어서 신발장에 넣어줘\')', category: 'LANGUAGE' },
  { id: 'lang_4', text: '대화할 때 아이의 말을 이해할 수 있나요?', category: 'LANGUAGE' },
  { id: 'lang_5', text: '2가지 이상의 물건 이름을 말하나요? (예: 컵, 숟가락 등)', category: 'LANGUAGE' },
  { id: 'lang_6', text: '간단한 의문사 질문에 대답하나요? (예: \'뭐 하고 있어?\', \'뭐 먹었어?\' 등)', category: 'LANGUAGE' },
  { id: 'lang_7', text: '"크다", "작다" 등과 같은 형용사를 말하나요?', category: 'LANGUAGE' },
  { id: 'lang_8', text: '색깔 이름을 말하나요? (예: 빨강, 노랑 등)', category: 'LANGUAGE' },
]

const ANSWER_OPTIONS = [
  { value: '잘함', score: 3, emoji: '😊' },
  { value: '대체로 잘함', score: 2, emoji: '🙂' },
  { value: '대체로 못함', score: 1, emoji: '😐' },
  { value: '전혀 못함', score: 0, emoji: '😟' },
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
    setIsLoading(false)
  }, [searchParams, router])

  const currentQuestion = TRIAL_QUESTIONS[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / TRIAL_QUESTIONS.length) * 100

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

    // 다음 질문으로 이동 또는 완료
    if (currentQuestionIndex < TRIAL_QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1)
      }, 300)
    } else {
      // 모든 질문 완료 - 결과 페이지로 이동
      setTimeout(() => {
        const totalScore = newResponses.reduce((sum, r) => sum + r.score, 0)
        const maxScore = TRIAL_QUESTIONS.length * 3 // Q1은 최대 3점
        const percentage = Math.round((totalScore / maxScore) * 100)

        const params = new URLSearchParams({
          ageInMonths: childInfo.ageInMonths.toString(),
          gender: childInfo.gender,
          totalScore: totalScore.toString(),
          maxScore: maxScore.toString(),
          percentage: percentage.toString(),
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
                  언어 발달 체크
                </span>
                <span className="text-sm text-gray-600">
                  {currentQuestionIndex + 1} / {TRIAL_QUESTIONS.length}
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
                  질문 {currentQuestionIndex + 1}
                </h2>
                <p className="text-lg text-gray-800">
                  {currentQuestion.text}
                </p>
              </div>

              {/* Answer Options */}
              <div className="space-y-3">
                {ANSWER_OPTIONS.map((option) => (
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
