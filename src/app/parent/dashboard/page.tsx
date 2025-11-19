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
  aiAnalysisSummary?: string
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
  ADVANCED: { text: '빠른수준', color: '#0EBCFF', bgColor: '#F0FBFF' },
  NORMAL: { text: '또래수준', color: '#7CCF3C', bgColor: '#EDFCE2' },
  NEEDS_TRACKING: { text: '추적검사요망', color: '#FFA01B', bgColor: '#FFF5E8' },
  NEEDS_ASSESSMENT: { text: '심화평가권고', color: '#EB4C25', bgColor: '#FFF1ED' }
}

// YouTube URL에서 썸네일 URL 추출
const getYouTubeThumbnail = (videoUrl: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/,
    /youtube\.com\/v\/([^&?/]+)/
  ]

  for (const pattern of patterns) {
    const match = videoUrl.match(pattern)
    if (match && match[1]) {
      return `https://i.ytimg.com/vi/${match[1]}/hqdefault.jpg`
    }
  }
  return null
}

// 비디오의 썸네일 URL 결정 (저장된 것 또는 YouTube 자동 추출)
const getVideoThumbnail = (video: any): string | null => {
  if (video.thumbnailUrl) {
    return video.thumbnailUrl
  }
  // YouTube URL인 경우 자동 추출
  if (video.videoUrl && (video.videoUrl.includes('youtube.com') || video.videoUrl.includes('youtu.be'))) {
    return getYouTubeThumbnail(video.videoUrl)
  }
  return null
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

  // 예약 목록 새로고침 함수
  const fetchMyBookings = async () => {
    try {
      const bookingsRes = await fetch('/api/bookings')
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json()
        const bookingsArray = bookingsData.bookings || []
        const sortedBookings = bookingsArray.sort((a: any, b: any) =>
          new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
        )
        setMyBookings(sortedBookings)
      }
    } catch (error) {
      console.error('예약 목록 조회 오류:', error)
    }
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
      <div className="min-h-screen bg-[#F5EFE7] flex items-center justify-center font-pretendard">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6A00] mx-auto"></div>
          <p className="mt-4 text-stone-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#F5EFE7] font-pretendard">
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          {/* Banner Section */}
          <div className="bg-[#FFF6E8] rounded-2xl px-6 py-5 mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#1E1307] mb-1">
                안녕하세요! {session.user?.name}님
              </h2>
              <p className="text-base text-[#555555]">
                지금 {children.find(c => c.id === selectedChildId)?.name || '민준'}이의 발달, 한눈에 확인하세요
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/parent/profile"
                className="text-[#FF6A00] border border-[#FF6A00] rounded-lg px-4 py-2 font-semibold hover:bg-[#FFF5EB] transition-colors flex items-center gap-1"
              >
                부모 프로필 관리
              </Link>
              <Link
                href="/parent/inquiries"
                className="bg-[#FF6A00] text-white rounded-lg px-4 py-2 font-semibold hover:bg-[#E55F00] transition-colors flex items-center gap-1"
              >
                1:1 문의
              </Link>
            </div>
          </div>

          {/* 2-Column Layout */}
          {selectedChildId && children.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Child Profile + Videos */}
              <div className="space-y-6">
                {/* Child Profile Card with Navigation */}
                <div className="relative">
                  <div className="bg-white rounded-[20px] shadow-sm px-[40px] py-[50px] flex items-center justify-between">
                    {/* Left Arrow */}
                    {children.length > 1 && (
                      <button
                        onClick={() => {
                          const currentIndex = children.findIndex(c => c.id === selectedChildId)
                          const prevIndex = currentIndex > 0 ? currentIndex - 1 : children.length - 1
                          setSelectedChildId(children[prevIndex].id)
                        }}
                        className="absolute left-[-20px] top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-xl text-[#FF6A00]">←</span>
                      </button>
                    )}

                    {/* Child Info - Left */}
                    <div className="flex flex-col gap-[10px]">
                      <p className="font-semibold text-[30px] text-[#1E1307]">
                        {children.find(c => c.id === selectedChildId)?.name || '김민준'}
                      </p>
                      <div className="flex flex-col gap-[4px] text-[20px] text-[#666666] tracking-[0.2px]">
                        <p>
                          {(() => {
                            const child = children.find(c => c.id === selectedChildId)
                            if (!child) return '30개월 ∙ 남아'
                            const age = calculateAge(child.birthDate)
                            return `${age} ∙ ${child.gender === 'MALE' ? '남아' : '여아'}`
                          })()}
                        </p>
                        <p>
                          생년월일 : {(() => {
                            const child = children.find(c => c.id === selectedChildId)
                            if (!child) return '2022.06.24'
                            return new Date(child.birthDate).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit'
                            }).replace(/\. /g, '.').replace(/\.$/, '')
                          })()}
                        </p>
                      </div>
                    </div>

                    {/* Avatar - Right */}
                    <div className="relative w-[132px] h-[132px]">
                      {userAvatar ? (
                        <img src={userAvatar} alt="아이" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <img src="/images/child-avatar-default.svg" alt="아이" className="w-full h-full" />
                      )}
                      <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="absolute bottom-0 right-0 w-[40px] h-[40px] cursor-pointer"
                      >
                        <img src="/images/edit-button.svg" alt="편집" className="w-full h-full" />
                      </button>
                    </div>

                    {/* Right Arrow */}
                    {children.length > 1 && (
                      <button
                        onClick={() => {
                          const currentIndex = children.findIndex(c => c.id === selectedChildId)
                          const nextIndex = currentIndex < children.length - 1 ? currentIndex + 1 : 0
                          setSelectedChildId(children[nextIndex].id)
                        }}
                        className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-xl text-[#FF6A00]">→</span>
                      </button>
                    )}
                  </div>

                  {/* Add Child Button */}
                  <Link
                    href="/parent/children/new"
                    className="mt-4 w-full bg-white border-2 border-dashed border-[#FF6A00] rounded-[20px] px-6 py-4 flex items-center justify-center gap-2 hover:bg-[#FFF5EB] transition-colors"
                  >
                    <span className="text-2xl text-[#FF6A00]">+</span>
                    <span className="font-semibold text-[18px] text-[#FF6A00]">아이 등록</span>
                  </Link>
                </div>

                {/* Development Check Section */}
                {latestAssessment && (
                  <div className="bg-white rounded-[20px] shadow-sm px-[40px] py-[50px]">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-[24px] text-[#1E1307]">최근 발달 체크</h3>
                      <p className="text-[22px] text-[#555555] leading-[28px]">
                        {new Date(latestAssessment.createdAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit'
                        }).replace(/\. /g, '.').replace(/\.$/, '')}
                      </p>
                    </div>

                    {/* Divider */}
                    <div className="h-[2px] bg-[#666666] mb-6" />

                    {/* Development Summary */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex flex-col gap-[13px]">
                        <p className="font-bold text-[22px] text-[#1E1307] leading-[28px] tracking-[-0.44px]">
                          발달 수준
                        </p>
                        <div className="text-[20px] text-[#1E1307] leading-[28px] tracking-[0.2px]">
                          <p className="mb-0">
                            {latestAssessment.aiAnalysisSummary || (() => {
                              // aiAnalysisSummary가 없는 경우 결과 기반 기본 메시지 생성
                              const hasWeakArea = latestAssessment.results?.some(
                                r => r.level === 'NEEDS_TRACKING' || r.level === 'NEEDS_ASSESSMENT'
                              )
                              const weakAreas = latestAssessment.results
                                ?.filter(r => r.level === 'NEEDS_TRACKING' || r.level === 'NEEDS_ASSESSMENT')
                                .map(r => CATEGORY_LABELS[r.category])
                                .join(', ')

                              if (hasWeakArea && weakAreas) {
                                return `전반적으로 건강하게 발달하고 있으나 ${weakAreas} 분야는 추적이 필요합니다.`
                              }
                              return '전반적으로 건강하게 발달하고 있습니다.'
                            })()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Development Categories Grid */}
                    <div className="flex flex-col gap-[12px] mb-6">
                      {/* Row 1 */}
                      <div className="flex gap-[12px]">
                        {latestAssessment.results?.slice(0, 2).map((result, idx) => {
                          const levelInfo = LEVEL_LABELS[result.level] || LEVEL_LABELS['NEEDS_ASSESSMENT']
                          const categoryLabel = CATEGORY_LABELS[result.category] || result.category

                          return (
                            <div
                              key={idx}
                              className="flex-1 h-[80px] rounded-[20px] px-4 py-2.5 flex items-center justify-between"
                              style={{ backgroundColor: levelInfo.bgColor }}
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-[40px] h-[40px]">
                                  {/* Category icon would go here */}
                                  <span className="text-2xl">
                                    {result.category === 'GROSS_MOTOR' ? '🏃' : '✋'}
                                  </span>
                                </div>
                                <p className="font-semibold text-[17px] text-[#1E1307] tracking-[0.17px] leading-[20px]">
                                  {categoryLabel}
                                </p>
                              </div>
                              <div
                                className="px-[10px] py-1 rounded-[120px] flex items-center justify-center"
                                style={{ backgroundColor: levelInfo.color }}
                              >
                                <p className="font-bold text-[14px] text-white tracking-[0.14px]">
                                  {levelInfo.text}
                                </p>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Row 2 */}
                      <div className="flex gap-[12px]">
                        {latestAssessment.results?.slice(2, 4).map((result, idx) => {
                          const levelInfo = LEVEL_LABELS[result.level] || LEVEL_LABELS['NEEDS_ASSESSMENT']
                          const categoryLabel = CATEGORY_LABELS[result.category] || result.category

                          return (
                            <div
                              key={idx}
                              className="flex-1 h-[80px] rounded-[20px] px-4 py-2.5 flex items-center justify-between"
                              style={{ backgroundColor: levelInfo.bgColor }}
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-[40px] h-[40px]">
                                  <span className="text-2xl">
                                    {result.category === 'LANGUAGE' ? '💬' : '💡'}
                                  </span>
                                </div>
                                <p className="font-semibold text-[17px] text-[#1E1307] tracking-[0.17px] leading-[20px]">
                                  {categoryLabel}발달
                                </p>
                              </div>
                              <div
                                className="px-[10px] py-1 rounded-[120px] flex items-center justify-center"
                                style={{ backgroundColor: levelInfo.color }}
                              >
                                <p className="font-bold text-[14px] text-white tracking-[0.14px]">
                                  {levelInfo.text}
                                </p>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Row 3 - Social */}
                      {latestAssessment.results?.[4] && (
                        <div className="flex gap-[12px]">
                          <div
                            className="w-full h-[80px] rounded-[20px] px-4 py-2.5 flex items-center justify-between"
                            style={{ backgroundColor: LEVEL_LABELS[latestAssessment.results[4].level]?.bgColor || '#FFEBEE' }}
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-[40px] h-[40px]">
                                <span className="text-2xl">😊</span>
                              </div>
                              <p className="font-semibold text-[17px] text-[#1E1307] tracking-[0.17px] leading-[20px]">
                                사회성 발달
                              </p>
                            </div>
                            <div
                              className="px-[10px] py-1 rounded-[120px] flex items-center justify-center"
                              style={{ backgroundColor: LEVEL_LABELS[latestAssessment.results[4].level]?.color || '#EB4C25' }}
                            >
                              <p className="font-bold text-[14px] text-white tracking-[0.14px]">
                                {LEVEL_LABELS[latestAssessment.results[4].level]?.text || '심화평가권고'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Next Check Date */}
                    {getNextCheckDate() && (
                      <div className="bg-[#F9F9F9] rounded-[100px] px-5 py-5 flex items-center justify-center gap-[14px] mb-6">
                        <div className="w-[22px] h-[22px]">
                          <img src="/images/calendar-icon.svg" alt="" className="w-full h-full" />
                        </div>
                        <p className="text-[20px] text-[#1E1307] tracking-[-0.4px] leading-[28px]">
                          다음 검사 권장일{' '}
                          <span className="font-bold">
                            {getNextCheckDate()!.toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit'
                            }).replace(/\. /g, '.').replace(/\.$/, '')}
                          </span>
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-[10px]">
                      <Link
                        href="/parent/assessments"
                        className="flex-1 h-[70px] border-[1.5px] border-[#FF6A00] rounded-[14px] flex items-center justify-center gap-[10px] hover:bg-[#FFF5EB] transition-colors"
                      >
                        <p className="font-bold text-[18px] text-[#FF6A00] tracking-[-0.36px]">
                          발달체크 기록보기
                        </p>
                        <div className="w-2 h-5">
                          <img src="/images/arrow-orange.svg" alt="" className="w-full h-full" />
                        </div>
                      </Link>
                      <Link
                        href="/parent/assessments/new"
                        className="flex-1 h-[70px] bg-[#FF6A00] rounded-[14px] flex items-center justify-center gap-[10px] hover:bg-[#E55F00] transition-colors"
                      >
                        <p className="font-bold text-[18px] text-white tracking-[-0.36px]">
                          발달체크 시작하기
                        </p>
                        <div className="w-2 h-5">
                          <img src="/images/arrow-white.svg" alt="" className="w-full h-full" />
                        </div>
                      </Link>
                    </div>
                  </div>
                )}

                {/* Recommended Videos Carousel */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-[#1E1307]">
                      {children.find(c => c.id === selectedChildId)?.name}님을 위한 맞춤 영상
                    </h3>
                    <Link
                      href="/videos"
                      className="text-sm text-[#FF6A00] font-semibold hover:text-[#E55F00]"
                    >
                      전체 보기 &gt;
                    </Link>
                  </div>

                  {recommendedVideos.length > 0 ? (
                    <div className="relative">
                      {/* Carousel */}
                      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth">
                        {recommendedVideos.slice(0, 3).map((video) => (
                          <div key={video.id} className="flex-none w-64 snap-start">
                            <Link href={`/videos/${video.id}`}>
                              <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-2">
                                {(() => {
                                  const thumbnail = getVideoThumbnail(video)
                                  return thumbnail ? (
                                    <img
                                      src={thumbnail}
                                      alt={video.title}
                                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <span className="text-4xl">📹</span>
                                    </div>
                                  )
                                })()}
                              </div>
                              <h4 className="font-semibold text-sm text-[#1E1307] line-clamp-2">{video.title}</h4>
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-[#888888]">
                      <p>추천 영상이 없습니다</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Calendar */}
              <div className="space-y-6">
                {/* Calendar Card */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-[#1E1307]">
                      {children.find(c => c.id === selectedChildId)?.name}님의 상담 일정
                    </h3>
                    <Link
                      href="/parent/payments"
                      className="text-sm text-[#FF6A00] font-semibold hover:text-[#E55F00]"
                    >
                      결제내역 보기 &gt;
                    </Link>
                  </div>

                  {/* Sessions Calendar */}
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

                  {/* Booking Buttons */}
                  <div className="flex gap-3 mt-6">
                    <Link
                      href="/parent/consultations"
                      className="flex-1 px-4 py-3 rounded-lg border-2 border-[#FF6A00] text-[#FF6A00] font-semibold text-center hover:bg-[#FFF5EB] transition-colors"
                    >
                      언어 컨설팅 예약하기 &gt;
                    </Link>
                    <Link
                      href="/parent/therapies"
                      className="flex-1 px-4 py-3 rounded-lg bg-[#FF6A00] text-white font-semibold text-center hover:bg-[#E55F00] transition-colors"
                    >
                      홈티 예약하기 &gt;
                    </Link>
                  </div>
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
