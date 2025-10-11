'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface AssessmentAnswer {
  id: string
  questionId: string
  score: number
  question: {
    category: string
    question: string
  }
}

interface Assessment {
  id: string
  childId: string
  ageInMonths: number
  totalScore: number
  createdAt: string
  child: {
    id: string
    name: string
    gender: string
  }
  answers: AssessmentAnswer[]
}

interface PageParams {
  id: string
}

export default function AssessmentDetailPage({ params }: { params: Promise<PageParams> }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }

    const fetchAssessment = async () => {
      try {
        const resolvedParams = await params
        const response = await fetch(`/api/assessments/${resolvedParams.id}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError('평가 결과를 찾을 수 없습니다.')
          } else if (response.status === 403) {
            setError('이 평가 결과를 볼 권한이 없습니다.')
          } else {
            setError('평가 결과를 불러오는 중 오류가 발생했습니다.')
          }
          setIsLoading(false)
          return
        }
        const data = await response.json()
        console.log('API 응답 데이터:', data)

        // API는 { assessment } 형태로 반환
        const assessmentData = data.assessment
        console.log('Assessment 데이터:', assessmentData)

        // responses를 answers로 변환
        if (assessmentData?.responses) {
          assessmentData.answers = assessmentData.responses.map((response: any) => ({
            id: response.id,
            questionId: response.questionId,
            score: response.score,
            question: {
              category: response.question.category,
              question: response.question.questionText
            }
          }))
          console.log('변환된 answers:', assessmentData.answers)
        } else {
          console.log('responses가 없습니다')
          assessmentData.answers = []
        }

        setAssessment(assessmentData)
      } catch (error) {
        console.error('평가 결과 조회 오류:', error)
        setError('평가 결과를 불러오는 중 오류가 발생했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAssessment()
  }, [session, status, router, params])

  const getScoreLabel = (score: number) => {
    switch (score) {
      case 0: return '아직 못함'
      case 1: return '가끔 함'
      case 2: return '자주 함'
      case 3: return '항상 함'
      default: return ''
    }
  }

  const getScoreColor = (score: number) => {
    switch (score) {
      case 0: return 'text-red-600 bg-red-50'
      case 1: return 'text-orange-600 bg-orange-50'
      case 2: return 'text-yellow-600 bg-yellow-50'
      case 3: return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getCategoryStats = () => {
    if (!assessment || !assessment.answers || assessment.answers.length === 0) return {}

    const stats: { [key: string]: { total: number; maxScore: number; average: number } } = {}

    assessment.answers.forEach(answer => {
      const category = answer.question.category
      if (!stats[category]) {
        stats[category] = { total: 0, maxScore: 0, average: 0 }
      }
      stats[category].total += answer.score
      stats[category].maxScore += 3
    })

    Object.keys(stats).forEach(category => {
      stats[category].average = stats[category].total / (stats[category].maxScore / 3)
    })

    return stats
  }

  const getOverallPercentage = () => {
    if (!assessment || !assessment.answers || assessment.answers.length === 0) return 0
    const maxPossibleScore = assessment.answers.length * 3
    return Math.round((assessment.totalScore / maxPossibleScore) * 100)
  }

  const getInterpretation = () => {
    const percentage = getOverallPercentage()
    if (percentage >= 80) return { level: '우수', color: 'text-green-600', description: '연령에 적합한 발달을 보이고 있습니다.' }
    if (percentage >= 60) return { level: '양호', color: 'text-blue-600', description: '대체로 연령에 맞는 발달을 보이고 있습니다.' }
    if (percentage >= 40) return { level: '주의', color: 'text-yellow-600', description: '일부 영역에서 발달 지원이 필요할 수 있습니다.' }
    return { level: '관심', color: 'text-red-600', description: '전문가 상담을 고려해보시기 바랍니다.' }
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

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-light flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link
            href="/parent/dashboard"
            style={{ backgroundColor: '#F78C6B' }}
            className="inline-flex items-center px-6 py-3 text-white rounded-md hover:opacity-90 transition-all font-medium shadow-md"
          >
            대시보드로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  if (!assessment) {
    return null
  }

  const categoryStats = getCategoryStats()
  const interpretation = getInterpretation()
  const groupedAnswers = (assessment.answers || []).reduce((groups, answer) => {
    const category = answer.question.category
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(answer)
    return groups
  }, {} as { [key: string]: AssessmentAnswer[] })

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
                평가 목록
              </Link>
              <Link href={`/children/${assessment.child.id}`} className="text-gray-600 hover:text-aipoten-green">
                아이 프로필
              </Link>
              <span className="text-gray-700">{session.user?.name}님</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Assessment Header */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {assessment.child.name}의 발달체크 결과
                  </h1>
                  <p className="text-gray-600 mt-1">
                    평가일: {new Date(assessment.createdAt).toLocaleDateString('ko-KR')} •
                    당시 월령: {assessment.ageInMonths}개월
                  </p>
                </div>
                <Link
                  href={`/assessments/new?childId=${assessment.child.id}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-aipoten-green hover:bg-aipoten-navy"
                >
                  새 평가 시작
                </Link>
              </div>

              {/* Overall Score */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {assessment.totalScore}점
                  </div>
                  <div className="text-sm text-gray-500">
                    총점 (최대 {assessment.answers.length * 3}점)
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {getOverallPercentage()}%
                  </div>
                  <div className="text-sm text-gray-500">달성률</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <div className={`text-2xl font-bold mb-2 ${interpretation.color}`}>
                    {interpretation.level}
                  </div>
                  <div className="text-sm text-gray-500">발달 수준</div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800">{interpretation.description}</p>
              </div>
            </div>
          </div>

          {/* Category Statistics */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">영역별 발달 현황</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(categoryStats).map(([category, stats]) => (
                  <div key={category} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">{category}</h4>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {stats.total}/{stats.maxScore}
                    </div>
                    <div className="text-sm text-gray-500 mb-2">
                      평균 {stats.average.toFixed(1)}점
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-aipoten-green h-2 rounded-full"
                        style={{ width: `${(stats.total / stats.maxScore) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">상세 평가 결과</h3>

              <div className="space-y-8">
                {Object.entries(groupedAnswers).map(([category, answers]) => (
                  <div key={category}>
                    <h4 className="text-md font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
                      {category}
                    </h4>
                    <div className="space-y-3">
                      {answers.map((answer) => (
                        <div key={answer.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {answer.question.question}
                            </p>
                          </div>
                          <div className="ml-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getScoreColor(answer.score)}`}>
                              {answer.score}점 • {getScoreLabel(answer.score)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="mt-6 bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">추천 활동</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  href={`/videos?childId=${assessment.child.id}&age=${assessment.ageInMonths}`}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-aipoten-green hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-aipoten-red rounded-full flex items-center justify-center mr-3">
                      <span className="text-white">📹</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">추천 영상</h4>
                      <p className="text-sm text-gray-500">발달에 도움되는 영상</p>
                    </div>
                  </div>
                </Link>

                <Link
                  href={`/spirituality?childId=${assessment.child.id}`}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-aipoten-green hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-aipoten-orange rounded-full flex items-center justify-center mr-3">
                      <span className="text-white">🎮</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">놀이 영성</h4>
                      <p className="text-sm text-gray-500">맞춤 놀이 활동</p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/boards"
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-aipoten-green hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-aipoten-blue rounded-full flex items-center justify-center mr-3">
                      <span className="text-white">💬</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">커뮤니티</h4>
                      <p className="text-sm text-gray-500">다른 부모와 소통</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}