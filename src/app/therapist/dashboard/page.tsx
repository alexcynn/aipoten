'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
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
  const [inquiries, setInquiries] = useState<any[]>([])
  const [showInquiryForm, setShowInquiryForm] = useState(false)
  const [inquiryForm, setInquiryForm] = useState({
    category: 'SERVICE',
    title: '',
    content: '',
  })

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
    fetchInquiries()
  }, [session, status, router])

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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

            <Link
              href="/therapist/journal-test"
              className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded flex items-center justify-center">
                    <span className="text-white">✨</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-white">AI 상담일지</h3>
                  <p className="text-sm text-purple-100">자동 생성 테스트</p>
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
          <div className="bg-white shadow overflow-hidden sm:rounded-md mb-6">
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

          {/* 1:1 문의 Section */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    1:1 문의
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    궁금하신 사항을 문의해주세요.
                  </p>
                </div>
                <button
                  onClick={() => setShowInquiryForm(!showInquiryForm)}
                  className="px-4 py-2 rounded-md transition-colors font-medium text-sm"
                  style={{
                    backgroundColor: showInquiryForm ? '#6B7280' : '#386646',
                    color: '#FFFFFF'
                  }}
                >
                  {showInquiryForm ? '취소' : '+ 새 문의하기'}
                </button>
              </div>
            </div>

            {/* 문의 작성 폼 */}
            {showInquiryForm && (
              <div className="px-4 pb-6">
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
              </div>
            )}

            {/* 문의 목록 */}
            <div className="px-4 pb-5">
              {inquiries.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <div className="text-4xl mb-3">💬</div>
                  <p className="text-gray-600 text-sm">문의 내역이 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {inquiries.slice(0, 5).map((inquiry: any) => {
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
                        className="bg-gray-50 border border-gray-200 rounded-lg p-4"
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
                            <h5 className="font-semibold text-gray-900 mb-1 text-sm">{inquiry.title}</h5>
                            <p className="text-xs text-gray-600 line-clamp-2 mb-1">{inquiry.content}</p>
                            <div className="text-xs text-gray-500">
                              {new Date(inquiry.createdAt).toLocaleDateString('ko-KR')}
                            </div>
                          </div>
                        </div>

                        {/* 상세보기 버튼 */}
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <Link
                            href={`/inquiries/${inquiry.id}`}
                            className="inline-block px-3 py-1.5 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
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
        </div>
      </main>
    </div>
  )
}