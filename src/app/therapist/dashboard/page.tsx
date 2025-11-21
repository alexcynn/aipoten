'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import SessionsCalendar from '@/components/SessionsCalendar'
import TherapistBookingDetailModal from '@/components/modals/TherapistBookingDetailModal'

interface TherapistExperience {
  id: string
  startDate: string
  endDate: string | null
  institutionName: string
  specialty: string
  employmentType: string
}

interface TherapistProfile {
  id: string
  specialty: string
  experience: number
  consultationFee: number
  status: string
  introduction?: string
  specialties?: string[]
  experiences?: TherapistExperience[]
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
          const bookingsArray = bookingsData.bookings || []
          const sortedBookings = bookingsArray.sort((a: any, b: any) =>
            new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
          )
          setMyBookings(sortedBookings)
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
      PLAY_THERAPY: '놀이치료',
      SENSORY_INTEGRATION: '감각통합',
      COGNITIVE_THERAPY: '인지치료',
      ART_THERAPY: '미술치료',
      MUSIC_THERAPY: '음악치료'
    }
    return specialtyMap[specialty] || specialty
  }

  // 이달 수입금 계산 (이번 달에 정산 완료된 금액)
  const calculateMonthlyEarnings = () => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    return myBookings
      .filter((booking: any) => {
        if (booking.status !== 'SETTLEMENT_COMPLETED' && !booking.payment?.settledAt) {
          return false
        }
        const settledDate = booking.payment?.settledAt ? new Date(booking.payment.settledAt) : null
        if (!settledDate) return false
        return settledDate >= startOfMonth && settledDate <= endOfMonth
      })
      .reduce((total: number, booking: any) => {
        const settlementAmount = booking.payment?.settlementAmount || 0
        return total + settlementAmount
      }, 0)
  }

  // 평균 평점 계산
  const calculateAverageRating = () => {
    const reviewedBookings = myBookings.filter((booking: any) => booking.review?.rating)
    if (reviewedBookings.length === 0) return 0
    const totalRating = reviewedBookings.reduce((sum: number, booking: any) => {
      return sum + (booking.review?.rating || 0)
    }, 0)
    return (totalRating / reviewedBookings.length).toFixed(1)
  }

  // 언어컨설팅 요청 대기 수 계산
  const getConsultationPendingCount = () => {
    return myBookings.filter((booking: any) => {
      return booking.payment?.sessionType === 'CONSULTATION' &&
        (booking.payment?.status === 'PENDING_PAYMENT' ||
         (booking.payment?.status === 'PAID' && booking.status === 'PENDING_CONFIRMATION'))
    }).length
  }

  // 홈티 요청 대기 수 계산
  const getTherapyPendingCount = () => {
    return myBookings.filter((booking: any) =>
      booking.payment?.sessionType === 'THERAPY' &&
      (booking.payment?.status === 'PENDING_PAYMENT' ||
       (booking.payment?.status === 'PAID' && booking.status === 'PENDING_CONFIRMATION'))
    ).length
  }

  // 이번달 총 세션 수 계산
  const getMonthlySessionCount = () => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    return myBookings.filter((booking: any) => {
      if (!booking.scheduledAt) return false
      const bookingDate = new Date(booking.scheduledAt)
      return bookingDate >= startOfMonth && bookingDate <= endOfMonth
    }).length
  }

  // 경력 계산 (실제 경력 데이터에서 총 경력 년수 계산)
  const getExperienceYears = () => {
    if (!profile) return 0

    // 경력 데이터가 있으면 총 경력 년수 계산
    if (profile.experiences && profile.experiences.length > 0) {
      let totalMonths = 0

      profile.experiences.forEach(exp => {
        const startDate = new Date(exp.startDate)
        const endDate = exp.endDate ? new Date(exp.endDate) : new Date()

        // 월 단위로 경력 계산
        const months = (endDate.getFullYear() - startDate.getFullYear()) * 12
          + (endDate.getMonth() - startDate.getMonth())

        totalMonths += Math.max(0, months)
      })

      // 년 단위로 변환 (소수점 버림)
      const years = Math.floor(totalMonths / 12)
      return years > 0 ? years : 1 // 최소 1년
    }

    // 경력 데이터가 없으면 profile.experience 사용
    return profile.experience || 0
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
      <main className="max-w-[1280px] mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5">
          {/* Profile Header Section */}
          <div className="bg-[#92745c] rounded-[20px] px-[50px] py-[50px] relative">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-6 max-w-[401px]">
                <h1 className="text-[30px] font-semibold text-white">
                  안녕하세요! {session.user?.name} 치료사님
                </h1>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-[10px] text-[20px] text-white">
                    <span>전문분야 : {(() => {
                      try {
                        if (profile?.specialties) {
                          const specialties = typeof profile.specialties === 'string'
                            ? JSON.parse(profile.specialties)
                            : profile.specialties
                          if (Array.isArray(specialties)) {
                            return specialties.map((s: string) => getSpecialtyName(s)).join(', ')
                          }
                        }
                        return profile?.specialty ? getSpecialtyName(profile.specialty) : '언어치료'
                      } catch {
                        return profile?.specialty ? getSpecialtyName(profile.specialty) : '언어치료'
                      }
                    })()}</span>
                    <div className="w-[2px] h-[18px] bg-white/40" />
                    <span>경력 {getExperienceYears()}년</span>
                    <div className="w-[2px] h-[18px] bg-white/40" />
                    <div className="flex items-center gap-[5px]">
                      <svg width="20" height="19" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 0L12.2451 6.90983H19.5106L13.6327 11.1803L15.8779 18.0902L10 13.8197L4.12215 18.0902L6.36729 11.1803L0.489435 6.90983H7.75486L10 0Z" fill="white"/>
                      </svg>
                      <span>평점 {calculateAverageRating() === '0' ? '0.0' : calculateAverageRating()}점</span>
                    </div>
                  </div>
                  <div className="bg-white/20 rounded-[4px] px-[10px] py-[9px] inline-flex items-center gap-[10px] w-fit">
                    <div className="flex items-center gap-[6px]">
                      <svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.5 0C3.81 0 0 3.81 0 8.5C0 13.19 3.81 17 8.5 17C13.19 17 17 13.19 17 8.5C17 3.81 13.19 0 8.5 0ZM7.65 12.75L3.4 8.5L4.59 7.31L7.65 10.37L12.41 5.61L13.6 6.8L7.65 12.75Z" fill="white"/>
                      </svg>
                      <span className="text-[16px] text-white">승인상태</span>
                    </div>
                    <span className="text-[16px] font-bold text-white">
                      {profile?.status === 'APPROVED' ? '승인됨' : '대기중'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="w-[160px] h-[160px] rounded-full overflow-hidden bg-gray-200">
                  {userAvatar ? (
                    <Image
                      src={userAvatar}
                      alt="프로필"
                      width={160}
                      height={160}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#d4c5b9] flex items-center justify-center">
                      <span className="text-4xl">👤</span>
                    </div>
                  )}
                </div>
                <Link
                  href="/therapist/profile"
                  className="absolute bottom-0 right-0 w-[50px] h-[50px] bg-[#FF6A00] rounded-full flex items-center justify-center hover:bg-[#E55F00] transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 14.25V18H3.75L14.81 6.94L11.06 3.19L0 14.25ZM17.71 4.04C18.1 3.65 18.1 3.02 17.71 2.63L15.37 0.29C14.98 -0.1 14.35 -0.1 13.96 0.29L12.13 2.12L15.88 5.87L17.71 4.04Z" fill="white"/>
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="flex gap-5">
            <Link
              href="/therapist/bookings/consultations"
              className="flex-1 bg-white border border-[#d78445] rounded-[20px] p-[40px] hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-2 mb-4">
                <Image
                  src="/images/icon-language-consulting-24.svg"
                  alt="언어컨설팅"
                  width={24}
                  height={24}
                  className="shrink-0"
                />
                <h3 className="text-[24px] font-semibold text-[#1e1307]">
                  언어컨설팅
                </h3>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[20px] text-[#666666] tracking-[0.2px]">요청 대기</span>
                <div className="text-right">
                  <span className="text-[56px] font-semibold text-[#1e1307] tracking-[-1.2px]">{getConsultationPendingCount()}</span>
                  <span className="text-[40px] font-semibold text-[#1e1307] tracking-[-0.8px]">건</span>
                </div>
              </div>
            </Link>

            <Link
              href="/therapist/bookings/therapies"
              className="flex-1 bg-white border border-[#d78445] rounded-[20px] p-[40px] hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-2 mb-4">
                <Image
                  src="/images/icon-home-therapy-24.svg"
                  alt="홈티"
                  width={24}
                  height={24}
                  className="shrink-0"
                />
                <h3 className="text-[24px] font-semibold text-[#1e1307]">
                  홈티
                </h3>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[20px] text-[#666666] tracking-[0.2px]">요청 대기</span>
                <div className="text-right">
                  <span className="text-[56px] font-semibold text-[#1e1307] tracking-[-1.2px]">{getTherapyPendingCount()}</span>
                  <span className="text-[40px] font-semibold text-[#1e1307] tracking-[-0.8px]">건</span>
                </div>
              </div>
            </Link>

            <Link
              href="/therapist/earnings"
              className="w-[480px] bg-white border border-[#d78445] rounded-[20px] p-[40px] hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-2 mb-4">
                <Image
                  src="/images/icon-earnings-24.svg"
                  alt="이번달 수입금"
                  width={24}
                  height={24}
                  className="shrink-0"
                />
                <h3 className="text-[24px] font-semibold text-[#1e1307]">
                  이번달 수입금
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[56px] font-semibold text-[#1e1307] tracking-[-1.2px]">{calculateMonthlyEarnings().toLocaleString()}</span>
                <span className="text-[40px] font-semibold text-[#1e1307] tracking-[-0.8px]">원</span>
              </div>
            </Link>
          </div>

          {/* AI Banner */}
          <Link
            href="/therapist/journal-test"
            className="bg-[#d78445] rounded-[20px] p-[50px] flex items-center justify-between hover:bg-[#c67535] transition-colors"
          >
            <div className="flex flex-col gap-[10px]">
              <div className="flex items-center gap-2">
                <Image
                  src="/images/icon-ai-journal-30.svg"
                  alt="AI 상담일지"
                  width={30}
                  height={30}
                  className="shrink-0"
                />
                <h2 className="text-[30px] font-semibold text-white">
                  AI 상담일지 자동생성
                </h2>
              </div>
              <p className="text-[20px] text-white pl-[36px]">
                지금 바로 최신 세션 일지를 생성해보세요
              </p>
            </div>
            <div className="w-[50px] h-[50px] bg-white rounded-full flex items-center justify-center">
              <svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 20L16 10L0 0V20Z" fill="#d78445"/>
              </svg>
            </div>
          </Link>

          {/* Calendar Section */}
          <div className="bg-white rounded-[20px] p-[50px]">
            <div className="border-b-2 border-[#92745c] pb-[25px] mb-[50px] flex items-end justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Image
                    src="/images/icon-sessions-24.svg"
                    alt="이번달 상담 세션"
                    width={24}
                    height={24}
                    className="shrink-0"
                  />
                  <h2 className="text-[24px] font-bold text-[#1e1307]">
                    이번달 상담 세션
                  </h2>
                </div>
                <Link
                  href="/therapist/schedule"
                  className="px-4 py-2 bg-[#92745c] text-white text-[14px] rounded-lg hover:bg-[#7a6049] transition-colors"
                >
                  일정 관리
                </Link>
              </div>
              <span className="text-[24px] font-bold text-[#1e1307]">
                총 {getMonthlySessionCount()}건
              </span>
            </div>

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

            {/* Legend */}
            <div className="bg-[#f8f8f8] rounded-[20px] px-[80px] py-[30px] mt-[50px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-[10px]">
                  <span className="bg-[#ffdbdb] px-[13px] py-0 h-[24px] rounded-full text-[16px] text-[#1e1307] tracking-[-0.32px] flex items-center gap-1">
                    <Image
                      src="/images/icon-language-consulting-16.svg"
                      alt="언어컨설팅"
                      width={16}
                      height={16}
                      className="shrink-0"
                    />
                    언어컨설팅
                  </span>
                  <span className="bg-[#ffe1b8] px-[13px] py-0 h-[24px] rounded-full text-[16px] text-[#1e1307] tracking-[-0.32px] flex items-center gap-1">
                    <Image
                      src="/images/icon-home-therapy-16.svg"
                      alt="홈티"
                      width={16}
                      height={16}
                      className="shrink-0"
                    />
                    홈티
                  </span>
                </div>
                <div className="flex items-center gap-[20px]">
                  <div className="flex items-center gap-[6px]">
                    <div className="w-[12px] h-[12px] rounded-full bg-[#ffa500]" />
                    <span className="text-[15px] text-[#1e1307] tracking-[-0.3px]">예약대기</span>
                  </div>
                  <div className="flex items-center gap-[6px]">
                    <div className="w-[12px] h-[12px] rounded-full bg-[#4caf50]" />
                    <span className="text-[15px] text-[#1e1307] tracking-[-0.3px]">예약확정</span>
                  </div>
                  <div className="flex items-center gap-[6px]">
                    <div className="w-[12px] h-[12px] rounded-full bg-[#2196f3]" />
                    <span className="text-[15px] text-[#1e1307] tracking-[-0.3px]">완료</span>
                  </div>
                  <div className="flex items-center gap-[6px]">
                    <div className="w-[12px] h-[12px] rounded-full bg-[#9e9e9e]" />
                    <span className="text-[15px] text-[#1e1307] tracking-[-0.3px]">예약 취소</span>
                  </div>
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
