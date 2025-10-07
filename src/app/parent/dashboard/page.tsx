'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import ProfilePictureUpload from '@/components/ProfilePictureUpload'
import Header from '@/components/layout/Header'
import ChildSelector from '@/components/ChildSelector'

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

                  {/* ChildSelector - 다자녀인 경우만 표시 */}
                  {children.length > 1 && (
                    <div className="mt-4">
                      <ChildSelector
                        children={children}
                        selectedChildId={selectedChildId}
                        onSelectChild={handleSelectChild}
                      />
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
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {children.find(c => c.id === selectedChildId)?.name}의 정보
                </h2>

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

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Link
              href="/parent/children/new"
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-aipoten-blue rounded flex items-center justify-center">
                    <span className="text-white font-bold">+</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">아이 등록</h3>
                  <p className="text-sm text-gray-500">새로운 아이를 등록하세요</p>
                </div>
              </div>
            </Link>

            <Link
              href="/parent/assessments"
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-aipoten-green rounded flex items-center justify-center">
                    <span className="text-white">📊</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">발달체크</h3>
                  <p className="text-sm text-gray-500">발달 상태를 확인하세요</p>
                </div>
              </div>
            </Link>

            <Link
              href="/videos"
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-aipoten-red rounded flex items-center justify-center">
                    <span className="text-white">📹</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">추천영상</h3>
                  <p className="text-sm text-gray-500">맞춤 콘텐츠를 확인하세요</p>
                </div>
              </div>
            </Link>

            <Link
              href="/parent/therapists"
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded flex items-center justify-center">
                    <span className="text-white">👨‍⚕️</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">치료사 찾기</h3>
                  <p className="text-sm text-gray-500">전문 치료사를 찾아보세요</p>
                </div>
              </div>
            </Link>

            <Link
              href="/parent/sessions/schedule"
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                    <span className="text-white">📅</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">세션 일정</h3>
                  <p className="text-sm text-gray-500">치료 일정을 확인하세요</p>
                </div>
              </div>
            </Link>

            <Link
              href="/boards/parenting"
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-aipoten-orange rounded flex items-center justify-center">
                    <span className="text-white">💬</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">육아소통</h3>
                  <p className="text-sm text-gray-500">다른 부모님과 소통하세요</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Children List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                등록된 아이들
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                현재 등록된 아이들의 목록입니다.
              </p>
            </div>

            {children.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-gray-500 mb-4">아직 등록된 아이가 없습니다.</p>
                <Link
                  href="/parent/children/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-aipoten-green hover:bg-aipoten-navy"
                >
                  첫 번째 아이 등록하기
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {children.map((child) => (
                  <li key={child.id}>
                    <Link
                      href={`/parent/children/${child.id}`}
                      className="block hover:bg-gray-50 px-4 py-4 sm:px-6"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-aipoten-accent rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold">
                                {child.name.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {child.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {child.gender === 'MALE' ? '남아' : '여아'} •
                              생년월일: {new Date(child.birthDate).toLocaleDateString('ko-KR')}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-400">
                          등록일: {new Date(child.createdAt).toLocaleDateString('ko-KR')}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
