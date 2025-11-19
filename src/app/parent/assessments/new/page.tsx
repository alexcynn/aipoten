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
  GROSS_MOTOR: '대근육',
  FINE_MOTOR: '소근육',
  LANGUAGE: '언어',
  COGNITIVE: '인지',
  SOCIAL: '사회성',
  EMOTIONAL: '정서',
}

const CATEGORY_ORDER = ['GROSS_MOTOR', 'FINE_MOTOR', 'COGNITIVE', 'LANGUAGE', 'SOCIAL', 'EMOTIONAL']

const FOUR_POINT_OPTIONS = [
  { value: '잘함', score: 3 },
  { value: '대체로 잘함', score: 2 },
  { value: '대체로 못함', score: 1 },
  { value: '전혀 못함', score: 0 },
]

const TWO_POINT_Q2_OPTIONS = [
  { value: '잘함', score: 1 },
  { value: '못함', score: 0 },
]

const TWO_POINT_Q3_OPTIONS = [
  { value: '잘함', score: 0.5 },
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
  const [completionMessage, setCompletionMessage] = useState<string | null>(null)
  const [categoryCompleted, setCategoryCompleted] = useState<string | null>(null)
  const [showCategoryTransition, setShowCategoryTransition] = useState(false)
  const [showConcernsStep, setShowConcernsStep] = useState(false)
  const [concernsText, setConcernsText] = useState('')
  const [showPromptModal, setShowPromptModal] = useState(false)
  const [generatedPrompt, setGeneratedPrompt] = useState('')

  // 프롬프트 생성 함수
  const generatePrompt = () => {
    if (!selectedChild) return ''

    const ageInMonths = calculateAge(selectedChild.birthDate)
    const years = Math.floor(ageInMonths / 12)
    const months = ageInMonths % 12

    // 질문과 답변을 카테고리별로 정리
    const responsesByCategory: Record<string, { question: string; answer: string; level: string }[]> = {}

    responses.forEach(response => {
      const question = allQuestions.find(q => q.id === response.questionId)
      if (question) {
        if (!responsesByCategory[question.category]) {
          responsesByCategory[question.category] = []
        }
        responsesByCategory[question.category].push({
          question: question.questionText,
          answer: response.answer,
          level: response.level
        })
      }
    })

    // 프롬프트 구성
    let prompt = `당신은 아동 발달 전문가입니다. 다음은 ${selectedChild.name} 아이(${years}세 ${months}개월, ${selectedChild.gender === 'MALE' ? '남아' : '여아'})의 발달체크 결과입니다.

## 발달체크 응답 내용

`

    // 카테고리별 질문과 답변 추가
    CATEGORY_ORDER.forEach(category => {
      if (responsesByCategory[category] && responsesByCategory[category].length > 0) {
        prompt += `### ${CATEGORY_LABELS[category]} 발달\n`
        responsesByCategory[category].forEach((item, index) => {
          prompt += `${index + 1}. Q: ${item.question}\n   A: ${item.answer}\n`
        })
        prompt += '\n'
      }
    })

    // 우려 사항 추가
    if (concernsText.trim()) {
      prompt += `### 부모 우려 사항\n${concernsText}\n\n`
    }

    // 응답 형식 지시
    prompt += `## 요청 사항

위 발달체크 결과를 분석하여 다음 형식으로 응답해주세요:

### 1. 발달 영역별 현황 요약 (70자 이내)
전체적인 발달 상태를 한 문장으로 요약해주세요. 예: "전반적으로 건강하게 발달하고 있으니 언어 분야는 추적 필요합니다."

### 2. 영역별 발달 수준 및 상세 분석
각 영역에 대해 다음 4단계 중 하나로 평가하고, 질문 응답을 바탕으로 상세 분석을 작성해주세요:
- 빠른수준: 해당 월령 기준 상위 발달
- 또래수준: 해당 월령에 맞는 발달
- 추적/심화상담: 지속적인 관찰 필요
- 심화평가권고: 전문가 평가 권장

각 영역별로 다음 형식으로 작성해주세요:

#### 대근육 운동 - [수준]
[질문 응답을 바탕으로 100-150자 분석. 아이가 잘하는 부분, 발달 특징, 개선이 필요한 부분을 구체적으로 설명. 예: "달리기와 점프 등 기본 대근육 활동을 능숙하게 수행하며, 균형 감각도 우수합니다. 계단 오르내리기에서 한 발씩 번갈아 사용하는 능력이 또래보다 발달되어 있습니다."]

#### 소근육 운동 - [수준]
[질문 응답을 바탕으로 100-150자 분석. 손가락 조작, 그리기, 가위질 등 소근육 발달 상태를 구체적으로 설명]

#### 언어 발달 - [수준]
[질문 응답을 바탕으로 100-150자 분석. 어휘력, 문장 구사력, 의사소통 능력 등을 구체적으로 설명]

#### 인지 발달 - [수준]
[질문 응답을 바탕으로 100-150자 분석. 문제해결력, 기억력, 개념 이해 등을 구체적으로 설명]

#### 사회성 발달 - [수준]
[질문 응답을 바탕으로 100-150자 분석. 또래 관계, 감정 조절, 규칙 이해 등을 구체적으로 설명]

### 3. AI 종합 분석 (200-300자)
아이의 전반적인 발달 상태와 특징적인 강점, 그리고 앞으로 주의 깊게 살펴볼 부분을 종합적으로 설명해주세요.

### 4. 맞춤 권장사항 (5개)
가정에서 실천할 수 있는 구체적인 활동을 불릿 포인트로 제시해주세요.
예:
• 매일 15분씩 그림책을 읽어 아이와 대화 나누기
• 일상생활에서 2단어 문장을 자주 모델링해주기
• 소근육 발달을 위한 점토놀이, 스티커 붙이기 활동
• 또래와 만날 수 있는 기회를 자주 만들어주기
• 적극적 격려를 통해 자신감 키워주기`

    return prompt
  }

  const handleShowPrompt = () => {
    const prompt = generatePrompt()
    setGeneratedPrompt(prompt)
    setShowPromptModal(true)
  }

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

  const getQuestionsPath = (currentResponses?: QuestionResponse[]): AssessmentQuestion[] => {
    const path: AssessmentQuestion[] = []
    const regularQuestions = allQuestions.filter(q => !q.isWarning)
    const responsesToUse = currentResponses || responses

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
      const q1Response = responsesToUse.find(r => r.questionId === q1.id)
      if (q1Response) {
        // Q1에서 "대체로 못함" 또는 "전혀 못함" 선택 시 Q2로 이동
        if (q1Response.answer === '대체로 못함' || q1Response.answer === '전혀 못함') {
          const q2 = group.find(q => q.level === 'Q2')
          if (q2) {
            path.push(q2)

            // Q2 응답 확인
            const q2Response = responsesToUse.find(r => r.questionId === q2.id)
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

  const getActualCategoryOrder = () => {
    // 질문의 실제 order 기준으로 카테고리 순서 결정
    const categories = allQuestions
      .filter(q => q.level === 'Q1' && !q.isWarning)
      .sort((a, b) => a.order - b.order)
      .map(q => q.category)

    // 중복 제거하면서 순서 유지
    return Array.from(new Set(categories))
  }

  const getCategoryProgress = (currentResponses?: QuestionResponse[]) => {
    const responsesToUse = currentResponses || responses
    const progress: Record<string, { completed: number; total: number }> = {}
    const orderedCategories = getActualCategoryOrder()

    orderedCategories.forEach(category => {
      const categoryQuestions = allQuestions.filter(q => q.category === category && q.level === 'Q1' && !q.isWarning)

      // 각 Q1 그룹(questionNumber)에서 Q1, Q2, Q3 중 하나라도 응답이 있으면 완료로 간주
      const completedInCategory = categoryQuestions.filter(q1 => {
        // 해당 Q1 그룹의 모든 질문 (Q1, Q2, Q3) 찾기
        const groupQuestions = allQuestions.filter(q =>
          q.category === q1.category &&
          q.questionNumber === q1.questionNumber
        )

        // 이 그룹의 질문 중 하나라도 응답이 있으면 완료
        return groupQuestions.some(gq =>
          responsesToUse.some(r => r.questionId === gq.id)
        )
      }).length

      progress[category] = { completed: completedInCategory, total: categoryQuestions.length }
    })

    return progress
  }

  const checkCategoryCompletion = (prevCategory: string | null, newCategory: string | null) => {
    if (!prevCategory || prevCategory === newCategory) return

    const progress = getCategoryProgress()
    const categoryProgress = progress[prevCategory]

    if (categoryProgress && categoryProgress.completed === categoryProgress.total) {
      const nextCategoryIndex = CATEGORY_ORDER.indexOf(newCategory || '')
      const nextCategoryLabel = newCategory && CATEGORY_LABELS[newCategory] ? CATEGORY_LABELS[newCategory] : null

      const message = nextCategoryLabel
        ? `😊 훌륭해요! ${CATEGORY_LABELS[prevCategory]} 영역을 모두 마쳤어요. 이제 ${nextCategoryLabel} 영역으로 넘어가볼게요!`
        : `😊 훌륭해요! ${CATEGORY_LABELS[prevCategory]} 영역을 모두 마쳤어요!`

      setCompletionMessage(message)
      setTimeout(() => setCompletionMessage(null), 4000)
    }
  }

  const handleAnswer = (answer: string, score: number) => {
    const currentQuestion = getCurrentQuestion()
    if (!currentQuestion) return

    const prevCategory = currentQuestion.category

    // 현재 질문에 대한 응답 저장
    const newResponse: QuestionResponse = {
      questionId: currentQuestion.id,
      level: currentQuestion.level,
      answer,
      score,
    }

    const updatedResponses = [...responses.filter(r => r.questionId !== currentQuestion.id), newResponse]
    setResponses(updatedResponses)

    // 다음 질문으로 이동 로직
    setTimeout(() => {
      const path = getQuestionsPath(updatedResponses)
      const nextIndex = currentQuestionIndex + 1
      let shouldMoveToNext = false
      let targetIndex = nextIndex

      let checkCategoryTransition = false

      if (currentQuestion.level === 'Q1') {
        // Q1에서 "대체로 못함" 또는 "전혀 못함" 선택 시 Q2로
        if (answer === '대체로 못함' || answer === '전혀 못함') {
          shouldMoveToNext = true
          // Q2로 이동하는 경우 카테고리 전환 체크 하지 않음
        } else {
          // 다음 Q1 그룹으로
          const nextQ1Index = findNextQ1Index()
          if (nextQ1Index !== -1) {
            shouldMoveToNext = true
            targetIndex = nextQ1Index
            checkCategoryTransition = true  // Q1 → Q1 이동 시에만 카테고리 체크
          } else {
            handleComplete()
            return
          }
        }
      } else if (currentQuestion.level === 'Q2') {
        // Q2에서 "못함" 선택 시 Q3로
        if (answer === '못함') {
          shouldMoveToNext = true
          // Q3로 이동하는 경우 카테고리 전환 체크 하지 않음
        } else {
          // 다음 Q1 그룹으로
          const nextQ1Index = findNextQ1Index()
          if (nextQ1Index !== -1) {
            shouldMoveToNext = true
            targetIndex = nextQ1Index
            checkCategoryTransition = true  // Q2 → Q1 이동 시에만 카테고리 체크
          } else {
            handleComplete()
            return
          }
        }
      } else {
        // Q3 완료 후 다음 Q1 그룹으로
        const nextQ1Index = findNextQ1Index()
        if (nextQ1Index !== -1) {
          shouldMoveToNext = true
          targetIndex = nextQ1Index
          checkCategoryTransition = true  // Q3 → Q1 이동 시에만 카테고리 체크
        } else {
          handleComplete()
          return
        }
      }

      if (shouldMoveToNext) {
        // 카테고리 전환 체크는 다음 Q1으로 이동할 때만 수행
        if (checkCategoryTransition) {
          const updatedPath = getQuestionsPath(updatedResponses)
          const nextQuestion = updatedPath[targetIndex]

          // 카테고리가 변경되는지 확인
          if (nextQuestion && nextQuestion.category !== prevCategory) {
            // 현재 카테고리에 아직 남은 질문이 있는지 확인
            const hasMoreInPrevCategory = updatedPath.slice(targetIndex).some(q => q.category === prevCategory)

            // 현재 카테고리의 질문이 모두 완료되었을 때만 전환 화면 표시
            if (!hasMoreInPrevCategory) {
              const progress = getCategoryProgress(updatedResponses)
              const categoryProgress = progress[prevCategory]

              if (categoryProgress && categoryProgress.completed === categoryProgress.total) {
                // 카테고리 완료 - 전환 화면 표시
                setCategoryCompleted(prevCategory)
                setShowCategoryTransition(true)
                setCurrentQuestionIndex(targetIndex)
                return
              }
            }
          }
        }

        setCurrentQuestionIndex(targetIndex)
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

  const handleContinueToNextCategory = () => {
    setShowCategoryTransition(false)
    setCategoryCompleted(null)
  }

  const handleMoveToConcernsStep = () => {
    setShowCategoryTransition(false)
    setShowConcernsStep(true)
  }

  const getNextCategoryLabel = () => {
    if (!categoryCompleted) return null
    const orderedCategories = getActualCategoryOrder()
    const currentIndex = orderedCategories.indexOf(categoryCompleted)
    if (currentIndex === -1 || currentIndex === orderedCategories.length - 1) return null
    const nextCategory = orderedCategories[currentIndex + 1]
    return CATEGORY_LABELS[nextCategory] || null
  }

  const isLastCategory = () => {
    if (!categoryCompleted) return false
    const orderedCategories = getActualCategoryOrder()
    return orderedCategories.indexOf(categoryCompleted) === orderedCategories.length - 1
  }

  const handleComplete = () => {
    // 마지막 카테고리 확인
    const currentQuestion = getCurrentQuestion()
    if (currentQuestion) {
      const currentCategory = currentQuestion.category
      const orderedCategories = getActualCategoryOrder()
      const lastCategory = orderedCategories[orderedCategories.length - 1]

      if (currentCategory === lastCategory) {
        // 마지막 카테고리 완료 화면 표시
        setCategoryCompleted(currentCategory)
        setShowCategoryTransition(true)
        return
      }
    }

    // 경고 질문이 없으면 바로 제출
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
          concernsText: concernsText.trim() || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '평가 저장 중 오류가 발생했습니다.')
      }

      const assessment = await response.json()
      // 성공 시 isSubmitting을 유지하여 버튼 비활성화 상태 유지
      router.push(`/parent/assessments/${assessment.id}`)
    } catch (err: any) {
      setError(err.message)
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
    <div className="min-h-screen bg-[#F5EFE7]">
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="sm:px-0">
          {selectedChild ? (
            /* Assessment Form with Q1→Q2→Q3 Flow */
            <div className="bg-white shadow-sm rounded-xl md:rounded-2xl">
              <div className="px-4 py-5 sm:p-6 md:p-8">
                {/* Header */}
                <div className="mb-6 md:mb-8">
                  <div className="mb-4 md:mb-6">
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-stone-900 mb-2">
                      {selectedChild?.name}의 발달체크
                    </h1>
                    <p className="text-sm sm:text-base md:text-lg text-stone-600">
                      현재 월령: {calculateAge(selectedChild?.birthDate || '')}개월
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4 md:mb-6">
                    <div className="flex justify-between text-xs sm:text-sm text-stone-600 mb-2">
                      <span>
                        {currentQuestion ? (
                          <span className="font-semibold text-[#FF6A00]">
                            {CATEGORY_LABELS[currentQuestion.category]} 영역 테스트 중
                          </span>
                        ) : (
                          <span>진행률</span>
                        )}
                      </span>
                      <span className="font-medium">{getCompletedQuestions()} / {getTotalQuestions()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 md:h-3">
                      <div
                        className="h-2.5 md:h-3 rounded-full transition-all duration-300"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: '#FF6A00'
                        }}
                      ></div>
                    </div>

                    {/* Category Progress Indicators */}
                    <div className="mt-3 md:mt-4 flex flex-wrap gap-2">
                      {getActualCategoryOrder().map(category => {
                        const categoryProgress = getCategoryProgress()[category]
                        if (!categoryProgress || categoryProgress.total === 0) return null

                        const isCompleted = categoryProgress.completed === categoryProgress.total
                        const isCurrent = currentQuestion?.category === category

                        return (
                          <div
                            key={category}
                            className={`text-xs px-2 md:px-3 py-1 rounded-full font-medium ${
                              isCompleted
                                ? 'bg-[#EDFCE2] text-[#7CCF3C]'
                                : isCurrent
                                ? 'bg-[#FFF5E8] text-[#FF6A00] font-semibold'
                                : 'bg-gray-100 text-stone-600'
                            }`}
                          >
                            {CATEGORY_LABELS[category]} {categoryProgress.completed}/{categoryProgress.total}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Completion Message */}
                {completionMessage && (
                  <div className="mb-6 md:mb-8 p-4 md:p-6 bg-[#EDFCE2] border-2 border-[#7CCF3C] rounded-xl text-center animate-fade-in">
                    <p className="text-[#7CCF3C] font-semibold text-base sm:text-lg md:text-xl">
                      {completionMessage}
                    </p>
                  </div>
                )}

                {/* Category Transition Screen */}
                {showCategoryTransition && categoryCompleted ? (
                  <div className="text-center py-12 md:py-16">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 bg-[#7CCF3C]">
                      <span className="text-white text-3xl sm:text-4xl md:text-5xl">✓</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-stone-900 mb-3 md:mb-4">
                      {CATEGORY_LABELS[categoryCompleted]} 영역 완료!
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg text-stone-600 mb-8 md:mb-12">
                      {isLastCategory()
                        ? '모든 발달 영역 평가를 완료하셨습니다!'
                        : `다음은 ${getNextCategoryLabel()} 영역입니다.`
                      }
                    </p>
                    <button
                      onClick={isLastCategory() ? handleMoveToConcernsStep : handleContinueToNextCategory}
                      disabled={isSubmitting}
                      className="inline-block bg-[#FF6A00] text-white px-6 sm:px-8 md:px-10 py-3 md:py-4 rounded-[10px] font-semibold text-sm sm:text-base md:text-lg hover:bg-[#E55F00] transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLastCategory()
                        ? '다음'
                        : `${getNextCategoryLabel()} 발달체크 계속하기`
                      }
                    </button>
                  </div>
                ) : showConcernsStep ? (
                  /* 서술형 우려 사항 질문 */
                  <div className="py-8 md:py-12">
                    <div className="text-center mb-8 md:mb-12">
                      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-stone-900 mb-4 md:mb-6">
                        마지막 질문입니다
                      </h2>
                      <p className="text-sm sm:text-base md:text-lg text-stone-600 mb-2">
                        아이의 발달에 대해 특별히 궁금하거나 우려되는 점이 있으신가요?
                      </p>
                      <p className="text-xs sm:text-sm text-stone-500">
                        (선택 사항) 작성하신 내용은 AI 분석에 반영되어 더 맞춤화된 피드백을 제공합니다.
                      </p>
                    </div>

                    <div className="max-w-3xl mx-auto">
                      <textarea
                        value={concernsText}
                        onChange={(e) => setConcernsText(e.target.value)}
                        placeholder="예: 또래 아이들에 비해 말이 느린 것 같아 걱정됩니다..."
                        rows={6}
                        maxLength={1000}
                        className="w-full px-4 md:px-5 py-3 md:py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF6A00] focus:border-transparent resize-none text-sm sm:text-base"
                      />
                      <div className="text-right text-xs sm:text-sm text-stone-500 mt-2">
                        {concernsText.length} / 1000
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-6 md:mt-8">
                        <button
                          onClick={() => {
                            setConcernsText('')
                            handleSubmit()
                          }}
                          disabled={isSubmitting}
                          className="flex-1 px-6 md:px-8 py-3 md:py-4 border-2 border-gray-300 text-stone-700 rounded-[10px] hover:bg-gray-50 transition-colors disabled:opacity-50 font-semibold text-sm sm:text-base"
                        >
                          건너뛰기
                        </button>
                        <button
                          onClick={handleSubmit}
                          disabled={isSubmitting}
                          className="flex-1 bg-[#FF6A00] text-white px-6 md:px-8 py-3 md:py-4 rounded-[10px] hover:bg-[#E55F00] transition-colors disabled:opacity-50 font-semibold text-sm sm:text-base shadow-lg"
                        >
                          {isSubmitting ? (
                            <span className="flex items-center justify-center gap-2">
                              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              AI가 결과를 분석 중입니다...
                            </span>
                          ) : '제출하고 결과 보기'}
                        </button>
                        {/* 프롬프트 보기 버튼 - 임시 숨김
                        <button
                          onClick={handleShowPrompt}
                          className="flex-1 px-6 md:px-8 py-3 md:py-4 border-2 border-[#FF6A00] text-[#FF6A00] rounded-[10px] hover:bg-[#FFF5EB] transition-colors font-semibold text-sm sm:text-base"
                        >
                          프롬프트 보기
                        </button>
                        */}
                      </div>
                    </div>
                  </div>
                ) : currentQuestion ? (
                  <div className="space-y-6 md:space-y-8">
                    <div className="bg-[#F5EFE7] p-4 sm:p-6 md:p-8 rounded-xl md:rounded-2xl">
                      <div className="flex items-center justify-between mb-4 md:mb-6">
                        <span className="inline-flex items-center px-3 md:px-4 py-1 md:py-2 rounded-full text-xs sm:text-sm font-semibold bg-[#FF9999] text-white">
                          {CATEGORY_LABELS[currentQuestion.category]}
                        </span>
                        <span className="text-xs sm:text-sm text-stone-500 font-medium">
                          {currentQuestion.level}
                        </span>
                      </div>
                      <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-stone-900 mb-6 md:mb-8 leading-relaxed">
                        {currentQuestion.questionText}
                      </h2>

                      {/* Answer Options */}
                      <div className="grid grid-cols-1 gap-3 md:gap-4">
                        {(currentQuestion.answerType === 'FOUR_POINT'
                          ? FOUR_POINT_OPTIONS
                          : currentQuestion.level === 'Q3'
                          ? TWO_POINT_Q3_OPTIONS
                          : TWO_POINT_Q2_OPTIONS
                        ).map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleAnswer(option.value, option.score)}
                            className="p-4 md:p-5 border-2 border-gray-300 rounded-[10px] hover:border-[#FF6A00] hover:bg-[#FFF5EB] transition-colors text-left"
                          >
                            <span className="text-sm sm:text-base md:text-lg text-stone-900 font-semibold">{option.value}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                      <button
                        onClick={handlePrevious}
                        disabled={currentQuestionIndex === 0}
                        className="px-4 md:px-6 py-2 md:py-3 text-xs sm:text-sm font-semibold text-stone-700 bg-white border-2 border-gray-300 rounded-[10px] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        ← 이전
                      </button>

                      <div className="text-xs sm:text-sm text-stone-500 font-medium">
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
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          AI가 결과를 분석 중입니다...
                        </span>
                      ) : '평가 완료 및 결과 보기'}
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

      {/* 프롬프트 보기 모달 */}
      {showPromptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 md:p-6 border-b">
              <h2 className="text-lg md:text-xl font-bold text-stone-900">AI 분석 프롬프트</h2>
              <button
                onClick={() => setShowPromptModal(false)}
                className="text-stone-400 hover:text-stone-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <pre className="whitespace-pre-wrap text-sm text-stone-700 font-mono bg-gray-50 p-4 rounded-lg">
                {generatedPrompt}
              </pre>
            </div>
            <div className="p-4 md:p-6 border-t flex gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedPrompt)
                  alert('프롬프트가 클립보드에 복사되었습니다.')
                }}
                className="flex-1 px-4 py-3 bg-[#FF6A00] text-white rounded-lg hover:bg-[#E55F00] transition-colors font-semibold"
              >
                클립보드에 복사
              </button>
              <button
                onClick={() => setShowPromptModal(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-stone-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
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
