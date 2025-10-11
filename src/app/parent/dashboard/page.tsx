'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import ProfilePictureUpload from '@/components/ProfilePictureUpload'
import Header from '@/components/layout/Header'
import ChildSelector from '@/components/ChildSelector'
import ChildEditModal from '@/components/ChildEditModal'

interface Child {
  id: string
  name: string
  gender: string
  birthDate: string
  createdAt: string
}

interface Assessment {
  id: string
  childId: string
  ageInMonths: number
  totalScore: number
  createdAt: string
}

export default function ParentDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChildId, setSelectedChildId] = useState<string>('')
  const [latestAssessment, setLatestAssessment] = useState<Assessment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userAvatar, setUserAvatar] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'assessments' | 'videos' | 'therapists' | 'sessions'>('assessments')

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    // 역할에 따른 리다이렉트
    if (session.user?.role === 'THERAPIST') {
      router.push('/therapist/dashboard')
      return
    }

    if (session.user?.role === 'ADMIN') {
      router.push('/admin/dashboard')
      return
    }

    // 사용자 정보와 아이 목록 가져오기
    const fetchData = async () => {
      try {
        const [userRes, childrenRes] = await Promise.all([
          fetch('/api/users/me'),
          fetch('/api/children')
        ])

        if (userRes.ok) {
          const userData = await userRes.json()
          setUserAvatar(userData.avatar)
        }

        if (childrenRes.ok) {
          const childrenData = await childrenRes.json()
          // API 응답이 객체인 경우 children 배열 추출
          const childrenArray = Array.isArray(childrenData) ? childrenData : (childrenData.children || [])
          setChildren(childrenArray)

          // localStorage에서 선택된 아이 ID 확인
          if (childrenArray.length > 0) {
            const savedChildId = localStorage.getItem('aipoten_selected_child_id')
            const validChild = childrenArray.find((c: Child) => c.id === savedChildId)

            if (validChild) {
              setSelectedChildId(validChild.id)
            } else {
              // 저장된 ID가 없거나 유효하지 않으면 첫 번째 아이 선택
              setSelectedChildId(childrenArray[0].id)
              localStorage.setItem('aipoten_selected_child_id', childrenArray[0].id)
            }
          }
        }
      } catch (error) {
        console.error('데이터를 가져오는 중 오류 발생:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [session, status, router])

  // 선택된 아이의 최근 발달체크 조회
  useEffect(() => {
    if (!selectedChildId) return

    const fetchLatestAssessment = async () => {
      try {
        const response = await fetch(`/api/assessments?childId=${selectedChildId}&limit=1`)
        if (response.ok) {
          const data = await response.json()
          const assessmentsArray = Array.isArray(data) ? data : (data.assessments || [])
          setLatestAssessment(assessmentsArray.length > 0 ? assessmentsArray[0] : null)
        }
      } catch (error) {
        console.error('최근 발달체크 조회 오류:', error)
      }
    }

    fetchLatestAssessment()
  }, [selectedChildId])

  // 아이 선택 변경 핸들러
  const handleSelectChild = (childId: string) => {
    setSelectedChildId(childId)
    localStorage.setItem('aipoten_selected_child_id', childId)
  }

  // 아이 정보 업데이트 핸들러
  const handleChildUpdate = (updatedChild: Child) => {
    setChildren(children.map(child =>
      child.id === updatedChild.id ? updatedChild : child
    ))
  }

  // 나이 계산
  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate)
    const today = new Date()
    const ageInMonths = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth())

    if (ageInMonths < 12) {
      return `${ageInMonths}개월`
    } else {
      const years = Math.floor(ageInMonths / 12)
      const months = ageInMonths % 12
      return months > 0 ? `${years}세 ${months}개월` : `${years}세`
    }
  }

  // 다음 체크 권장 시기 계산
  const getNextCheckDate = () => {
    if (!latestAssessment) return null
    const lastCheckDate = new Date(latestAssessment.createdAt)
    const nextCheckDate = new Date(lastCheckDate)
    nextCheckDate.setMonth(nextCheckDate.getMonth() + 1)
    return nextCheckDate
  }

  const handleAvatarUpload = async (imageUrl: string) => {
    try {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ avatar: imageUrl }),
      })

      if (response.ok) {
        setUserAvatar(imageUrl)
      }
    } catch (error) {
      console.error('프로필 사진 업데이트 오류:', error)
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
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    안녕하세요, {session.user?.name}님!
                  </h1>
                  <p className="text-gray-600">
                    아이포텐에서 우리 아이의 발달을 체크하고 관리해보세요.
                  </p>

                  {/* ChildSelector와 등록 버튼 */}
                  {children.length > 0 && (
                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex-1">
                        <ChildSelector
                          children={children}
                          selectedChildId={selectedChildId}
                          onSelectChild={handleSelectChild}
                        />
                      </div>
                      <Link
                        href="/parent/children/new"
                        className="px-4 py-2 bg-aipoten-green text-white rounded-md hover:bg-aipoten-navy transition-colors whitespace-nowrap"
                      >
                        + 아이 등록
                      </Link>
                    </div>
                  )}
                </div>
                <div className="ml-6">
                  <ProfilePictureUpload
                    currentImageUrl={userAvatar}
                    onImageUpload={handleAvatarUpload}
                    type="profile"
                    size="lg"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Selected Child Info - 아이가 있을 때만 표시 */}
          {selectedChildId && children.length > 0 && (
            <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {children.find(c => c.id === selectedChildId)?.name}의 정보
                  </h2>
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="px-3 py-1 text-sm text-aipoten-green border border-aipoten-green rounded-md hover:bg-aipoten-green hover:text-white transition-colors"
                  >
                    편집
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 기본 정보 */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">기본 정보</h3>
                    <div className="space-y-2">
                      {children.find(c => c.id === selectedChildId) && (
                        <>
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">나이:</span>{' '}
                            {calculateAge(children.find(c => c.id === selectedChildId)!.birthDate)}
                          </p>
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">성별:</span>{' '}
                            {children.find(c => c.id === selectedChildId)!.gender === 'MALE' ? '남아' : '여아'}
                          </p>
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">생년월일:</span>{' '}
                            {new Date(children.find(c => c.id === selectedChildId)!.birthDate).toLocaleDateString('ko-KR')}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 최근 발달체크 */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">최근 발달체크</h3>
                    {latestAssessment ? (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">평가일:</span>{' '}
                          {new Date(latestAssessment.createdAt).toLocaleDateString('ko-KR')}
                        </p>
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">총점:</span>{' '}
                          {latestAssessment.totalScore}점
                        </p>
                        {getNextCheckDate() && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">다음 체크 권장:</span>{' '}
                            {getNextCheckDate()!.toLocaleDateString('ko-KR')}
                          </p>
                        )}
                        <Link
                          href={`/parent/assessments/${latestAssessment.id}`}
                          className="inline-block text-sm text-aipoten-green hover:text-aipoten-navy font-medium"
                        >
                          자세히 보기 →
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-500 mb-3">
                          아직 발달체크 기록이 없습니다.
                        </p>
                        <Link
                          href="/parent/assessments/new"
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-aipoten-green hover:bg-aipoten-navy"
                        >
                          첫 발달체크 시작하기
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tabs Navigation */}
          {selectedChildId && children.length > 0 && (
            <div className="bg-white shadow rounded-lg mb-6">
              {/* Tab Headers */}
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setActiveTab('assessments')}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'assessments'
                        ? 'border-aipoten-green text-aipoten-green'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    발달체크
                  </button>
                  <button
                    onClick={() => setActiveTab('videos')}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'videos'
                        ? 'border-aipoten-green text-aipoten-green'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    추천영상
                  </button>
                  <button
                    onClick={() => setActiveTab('therapists')}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'therapists'
                        ? 'border-aipoten-green text-aipoten-green'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    치료사 찾기
                  </button>
                  <button
                    onClick={() => setActiveTab('sessions')}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'sessions'
                        ? 'border-aipoten-green text-aipoten-green'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    세션 일정
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* 발달체크 탭 */}
                {activeTab === 'assessments' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">발달체크 이력</h3>
                    <div className="space-y-4">
                      <Link
                        href="/parent/assessments/new"
                        className="inline-flex items-center px-4 py-2 bg-aipoten-green text-white rounded-md hover:bg-aipoten-navy transition-colors"
                      >
                        + 새 발달체크 시작하기
                      </Link>
                      <div className="text-sm text-gray-500">
                        발달체크 이력을 확인하고 새로운 평가를 시작할 수 있습니다.
                      </div>
                    </div>
                  </div>
                )}

                {/* 추천영상 탭 */}
                {activeTab === 'videos' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">추천 놀이영상</h3>
                    <div className="space-y-4">
                      <Link
                        href="/videos"
                        className="inline-flex items-center px-4 py-2 bg-aipoten-green text-white rounded-md hover:bg-aipoten-navy transition-colors"
                      >
                        추천영상 보러가기
                      </Link>
                      <div className="text-sm text-gray-500">
                        아이의 발달 단계에 맞는 놀이영상을 확인해보세요.
                      </div>
                    </div>
                  </div>
                )}

                {/* 치료사 찾기 탭 */}
                {activeTab === 'therapists' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">전문 치료사 찾기</h3>
                    <div className="space-y-4">
                      <Link
                        href="/parent/therapists"
                        className="inline-flex items-center px-4 py-2 bg-aipoten-green text-white rounded-md hover:bg-aipoten-navy transition-colors"
                      >
                        치료사 검색하기
                      </Link>
                      <div className="text-sm text-gray-500">
                        우리 아이에게 맞는 전문 치료사를 찾아보세요.
                      </div>
                    </div>
                  </div>
                )}

                {/* 세션 일정 탭 */}
                {activeTab === 'sessions' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">치료 세션 일정</h3>
                    <div className="space-y-4">
                      <Link
                        href="/parent/sessions/schedule"
                        className="inline-flex items-center px-4 py-2 bg-aipoten-green text-white rounded-md hover:bg-aipoten-navy transition-colors"
                      >
                        일정 확인하기
                      </Link>
                      <div className="text-sm text-gray-500">
                        예약된 치료 세션 일정을 확인하고 관리할 수 있습니다.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Child Edit Modal */}
      {selectedChildId && children.find(c => c.id === selectedChildId) && (
        <ChildEditModal
          child={children.find(c => c.id === selectedChildId)!}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleChildUpdate}
        />
      )}
    </div>
  )
}
