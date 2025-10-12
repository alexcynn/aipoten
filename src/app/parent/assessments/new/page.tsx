'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'

export const dynamic = 'force-dynamic'

interface Child {
  id: string
  name: string
  birthDate: string
  gender: string
}

interface AssessmentQuestion {
  id: string
  category: string
  questionNumber: number
  level: 'Q1' | 'Q2' | 'Q3'
  questionText: string
  answerType: 'FOUR_POINT' | 'TWO_POINT'
  isWarning: boolean
  order: number
}

interface QuestionResponse {
  questionId: string
  level: 'Q1' | 'Q2' | 'Q3'
  answer: string
  score: number
}

const CATEGORY_LABELS: Record<string, string> = {
  GROSS_MOTOR: '대근육 운동',
  FINE_MOTOR: '소근육 운동',
  LANGUAGE: '언어',
  COGNITIVE: '인지',
  SOCIAL: '사회성',
  EMOTIONAL: '정서',
}

const FOUR_POINT_OPTIONS = [
  { value: '잘함', score: 3 },
  { value: '대체로 잘함', score: 2 },
  { value: '대체로 못함', score: 1 },
  { value: '전혀 못함', score: 0 },
]

const TWO_POINT_OPTIONS = [
  { value: '잘함', score: 1 },
  { value: '못함', score: 0 },
]

function AssessmentContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [children, setChildren] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [allQuestions, setAllQuestions] = useState<AssessmentQuestion[]>([])
  const [responses, setResponses] = useState<QuestionResponse[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }

    const fetchChildren = async () => {
      try {
        const response = await fetch('/api/children')
        if (response.ok) {
          const childrenData = await response.json()
          // API 응답이 객체인 경우 children 배열 추출
          const childrenArray = Array.isArray(childrenData) ? childrenData : (childrenData.children || [])
          setChildren(childrenArray)

          // childId가 URL 파라미터로 전달되면 해당 아이 선택
          const childIdParam = searchParams.get('childId')
          let targetChild: Child | null = null

          if (childIdParam) {
            targetChild = childrenArray.find((c: Child) => c.id === childIdParam) || null
          }

          // childId가 없거나 찾을 수 없으면 첫 번째 아이 선택
          if (!targetChild && childrenArray.length > 0) {
            targetChild = childrenArray[0]
          }

          if (targetChild) {
            handleChildSelect(targetChild)
          } else {
            setIsLoading(false)
          }
        }
      } catch (error) {
        console.error('아이 목록을 가져오는 중 오류 발생:', error)
        setError('아이 목록을 불러올 수 없습니다.')
        setIsLoading(false)
      }
    }

    fetchChildren()
  }, [session, status, router, searchParams])

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate)
    const today = new Date()
    const ageInMonths = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth())
    return ageInMonths
  }

  const handleChildSelect = async (child: Child) => {
    setSelectedChild(child)
    const ageInMonths = calculateAge(child.birthDate)

    try {
      const response = await fetch(`/api/assessment-questions?ageInMonths=${ageInMonths}`)
      if (response.ok) {
        const questionsData = await response.json()
        // Q1 질문들만 초기 로드 (경고 질문 제외)
        const q1Questions = questionsData.filter((q: AssessmentQuestion) =>
          q.level === 'Q1' && !q.isWarning
        )
        setAllQuestions(questionsData)
        setResponses([])
        setCurrentQuestionIndex(0)
        setIsLoading(false)
      } else {
        setError('평가 질문을 불러올 수 없습니다.')
        setIsLoading(false)
      }
    } catch (error) {
      console.error('질문을 가져오는 중 오류 발생:', error)
      setError('평가 질문을 불러올 수 없습니다.')
      setIsLoading(false)
    }
  }

  const getQuestionsPath = (): AssessmentQuestion[] => {
    const path: AssessmentQuestion[] = []
    const regularQuestions = allQuestions.filter(q => !q.isWarning)

    // 문항 번호로 그룹화
    const questionGroups: Record<string, AssessmentQuestion[]> = {}
    regularQuestions.forEach(q => {
      const key = `${q.category}-${q.questionNumber}`
      if (!questionGroups[key]) {
        questionGroups[key] = []
      }
      questionGroups[key].push(q)
    })

    // 각 그룹을 순서대로 처리
    Object.keys(questionGroups).sort((a, b) => {
      const [catA, numA] = a.split('-')
      const [catB, numB] = b.split('-')
      if (catA !== catB) {
        return regularQuestions.find(q => `${q.category}-${q.questionNumber}` === a)!.order -
               regularQuestions.find(q => `${q.category}-${q.questionNumber}` === b)!.order
      }
      return parseInt(numA) - parseInt(numB)
    }).forEach(key => {
      const group = questionGroups[key]
      const q1 = group.find(q => q.level === 'Q1')
      if (!q1) return

      path.push(q1)

      // 이미 응답한 Q1 확인
      const q1Response = responses.find(r => r.questionId === q1.id)
      if (q1Response) {
        // Q1에서 "대체로 못함" 또는 "전혀 못함" 선택 시 Q2로 이동
        if (q1Response.answer === '대체로 못함' || q1Response.answer === '전혀 못함') {
          const q2 = group.find(q => q.level === 'Q2')
          if (q2) {
            path.push(q2)

            // Q2 응답 확인
            const q2Response = responses.find(r => r.questionId === q2.id)
            if (q2Response && q2Response.answer === '못함') {
              const q3 = group.find(q => q.level === 'Q3')
              if (q3) {
                path.push(q3)
              }
            }
          }
        }
      }
    })

    return path
  }

  const getCurrentQuestion = (): AssessmentQuestion | null => {
    const path = getQuestionsPath()
    return path[currentQuestionIndex] || null
  }

  const getTotalQuestions = (): number => {
    // Q1 질문 개수 반환 (경고 질문 제외)
    return allQuestions.filter(q => q.level === 'Q1' && !q.isWarning).length
  }

  const getCompletedQuestions = (): number => {
    // 완료된 Q1 그룹 개수
    const questionGroups = new Set<string>()
    allQuestions.filter(q => q.level === 'Q1' && !q.isWarning).forEach(q1 => {
      const hasResponse = responses.some(r =>
        r.questionId === q1.id ||
        responses.some(r2 => {
          const q2 = allQuestions.find(q => q.questionNumber === q1.questionNumber && q.category === q1.category && q.level === 'Q2')
          const q3 = allQuestions.find(q => q.questionNumber === q1.questionNumber && q.category === q1.category && q.level === 'Q3')
          return (q2 && r2.questionId === q2.id) || (q3 && r2.questionId === q3.id)
        })
      )
      if (hasResponse) {
        questionGroups.add(`${q1.category}-${q1.questionNumber}`)
      }
    })
    return questionGroups.size
  }

  const handleAnswer = (answer: string, score: number) => {
    const currentQuestion = getCurrentQuestion()
    if (!currentQuestion) return

    // 현재 질문에 대한 응답 저장
    const newResponse: QuestionResponse = {
      questionId: currentQuestion.id,
      level: currentQuestion.level,
      answer,
      score,
    }

    setResponses(prev => {
      const filtered = prev.filter(r => r.questionId !== currentQuestion.id)
      return [...filtered, newResponse]
    })

    // 다음 질문으로 이동 로직
    setTimeout(() => {
      if (currentQuestion.level === 'Q1') {
        // Q1에서 "대체로 못함" 또는 "전혀 못함" 선택 시 Q2로
        if (answer === '대체로 못함' || answer === '전혀 못함') {
          setCurrentQuestionIndex(prev => prev + 1)
        } else {
          // 다음 Q1 그룹으로
          moveToNextQuestion()
        }
      } else if (currentQuestion.level === 'Q2') {
        // Q2에서 "못함" 선택 시 Q3로
        if (answer === '못함') {
          setCurrentQuestionIndex(prev => prev + 1)
        } else {
          // 다음 Q1 그룹으로
          moveToNextQuestion()
        }
      } else {
        // Q3 완료 후 다음 Q1 그룹으로
        moveToNextQuestion()
      }
    }, 300)
  }

  const moveToNextQuestion = () => {
    const path = getQuestionsPath()
    const nextIndex = currentQuestionIndex + 1

    if (nextIndex >= path.length) {
      // 모든 질문 완료 - 경고 질문으로 이동하거나 완료
      const nextQ1Index = findNextQ1Index()
      if (nextQ1Index !== -1) {
        setCurrentQuestionIndex(nextQ1Index)
      } else {
        // 모든 질문 완료
        handleComplete()
      }
    } else {
      setCurrentQuestionIndex(nextIndex)
    }
  }

  const findNextQ1Index = (): number => {
    const path = getQuestionsPath()
    const currentQuestion = path[currentQuestionIndex]
    if (!currentQuestion) return -1

    // 현재 질문 그룹 다음의 Q1 찾기
    const nextQ1s = allQuestions.filter(q =>
      q.level === 'Q1' &&
      !q.isWarning &&
      q.order > currentQuestion.order
    ).sort((a, b) => a.order - b.order)

    if (nextQ1s.length > 0) {
      // 전체 경로에서 다음 Q1의 인덱스 찾기
      const fullPath = getQuestionsPath()
      const nextQ1Index = fullPath.findIndex(q => q.id === nextQ1s[0].id)
      return nextQ1Index !== -1 ? nextQ1Index : fullPath.length
    }

    return -1
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleComplete = () => {
    // TODO: 경고 질문 처리 추가
    handleSubmit()
  }

  const handleSubmit = async () => {
    if (!selectedChild) return

    setIsSubmitting(true)
    setError('')

    try {
      const ageInMonths = calculateAge(selectedChild.birthDate)
      const totalScore = responses.reduce((sum, r) => sum + r.score, 0)

      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          childId: selectedChild.id,
          ageInMonths,
          totalScore,
          responses: responses.map(r => ({
            questionId: r.questionId,
            level: r.level,
            answer: r.answer,
            score: r.score,
          })),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '평가 저장 중 오류가 발생했습니다.')
      }

      const assessment = await response.json()
      router.push(`/parent/assessments/${assessment.id}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-neutral-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aipoten-green mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  if (children.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-light flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">등록된 아이가 없습니다</h2>
          <p className="text-gray-600 mb-6">발달체크를 시작하려면 먼저 아이를 등록해주세요.</p>
          <Link
            href="/parent/children/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-aipoten-green hover:bg-aipoten-navy"
          >
            아이 등록하기
          </Link>
        </div>
      </div>
    )
  }

  const currentQuestion = getCurrentQuestion()
  const progress = getTotalQuestions() > 0 ? (getCompletedQuestions() / getTotalQuestions()) * 100 : 0

  return (
    <div className="min-h-screen bg-neutral-light">
      <Header />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {selectedChild ? (
            /* Assessment Form with Q1→Q2→Q3 Flow */
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                {/* Header */}
                <div className="mb-6">
                  <div className="mb-4">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {selectedChild?.name}의 발달체크
                    </h1>
                    <p className="text-gray-600 mt-1">
                      현재 월령: {calculateAge(selectedChild?.birthDate || '')}개월
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>진행률</span>
                      <span>{getCompletedQuestions()} / {getTotalQuestions()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-aipoten-green h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Current Question */}
                {currentQuestion ? (
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-aipoten-accent bg-opacity-20 text-aipoten-green">
                          {CATEGORY_LABELS[currentQuestion.category]}
                        </span>
                        <span className="text-sm text-gray-500">
                          {currentQuestion.level}
                        </span>
                      </div>
                      <h2 className="text-lg font-medium text-gray-900 mb-6">
                        {currentQuestion.questionText}
                      </h2>

                      {/* Answer Options */}
                      <div className="grid grid-cols-1 gap-3">
                        {(currentQuestion.answerType === 'FOUR_POINT'
                          ? FOUR_POINT_OPTIONS
                          : TWO_POINT_OPTIONS
                        ).map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleAnswer(option.value, option.score)}
                            className="p-4 border-2 border-gray-300 rounded-lg hover:border-aipoten-green hover:bg-aipoten-green hover:bg-opacity-5 transition-colors text-left"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-gray-900 font-medium">{option.value}</span>
                              <span className="text-sm text-gray-500">{option.score}점</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between items-center pt-4">
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
                ) : (
                  /* All Questions Completed */
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-aipoten-green rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white text-2xl">✓</span>
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      모든 질문에 응답하셨습니다!
                    </h3>
                    <p className="text-gray-600 mb-6">
                      총 {responses.length}개 응답 완료
                    </p>
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-aipoten-green hover:bg-aipoten-navy disabled:opacity-50"
                    >
                      {isSubmitting ? '저장 중...' : '평가 완료 및 결과 보기'}
                    </button>
                  </div>
                )}

                {error && (
                  <div className="mt-6 rounded-md bg-red-50 p-4">
                    <div className="text-sm text-red-800">{error}</div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* No children available */
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6 text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">등록된 아이가 없습니다</h1>
                <p className="text-gray-600 mb-6">
                  발달체크를 진행하려면 먼저 아이를 등록해주세요.
                </p>
                <Link
                  href="/parent/children/new"
                  style={{ backgroundColor: '#F78C6B' }}
                  className="inline-flex items-center px-6 py-3 text-white rounded-md hover:opacity-90 transition-all font-medium shadow-md"
                >
                  아이 등록하기
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function NewAssessmentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aipoten-green mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <AssessmentContent />
    </Suspense>
  )
}
