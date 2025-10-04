'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

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
  question: string
  ageMin: number
  ageMax: number
}

export default function NewAssessmentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChildId, setSelectedChildId] = useState<string>('')
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([])
  const [answers, setAnswers] = useState<{ [key: string]: number }>({})
  const [currentStep, setCurrentStep] = useState<'select' | 'assess'>('select')
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
          setChildren(childrenData)

          // URL 파라미터에서 childId가 있으면 자동 선택
          const childIdParam = searchParams.get('childId')
          if (childIdParam && childrenData.find((c: Child) => c.id === childIdParam)) {
            setSelectedChildId(childIdParam)
          }
        }
      } catch (error) {
        console.error('아이 목록을 가져오는 중 오류 발생:', error)
        setError('아이 목록을 불러올 수 없습니다.')
      } finally {
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

  const handleChildSelect = async (childId: string) => {
    const child = children.find(c => c.id === childId)
    if (!child) return

    setSelectedChild(child)
    const ageInMonths = calculateAge(child.birthDate)

    try {
      // 해당 월령에 맞는 질문들을 가져오기
      const response = await fetch(`/api/assessment-questions?ageInMonths=${ageInMonths}`)
      if (response.ok) {
        const questionsData = await response.json()
        setQuestions(questionsData)
        setCurrentStep('assess')

        // 답변 초기화
        const initialAnswers: { [key: string]: number } = {}
        questionsData.forEach((q: AssessmentQuestion) => {
          initialAnswers[q.id] = 0
        })
        setAnswers(initialAnswers)
      } else {
        setError('평가 질문을 불러올 수 없습니다.')
      }
    } catch (error) {
      console.error('질문을 가져오는 중 오류 발생:', error)
      setError('평가 질문을 불러올 수 없습니다.')
    }
  }

  const handleAnswerChange = (questionId: string, score: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: score
    }))
  }

  const handleSubmit = async () => {
    if (!selectedChild) return

    setIsSubmitting(true)
    setError('')

    try {
      const ageInMonths = calculateAge(selectedChild.birthDate)
      const totalScore = Object.values(answers).reduce((sum, score) => sum + score, 0)

      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          childId: selectedChild.id,
          ageInMonths,
          totalScore,
          answers: Object.entries(answers).map(([questionId, score]) => ({
            questionId,
            score
          }))
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '평가 저장 중 오류가 발생했습니다.')
      }

      const assessment = await response.json()
      router.push(`/assessments/${assessment.id}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getScoreLabel = (score: number) => {
    switch (score) {
      case 0: return '아직 못함'
      case 1: return '가끔 함'
      case 2: return '자주 함'
      case 3: return '항상 함'
      default: return ''
    }
  }

  const groupedQuestions = questions.reduce((groups, question) => {
    if (!groups[question.category]) {
      groups[question.category] = []
    }
    groups[question.category].push(question)
    return groups
  }, {} as { [key: string]: AssessmentQuestion[] })

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
            href="/children/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-aipoten-green hover:bg-aipoten-navy"
          >
            아이 등록하기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="text-xl font-bold text-aipoten-navy">
              아이포텐
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/assessments" className="text-gray-600 hover:text-aipoten-green">
                발달체크 목록
              </Link>
              <span className="text-gray-700">{session.user?.name}님</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {currentStep === 'select' ? (
            /* Child Selection */
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">발달체크 시작</h1>
                <p className="text-gray-600 mb-8">
                  발달체크를 진행할 아이를 선택해주세요. 각 아이의 월령에 맞는 평가 항목이 제공됩니다.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {children.map((child) => {
                    const ageInMonths = calculateAge(child.birthDate)
                    const ageText = ageInMonths < 12
                      ? `${ageInMonths}개월`
                      : `${Math.floor(ageInMonths / 12)}세 ${ageInMonths % 12}개월`

                    return (
                      <button
                        key={child.id}
                        onClick={() => handleChildSelect(child.id)}
                        className="p-6 border-2 border-gray-200 rounded-lg hover:border-aipoten-green hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-aipoten-accent rounded-full flex items-center justify-center mr-4">
                            <span className="text-xl text-white font-bold">
                              {child.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">{child.name}</h3>
                            <p className="text-sm text-gray-500">
                              {child.gender === 'MALE' ? '남아' : '여아'} • {ageText}
                            </p>
                            <p className="text-xs text-gray-400">
                              생일: {new Date(child.birthDate).toLocaleDateString('ko-KR')}
                            </p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {error && (
                  <div className="mt-4 rounded-md bg-red-50 p-4">
                    <div className="text-sm text-red-800">{error}</div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Assessment Form */
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        {selectedChild?.name}의 발달체크
                      </h1>
                      <p className="text-gray-600 mt-1">
                        현재 월령: {calculateAge(selectedChild?.birthDate || '')}개월
                      </p>
                    </div>
                    <button
                      onClick={() => setCurrentStep('select')}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      아이 다시 선택
                    </button>
                  </div>
                </div>

                <div className="space-y-8">
                  {Object.entries(groupedQuestions).map(([category, categoryQuestions]) => (
                    <div key={category}>
                      <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
                        {category}
                      </h3>
                      <div className="space-y-6">
                        {categoryQuestions.map((question) => (
                          <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">
                              {question.question}
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {[0, 1, 2, 3].map((score) => (
                                <label
                                  key={score}
                                  className={`flex items-center justify-center p-3 border rounded-md cursor-pointer transition-colors ${
                                    answers[question.id] === score
                                      ? 'border-aipoten-green bg-aipoten-green bg-opacity-10'
                                      : 'border-gray-300 hover:border-gray-400'
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name={question.id}
                                    value={score}
                                    checked={answers[question.id] === score}
                                    onChange={() => handleAnswerChange(question.id, score)}
                                    className="sr-only"
                                  />
                                  <div className="text-center">
                                    <div className="text-lg font-semibold text-gray-900">{score}</div>
                                    <div className="text-xs text-gray-500">{getScoreLabel(score)}</div>
                                  </div>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {error && (
                  <div className="mt-6 rounded-md bg-red-50 p-4">
                    <div className="text-sm text-red-800">{error}</div>
                  </div>
                )}

                <div className="mt-8 flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    총 {questions.length}개 항목 • 현재 총점: {Object.values(answers).reduce((sum, score) => sum + score, 0)}점
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || Object.keys(answers).length !== questions.length}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-aipoten-green hover:bg-aipoten-navy focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-aipoten-green disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? '저장 중...' : '평가 완료'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}