'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Header from '@/components/layout/Header'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface MonthlyEarning {
  month: string
  amount: number
}

export default function TherapistEarningsPage() {
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
      const response = await fetch('/api/bookings')
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

  // 예비정산금 계산 (결제 완료되었지만 아직 정산되지 않은 세션)
  const calculatePendingSettlement = () => {
    return myBookings
      .filter((booking: any) =>
        booking.payment?.status === 'PAID' &&
        (booking.status === 'CONFIRMED' || booking.status === 'PENDING_SETTLEMENT')
      )
      .reduce((total: number, booking: any) => {
        const therapistAmount = booking.payment?.amount ? booking.payment.amount * 0.9 : 0
        return total + therapistAmount
      }, 0)
  }

  // 미정산금 계산 (완료되었지만 정산되지 않은 금액)
  const calculateUnsettled = () => {
    return myBookings
      .filter((booking: any) =>
        booking.payment?.status === 'PAID' &&
        booking.status === 'PENDING_SETTLEMENT'
      )
      .reduce((total: number, booking: any) => {
        const therapistAmount = booking.payment?.amount ? booking.payment.amount * 0.9 : 0
        return total + therapistAmount
      }, 0)
  }

  // 이달 수입금 계산 (이번 달에 정산된 금액)
  const calculateThisMonthEarnings = () => {
    const now = new Date()
    const thisMonth = now.getMonth()
    const thisYear = now.getFullYear()

    return myBookings
      .filter((booking: any) => {
        if (booking.status !== 'SETTLEMENT_COMPLETED') return false

        const completedDate = new Date(booking.completedAt || booking.scheduledAt)
        return completedDate.getMonth() === thisMonth && completedDate.getFullYear() === thisYear
      })
      .reduce((total: number, booking: any) => {
        const therapistAmount = booking.payment?.amount ? booking.payment.amount * 0.9 : 0
        return total + therapistAmount
      }, 0)
  }

  // 월별 수입금 데이터 생성 (최근 6개월)
  const getMonthlyEarnings = (): MonthlyEarning[] => {
    const monthlyData: { [key: string]: number } = {}
    const now = new Date()

    // 최근 6개월 초기화
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      monthlyData[monthKey] = 0
    }

    // 정산 완료된 예약으로 월별 수입 계산
    myBookings
      .filter((booking: any) => booking.status === 'SETTLEMENT_COMPLETED')
      .forEach((booking: any) => {
        const completedDate = new Date(booking.completedAt || booking.scheduledAt)
        const monthKey = `${completedDate.getFullYear()}-${String(completedDate.getMonth() + 1).padStart(2, '0')}`

        if (monthlyData[monthKey] !== undefined) {
          const therapistAmount = booking.payment?.amount ? booking.payment.amount * 0.9 : 0
          monthlyData[monthKey] += therapistAmount
        }
      })

    // 차트 데이터 형식으로 변환
    return Object.entries(monthlyData).map(([month, amount]) => {
      const [year, monthNum] = month.split('-')
      return {
        month: `${monthNum}월`,
        amount: Math.round(amount)
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

  const monthlyEarnings = getMonthlyEarnings()

  return (
    <div className="min-h-screen bg-neutral-light">
      <Header />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">수익 통계</h1>
            <p className="mt-2 text-gray-600">
              치료사님의 수익 현황과 월별 추이를 확인하세요.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">예비정산금</h3>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📋</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-blue-600">
                ₩{calculatePendingSettlement().toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                결제 완료, 정산 대기 중
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">미정산금</h3>
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">⏳</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-orange-600">
                ₩{calculateUnsettled().toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                세션 완료, 정산 대기 중
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">이달 수입금</h3>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-green-600">
                ₩{calculateThisMonthEarnings().toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                이번 달 정산 완료
              </p>
            </div>
          </div>

          {/* Monthly Earnings Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">월별 수입금 추이</h2>

            {monthlyEarnings.every(data => data.amount === 0) ? (
              <div className="text-center py-12">
                <p className="text-gray-500">아직 정산 완료된 수입이 없습니다.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={monthlyEarnings}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#6B7280' }}
                  />
                  <YAxis
                    tick={{ fill: '#6B7280' }}
                    tickFormatter={(value) => `₩${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value: number) => [`₩${value.toLocaleString()}`, '수입금']}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="amount"
                    fill="#386646"
                    name="월별 수입금"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">참고사항</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>모든 금액은 플랫폼 수수료(10%)를 제외한 치료사님의 실 수령액입니다.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>예비정산금: 결제는 완료되었으나 세션이 아직 진행되지 않은 금액</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>미정산금: 세션은 완료되었으나 아직 정산되지 않은 금액</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>이달 수입금: 이번 달에 정산이 완료된 금액</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
