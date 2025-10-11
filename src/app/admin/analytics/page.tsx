'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'

interface AnalyticsData {
  userStats: {
    totalUsers: number
    newUsersThisMonth: number
    newUsersLastMonth: number
    userGrowthRate: number
    roleDistribution: {
      PARENT: number
      THERAPIST: number
      ADMIN: number
    }
  }
  consultationStats: {
    totalConsultations: number
    completedConsultations: number
    scheduledConsultations: number
    cancelledConsultations: number
    monthlyRevenue: number
    averageConsultationFee: number
  }
  contentStats: {
    totalVideos: number
    activeVideos: number
    totalViews: number
    mostViewedVideos: Array<{
      id: string
      title: string
      views: number
    }>
  }
  systemStats: {
    totalChildren: number
    totalAssessments: number
    pendingTherapistApprovals: number
    systemUptime: string
  }
  monthlyData: Array<{
    month: string
    users: number
    consultations: number
    revenue: number
  }>
}

export default function AdminAnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    if (session.user?.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }

    fetchAnalytics()
  }, [session, status, router, timeRange])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/admin/analytics?timeRange=${timeRange}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('분석 데이터를 가져오는 중 오류 발생:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount)
  }

  const getGrowthColor = (rate: number) => {
    if (rate > 0) return 'text-green-600'
    if (rate < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getGrowthIcon = (rate: number) => {
    if (rate > 0) return '↗️'
    if (rate < 0) return '↘️'
    return '➡️'
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

  if (!session || !analytics) {
    return null
  }

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">분석 및 통계</h1>
            <p className="mt-2 text-gray-600">
              플랫폼의 성과와 사용 현황을 분석할 수 있습니다.
            </p>
          </div>

          {/* User Statistics */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">사용자 통계</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">전체 사용자</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.userStats.totalUsers.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">👥</span>
                  </div>
                </div>
                <div className="mt-2">
                  <span className={`text-sm ${getGrowthColor(analytics.userStats.userGrowthRate)}`}>
                    {getGrowthIcon(analytics.userStats.userGrowthRate)} {Math.abs(analytics.userStats.userGrowthRate).toFixed(1)}%
                  </span>
                  <span className="text-sm text-gray-500 ml-1">지난 달 대비</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">이달 신규 사용자</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.userStats.newUsersThisMonth.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">✨</span>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-500">지난 달: {analytics.userStats.newUsersLastMonth}명</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">부모 사용자</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.userStats.roleDistribution.PARENT.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">👨‍👩‍👧‍👦</span>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-500">
                    전체의 {((analytics.userStats.roleDistribution.PARENT / analytics.userStats.totalUsers) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">치료사</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.userStats.roleDistribution.THERAPIST.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">👩‍⚕️</span>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-500">
                    전체의 {((analytics.userStats.roleDistribution.THERAPIST / analytics.userStats.totalUsers) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Consultation Statistics */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">상담 통계</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">총 상담 건수</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.consultationStats.totalConsultations.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">💬</span>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-sm text-gray-500">
                    완료: {analytics.consultationStats.completedConsultations}건 |
                    예정: {analytics.consultationStats.scheduledConsultations}건
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">월간 수익</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.consultationStats.monthlyRevenue)}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">💰</span>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-500">
                    평균 상담료: {formatCurrency(analytics.consultationStats.averageConsultationFee)}
                  </span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">완료율</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics.consultationStats.totalConsultations > 0
                        ? ((analytics.consultationStats.completedConsultations / analytics.consultationStats.totalConsultations) * 100).toFixed(1)
                        : 0}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">✅</span>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-500">
                    취소: {analytics.consultationStats.cancelledConsultations}건
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content Statistics */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">콘텐츠 통계</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">영상 현황</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{analytics.contentStats.totalVideos}</div>
                    <div className="text-sm text-gray-500">전체 영상</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{analytics.contentStats.activeVideos}</div>
                    <div className="text-sm text-gray-500">활성 영상</div>
                  </div>
                  <div className="text-center col-span-2">
                    <div className="text-2xl font-bold text-purple-600">{analytics.contentStats.totalViews.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">총 조회수</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">인기 영상</h3>
                <div className="space-y-3">
                  {analytics.contentStats.mostViewedVideos.slice(0, 5).map((video, index) => (
                    <div key={video.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                          {index + 1}
                        </span>
                        <span className="text-sm text-gray-900 truncate max-w-xs">{video.title}</span>
                      </div>
                      <span className="text-sm text-gray-500">{video.views.toLocaleString()}회</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* System Statistics */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">시스템 현황</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">등록된 아이</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.systemStats.totalChildren.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">👶</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">발달체크</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.systemStats.totalAssessments.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📊</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">승인 대기</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.systemStats.pendingTherapistApprovals}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">⏳</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">시스템 가동시간</p>
                    <p className="text-lg font-bold text-gray-900">{analytics.systemStats.systemUptime}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🟢</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Trends */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">월별 추이</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      월
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      신규 사용자
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상담 건수
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      수익
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analytics.monthlyData.map((data, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {data.month}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {data.users.toLocaleString()}명
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {data.consultations.toLocaleString()}회
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(data.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}