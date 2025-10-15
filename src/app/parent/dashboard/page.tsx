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
  completedAt?: string
  results?: {
    category: string
    score: number
    level: string
  }[]
}

const CATEGORY_LABELS: Record<string, string> = {
  GROSS_MOTOR: '대근육',
  FINE_MOTOR: '소근육',
  COGNITIVE: '인지',
  LANGUAGE: '언어',
  SOCIAL: '사회성',
  EMOTIONAL: '정서'
}

export default function ParentDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChildId, setSelectedChildId] = useState<string>('')
  const [latestAssessment, setLatestAssessment] = useState<Assessment | null>(null)
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [recommendedVideos, setRecommendedVideos] = useState<any[]>([])
  const [recommendedTherapists, setRecommendedTherapists] = useState<any[]>([])
  const [myBookings, setMyBookings] = useState<any[]>([])
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

    const fetchAssessments = async () => {
      try {
        const response = await fetch(`/api/assessments?childId=${selectedChildId}`)
        if (response.ok) {
          const data = await response.json()
          const assessmentsArray = Array.isArray(data) ? data : (data.assessments || [])
          setLatestAssessment(assessmentsArray.length > 0 ? assessmentsArray[0] : null)
          setAssessments(assessmentsArray.slice(0, 5)) // 최근 5개
        }
      } catch (error) {
        console.error('발달체크 조회 오류:', error)
      }
    }

    const fetchRecommendedVideos = async () => {
      try {
        const response = await fetch(`/api/videos/recommendations?childId=${selectedChildId}&limit=5`)
        if (response.ok) {
          const data = await response.json()
          setRecommendedVideos(data.videos || [])
        }
      } catch (error) {
        console.error('추천 영상 조회 오류:', error)
      }
    }

    const fetchTherapistsAndBookings = async () => {
      try {
        // 추천 치료사 가져오기
        const therapistsRes = await fetch('/api/therapists/search?limit=3')
        if (therapistsRes.ok) {
          const therapistsData = await therapistsRes.json()
          setRecommendedTherapists(therapistsData.therapists || [])
        }

        // 예약 목록 가져오기
        const bookingsRes = await fetch('/api/bookings')
        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json()
          const bookingsArray = bookingsData.bookings || []
          // 확정된 예약 중 앞으로 있을 예약만 필터링
          const upcomingBookings = bookingsArray
            .filter((b: any) =>
              (b.status === 'CONFIRMED' || b.status === 'PENDING_CONFIRMATION') &&
              new Date(b.scheduledAt) > new Date()
            )
            .sort((a: any, b: any) =>
              new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
            )
            .slice(0, 3)
          setMyBookings(upcomingBookings)
        }
      } catch (error) {
        console.error('치료사 및 예약 조회 오류:', error)
      }
    }

    fetchAssessments()
    fetchRecommendedVideos()
    fetchTherapistsAndBookings()
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
                        className="px-4 py-2 bg-brand-accent text-brand-navy font-semibold rounded-md hover:bg-brand-green hover:text-white transition-colors whitespace-nowrap shadow-md"
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
                    {/* 발달체크 시작하기 버튼 */}
                    <div className="mb-6">
                      <Link
                        href={`/parent/assessments/new?childId=${selectedChildId}`}
                        style={{ backgroundColor: '#F78C6B' }}
                        className="inline-flex items-center px-6 py-3 text-white rounded-md hover:opacity-90 transition-all font-medium text-lg shadow-md"
                      >
                        발달체크 시작하기
                      </Link>
                    </div>

                    {/* 이전 발달체크 기록 */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">이전 발달체크 기록</h3>
                      {assessments.length > 0 ? (
                        <div className="space-y-4">
                          {assessments.map((assessment) => {
                            const date = new Date(assessment.createdAt)
                            const formattedDate = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
                            const percentage = Math.round((assessment.totalScore / 300) * 100)

                            return (
                              <div
                                key={assessment.id}
                                className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <span className="text-sm font-medium text-gray-600">{formattedDate}</span>
                                      <span className="text-sm text-gray-500">
                                        {assessment.ageInMonths}개월
                                      </span>
                                      <span
                                        className="px-3 py-1 rounded-full text-xs font-medium"
                                        style={{
                                          backgroundColor: assessment.completedAt ? '#98C15E' : '#E5E7EB',
                                          color: assessment.completedAt ? 'white' : '#6B7280'
                                        }}
                                      >
                                        {assessment.completedAt ? '완료' : '진행 중'}
                                      </span>
                                    </div>
                                    <div className="text-2xl font-bold" style={{ color: '#193149' }}>
                                      {percentage}점
                                    </div>
                                    {assessment.results && assessment.results.length > 0 && (
                                      <div className="flex flex-wrap gap-2 mt-3">
                                        {assessment.results.map((result, idx) => (
                                          <div
                                            key={idx}
                                            className="text-xs px-2 py-1 rounded"
                                            style={{ backgroundColor: '#F5F5F5', color: '#386646' }}
                                          >
                                            {CATEGORY_LABELS[result.category] || result.category}: {result.score}점
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <Link
                                    href={`/parent/assessments/${assessment.id}`}
                                    style={{ color: '#386646' }}
                                    className="ml-4 text-sm font-medium hover:opacity-70 underline"
                                  >
                                    자세히 보기 →
                                  </Link>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="bg-blue-50 rounded-lg p-6 text-center">
                          <p className="text-blue-900 mb-2">아직 발달체크 기록이 없습니다.</p>
                          <p className="text-sm text-blue-800">
                            위의 "발달체크 시작하기" 버튼을 눌러 첫 발달체크를 진행해보세요.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 추천영상 탭 */}
                {activeTab === 'videos' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {children.find(c => c.id === selectedChildId)?.name}님을 위한 추천 영상
                      </h3>
                      <Link
                        href={`/videos?childId=${selectedChildId}`}
                        className="text-sm text-aipoten-green hover:text-aipoten-navy"
                      >
                        전체 보기 →
                      </Link>
                    </div>

                    {recommendedVideos.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <div className="text-4xl mb-4">📹</div>
                        <p className="text-gray-600 mb-4">아직 추천 영상이 없습니다.</p>
                        <Link
                          href="/videos"
                          className="inline-flex items-center px-4 py-2 bg-aipoten-green text-white rounded-md hover:bg-aipoten-navy transition-colors"
                        >
                          전체 영상 보러가기
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {recommendedVideos.map((video) => (
                          <div key={video.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                            {/* Thumbnail - 클릭하면 상세 페이지로 */}
                            <Link href={`/videos/${video.id}`}>
                              <div className="aspect-video bg-gray-200 relative cursor-pointer group">
                                {video.thumbnailUrl ? (
                                  <img
                                    src={video.thumbnailUrl}
                                    alt={video.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <span className="text-4xl">📹</span>
                                  </div>
                                )}
                                {/* 재생 아이콘 오버레이 */}
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all">
                                  <div className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-xl ml-1">▶️</span>
                                  </div>
                                </div>
                                {video.duration && (
                                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                                    {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                                  </div>
                                )}
                              </div>
                            </Link>

                            {/* Content */}
                            <div className="p-4">
                              <Link href={`/videos/${video.id}`}>
                                <h4 className="font-medium text-gray-900 mb-2 line-clamp-2 hover:text-aipoten-green cursor-pointer">
                                  {video.title}
                                </h4>
                              </Link>
                              {video.recommendationReason && (
                                <p className="text-xs text-blue-600 mb-2">
                                  💡 {video.recommendationReason}
                                </p>
                              )}
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {video.description}
                              </p>
                              <div className="flex gap-2 mb-3">
                                {video.developmentCategories && video.developmentCategories.slice(0, 2).map((cat: string) => (
                                  <span
                                    key={cat}
                                    className="text-xs px-2 py-1 rounded-full"
                                    style={{ backgroundColor: '#E8F5E9', color: '#386646' }}
                                  >
                                    {CATEGORY_LABELS[cat] || cat}
                                  </span>
                                ))}
                              </div>
                              <Link
                                href={`/videos/${video.id}`}
                                className="inline-block w-full text-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white hover:opacity-90"
                                style={{ backgroundColor: '#F78C6B' }}
                              >
                                시청하기
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 치료사 찾기 탭 */}
                {activeTab === 'therapists' && (
                  <div className="space-y-6">
                    {/* 헤더와 검색 버튼 */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">전문 치료사 찾기</h3>
                      <Link
                        href="/parent/therapists"
                        className="inline-flex items-center px-6 py-2 bg-aipoten-green text-white rounded-md hover:bg-aipoten-navy transition-colors font-medium"
                      >
                        전체 치료사 검색 →
                      </Link>
                    </div>

                    {/* 다가오는 예약 */}
                    {myBookings.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-md font-semibold text-gray-700">다가오는 예약</h4>
                          <Link
                            href="/parent/bookings"
                            className="text-sm text-aipoten-green hover:text-aipoten-navy"
                          >
                            전체 보기 →
                          </Link>
                        </div>
                        <div className="space-y-3">
                          {myBookings.map((booking: any) => (
                            <div
                              key={booking.id}
                              className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-gray-900">
                                      {booking.therapist.user.name} 치료사
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                      booking.status === 'CONFIRMED'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {booking.status === 'CONFIRMED' ? '확정됨' : '확인 대기'}
                                    </span>
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    📅 {new Date(booking.scheduledAt).toLocaleDateString('ko-KR', {
                                      month: 'long',
                                      day: 'numeric',
                                      weekday: 'short'
                                    })}{' '}
                                    {booking.timeSlot.startTime}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {booking.sessionType === 'CONSULTATION' ? '방문 컨설팅' : '치료'} • {booking.child.name}
                                  </div>
                                </div>
                                <Link
                                  href={`/parent/bookings/${booking.id}`}
                                  className="ml-3 px-3 py-1 bg-white text-aipoten-green border border-aipoten-green rounded-md hover:bg-aipoten-green hover:text-white transition-colors text-sm"
                                >
                                  상세
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 추천 치료사 */}
                    <div>
                      <h4 className="text-md font-semibold text-gray-700 mb-3">추천 치료사</h4>
                      {recommendedTherapists.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                          <div className="text-4xl mb-4">👨‍⚕️</div>
                          <p className="text-gray-600 mb-4">추천 치료사 정보를 불러오는 중입니다...</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {recommendedTherapists.map((therapist: any) => (
                            <div
                              key={therapist.id}
                              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
                            >
                              <div className="mb-3">
                                <h5 className="font-semibold text-gray-900 mb-1">
                                  {therapist.user.name} 치료사
                                </h5>
                                {therapist.education && (
                                  <p className="text-xs text-gray-600">{therapist.education}</p>
                                )}
                              </div>

                              {/* 전문 분야 */}
                              {therapist.specialties && therapist.specialties.length > 0 && (
                                <div className="mb-3">
                                  <div className="flex flex-wrap gap-1">
                                    {therapist.specialties.slice(0, 2).map((spec: string, idx: number) => {
                                      const specLabels: Record<string, string> = {
                                        SPEECH_THERAPY: '언어치료',
                                        SENSORY_INTEGRATION: '감각통합',
                                        PLAY_THERAPY: '놀이치료',
                                        ART_THERAPY: '미술치료',
                                        MUSIC_THERAPY: '음악치료',
                                        OCCUPATIONAL_THERAPY: '작업치료',
                                        COGNITIVE_THERAPY: '인지치료',
                                        BEHAVIORAL_THERAPY: '행동치료',
                                      }
                                      return (
                                        <span
                                          key={idx}
                                          className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full"
                                        >
                                          {specLabels[spec] || spec}
                                        </span>
                                      )
                                    })}
                                    {therapist.specialties.length > 2 && (
                                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                        +{therapist.specialties.length - 2}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* 서비스 지역 */}
                              {therapist.serviceAreas && therapist.serviceAreas.length > 0 && (
                                <div className="mb-3">
                                  <div className="text-xs text-gray-600">
                                    📍 {therapist.serviceAreas.slice(0, 2).map((area: string) => {
                                      const areaLabels: Record<string, string> = {
                                        GANGNAM: '강남구',
                                        SEOCHO: '서초구',
                                        SONGPA: '송파구',
                                        GANGDONG: '강동구',
                                      }
                                      return areaLabels[area] || area
                                    }).join(', ')}
                                    {therapist.serviceAreas.length > 2 && ' 외'}
                                  </div>
                                </div>
                              )}

                              {/* 세션 비용 */}
                              {therapist.sessionFee && (
                                <div className="mb-3 pb-3 border-b border-gray-200">
                                  <span className="text-sm font-bold text-gray-900">
                                    ₩{therapist.sessionFee.toLocaleString()}
                                  </span>
                                  <span className="text-xs text-gray-500 ml-1">/ 50분</span>
                                </div>
                              )}

                              {/* 버튼 */}
                              <div className="flex gap-2">
                                <Link
                                  href={`/parent/therapists/${therapist.id}`}
                                  className="flex-1 text-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
                                >
                                  프로필
                                </Link>
                                <Link
                                  href={`/parent/therapists/${therapist.id}/booking`}
                                  className="flex-1 text-center px-3 py-2 bg-aipoten-green text-white rounded-md hover:bg-aipoten-navy transition-colors text-sm font-medium"
                                >
                                  예약
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 전체 검색 CTA */}
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 text-center">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        우리 아이에게 딱 맞는 치료사를 찾아보세요
                      </h4>
                      <p className="text-sm text-gray-600 mb-4">
                        전문 분야, 지역, 비용 등 다양한 조건으로 검색할 수 있습니다
                      </p>
                      <Link
                        href="/parent/therapists"
                        className="inline-flex items-center px-6 py-3 bg-aipoten-green text-white rounded-md hover:bg-aipoten-navy transition-colors font-medium shadow-md"
                      >
                        치료사 전체 검색하기 →
                      </Link>
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
