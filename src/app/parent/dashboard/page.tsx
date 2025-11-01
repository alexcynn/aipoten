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
  const [activeTab, setActiveTab] = useState<'assessments' | 'videos' | 'consultation' | 'therapy' | 'sessions' | 'inquiry'>('assessments')
  const [consultationSubTab, setConsultationSubTab] = useState<'pending' | 'in_progress' | 'history'>('pending')
  const [therapySubTab, setTherapySubTab] = useState<'pending' | 'in_progress' | 'history'>('pending')
  const [inquiries, setInquiries] = useState<any[]>([])
  const [showInquiryForm, setShowInquiryForm] = useState(false)
  const [inquiryForm, setInquiryForm] = useState({
    category: 'SERVICE',
    title: '',
    content: '',
  })
  const [sessionRecords, setSessionRecords] = useState<any[]>([])
  const [recordsFilter, setRecordsFilter] = useState<'ALL' | 'CONSULTATION' | 'THERAPY'>('ALL')

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

  // 문의 목록 조회
  useEffect(() => {
    if (activeTab === 'inquiry') {
      fetchInquiries()
    }
  }, [activeTab])

  // 세션 기록 조회
  useEffect(() => {
    if (activeTab === 'sessions') {
      fetchSessionRecords()
    }
  }, [activeTab])

  const fetchInquiries = async () => {
    try {
      const response = await fetch('/api/inquiry')
      if (response.ok) {
        const data = await response.json()
        setInquiries(data.inquiries || [])
      }
    } catch (error) {
      console.error('문의 목록 조회 오류:', error)
    }
  }

  const fetchSessionRecords = async () => {
    try {
      // 모든 예약의 세션 정보를 가져옴
      const allSessions: any[] = []

      for (const booking of myBookings) {
        const response = await fetch(`/api/bookings/${booking.id}/sessions`)
        if (response.ok) {
          const data = await response.json()
          // 완료된 세션만 필터링 (상담일지가 있는 세션)
          const completedSessions = data.sessions.filter((s: any) => s.therapistNote)
          completedSessions.forEach((s: any) => {
            allSessions.push({
              ...s,
              booking: data.booking,
            })
          })
        }
      }

      // 날짜순 정렬 (최신순)
      allSessions.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
      setSessionRecords(allSessions)
    } catch (error) {
      console.error('세션 기록 조회 오류:', error)
    }
  }

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inquiryForm.title.trim() || !inquiryForm.content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.')
      return
    }

    try {
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inquiryForm),
      })

      if (response.ok) {
        alert('문의가 등록되었습니다.')
        setInquiryForm({ category: 'SERVICE', title: '', content: '' })
        setShowInquiryForm(false)
        fetchInquiries()
      } else {
        const data = await response.json()
        alert(data.error || '문의 등록에 실패했습니다.')
      }
    } catch (error) {
      console.error('문의 등록 오류:', error)
      alert('문의 등록 중 오류가 발생했습니다.')
    }
  }

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

  // 예약 필터링 함수
  const filterBookings = (bookings: any[], sessionType: 'CONSULTATION' | 'THERAPY', state: 'pending' | 'in_progress' | 'history') => {
    const filtered = bookings.filter((b: any) => b.sessionType === sessionType)

    if (state === 'pending') {
      // 결제 대기: paidAt이 null인 예약
      return filtered.filter((b: any) => !b.paidAt)
    } else if (state === 'in_progress') {
      // 진행 중: paidAt이 있고, completedSessions < sessionCount
      return filtered.filter((b: any) => b.paidAt && b.completedSessions < b.sessionCount)
    } else {
      // 기록: completedSessions === sessionCount 또는 status가 COMPLETED/CANCELLED
      return filtered.filter((b: any) =>
        b.completedSessions === b.sessionCount ||
        b.status === 'COMPLETED' ||
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
                    className="px-3 py-1 text-sm rounded-md transition-colors"
                    style={{
                      color: '#386646',
                      borderColor: '#386646',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#386646'
                      e.currentTarget.style.color = '#FFFFFF'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.color = '#386646'
                    }}
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
                        <div>
                          <span className="text-sm font-medium text-gray-900">발달 수준: </span>
                          {(() => {
                            const overallLevel = getOverallLevel(latestAssessment.results)
                            const levelInfo = LEVEL_LABELS[overallLevel] || LEVEL_LABELS['NEEDS_ASSESSMENT']
                            return (
                              <span
                                className="inline-block px-3 py-1 rounded-full text-xs font-bold"
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
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md transition-colors"
                          style={{
                            backgroundColor: '#386646',
                            color: '#FFFFFF'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#193149'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#386646'}
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
                    onClick={() => setActiveTab('consultation')}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'consultation'
                        ? 'border-aipoten-green text-aipoten-green'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    언어 컨설팅 예약
                  </button>
                  <button
                    onClick={() => setActiveTab('therapy')}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'therapy'
                        ? 'border-aipoten-green text-aipoten-green'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    홈티 예약
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
                  <button
                    onClick={() => setActiveTab('inquiry')}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'inquiry'
                        ? 'border-aipoten-green text-aipoten-green'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    1:1 문의
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

                            // 전체 발달 수준 판정
                            const overallLevel = getOverallLevel(assessment.results)
                            const levelInfo = LEVEL_LABELS[overallLevel] || LEVEL_LABELS['NEEDS_ASSESSMENT']

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

                                    {/* 전체 발달 수준 표시 */}
                                    <div
                                      className="inline-block px-4 py-2 rounded-lg text-lg font-bold mb-3"
                                      style={{
                                        backgroundColor: levelInfo.bgColor,
                                        color: levelInfo.color
                                      }}
                                    >
                                      {levelInfo.text}
                                    </div>

                                    {/* 영역별 발달 수준 */}
                                    {assessment.results && assessment.results.length > 0 && (
                                      <div className="flex flex-wrap gap-2 mt-3">
                                        {assessment.results.map((result, idx) => {
                                          const resultLevelInfo = LEVEL_LABELS[result.level] || LEVEL_LABELS['NEEDS_ASSESSMENT']
                                          return (
                                            <div
                                              key={idx}
                                              className="text-xs px-2 py-1 rounded font-medium"
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
                )}

                {/* 언어 컨설팅 예약 탭 */}
                {activeTab === 'consultation' && (
                  <div className="space-y-6">
                    {/* 예약하기 버튼 */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border-2 border-blue-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">언어 컨설팅 찾기</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        언어 발달 전문 치료사의 1회 컨설팅
                      </p>
                      <Link
                        href="/parent/therapists?type=consultation"
                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                      >
                        언어치료 컨설팅 예약하기 →
                      </Link>
                    </div>

                    {/* Sub-tabs */}
                    <div className="border-b border-gray-200">
                      <nav className="flex -mb-px gap-2">
                        <button
                          onClick={() => setConsultationSubTab('pending')}
                          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                            consultationSubTab === 'pending'
                              ? 'border-blue-600 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          결제 대기 ({consultationPendingBookings.length})
                        </button>
                        <button
                          onClick={() => setConsultationSubTab('in_progress')}
                          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                            consultationSubTab === 'in_progress'
                              ? 'border-blue-600 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          진행 중 ({consultationInProgressBookings.length})
                        </button>
                        <button
                          onClick={() => setConsultationSubTab('history')}
                          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                            consultationSubTab === 'history'
                              ? 'border-blue-600 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          컨설팅 기록 ({consultationHistoryBookings.length})
                        </button>
                      </nav>
                    </div>

                    {/* Sub-tab Content */}
                    <div>
                      {consultationSubTab === 'pending' && (
                        <div className="space-y-3">
                          {consultationPendingBookings.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-lg">
                              <div className="text-4xl mb-4">📋</div>
                              <p className="text-gray-600">결제 대기 중인 컨설팅이 없습니다.</p>
                            </div>
                          ) : (
                            consultationPendingBookings.map((booking: any) => (
                              <div
                                key={booking.id}
                                className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-semibold text-gray-900">
                                        {booking.therapist.user.name} 치료사
                                      </span>
                                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        결제 대기
                                      </span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      📅 {new Date(booking.scheduledAt).toLocaleDateString('ko-KR', {
                                        month: 'long',
                                        day: 'numeric',
                                        weekday: 'short'
                                      })}{' '}
                                      {booking.timeSlot?.startTime || '시간 미정'}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {booking.child.name} • ₩{booking.finalFee.toLocaleString()}
                                    </div>
                                  </div>
                                  <Link
                                    href={`/parent/bookings/${booking.id}`}
                                    className="ml-3 px-3 py-1 bg-white text-blue-600 border border-blue-600 rounded-md hover:bg-blue-600 hover:text-white transition-colors text-sm"
                                  >
                                    상세
                                  </Link>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}

                      {consultationSubTab === 'in_progress' && (
                        <div className="space-y-3">
                          {consultationInProgressBookings.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-lg">
                              <div className="text-4xl mb-4">📝</div>
                              <p className="text-gray-600">진행 중인 컨설팅이 없습니다.</p>
                            </div>
                          ) : (
                            consultationInProgressBookings.map((booking: any) => (
                              <div
                                key={booking.id}
                                className="bg-green-50 border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-semibold text-gray-900">
                                        {booking.therapist.user.name} 치료사
                                      </span>
                                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        진행 중
                                      </span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      📅 {new Date(booking.scheduledAt).toLocaleDateString('ko-KR', {
                                        month: 'long',
                                        day: 'numeric',
                                        weekday: 'short'
                                      })}{' '}
                                      {booking.timeSlot?.startTime || '시간 미정'}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {booking.child.name} • {booking.completedSessions}/{booking.sessionCount}회 완료
                                    </div>
                                  </div>
                                  <Link
                                    href={`/parent/bookings/${booking.id}`}
                                    className="ml-3 px-3 py-1 bg-white text-green-600 border border-green-600 rounded-md hover:bg-green-600 hover:text-white transition-colors text-sm"
                                  >
                                    상세
                                  </Link>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}

                      {consultationSubTab === 'history' && (
                        <div className="space-y-3">
                          {consultationHistoryBookings.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-lg">
                              <div className="text-4xl mb-4">📚</div>
                              <p className="text-gray-600">컨설팅 기록이 없습니다.</p>
                            </div>
                          ) : (
                            consultationHistoryBookings.map((booking: any) => (
                              <div
                                key={booking.id}
                                className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-semibold text-gray-900">
                                        {booking.therapist.user.name} 치료사
                                      </span>
                                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                        booking.status === 'COMPLETED'
                                          ? 'bg-blue-100 text-blue-800'
                                          : 'bg-gray-100 text-gray-800'
                                      }`}>
                                        {booking.status === 'COMPLETED' ? '완료' : '취소됨'}
                                      </span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      📅 {new Date(booking.scheduledAt).toLocaleDateString('ko-KR', {
                                        month: 'long',
                                        day: 'numeric',
                                        weekday: 'short'
                                      })}{' '}
                                      {booking.timeSlot?.startTime || '시간 미정'}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {booking.child.name}
                                    </div>
                                  </div>
                                  <Link
                                    href={`/parent/bookings/${booking.id}`}
                                    className="ml-3 px-3 py-1 bg-white text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors text-sm"
                                  >
                                    상세
                                  </Link>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 홈티 예약 탭 */}
                {activeTab === 'therapy' && (
                  <div className="space-y-6">
                    {/* 예약하기 버튼 */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border-2 border-green-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">홈티 찾기</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        정기 치료를 위한 전문 치료사 검색
                      </p>
                      <Link
                        href="/parent/therapists?type=therapy"
                        className="inline-flex items-center px-6 py-3 rounded-md transition-colors font-medium"
                        style={{
                          backgroundColor: '#386646',
                          color: '#FFFFFF'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#193149'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#386646'}
                      >
                        전문 치료사 검색하기 →
                      </Link>
                    </div>

                    {/* Sub-tabs */}
                    <div className="border-b border-gray-200">
                      <nav className="flex -mb-px gap-2">
                        <button
                          onClick={() => setTherapySubTab('pending')}
                          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                            therapySubTab === 'pending'
                              ? 'border-aipoten-green text-aipoten-green'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          결제 대기 홈티 ({therapyPendingBookings.length})
                        </button>
                        <button
                          onClick={() => setTherapySubTab('in_progress')}
                          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                            therapySubTab === 'in_progress'
                              ? 'border-aipoten-green text-aipoten-green'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          진행 중 홈티 ({therapyInProgressBookings.length})
                        </button>
                        <button
                          onClick={() => setTherapySubTab('history')}
                          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                            therapySubTab === 'history'
                              ? 'border-aipoten-green text-aipoten-green'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          홈티 기록 ({therapyHistoryBookings.length})
                        </button>
                      </nav>
                    </div>

                    {/* Sub-tab Content */}
                    <div>
                      {therapySubTab === 'pending' && (
                        <div className="space-y-3">
                          {therapyPendingBookings.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-lg">
                              <div className="text-4xl mb-4">📋</div>
                              <p className="text-gray-600">결제 대기 중인 홈티가 없습니다.</p>
                            </div>
                          ) : (
                            therapyPendingBookings.map((booking: any) => (
                              <div
                                key={booking.id}
                                className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-semibold text-gray-900">
                                        {booking.therapist.user.name} 치료사
                                      </span>
                                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        결제 대기
                                      </span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      📅 {new Date(booking.scheduledAt).toLocaleDateString('ko-KR', {
                                        month: 'long',
                                        day: 'numeric',
                                        weekday: 'short'
                                      })}{' '}
                                      {booking.timeSlot?.startTime || '시간 미정'}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {booking.child.name} • {booking.sessionCount}회 • ₩{booking.finalFee.toLocaleString()}
                                    </div>
                                  </div>
                                  <Link
                                    href={`/parent/bookings/${booking.id}`}
                                    className="ml-3 px-3 py-1 rounded-md transition-colors text-sm"
                                    style={{
                                      color: '#386646',
                                      borderColor: '#386646',
                                      borderWidth: '1px',
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
                                    상세
                                  </Link>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}

                      {therapySubTab === 'in_progress' && (
                        <div className="space-y-3">
                          {therapyInProgressBookings.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-lg">
                              <div className="text-4xl mb-4">📝</div>
                              <p className="text-gray-600">진행 중인 홈티가 없습니다.</p>
                            </div>
                          ) : (
                            therapyInProgressBookings.map((booking: any) => (
                              <div
                                key={booking.id}
                                className="bg-green-50 border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-semibold text-gray-900">
                                        {booking.therapist.user.name} 치료사
                                      </span>
                                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        진행 중
                                      </span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      📅 {new Date(booking.scheduledAt).toLocaleDateString('ko-KR', {
                                        month: 'long',
                                        day: 'numeric',
                                        weekday: 'short'
                                      })}{' '}
                                      {booking.timeSlot?.startTime || '시간 미정'}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {booking.child.name} • {booking.completedSessions}/{booking.sessionCount}회 완료
                                    </div>
                                  </div>
                                  <Link
                                    href={`/parent/bookings/${booking.id}`}
                                    className="ml-3 px-3 py-1 rounded-md transition-colors text-sm"
                                    style={{
                                      color: '#386646',
                                      borderColor: '#386646',
                                      borderWidth: '1px',
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
                                    상세
                                  </Link>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}

                      {therapySubTab === 'history' && (
                        <div className="space-y-3">
                          {therapyHistoryBookings.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-lg">
                              <div className="text-4xl mb-4">📚</div>
                              <p className="text-gray-600">홈티 기록이 없습니다.</p>
                            </div>
                          ) : (
                            therapyHistoryBookings.map((booking: any) => (
                              <div
                                key={booking.id}
                                className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-semibold text-gray-900">
                                        {booking.therapist.user.name} 치료사
                                      </span>
                                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                        booking.status === 'COMPLETED'
                                          ? 'bg-blue-100 text-blue-800'
                                          : 'bg-gray-100 text-gray-800'
                                      }`}>
                                        {booking.status === 'COMPLETED' ? '완료' : '취소됨'}
                                      </span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      📅 {new Date(booking.scheduledAt).toLocaleDateString('ko-KR', {
                                        month: 'long',
                                        day: 'numeric',
                                        weekday: 'short'
                                      })}{' '}
                                      {booking.timeSlot?.startTime || '시간 미정'}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {booking.child.name} • {booking.sessionCount}회
                                    </div>
                                  </div>
                                  <Link
                                    href={`/parent/bookings/${booking.id}`}
                                    className="ml-3 px-3 py-1 bg-white text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors text-sm"
                                  >
                                    상세
                                  </Link>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 세션 기록 탭 */}
                {activeTab === 'sessions' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">세션 기록 (홈티/언어컨설팅)</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setRecordsFilter('ALL')}
                          className={`px-3 py-1 text-sm rounded-md transition-colors ${
                            recordsFilter === 'ALL'
                              ? 'bg-aipoten-green text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          전체
                        </button>
                        <button
                          onClick={() => setRecordsFilter('CONSULTATION')}
                          className={`px-3 py-1 text-sm rounded-md transition-colors ${
                            recordsFilter === 'CONSULTATION'
                              ? 'bg-aipoten-green text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          언어컨설팅
                        </button>
                        <button
                          onClick={() => setRecordsFilter('THERAPY')}
                          className={`px-3 py-1 text-sm rounded-md transition-colors ${
                            recordsFilter === 'THERAPY'
                              ? 'bg-aipoten-green text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          홈티
                        </button>
                      </div>
                    </div>

                    {sessionRecords.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <div className="text-4xl mb-4">📋</div>
                        <p className="text-gray-600 mb-2">세션 기록이 없습니다.</p>
                        <p className="text-sm text-gray-500">
                          세션이 완료되면 치료사님이 작성한 상담일지를 확인하실 수 있습니다.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {sessionRecords
                          .filter(record => {
                            if (recordsFilter === 'ALL') return true
                            return record.booking.sessionType === recordsFilter
                          })
                          .map((session: any) => {
                            const sessionTypeLabel = session.booking.sessionType === 'CONSULTATION' ? '언어컨설팅' : '홈티'

                            return (
                              <div
                                key={session.id}
                                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                              >
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                        {sessionTypeLabel}
                                      </span>
                                      <span className="text-sm font-medium text-gray-900">
                                        {session.sessionNumber}회차
                                      </span>
                                      <span className="text-sm text-gray-500">
                                        {session.booking.therapist.user.name} 치료사
                                      </span>
                                    </div>
                                    <div className="text-sm text-gray-600 mb-1">
                                      📅 {new Date(session.scheduledAt).toLocaleDateString('ko-KR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        weekday: 'short'
                                      })}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {session.booking.child.name}
                                    </div>
                                  </div>
                                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                    완료
                                  </span>
                                </div>

                                {/* 상담일지 내용 */}
                                <div className="border-t border-gray-200 pt-4">
                                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <span>📝</span>
                                    상담일지
                                  </h4>
                                  <div className="prose prose-sm max-w-none">
                                    <div
                                      className="text-sm text-gray-700 whitespace-pre-wrap"
                                      dangerouslySetInnerHTML={{
                                        __html: session.therapistNote.replace(/\n/g, '<br>')
                                      }}
                                    />
                                  </div>
                                </div>

                                {/* 부모 피드백 (있는 경우) */}
                                {session.parentFeedback && (
                                  <div className="border-t border-gray-200 mt-4 pt-4">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                                      부모님 피드백
                                    </h4>
                                    <p className="text-sm text-gray-700">{session.parentFeedback}</p>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                      </div>
                    )}
                  </div>
                )}

                {/* 1:1 문의 탭 */}
                {activeTab === 'inquiry' && (
                  <div className="space-y-6">
                    {/* 문의하기 버튼 */}
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900">1:1 문의</h3>
                      <button
                        onClick={() => setShowInquiryForm(!showInquiryForm)}
                        className="px-4 py-2 rounded-md transition-colors font-medium"
                        style={{
                          backgroundColor: showInquiryForm ? '#6B7280' : '#386646',
                          color: '#FFFFFF'
                        }}
                      >
                        {showInquiryForm ? '취소' : '+ 새 문의하기'}
                      </button>
                    </div>

                    {/* 문의 작성 폼 */}
                    {showInquiryForm && (
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                        <h4 className="text-md font-semibold text-gray-900 mb-4">문의 작성</h4>
                        <form onSubmit={handleInquirySubmit} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              카테고리
                            </label>
                            <select
                              value={inquiryForm.category}
                              onChange={(e) => setInquiryForm({ ...inquiryForm, category: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aipoten-green"
                            >
                              <option value="SERVICE">서비스 이용 문의</option>
                              <option value="PAYMENT">결제/환불 문의</option>
                              <option value="TECHNICAL">기술 지원</option>
                              <option value="OTHER">기타</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              제목
                            </label>
                            <input
                              type="text"
                              value={inquiryForm.title}
                              onChange={(e) => setInquiryForm({ ...inquiryForm, title: e.target.value })}
                              placeholder="문의 제목을 입력해주세요"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aipoten-green"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              내용
                            </label>
                            <textarea
                              value={inquiryForm.content}
                              onChange={(e) => setInquiryForm({ ...inquiryForm, content: e.target.value })}
                              placeholder="문의 내용을 자세히 입력해주세요"
                              rows={6}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aipoten-green"
                              required
                            />
                          </div>

                          <div className="flex gap-3">
                            <button
                              type="submit"
                              className="px-6 py-2 rounded-md transition-colors font-medium"
                              style={{
                                backgroundColor: '#386646',
                                color: '#FFFFFF'
                              }}
                            >
                              문의 등록
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowInquiryForm(false)}
                              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                            >
                              취소
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* 문의 목록 */}
                    <div>
                      <h4 className="text-md font-semibold text-gray-900 mb-4">문의 내역</h4>
                      {inquiries.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                          <div className="text-4xl mb-4">💬</div>
                          <p className="text-gray-600 mb-2">문의 내역이 없습니다.</p>
                          <p className="text-sm text-gray-500">
                            궁금하신 사항이 있으시면 문의를 남겨주세요.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {inquiries.map((inquiry: any) => {
                            const categoryLabels: Record<string, string> = {
                              SERVICE: '서비스 이용',
                              PAYMENT: '결제/환불',
                              TECHNICAL: '기술 지원',
                              OTHER: '기타',
                            }

                            const statusLabels: Record<string, { text: string; color: string; bgColor: string }> = {
                              PENDING: { text: '답변 대기', color: '#F59E0B', bgColor: '#FEF3C7' },
                              IN_PROGRESS: { text: '처리 중', color: '#3B82F6', bgColor: '#DBEAFE' },
                              RESOLVED: { text: '해결됨', color: '#10B981', bgColor: '#D1FAE5' },
                              CLOSED: { text: '종료됨', color: '#6B7280', bgColor: '#F3F4F6' },
                            }

                            const statusInfo = statusLabels[inquiry.status] || statusLabels.PENDING

                            return (
                              <div
                                key={inquiry.id}
                                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                                        {categoryLabels[inquiry.category]}
                                      </span>
                                      <span
                                        className="text-xs px-2 py-1 rounded-full font-medium"
                                        style={{
                                          backgroundColor: statusInfo.bgColor,
                                          color: statusInfo.color
                                        }}
                                      >
                                        {statusInfo.text}
                                      </span>
                                    </div>
                                    <h5 className="font-semibold text-gray-900 mb-1">{inquiry.title}</h5>
                                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">{inquiry.content}</p>
                                    <div className="text-xs text-gray-500">
                                      {new Date(inquiry.createdAt).toLocaleDateString('ko-KR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                      })}
                                    </div>
                                  </div>
                                </div>

                                {/* 상세보기 버튼 */}
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <Link
                                    href={`/inquiries/${inquiry.id}`}
                                    className="inline-block px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                                  >
                                    상세보기 / 메시지
                                  </Link>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
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
