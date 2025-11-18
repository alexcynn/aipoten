'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import SessionsCalendar from '@/components/SessionsCalendar'
import TherapistBookingDetailModal from '@/components/modals/TherapistBookingDetailModal'

interface TherapistProfile {
  id: string
  specialty: string
  experience: number
  consultationFee: number
  status: string
  introduction?: string
}

interface MatchingRequest {
  id: string
  childName: string
  parentName: string
  preferredDates: string[]
  status: string
  createdAt: string
}

interface TodaySchedule {
  id: string
  time: string
  childName: string
  parentName: string
  type: string
}

export default function TherapistDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<TherapistProfile | null>(null)
  const [matchingRequests, setMatchingRequests] = useState<MatchingRequest[]>([])
  const [todaySchedule, setTodaySchedule] = useState<TodaySchedule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userAvatar, setUserAvatar] = useState<string | null>(null)
  const [myBookings, setMyBookings] = useState<any[]>([])
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    if (session.user?.role !== 'THERAPIST') {
      router.push('/dashboard')
      return
    }

    // 치료사 데이터 가져오기
    const fetchTherapistData = async () => {
      try {
        const [userRes, profileRes, requestsRes, scheduleRes, bookingsRes] = await Promise.all([
          fetch('/api/users/me'),
          fetch('/api/therapist/profile'),
          fetch('/api/therapist/matching-requests'),
          fetch('/api/therapist/today-schedule'),
          fetch('/api/therapist/bookings')
        ])

        if (userRes.ok) {
          const userData = await userRes.json()
          setUserAvatar(userData.avatar)
        }

        if (profileRes.ok) {
          const profileData = await profileRes.json()
          setProfile(profileData)
        }

        if (requestsRes.ok) {
          const requestsData = await requestsRes.json()
          setMatchingRequests(requestsData)
        }

        if (scheduleRes.ok) {
          const scheduleData = await scheduleRes.json()
          setTodaySchedule(scheduleData)
        }

        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json()
          console.log('🔍 [대시보드] 예약 API 응답:', bookingsData)
          const bookingsArray = bookingsData.bookings || []
          console.log('🔍 [대시보드] 예약 배열 길이:', bookingsArray.length)
          const sortedBookings = bookingsArray.sort((a: any, b: any) =>
            new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
          )
          setMyBookings(sortedBookings)
          console.log('🔍 [대시보드] myBookings 설정 완료:', sortedBookings.length, '건')
        } else {
          console.error('❌ [대시보드] 예약 API 실패:', bookingsRes.status)
        }
      } catch (error) {
        console.error('치료사 데이터를 가져오는 중 오류 발생:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTherapistData()
  }, [session, status, router])


  const getSpecialtyName = (specialty: string) => {
    const specialtyMap: Record<string, string> = {
      SPEECH_THERAPY: '언어치료',
      OCCUPATIONAL_THERAPY: '작업치료',
      PHYSICAL_THERAPY: '물리치료',
      PSYCHOLOGICAL_THERAPY: '심리치료',
      BEHAVIORAL_THERAPY: '행동치료',
      PLAY_THERAPY: '놀이치료'
    }
    return specialtyMap[specialty] || specialty
  }

  const getStatusName = (status: string) => {
    const statusMap: Record<string, string> = {
      PENDING: '승인 대기',
      APPROVED: '승인됨',
      REJECTED: '거절됨',
      SUSPENDED: '정지됨'
    }
    return statusMap[status] || status
  }

  // 이달 수입금 계산 (이번 달에 정산 완료된 금액)
  const calculateMonthlyEarnings = () => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    return myBookings
      .filter((booking: any) => {
        // 정산 완료된 건만
        if (booking.status !== 'SETTLEMENT_COMPLETED' && !booking.payment?.settledAt) {
          return false
        }

        // 이번 달에 정산된 건만
        const settledDate = booking.payment?.settledAt ? new Date(booking.payment.settledAt) : null
        if (!settledDate) return false

        return settledDate >= startOfMonth && settledDate <= endOfMonth
      })
      .reduce((total: number, booking: any) => {
        // payment.settlementAmount가 있으면 그것을 사용, 없으면 계산
        const settlementAmount = booking.payment?.settlementAmount || 0
        return total + settlementAmount
      }, 0)
  }

  // 평균 평점 계산
  const calculateAverageRating = () => {
    const reviewedBookings = myBookings.filter((booking: any) => booking.review?.rating)

    if (reviewedBookings.length === 0) {
      return 0
    }

    const totalRating = reviewedBookings.reduce((sum: number, booking: any) => {
      return sum + (booking.review?.rating || 0)
    }, 0)

    return (totalRating / reviewedBookings.length).toFixed(1)
  }

  // 언어컨설팅 요청 대기 수 계산
  const getConsultationPendingCount = () => {
    const count = myBookings.filter((booking: any) => {
      const match = booking.payment?.sessionType === 'CONSULTATION' &&
        (booking.payment?.status === 'PENDING_PAYMENT' ||
         (booking.payment?.status === 'PAID' && booking.status === 'PENDING_CONFIRMATION'))
      if (match) {
        console.log('✅ [컨설팅] 매칭된 예약:', booking.id, booking.payment?.sessionType, booking.payment?.status, booking.status)
      }
      return match
    })
    console.log('🔍 [컨설팅] 총 예약 수:', myBookings.length, '필터링 후:', count.length)
    return count.length
  }

  // 홈티 요청 대기 수 계산
  const getTherapyPendingCount = () => {
    const count = myBookings.filter((booking: any) =>
      booking.payment?.sessionType === 'THERAPY' &&
      (booking.payment?.status === 'PENDING_PAYMENT' ||
       (booking.payment?.status === 'PAID' && booking.status === 'PENDING_CONFIRMATION'))
    )
    console.log('🔍 [홈티] 총 예약 수:', myBookings.length, '필터링 후:', count.length)
    return count.length
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-[#F5EFE7] font-pretendard flex items-center justify-center">
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
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Banner Section */}
          <div className="bg-[#FFF6E8] rounded-2xl px-6 py-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-stone-900">
                {session.user?.name} 치료사님, 오늘도 좋은 하루 되세요!
              </h1>
              {profile && (
                <p className="text-sm sm:text-base text-stone-600 mt-1">
                  {getSpecialtyName(profile.specialty)} · 경력 {profile.experience}년
                  {profile.status === 'APPROVED' && (
                    <span className="ml-2 text-green-600 font-medium">✓ 승인됨</span>
                  )}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Link
                href="/therapist/profile"
                className="px-4 py-2 bg-white text-stone-700 text-sm rounded-lg hover:bg-stone-50 transition-colors border border-stone-200"
              >
                프로필 관리
              </Link>
              <Link
                href="/therapist/inquiries"
                className="px-4 py-2 bg-[#FF6A00] text-white text-sm rounded-lg hover:bg-[#E55F00] transition-colors"
              >
                1:1 문의
              </Link>
            </div>
          </div>

          {/* 2-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4">
                <Link
                  href="/therapist/bookings/consultations"
                  className="bg-white p-4 sm:p-6 rounded-[20px] shadow-sm hover:shadow-lg transition-all cursor-pointer border border-transparent hover:border-[#ffbda6]"
                >
                  <div className="text-center">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#e4edff] rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">💬</span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-[#1e1307] mb-1">언어컨설팅</h3>
                    <p className="text-xs text-stone-500 mb-2">요청 대기</p>
                    <p className="text-2xl sm:text-3xl font-bold text-[#FF6A00]">
                      {getConsultationPendingCount()}
                    </p>
                  </div>
                </Link>

                <Link
                  href="/therapist/bookings/therapies"
                  className="bg-white p-4 sm:p-6 rounded-[20px] shadow-sm hover:shadow-lg transition-all cursor-pointer border border-transparent hover:border-[#ffbda6]"
                >
                  <div className="text-center">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#e4edff] rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">🏠</span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-[#1e1307] mb-1">홈티</h3>
                    <p className="text-xs text-stone-500 mb-2">요청 대기</p>
                    <p className="text-2xl sm:text-3xl font-bold text-[#FF6A00]">
                      {getTherapyPendingCount()}
                    </p>
                  </div>
                </Link>

                <Link
                  href="/therapist/earnings"
                  className="bg-white p-4 sm:p-6 rounded-[20px] shadow-sm hover:shadow-lg transition-all cursor-pointer border border-transparent hover:border-[#ffbda6]"
                >
                  <div className="text-center">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#e4edff] rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">💰</span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-[#1e1307] mb-1">이달 수입금</h3>
                    <p className="text-xs text-stone-500 mb-2">정산 완료</p>
                    <p className="text-xl sm:text-2xl font-bold text-[#FF6A00]">
                      ₩{calculateMonthlyEarnings().toLocaleString()}
                    </p>
                  </div>
                </Link>

                <Link
                  href="/therapist/reviews"
                  className="bg-white p-4 sm:p-6 rounded-[20px] shadow-sm hover:shadow-lg transition-all cursor-pointer border border-transparent hover:border-[#ffbda6]"
                >
                  <div className="text-center">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#e4edff] rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">⭐</span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-[#1e1307] mb-1">평점</h3>
                    <p className="text-xs text-stone-500 mb-2">
                      {myBookings.filter(b => b.review?.rating).length}개 리뷰
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-[#FF6A00]">
                      {calculateAverageRating() === '0.0' ? '-' : calculateAverageRating()}
                    </p>
                  </div>
                </Link>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-[20px] shadow-sm p-6">
                <h2 className="text-base sm:text-lg font-bold text-[#1e1307] mb-4">빠른 메뉴</h2>
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/therapist/schedule"
                    className="flex items-center gap-3 p-3 rounded-xl bg-[#FFF6E8] hover:bg-[#FFE5D0] transition-colors"
                  >
                    <span className="text-xl">📅</span>
                    <div>
                      <p className="text-sm font-semibold text-[#1e1307]">일정 관리</p>
                      <p className="text-xs text-stone-500">스케줄 설정</p>
                    </div>
                  </Link>

                  <Link
                    href="/therapist/journal-test"
                    className="flex items-center gap-3 p-3 rounded-xl bg-[#FF6A00] hover:bg-[#E55F00] transition-colors"
                  >
                    <span className="text-xl">✨</span>
                    <div>
                      <p className="text-sm font-semibold text-white">AI 상담일지</p>
                      <p className="text-xs text-orange-100">자동 생성</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* 세션 캘린더 - 월별 일정 */}
              <div className="bg-white overflow-hidden shadow-sm rounded-[20px]">
                <div className="px-4 py-5 sm:p-6">
                  <h2 className="text-base sm:text-lg font-bold text-[#1e1307] mb-4">월별 세션 일정</h2>
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

              {/* 오늘의 일정 */}
              <div className="bg-white overflow-hidden shadow-sm rounded-[20px]">
                <div className="px-4 py-5 sm:p-6">
                  <h2 className="text-base sm:text-lg font-bold text-[#1e1307] mb-4">오늘의 일정</h2>
                  {(() => {
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    const tomorrow = new Date(today)
                    tomorrow.setDate(tomorrow.getDate() + 1)

                    const todaySessions = myBookings.filter((booking: any) => {
                      if (!booking.scheduledAt) return false
                      const bookingDate = new Date(booking.scheduledAt)
                      return bookingDate >= today && bookingDate < tomorrow
                    }).sort((a: any, b: any) =>
                      new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
                    )

                    if (todaySessions.length === 0) {
                      return (
                        <div className="text-center py-8">
                          <p className="text-stone-500 text-sm">오늘 예정된 세션이 없습니다.</p>
                        </div>
                      )
                    }

                    return (
                      <div className="space-y-3">
                        {todaySessions.map((session: any) => (
                          <div
                            key={session.id}
                            className="flex items-center justify-between p-3 bg-[#FFF6E8] rounded-xl cursor-pointer hover:bg-[#FFE5D0] transition-colors"
                            onClick={() => {
                              setSelectedBookingId(session.id)
                              setIsBookingModalOpen(true)
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                                <span className="text-sm">
                                  {session.payment?.sessionType === 'CONSULTATION' ? '💬' : '🏠'}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-[#1e1307]">
                                  {session.child?.name || '이름 없음'}
                                </p>
                                <p className="text-xs text-stone-500">
                                  {session.payment?.sessionType === 'CONSULTATION' ? '언어컨설팅' : '홈티'}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-[#FF6A00]">
                                {new Date(session.scheduledAt).toLocaleTimeString('ko-KR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Booking Detail Modal */}
      <TherapistBookingDetailModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false)
          setSelectedBookingId(null)
        }}
        bookingId={selectedBookingId}
        onUpdate={async () => {
          // 예약 정보 업데이트 시 새로고침
          const bookingsRes = await fetch('/api/therapist/bookings')
          if (bookingsRes.ok) {
            const bookingsData = await bookingsRes.json()
            const bookingsArray = bookingsData.bookings || []
            const sortedBookings = bookingsArray.sort((a: any, b: any) =>
              new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
            )
            setMyBookings(sortedBookings)
          }
        }}
      />
    </div>
  )
}