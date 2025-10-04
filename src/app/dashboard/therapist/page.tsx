'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import ProfilePictureUpload from '@/components/ProfilePictureUpload'

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
        const [userRes, profileRes, requestsRes, scheduleRes] = await Promise.all([
          fetch('/api/users/me'),
          fetch('/api/therapist/profile'),
          fetch('/api/therapist/matching-requests'),
          fetch('/api/therapist/today-schedule')
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
      } catch (error) {
        console.error('치료사 데이터를 가져오는 중 오류 발생:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTherapistData()
  }, [session, status, router])

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
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
            <Link href="/" className="flex items-center">
              <Image
                src="/images/logo-text.png"
                alt="AI Poten"
                width={160}
                height={40}
                className="h-10 w-auto"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/boards/notification" className="text-gray-600 hover:text-aipoten-green px-3 py-2 rounded-md text-sm font-medium">알림장</Link>
              <Link href="/news" className="text-gray-600 hover:text-aipoten-green px-3 py-2 rounded-md text-sm font-medium">육아정보</Link>
              <Link href="/boards/parenting" className="text-gray-600 hover:text-aipoten-green px-3 py-2 rounded-md text-sm font-medium">육아소통</Link>
              <span className="text-gray-700">{session.user?.name}님</span>
              <button
                onClick={handleSignOut}
                className="text-gray-600 hover:text-aipoten-green"
              >
                로그아웃
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-aipoten-green hover:bg-gray-100 focus:outline-none"
              >
                {isMobileMenuOpen ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link href="/boards/notification" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-aipoten-green hover:bg-gray-100">알림장</Link>
              <Link href="/news" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-aipoten-green hover:bg-gray-100">육아정보</Link>
              <Link href="/boards/parenting" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-aipoten-green hover:bg-gray-100">육아소통</Link>
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="px-3 py-2 text-sm text-gray-700">{session.user?.name}님</div>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-aipoten-green hover:bg-gray-100"
                >
                  로그아웃
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    안녕하세요, {session.user?.name} 치료사님!
                  </h1>
                  {profile ? (
                    <div className="space-y-1">
                      <p className="text-gray-600">
                        전문분야: {getSpecialtyName(profile.specialty)} | 경력: {profile.experience}년
                      </p>
                      <p className="text-sm text-gray-500">
                        승인 상태: <span className={`font-medium ${profile.status === 'APPROVED' ? 'text-green-600' : 'text-yellow-600'}`}>
                          {getStatusName(profile.status)}
                        </span>
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-600">
                      프로필을 설정하여 매칭 서비스를 시작해보세요.
                    </p>
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

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-aipoten-blue rounded flex items-center justify-center">
                    <span className="text-white text-sm">📋</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">새 요청</h3>
                  <p className="text-2xl font-bold text-aipoten-blue">
                    {matchingRequests.filter(r => r.status === 'PENDING').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-aipoten-green rounded flex items-center justify-center">
                    <span className="text-white text-sm">📅</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">오늘 일정</h3>
                  <p className="text-2xl font-bold text-aipoten-green">{todaySchedule.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-aipoten-orange rounded flex items-center justify-center">
                    <span className="text-white text-sm">⭐</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">평점</h3>
                  <p className="text-2xl font-bold text-aipoten-orange">4.8</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-aipoten-red rounded flex items-center justify-center">
                    <span className="text-white text-sm">💰</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">이번 달 수익</h3>
                  <p className="text-2xl font-bold text-aipoten-red">₩2,400,000</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Link
              href="/therapist/profile"
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-aipoten-blue rounded flex items-center justify-center">
                    <span className="text-white font-bold">👤</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">프로필 관리</h3>
                  <p className="text-sm text-gray-500">프로필 수정</p>
                </div>
              </div>
            </Link>

            <Link
              href="/therapist/schedule"
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-aipoten-green rounded flex items-center justify-center">
                    <span className="text-white">📅</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">일정 관리</h3>
                  <p className="text-sm text-gray-500">스케줄 설정</p>
                </div>
              </div>
            </Link>

            <Link
              href="/therapist/matching"
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-aipoten-orange rounded flex items-center justify-center">
                    <span className="text-white">🤝</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">매칭 요청</h3>
                  <p className="text-sm text-gray-500">요청 관리</p>
                </div>
              </div>
            </Link>

            <Link
              href="/therapist/consultations"
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-aipoten-red rounded flex items-center justify-center">
                    <span className="text-white">💬</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">상담 관리</h3>
                  <p className="text-sm text-gray-500">상담 내역</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Today's Schedule */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                오늘의 일정
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                오늘 예정된 상담 일정입니다.
              </p>
            </div>

            {todaySchedule.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-gray-500">오늘 예정된 상담이 없습니다.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {todaySchedule.map((schedule) => (
                  <li key={schedule.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {schedule.time} - {schedule.childName} ({schedule.parentName})
                          </p>
                          <p className="text-sm text-gray-500">
                            {schedule.type}
                          </p>
                        </div>
                        <Link
                          href={`/therapist/consultations/${schedule.id}`}
                          className="text-aipoten-green hover:text-aipoten-navy text-sm font-medium"
                        >
                          상세보기
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Recent Matching Requests */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                최근 매칭 요청
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                최근 받은 매칭 요청 목록입니다.
              </p>
            </div>

            {matchingRequests.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-gray-500 mb-4">아직 매칭 요청이 없습니다.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {matchingRequests.slice(0, 5).map((request) => (
                  <li key={request.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {request.childName} ({request.parentName})
                          </p>
                          <p className="text-sm text-gray-500">
                            희망일정: {request.preferredDates.join(', ')} |
                            요청일: {new Date(request.createdAt).toLocaleDateString('ko-KR')}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            request.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {request.status === 'PENDING' ? '대기중' :
                             request.status === 'APPROVED' ? '승인됨' : '거절됨'}
                          </span>
                          <Link
                            href={`/therapist/matching/${request.id}`}
                            className="text-aipoten-green hover:text-aipoten-navy text-sm font-medium"
                          >
                            상세보기
                          </Link>
                        </div>
                      </div>
                    </div>
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