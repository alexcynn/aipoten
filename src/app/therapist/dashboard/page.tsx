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
          {/* Welcome Section */}
          <div className="bg-white overflow-hidden shadow-sm rounded-xl md:rounded-2xl mb-6">
            <div className="px-4 py-5 sm:p-6 md:p-8">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-stone-900 mb-2">
                    안녕하세요, {session.user?.name} 치료사님!
                  </h1>
                  {profile ? (
                    <div className="space-y-1">
                      <p className="text-sm sm:text-base text-stone-700">
                        전문분야: {getSpecialtyName(profile.specialty)} | 경력: {profile.experience}년
                      </p>
                      <p className="text-xs sm:text-sm text-stone-600">
                        승인 상태: <span className={`font-medium ${profile.status === 'APPROVED' ? 'text-green-600' : 'text-yellow-600'}`}>
                          {getStatusName(profile.status)}
                        </span>
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm sm:text-base text-stone-700">
                      프로필을 설정하여 매칭 서비스를 시작해보세요.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <Link
              href="/therapist/bookings/consultations"
              className="bg-white p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-[#FFE5E5]"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#FFE5E5] rounded-xl flex items-center justify-center">
                    <span className="text-2xl">💬</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-stone-900">언어컨설팅</h3>
                  <p className="text-xs sm:text-sm text-stone-600">요청 대기</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-[#FF6A00]">
                    {getConsultationPendingCount()}
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/therapist/bookings/therapies"
              className="bg-white p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-[#FFE5E5]"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#FFE5E5] rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🏠</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-stone-900">홈티</h3>
                  <p className="text-xs sm:text-sm text-stone-600">요청 대기</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-[#FF6A00]">
                    {getTherapyPendingCount()}
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/therapist/earnings"
              className="bg-white p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-[#FFE5E5]"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#FFE5E5] rounded-xl flex items-center justify-center">
                    <span className="text-2xl">💰</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-stone-900">이달 수입금</h3>
                  <p className="text-xs sm:text-sm text-stone-600">정산 완료</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-[#FF6A00]">
                    ₩{calculateMonthlyEarnings().toLocaleString()}
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/therapist/reviews"
              className="bg-white p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-[#FFE5E5]"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#FFE5E5] rounded-xl flex items-center justify-center">
                    <span className="text-2xl">⭐</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-stone-900">평점</h3>
                  <p className="text-xs sm:text-sm text-stone-600">
                    {myBookings.filter(b => b.review?.rating).length}개 리뷰
                  </p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-[#FF6A00]">
                    {calculateAverageRating() === '0.0' ? '-' : calculateAverageRating()}
                  </p>
                </div>
              </div>
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <Link
              href="/therapist/profile"
              className="bg-gradient-to-br from-[#FFE5E5] to-[#FF9999]/30 border-2 border-[#FF9999] rounded-xl p-4 sm:p-6 md:p-8 hover:shadow-lg hover:border-[#FF8888] transition-all"
            >
              <div className="text-center">
                <div className="text-3xl sm:text-4xl mb-2">👤</div>
                <h3 className="text-sm sm:text-base md:text-lg font-bold text-stone-900 mb-1">프로필 관리</h3>
                <p className="text-xs sm:text-sm text-stone-700">프로필 수정</p>
              </div>
            </Link>

            <Link
              href="/therapist/schedule"
              className="bg-gradient-to-br from-[#F5EFE7] to-[#E8DCC8] border-2 border-[#D4C4A8] rounded-xl p-4 sm:p-6 md:p-8 hover:shadow-lg hover:border-[#C4B498] transition-all"
            >
              <div className="text-center">
                <div className="text-3xl sm:text-4xl mb-2">📅</div>
                <h3 className="text-sm sm:text-base md:text-lg font-bold text-stone-900 mb-1">일정 관리</h3>
                <p className="text-xs sm:text-sm text-stone-700">스케줄 설정</p>
              </div>
            </Link>

            <Link
              href="/therapist/inquiries"
              className="bg-gradient-to-br from-[#FFE5E5] to-[#FF9999]/30 border-2 border-[#FF9999] rounded-xl p-4 sm:p-6 md:p-8 hover:shadow-lg hover:border-[#FF8888] transition-all"
            >
              <div className="text-center">
                <div className="text-3xl sm:text-4xl mb-2">💬</div>
                <h3 className="text-sm sm:text-base md:text-lg font-bold text-stone-900 mb-1">1:1 문의</h3>
                <p className="text-xs sm:text-sm text-stone-700">문의 관리</p>
              </div>
            </Link>

            <Link
              href="/therapist/journal-test"
              className="bg-gradient-to-br from-[#FF6A00] to-[#E55F00] border-2 border-[#FF6A00] rounded-xl p-4 sm:p-6 md:p-8 hover:shadow-lg hover:border-[#FF7A10] transition-all"
            >
              <div className="text-center">
                <div className="text-3xl sm:text-4xl mb-2">✨</div>
                <h3 className="text-sm sm:text-base md:text-lg font-bold text-white mb-1">AI 상담일지</h3>
                <p className="text-xs sm:text-sm text-orange-100">자동 생성 테스트</p>
              </div>
            </Link>
          </div>

          {/* 세션 캘린더 - 월별 일정 */}
          <div className="bg-white overflow-hidden shadow-sm rounded-xl md:rounded-2xl mb-6">
            <div className="px-4 py-5 sm:p-6 md:p-8">
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-stone-900 mb-4">월별 세션 일정</h2>
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