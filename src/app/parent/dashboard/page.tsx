'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import ChildSelector from '@/components/ChildSelector'
import ChildEditModal from '@/components/ChildEditModal'
import SessionsCalendar from '@/components/SessionsCalendar'
import ParentBookingDetailModal from '@/components/modals/ParentBookingDetailModal'

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

const LEVEL_LABELS: Record<string, { text: string; color: string; bgColor: string }> = {
  ADVANCED: { text: '빠른 발달', color: '#1976D2', bgColor: '#E3F2FD' },
  NORMAL: { text: '또래 수준', color: '#388E3C', bgColor: '#E8F5E9' },
  NEEDS_TRACKING: { text: '추적 필요', color: '#F57C00', bgColor: '#FFF3E0' },
  NEEDS_ASSESSMENT: { text: '심화 평가 필요', color: '#D32F2F', bgColor: '#FFEBEE' }
}

// 전체 발달 수준 판정 (가장 낮은 수준 기준)
const getOverallLevel = (results?: { level: string }[]) => {
  if (!results || results.length === 0) return 'NEEDS_ASSESSMENT'

  const levelPriority = ['NEEDS_ASSESSMENT', 'NEEDS_TRACKING', 'NORMAL', 'ADVANCED']
  let lowestLevel = 'ADVANCED'

  for (const result of results) {
    const currentPriority = levelPriority.indexOf(result.level)
    const lowestPriority = levelPriority.indexOf(lowestLevel)

    if (currentPriority < lowestPriority) {
      lowestLevel = result.level
    }
  }

  return lowestLevel
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
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)

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

          // 중복 제거: ID를 기준으로 unique한 검사만 추출
          const uniqueAssessments = assessmentsArray.filter((assessment: Assessment, index: number, self: Assessment[]) =>
            index === self.findIndex((a) => a.id === assessment.id)
          )

          setLatestAssessment(uniqueAssessments.length > 0 ? uniqueAssessments[0] : null)
          setAssessments(uniqueAssessments.slice(0, 5)) // 최근 5개
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

        // 예약 목록 가져오기 (모든 예약)
        const bookingsRes = await fetch('/api/bookings')
        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json()
          const bookingsArray = bookingsData.bookings || []
          // 모든 예약을 저장 (날짜순 정렬)
          const sortedBookings = bookingsArray.sort((a: any, b: any) =>
            new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
          )
          setMyBookings(sortedBookings)
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


  // 예약 필터링 함수
  const filterBookings = (bookings: any[], sessionType: 'CONSULTATION' | 'THERAPY', state: 'pending' | 'in_progress' | 'history') => {
    const filtered = bookings.filter((b: any) => b.payment?.sessionType === sessionType)

    if (state === 'pending') {
      // 결제 대기 또는 예약 대기: Payment가 PENDING_PAYMENT이거나 PAID이지만 아직 확정되지 않은 예약
      return filtered.filter((b: any) =>
        b.payment?.status === 'PENDING_PAYMENT' ||
        (b.payment?.status === 'PAID' && b.status === 'PENDING_CONFIRMATION')
      )
    } else if (state === 'in_progress') {
      // 진행 중: 결제 완료되고 확정된 예약이지만 아직 완료되지 않은 것
      return filtered.filter((b: any) =>
        b.payment?.status === 'PAID' &&
        b.status === 'CONFIRMED'
      )
    } else {
      // 기록: 완료 또는 취소/환불
      return filtered.filter((b: any) =>
        b.status === 'PENDING_SETTLEMENT' ||
        b.status === 'SETTLEMENT_COMPLETED' ||
        b.status === 'REFUNDED' ||
        b.status === 'CANCELLED'
      )
    }
  }

  // 필터된 예약 목록
  const consultationPendingBookings = filterBookings(myBookings, 'CONSULTATION', 'pending')
  const consultationInProgressBookings = filterBookings(myBookings, 'CONSULTATION', 'in_progress')
  const consultationHistoryBookings = filterBookings(myBookings, 'CONSULTATION', 'history')

  const therapyPendingBookings = filterBookings(myBookings, 'THERAPY', 'pending')
  const therapyInProgressBookings = filterBookings(myBookings, 'THERAPY', 'in_progress')
  const therapyHistoryBookings = filterBookings(myBookings, 'THERAPY', 'history')

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
                        href="/parent/profile"
                        className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-md hover:bg-gray-200 transition-colors whitespace-nowrap shadow-md"
                      >
                        프로필 관리
                      </Link>
                      <Link
                        href="/parent/children/new"
                        className="px-4 py-2 bg-brand-accent text-brand-navy font-semibold rounded-md hover:bg-brand-green hover:text-white transition-colors whitespace-nowrap shadow-md"
                      >
                        + 아이 등록
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 최근 발달체크 카드와 퀵 액션 버튼 */}
          {selectedChildId && children.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* 최근 발달체크 카드 */}
              <div className="lg:col-span-2 bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">최근 발달체크</h2>

                {latestAssessment ? (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-medium text-gray-600">
                            {children.find(c => c.id === selectedChildId)?.name}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(latestAssessment.createdAt).toLocaleDateString('ko-KR')}
                          </span>
                        </div>

                        <div className="mb-3">
                          <span className="text-sm font-medium text-gray-700 mr-2">발달 수준:</span>
                          {(() => {
                            const overallLevel = getOverallLevel(latestAssessment.results)
                            const levelInfo = LEVEL_LABELS[overallLevel] || LEVEL_LABELS['NEEDS_ASSESSMENT']
                            return (
                              <span
                                className="inline-block px-4 py-2 rounded-full text-base font-bold"
                                style={{
                                  backgroundColor: levelInfo.bgColor,
                                  color: levelInfo.color
                                }}
                              >
                                {levelInfo.text}
                              </span>
                            )
                          })()}
                        </div>

                        {latestAssessment.results && latestAssessment.results.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {latestAssessment.results.map((result, idx) => {
                              const resultLevelInfo = LEVEL_LABELS[result.level] || LEVEL_LABELS['NEEDS_ASSESSMENT']
                              return (
                                <div
                                  key={idx}
                                  className="text-xs px-3 py-1 rounded-full font-medium"
                                  style={{
                                    backgroundColor: resultLevelInfo.bgColor,
                                    color: resultLevelInfo.color
                                  }}
                                >
                                  {CATEGORY_LABELS[result.category] || result.category}: {resultLevelInfo.text}
                                </div>
                              )
                            })}
                          </div>
                        )}

                        {getNextCheckDate() && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">다음 체크 권장:</span>{' '}
                            {getNextCheckDate()!.toLocaleDateString('ko-KR')}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Link
                        href="/parent/assessments/new"
                        className="inline-flex items-center px-6 py-3 rounded-md font-medium text-white transition-colors shadow-md"
                        style={{ backgroundColor: '#F78C6B' }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                      >
                        발달체크 시작하기
                      </Link>
                      <Link
                        href="/parent/assessments"
                        className="inline-flex items-center px-6 py-3 rounded-md font-medium transition-colors shadow-md"
                        style={{
                          color: '#386646',
                          borderColor: '#386646',
                          borderWidth: '2px',
                          borderStyle: 'solid',
                          backgroundColor: '#FFFFFF'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#386646'
                          e.currentTarget.style.color = '#FFFFFF'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#FFFFFF'
                          e.currentTarget.style.color = '#386646'
                        }}
                      >
                        발달체크 기록 보기
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-lg p-6 text-center">
                    <div className="text-4xl mb-3">📋</div>
                    <p className="text-gray-600 mb-4">아직 발달체크 기록이 없습니다.</p>
                    <p className="text-sm text-gray-500 mb-6">
                      우리 아이의 발달 상태를 체크해보세요.
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Link
                        href="/parent/assessments/new"
                        className="inline-flex items-center px-6 py-3 rounded-md font-medium text-white transition-colors shadow-md"
                        style={{ backgroundColor: '#F78C6B' }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                      >
                        첫 발달체크 시작하기
                      </Link>
                    </div>
                  </div>
                )}
                </div>
              </div>

              {/* 퀵 액션 버튼들 */}
              <div className="grid grid-cols-2 gap-4">
                {/* 언어컨설팅 버튼 */}
                <Link
                  href="/parent/consultations"
                  className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg p-8 hover:shadow-lg hover:border-blue-400 transition-all flex items-center justify-center"
                >
                  <h3 className="text-lg font-bold text-gray-900">언어 컨설팅</h3>
                </Link>

                {/* 홈티 버튼 */}
                <Link
                  href="/parent/therapies"
                  className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-lg p-8 hover:shadow-lg hover:border-green-400 transition-all flex items-center justify-center"
                >
                  <h3 className="text-lg font-bold text-gray-900">홈티</h3>
                </Link>

                {/* 결제 버튼 */}
                <Link
                  href="/parent/payments"
                  className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-lg p-8 hover:shadow-lg hover:border-purple-400 transition-all flex items-center justify-center"
                >
                  <h3 className="text-lg font-bold text-gray-900">결제</h3>
                </Link>

                {/* 1:1 문의 버튼 */}
                <Link
                  href="/parent/inquiries"
                  className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300 rounded-lg p-8 hover:shadow-lg hover:border-orange-400 transition-all flex items-center justify-center"
                >
                  <h3 className="text-lg font-bold text-gray-900">1:1 문의</h3>
                </Link>
              </div>
            </div>
          )}

          {/* 세션 캘린더 - 모든 아이의 세션 일정 */}
          {selectedChildId && children.length > 0 && (
            <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">모든 아이의 세션 일정</h2>
                <SessionsCalendar
                  sessions={myBookings
                    .filter((booking: any) => booking.scheduledAt)
                    .map((booking: any) => ({
                      id: booking.id,
                      scheduledAt: booking.scheduledAt,
                      sessionType: booking.payment?.sessionType || 'CONSULTATION',
                      status: booking.status,
                      child: booking.child,
                      therapist: booking.therapist,
                      payment: booking.payment ? { status: booking.payment.status } : undefined
                    }))}
                  onEventClick={(bookingId) => {
                    setSelectedBookingId(bookingId)
                    setIsBookingModalOpen(true)
                  }}
                />
              </div>
            </div>
          )}

          {/* 추천영상 */}
          {selectedChildId && children.length > 0 && (
            <div className="bg-white shadow rounded-lg mb-6">
              <div className="p-6">
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
                          className="inline-flex items-center px-4 py-2 rounded-md transition-colors"
                          style={{
                            backgroundColor: '#386646',
                            color: '#FFFFFF'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#193149'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#386646'}
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

      {/* Booking Detail Modal */}
      <ParentBookingDetailModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false)
          setSelectedBookingId(null)
        }}
        bookingId={selectedBookingId}
        onUpdate={() => {
          // 예약 정보 업데이트 시 새로고침
          fetchMyBookings()
        }}
      />
    </div>
  )
}
