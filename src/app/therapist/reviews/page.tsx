'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Header from '@/components/layout/Header'
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface MonthlyStats {
  month: string
  consultations: number
  therapies: number
  reviewCount: number
  avgRating: number
}

export default function TherapistReviewsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [myBookings, setMyBookings] = useState<any[]>([])

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

    fetchBookings()
  }, [session, status, router])

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/therapist/bookings')
      if (response.ok) {
        const data = await response.json()
        const bookingsArray = data.bookings || []
        setMyBookings(bookingsArray)
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 완료된 세션 필터 (세션이 실제로 진행 완료된 건만)
  const completedBookings = myBookings.filter((booking: any) =>
    booking.status === 'PENDING_SETTLEMENT' ||
    booking.status === 'SETTLEMENT_COMPLETED' ||
    booking.payment?.settledAt // 정산 완료된 건은 무조건 포함
  )

  // 총 언어컨설팅 진행 수
  const getTotalConsultations = () => {
    return completedBookings.filter((booking: any) =>
      booking.payment?.sessionType === 'CONSULTATION'
    ).length
  }

  // 총 홈티 진행 수
  const getTotalTherapies = () => {
    return completedBookings.filter((booking: any) =>
      booking.payment?.sessionType === 'THERAPY'
    ).length
  }

  // 총 리뷰가 달린 세션 수
  const getTotalReviews = () => {
    return completedBookings.filter((booking: any) =>
      booking.review !== null
    ).length
  }

  // 평균 평점 계산
  const getAverageRating = () => {
    const reviewedBookings = completedBookings.filter((booking: any) => booking.review !== null)
    if (reviewedBookings.length === 0) return 0

    const totalRating = reviewedBookings.reduce((sum: number, booking: any) => {
      return sum + (booking.review?.rating || 0)
    }, 0)

    return (totalRating / reviewedBookings.length).toFixed(1)
  }

  // 월별 통계 데이터 생성 (최근 6개월)
  const getMonthlyStats = (): MonthlyStats[] => {
    const monthlyData: { [key: string]: {
      consultations: number
      therapies: number
      reviews: number[]
    } } = {}
    const now = new Date()

    // 최근 6개월 초기화
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      monthlyData[monthKey] = {
        consultations: 0,
        therapies: 0,
        reviews: []
      }
    }

    // 완료된 예약으로 월별 통계 계산
    completedBookings.forEach((booking: any) => {
      // 세션 완료 날짜: 정산 완료된 경우 settledAt, 그 외는 scheduledAt 사용
      const completedDate = booking.payment?.settledAt
        ? new Date(booking.payment.settledAt)
        : new Date(booking.scheduledAt)
      const monthKey = `${completedDate.getFullYear()}-${String(completedDate.getMonth() + 1).padStart(2, '0')}`

      if (monthlyData[monthKey]) {
        // 세션 타입별 카운트
        if (booking.payment?.sessionType === 'CONSULTATION') {
          monthlyData[monthKey].consultations += 1
        } else if (booking.payment?.sessionType === 'THERAPY') {
          monthlyData[monthKey].therapies += 1
        }

        // 리뷰 수집
        if (booking.review) {
          monthlyData[monthKey].reviews.push(booking.review.rating)
        }
      }
    })

    // 차트 데이터 형식으로 변환
    return Object.entries(monthlyData).map(([month, data]) => {
      const [year, monthNum] = month.split('-')
      const avgRating = data.reviews.length > 0
        ? data.reviews.reduce((sum, rating) => sum + rating, 0) / data.reviews.length
        : 0

      return {
        month: `${monthNum}월`,
        consultations: data.consultations,
        therapies: data.therapies,
        reviewCount: data.reviews.length,
        avgRating: Number(avgRating.toFixed(1))
      }
    })
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

  const monthlyStats = getMonthlyStats()

  return (
    <div className="min-h-screen bg-neutral-light">
      <Header />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">리뷰 통계</h1>
            <p className="mt-2 text-gray-600">
              치료사님의 세션 진행 현황과 리뷰 통계를 확인하세요.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">언어컨설팅</h3>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">💬</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {getTotalConsultations()}건
              </p>
              <p className="text-sm text-gray-500 mt-2">
                총 진행 세션
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">홈티</h3>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🏠</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-green-600">
                {getTotalTherapies()}건
              </p>
              <p className="text-sm text-gray-500 mt-2">
                총 진행 세션
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">리뷰 수</h3>
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📝</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-purple-600">
                {getTotalReviews()}건
              </p>
              <p className="text-sm text-gray-500 mt-2">
                총 받은 리뷰
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">평균 평점</h3>
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">⭐</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-yellow-600">
                {getAverageRating()}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                5점 만점
              </p>
            </div>
          </div>

          {/* Monthly Stats Chart */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">월별 세션 진행 현황</h2>

            {monthlyStats.every(data => data.consultations === 0 && data.therapies === 0) ? (
              <div className="text-center py-12">
                <p className="text-gray-500">아직 완료된 세션이 없습니다.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={monthlyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#6B7280' }}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fill: '#6B7280' }}
                    label={{ value: '세션 수', angle: -90, position: 'insideLeft' }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fill: '#6B7280' }}
                    domain={[0, 5]}
                    label={{ value: '평점', angle: 90, position: 'insideRight' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="consultations"
                    fill="#3B82F6"
                    name="언어컨설팅"
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="therapies"
                    fill="#10B981"
                    name="홈티"
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="reviewCount"
                    fill="#A855F7"
                    name="리뷰 수"
                    radius={[8, 8, 0, 0]}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="avgRating"
                    stroke="#EAB308"
                    strokeWidth={3}
                    name="평균 평점"
                    dot={{ fill: '#EAB308', r: 5 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Info Section */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">참고사항</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>완료된 세션만 통계에 포함됩니다.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>리뷰는 세션 완료 후 7일 이내에 작성할 수 있습니다.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>평균 평점은 실제로 리뷰가 달린 세션만을 기준으로 계산됩니다.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>차트의 왼쪽 축은 세션 수, 오른쪽 축은 평점을 나타냅니다.</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
