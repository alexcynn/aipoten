'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
interface PlayActivity {
  id: string
  title: string
  description: string
  instructions: string[]
  materials: string[]
  ageMin: number
  ageMax: number
  category: string
  duration: number
  difficulty: 'easy' | 'medium' | 'hard'
  spiritualAspect: string
  benefits: string[]
}

interface Child {
  id: string
  name: string
  birthDate: string
}

export default function SpiritualityPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activities, setActivities] = useState<PlayActivity[]>([])
  const [children, setChildren] = useState<Child[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedChildId, setSelectedChildId] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('')

  const categories = [
    '전체',
    '감사하기',
    '나눔과 배려',
    '자연과 친해지기',
    '마음 다스리기',
    '기도와 명상',
    '사랑 표현하기',
    '용서와 화해',
    '경청하기',
    '창조성 기르기'
  ]

  const difficulties = [
    { value: '', label: '전체' },
    { value: 'easy', label: '쉬움' },
    { value: 'medium', label: '보통' },
    { value: 'hard', label: '어려움' }
  ]

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }

    const fetchData = async () => {
      try {
        const [activitiesRes, childrenRes] = await Promise.all([
          fetch('/api/spirituality-activities'),
          fetch('/api/children')
        ])

        if (activitiesRes.ok) {
          const activitiesData = await activitiesRes.json()
          setActivities(activitiesData)
        }

        if (childrenRes.ok) {
          const childrenData = await childrenRes.json()
          setChildren(childrenData)

          // URL 파라미터에서 childId가 있으면 자동 선택
          const childIdParam = searchParams.get('childId')
          if (childIdParam && childrenData.find((c: Child) => c.id === childIdParam)) {
            setSelectedChildId(childIdParam)
          }
        }
      } catch (error) {
        console.error('데이터를 불러오는 중 오류 발생:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [session, status, router, searchParams])

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate)
    const today = new Date()
    const ageInMonths = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth())
    return ageInMonths
  }

  const getAgeText = (birthDate: string) => {
    const ageInMonths = calculateAge(birthDate)
    if (ageInMonths < 12) {
      return `${ageInMonths}개월`
    } else {
      const years = Math.floor(ageInMonths / 12)
      const months = ageInMonths % 12
      return months > 0 ? `${years}세 ${months}개월` : `${years}세`
    }
  }

  const filteredActivities = activities.filter(activity => {
    // 카테고리 필터
    if (selectedCategory && selectedCategory !== '전체' && activity.category !== selectedCategory) {
      return false
    }

    // 난이도 필터
    if (selectedDifficulty && activity.difficulty !== selectedDifficulty) {
      return false
    }

    // 아이 나이 필터
    if (selectedChildId) {
      const child = children.find(c => c.id === selectedChildId)
      if (child) {
        const ageInMonths = calculateAge(child.birthDate)
        if (ageInMonths < activity.ageMin || ageInMonths > activity.ageMax) {
          return false
        }
      }
    }

    return true
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '쉬움'
      case 'medium': return '보통'
      case 'hard': return '어려움'
      default: return difficulty
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case '감사하기': return '🙏'
      case '나눔과 배려': return '🤝'
      case '자연과 친해지기': return '🌱'
      case '마음 다스리기': return '💆‍♀️'
      case '기도와 명상': return '🧘‍♀️'
      case '사랑 표현하기': return '💝'
      case '용서와 화해': return '🕊️'
      case '경청하기': return '👂'
      case '창조성 기르기': return '🎨'
      default: return '✨'
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
              <Link href="/dashboard" className="text-gray-600 hover:text-aipoten-green">
                대시보드
              </Link>
              <span className="text-gray-700">{session.user?.name}님</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">놀이 영성</h1>
            <p className="mt-2 text-gray-600">
              아이의 마음과 영성을 기르는 의미 있는 놀이 활동을 제안해드립니다.
            </p>
          </div>

          {/* Introduction Card */}
          <div className="bg-gradient-aipoten text-white rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold mb-2">
                  놀이를 통해 자라나는 아이의 영성 💫
                </h2>
                <p className="text-white/90 mb-4">
                  일상의 놀이 속에서 감사, 나눔, 배려의 마음을 기르고
                  <br />
                  자연과 생명의 소중함을 느낄 수 있도록 도와드립니다.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center">
                    <span className="mr-2">🙏</span>
                    <span>감사하는 마음</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">🤝</span>
                    <span>나눔과 배려</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">🌱</span>
                    <span>자연 친화</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">💝</span>
                    <span>사랑 표현</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Child Selection */}
              <div>
                <label htmlFor="child-select" className="block text-sm font-medium text-gray-700 mb-2">
                  아이 선택
                </label>
                <select
                  id="child-select"
                  value={selectedChildId}
                  onChange={(e) => setSelectedChildId(e.target.value)}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-aipoten-green focus:border-aipoten-green"
                >
                  <option value="">모든 연령대</option>
                  {children.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.name} ({getAgeText(child.birthDate)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Selection */}
              <div>
                <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 mb-2">
                  영성 영역
                </label>
                <select
                  id="category-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-aipoten-green focus:border-aipoten-green"
                >
                  {categories.map((category) => (
                    <option key={category} value={category === '전체' ? '' : category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Selection */}
              <div>
                <label htmlFor="difficulty-select" className="block text-sm font-medium text-gray-700 mb-2">
                  난이도
                </label>
                <select
                  id="difficulty-select"
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-aipoten-green focus:border-aipoten-green"
                >
                  {difficulties.map((difficulty) => (
                    <option key={difficulty.value} value={difficulty.value}>
                      {difficulty.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Activities Grid */}
          {filteredActivities.length === 0 ? (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-12 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">✨</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  조건에 맞는 놀이 활동이 없습니다
                </h3>
                <p className="text-gray-600 mb-6">
                  다른 조건을 선택해보시거나 필터를 초기화해보세요.
                </p>
                <button
                  onClick={() => {
                    setSelectedChildId('')
                    setSelectedCategory('')
                    setSelectedDifficulty('')
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-aipoten-green hover:bg-aipoten-navy"
                >
                  필터 초기화
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredActivities.map((activity) => (
                <div key={activity.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="text-2xl mr-3">
                          {getCategoryIcon(activity.category)}
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-1">
                            {activity.title}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <span className="inline-block bg-aipoten-accent bg-opacity-20 text-aipoten-green text-xs px-2 py-1 rounded-full">
                              {activity.category}
                            </span>
                            <span className={`inline-block text-xs px-2 py-1 rounded-full ${getDifficultyColor(activity.difficulty)}`}>
                              {getDifficultyLabel(activity.difficulty)}
                            </span>
                            <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                              {activity.ageMin}-{activity.ageMax}개월
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {activity.duration}분
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 mb-4 text-sm">
                      {activity.description}
                    </p>

                    {/* Spiritual Aspect */}
                    <div className="bg-purple-50 p-3 rounded-lg mb-4">
                      <h4 className="text-sm font-medium text-purple-900 mb-1">💫 영성적 의미</h4>
                      <p className="text-sm text-purple-800">{activity.spiritualAspect}</p>
                    </div>

                    {/* Benefits */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">🌟 기대 효과</h4>
                      <div className="flex flex-wrap gap-1">
                        {activity.benefits.map((benefit, index) => (
                          <span
                            key={index}
                            className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded"
                          >
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Materials */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">🧸 준비물</h4>
                      <div className="flex flex-wrap gap-1">
                        {activity.materials.map((material, index) => (
                          <span
                            key={index}
                            className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                          >
                            {material}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Instructions Preview */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">📝 활동 방법</h4>
                      <ol className="text-sm text-gray-600 space-y-1">
                        {activity.instructions.slice(0, 3).map((instruction, index) => (
                          <li key={index} className="flex">
                            <span className="mr-2 text-aipoten-green font-medium">{index + 1}.</span>
                            <span>{instruction}</span>
                          </li>
                        ))}
                        {activity.instructions.length > 3 && (
                          <li className="text-gray-400 text-xs">
                            ... 외 {activity.instructions.length - 3}단계 더
                          </li>
                        )}
                      </ol>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => {
                        // 상세 모달이나 페이지로 이동하는 로직 추가 가능
                        alert('상세 활동 가이드 페이지로 이동합니다.')
                      }}
                      className="w-full bg-aipoten-green text-white py-2 px-4 rounded-md hover:bg-aipoten-navy transition-colors text-sm font-medium"
                    >
                      자세한 활동 가이드 보기
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stats */}
          {filteredActivities.length > 0 && (
            <div className="mt-8 bg-white shadow rounded-lg p-6">
              <div className="text-center">
                <p className="text-gray-600">
                  총 <span className="font-semibold text-aipoten-green">{filteredActivities.length}</span>개의 놀이 영성 활동이 있습니다
                  {selectedChildId && (
                    <>
                      {' '}• {children.find(c => c.id === selectedChildId)?.name}님의 연령에 맞는 활동입니다
                    </>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}