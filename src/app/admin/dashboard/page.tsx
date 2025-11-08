'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminLayout from '@/components/layout/AdminLayout'

interface Stats {
  users: number
  children: number
  assessments: number
  videos: number
  posts: number
  news: number
  therapists: number
  bookings: number
  pendingTherapists: number
  monthlyRevenue: number
  recentUsers: number
  recentActivities: Array<{
    name: string
    email: string
    role: string
    createdAt: string
  }>
}

interface Consultation {
  id: string
  scheduledAt: string
  status: string
  parentUser: { name: string }
  child: { name: string }
  therapist: { user: { name: string } }
  payment: { finalFee: number; status: string }
}

interface Therapy {
  id: string
  scheduledAt: string
  status: string
  sessionNumber: number
  parentUser: { name: string }
  child: { name: string }
  therapist: { user: { name: string } }
  payment: { finalFee: number; totalSessions: number; status: string }
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Consultations & Therapies
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [therapies, setTherapies] = useState<Therapy[]>([])
  const [consultationStartDate, setConsultationStartDate] = useState('')
  const [consultationEndDate, setConsultationEndDate] = useState('')
  const [therapyStartDate, setTherapyStartDate] = useState('')
  const [therapyEndDate, setTherapyEndDate] = useState('')

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    // 관리자 권한 확인
    if (session.user?.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }

    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats')
        if (response.ok) {
          const statsData = await response.json()
          setStats(statsData)
        }
      } catch (error) {
        console.error('통계 데이터를 가져오는 중 오류 발생:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
    fetchConsultations()
    fetchTherapies()
  }, [session, status, router])

  // Fetch consultations when date filters change
  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchConsultations()
    }
  }, [consultationStartDate, consultationEndDate, session])

  // Fetch therapies when date filters change
  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchTherapies()
    }
  }, [therapyStartDate, therapyEndDate, session])

  const fetchConsultations = async () => {
    try {
      let url = '/api/admin/consultations?status=ALL'
      if (consultationStartDate) {
        url += `&startDate=${consultationStartDate}`
      }
      if (consultationEndDate) {
        url += `&endDate=${consultationEndDate}`
      }

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setConsultations(data.consultations || [])
      }
    } catch (error) {
      console.error('언어 컨설팅 데이터 가져오기 오류:', error)
    }
  }

  const fetchTherapies = async () => {
    try {
      let url = '/api/admin/bookings?sessionType=THERAPY'
      if (therapyStartDate) {
        url += `&startDate=${therapyStartDate}`
      }
      if (therapyEndDate) {
        url += `&endDate=${therapyEndDate}`
      }

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setTherapies(data.bookings || [])
      }
    } catch (error) {
      console.error('홈티 데이터 가져오기 오류:', error)
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
    <AdminLayout title="관리자 패널">
      <div className="space-y-6">
        {/* Header Section */}
        <div>
          <p className="text-gray-600">
            아이포텐 플랫폼의 전반적인 현황을 관리하고 모니터링할 수 있습니다.
          </p>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">총 사용자</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.users}명</p>
                    <p className="text-xs text-green-600">최근 7일: +{stats.recentUsers}명</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl">👩‍⚕️</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">치료사</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.therapists}명</p>
                    {stats.pendingTherapists > 0 && (
                      <p className="text-xs text-yellow-600">승인 대기: {stats.pendingTherapists}명</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl">📅</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">예약</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.bookings}건</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">이번 달 수익</p>
                    <p className="text-2xl font-bold text-gray-900">₩{stats.monthlyRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl">👶</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">등록된 아이</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.children}명</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">발달체크</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.assessments}회</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl">📹</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">추천 영상</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.videos}개</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl">📰</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">게시글/뉴스</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.posts + stats.news}개</p>
                  </div>
                </div>
            </div>
          </div>
        )}

        {/* Management Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Management */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">사용자 관리</h3>
            <div className="space-y-3">
              <Link
                href="/admin/users"
                className="block p-3 rounded-md hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <span className="text-lg mr-3">👥</span>
                  <div>
                    <div className="font-medium">사용자 목록</div>
                    <div className="text-sm text-gray-500">전체 사용자 관리</div>
                  </div>
                </div>
              </Link>

              <Link
                href="/admin/therapists"
                className="block p-3 rounded-md hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <span className="text-lg mr-3">👩‍⚕️</span>
                  <div>
                    <div className="font-medium">치료사 관리</div>
                    <div className="text-sm text-gray-500">치료사 승인 및 관리</div>
                  </div>
                </div>
              </Link>

              <Link
                href="/admin/children"
                className="block p-3 rounded-md hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <span className="text-lg mr-3">👶</span>
                  <div>
                    <div className="font-medium">아이 프로필</div>
                    <div className="text-sm text-gray-500">등록된 아이 현황</div>
                  </div>
                </div>
              </Link>

              <Link
                href="/admin/assessments"
                className="block p-3 rounded-md hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <span className="text-lg mr-3">📊</span>
                  <div>
                    <div className="font-medium">발달체크 현황</div>
                    <div className="text-sm text-gray-500">평가 결과 통계</div>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* System Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">시스템 설정</h3>
            <div className="space-y-3">
              <Link
                href="/admin/settings"
                className="block p-3 rounded-md hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <span className="text-lg mr-3">⚙️</span>
                  <div>
                    <div className="font-medium">전역 설정</div>
                    <div className="text-sm text-gray-500">시스템 환경 설정</div>
                  </div>
                </div>
              </Link>

              <Link
                href="/admin/backup"
                className="block p-3 rounded-md hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <span className="text-lg mr-3">💾</span>
                  <div>
                    <div className="font-medium">백업 관리</div>
                    <div className="text-sm text-gray-500">데이터 백업 및 복원</div>
                  </div>
                </div>
              </Link>

              <Link
                href="/admin/logs"
                className="block p-3 rounded-md hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <span className="text-lg mr-3">📝</span>
                  <div>
                    <div className="font-medium">로그 조회</div>
                    <div className="text-sm text-gray-500">시스템 로그 및 활동 기록</div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Consultations Section */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">언어 컨설팅</h3>
              <Link href="/admin/consultations" className="text-sm text-blue-600 hover:text-blue-800">
                전체 보기 →
              </Link>
            </div>
          </div>
          <div className="p-6">
            {/* Date Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">시작일</label>
                <input
                  type="date"
                  value={consultationStartDate}
                  onChange={(e) => setConsultationStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">종료일</label>
                <input
                  type="date"
                  value={consultationEndDate}
                  onChange={(e) => setConsultationEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Consultations Table */}
            {consultations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <span className="text-4xl mb-4 block">📅</span>
                <p>언어 컨설팅 예약이 없습니다.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">예약일시</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">아동</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">부모</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">치료사</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">금액</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {consultations.slice(0, 5).map((consultation) => (
                      <tr key={consultation.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(consultation.scheduledAt).toLocaleDateString('ko-KR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {consultation.child.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {consultation.parentUser.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {consultation.therapist.user.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₩{consultation.payment.finalFee.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {consultation.payment.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Therapies Section */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">홈티</h3>
              <Link href="/admin/therapies" className="text-sm text-blue-600 hover:text-blue-800">
                전체 보기 →
              </Link>
            </div>
          </div>
          <div className="p-6">
            {/* Date Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">시작일</label>
                <input
                  type="date"
                  value={therapyStartDate}
                  onChange={(e) => setTherapyStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">종료일</label>
                <input
                  type="date"
                  value={therapyEndDate}
                  onChange={(e) => setTherapyEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Therapies Table */}
            {therapies.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <span className="text-4xl mb-4 block">📅</span>
                <p>홈티 예약이 없습니다.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">예약일시</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">아동</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">부모</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">치료사</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">회차</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">금액</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {therapies.slice(0, 5).map((therapy) => (
                      <tr key={therapy.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(therapy.scheduledAt).toLocaleDateString('ko-KR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {therapy.child.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {therapy.parentUser.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {therapy.therapist.user.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {therapy.sessionNumber} / {therapy.payment.totalSessions}회
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₩{therapy.payment.finalFee.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {therapy.payment.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}