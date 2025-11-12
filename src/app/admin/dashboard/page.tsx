'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminLayout from '@/components/layout/AdminLayout'
import AdminBookingDetailModal from '@/components/modals/AdminBookingDetailModal'
import { Eye, FileText, Star } from 'lucide-react'

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
  therapistNote: string | null
  currentStatus: string
  parentUser: {
    id: string
    name: string
    email: string
    phone: string
  }
  child: {
    id: string
    name: string
    birthDate: string
    gender: string
  }
  therapist: {
    id: string
    user: { name: string; email: string; phone: string }
  }
  review: {
    id: string
    rating: number
    content: string
    createdAt: string
  } | null
  payment: {
    id: string
    finalFee: number
    status: string
    sessionType: string
    totalSessions: number
    settlementAmount: number | null
    settledAt: string | null
  }
}

interface Therapy {
  id: string
  scheduledAt: string
  status: string
  sessionNumber: number
  therapistNote: string | null
  currentStatus: string
  parentUser: {
    id: string
    name: string
    email: string
    phone: string
  }
  child: {
    id: string
    name: string
    birthDate: string
    gender: string
  }
  therapist: {
    id: string
    user: { name: string; email: string; phone: string }
  }
  review: {
    id: string
    rating: number
    content: string
    createdAt: string
  } | null
  payment: {
    id: string
    finalFee: number
    totalSessions: number
    status: string
    sessionType: string
    settlementAmount: number | null
    settledAt: string | null
  }
  timeSlot: {
    date: string
    startTime: string
    endTime: string
  }
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

  // Detail modal state
  const [selectedBooking, setSelectedBooking] = useState<Consultation | Therapy | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // Status labels
  const statusLabels: Record<string, { label: string; color: string }> = {
    PENDING_PAYMENT: { label: '결제대기', color: 'bg-stone-100 text-stone-800' },
    PENDING_CONFIRMATION: { label: '예약대기', color: 'bg-yellow-100 text-yellow-800' },
    CONFIRMED: { label: '진행예정', color: 'bg-[#FFE5E5] text-[#FF6A00]' },
    COMPLETED: { label: '완료', color: 'bg-[#FFE5E5] text-[#FF6A00]' },
    PENDING_SETTLEMENT: { label: '정산대기', color: 'bg-purple-100 text-purple-800' },
    SETTLEMENT_COMPLETED: { label: '정산완료', color: 'bg-[#FFE5E5] text-[#FF6A00]' },
    CANCELLED: { label: '취소', color: 'bg-red-100 text-red-800' },
  }

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
      let url = '/api/admin/therapies?status=ALL'
      if (therapyStartDate) {
        url += `&startDate=${therapyStartDate}`
      }
      if (therapyEndDate) {
        url += `&endDate=${therapyEndDate}`
      }

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setTherapies(data.therapies || [])
      }
    } catch (error) {
      console.error('홈티 데이터 가져오기 오류:', error)
    }
  }

  const handleOpenDetail = (booking: Consultation | Therapy) => {
    setSelectedBooking(booking)
    setIsDetailModalOpen(true)
  }

  const handleCloseDetail = () => {
    setIsDetailModalOpen(false)
    setSelectedBooking(null)
    // Refresh data
    fetchConsultations()
    fetchTherapies()
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6A00] mx-auto"></div>
          <p className="mt-4 text-stone-600 font-pretendard">로딩 중...</p>
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
          <p className="text-stone-600 font-pretendard">
            아이포텐 플랫폼의 전반적인 현황을 관리하고 모니터링할 수 있습니다.
          </p>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-[#FFE5E5] rounded-xl flex items-center justify-center mr-4">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-500 font-pretendard">총 사용자</p>
                    <p className="text-2xl font-bold text-stone-900 font-pretendard">{stats.users}명</p>
                    <p className="text-xs text-[#FF6A00] font-pretendard">최근 7일: +{stats.recentUsers}명</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-[#FFE5E5] rounded-xl flex items-center justify-center mr-4">
                    <span className="text-2xl">👩‍⚕️</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-500 font-pretendard">치료사</p>
                    <p className="text-2xl font-bold text-stone-900 font-pretendard">{stats.therapists}명</p>
                    {stats.pendingTherapists > 0 && (
                      <p className="text-xs text-yellow-600 font-pretendard">승인 대기: {stats.pendingTherapists}명</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-[#FFE5E5] rounded-xl flex items-center justify-center mr-4">
                    <span className="text-2xl">📅</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-500 font-pretendard">예약</p>
                    <p className="text-2xl font-bold text-stone-900 font-pretendard">{stats.bookings}건</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-[#FFE5E5] rounded-xl flex items-center justify-center mr-4">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-500 font-pretendard">이번 달 수익</p>
                    <p className="text-2xl font-bold text-stone-900 font-pretendard">₩{stats.monthlyRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-[#FFE5E5] rounded-xl flex items-center justify-center mr-4">
                    <span className="text-2xl">👶</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-500 font-pretendard">등록된 아이</p>
                    <p className="text-2xl font-bold text-stone-900 font-pretendard">{stats.children}명</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-[#FFE5E5] rounded-xl flex items-center justify-center mr-4">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-500 font-pretendard">발달체크</p>
                    <p className="text-2xl font-bold text-stone-900 font-pretendard">{stats.assessments}회</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-[#FFE5E5] rounded-xl flex items-center justify-center mr-4">
                    <span className="text-2xl">📹</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-500 font-pretendard">추천 영상</p>
                    <p className="text-2xl font-bold text-stone-900 font-pretendard">{stats.videos}개</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-[#FFE5E5] rounded-xl flex items-center justify-center mr-4">
                    <span className="text-2xl">📰</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-500 font-pretendard">게시글/뉴스</p>
                    <p className="text-2xl font-bold text-stone-900 font-pretendard">{stats.posts + stats.news}개</p>
                  </div>
                </div>
            </div>
          </div>
        )}

        {/* Management Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Management */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-medium text-stone-900 font-pretendard mb-4">사용자 관리</h3>
            <div className="space-y-3">
              <Link
                href="/admin/users"
                className="block p-3 rounded-[10px] hover:bg-[#FFF5F0] transition-colors"
              >
                <div className="flex items-center">
                  <span className="text-lg mr-3">👥</span>
                  <div>
                    <div className="font-medium font-pretendard">사용자 목록</div>
                    <div className="text-sm text-stone-500 font-pretendard">전체 사용자 관리</div>
                  </div>
                </div>
              </Link>

              <Link
                href="/admin/therapists"
                className="block p-3 rounded-[10px] hover:bg-[#FFF5F0] transition-colors"
              >
                <div className="flex items-center">
                  <span className="text-lg mr-3">👩‍⚕️</span>
                  <div>
                    <div className="font-medium font-pretendard">치료사 관리</div>
                    <div className="text-sm text-stone-500 font-pretendard">치료사 승인 및 관리</div>
                  </div>
                </div>
              </Link>

              <Link
                href="/admin/children"
                className="block p-3 rounded-[10px] hover:bg-[#FFF5F0] transition-colors"
              >
                <div className="flex items-center">
                  <span className="text-lg mr-3">👶</span>
                  <div>
                    <div className="font-medium font-pretendard">아이 프로필</div>
                    <div className="text-sm text-stone-500 font-pretendard">등록된 아이 현황</div>
                  </div>
                </div>
              </Link>

              <Link
                href="/admin/assessments"
                className="block p-3 rounded-[10px] hover:bg-[#FFF5F0] transition-colors"
              >
                <div className="flex items-center">
                  <span className="text-lg mr-3">📊</span>
                  <div>
                    <div className="font-medium font-pretendard">발달체크 현황</div>
                    <div className="text-sm text-stone-500 font-pretendard">평가 결과 통계</div>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* System Settings */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-medium text-stone-900 font-pretendard mb-4">시스템 설정</h3>
            <div className="space-y-3">
              <Link
                href="/admin/settings"
                className="block p-3 rounded-[10px] hover:bg-[#FFF5F0] transition-colors"
              >
                <div className="flex items-center">
                  <span className="text-lg mr-3">⚙️</span>
                  <div>
                    <div className="font-medium font-pretendard">전역 설정</div>
                    <div className="text-sm text-stone-500 font-pretendard">시스템 환경 설정</div>
                  </div>
                </div>
              </Link>

              <Link
                href="/admin/backup"
                className="block p-3 rounded-[10px] hover:bg-[#FFF5F0] transition-colors"
              >
                <div className="flex items-center">
                  <span className="text-lg mr-3">💾</span>
                  <div>
                    <div className="font-medium font-pretendard">백업 관리</div>
                    <div className="text-sm text-stone-500 font-pretendard">데이터 백업 및 복원</div>
                  </div>
                </div>
              </Link>

              <Link
                href="/admin/logs"
                className="block p-3 rounded-[10px] hover:bg-[#FFF5F0] transition-colors"
              >
                <div className="flex items-center">
                  <span className="text-lg mr-3">📝</span>
                  <div>
                    <div className="font-medium font-pretendard">로그 조회</div>
                    <div className="text-sm text-stone-500 font-pretendard">시스템 로그 및 활동 기록</div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Consultations Section */}
        <div className="mt-8 bg-white rounded-xl shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-stone-900 font-pretendard">언어 컨설팅</h3>
              <Link href="/admin/consultations" className="text-sm text-[#FF6A00] hover:text-[#E55F00] font-pretendard">
                전체 보기 →
              </Link>
            </div>
          </div>
          <div className="p-6">
            {/* Date Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 font-pretendard mb-2">시작일</label>
                <input
                  type="date"
                  value={consultationStartDate}
                  onChange={(e) => setConsultationStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] font-pretendard"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 font-pretendard mb-2">종료일</label>
                <input
                  type="date"
                  value={consultationEndDate}
                  onChange={(e) => setConsultationEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] font-pretendard"
                />
              </div>
            </div>

            {/* Consultations Table */}
            {consultations.length === 0 ? (
              <div className="text-center py-8 text-stone-500 font-pretendard">
                <span className="text-4xl mb-4 block">📅</span>
                <p>언어 컨설팅 예약이 없습니다.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-[#F9F9F9]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase font-pretendard">예약일시</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase font-pretendard">아동</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase font-pretendard">부모</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase font-pretendard">치료사</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase font-pretendard">금액</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-stone-500 uppercase font-pretendard">일지</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-stone-500 uppercase font-pretendard">후기</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase font-pretendard">상태</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-stone-500 uppercase font-pretendard">작업</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {consultations.slice(0, 5).map((consultation) => (
                      <tr key={consultation.id} className="hover:bg-[#FFF5F0]">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-900 font-pretendard">
                          {new Date(consultation.scheduledAt).toLocaleDateString('ko-KR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-900 font-pretendard">
                          {consultation.child.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-600 font-pretendard">
                          {consultation.parentUser.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-600 font-pretendard">
                          {consultation.therapist.user.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-900 font-pretendard">
                          ₩{consultation.payment.finalFee.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {consultation.therapistNote ? (
                            <FileText size={18} className="inline text-[#FF6A00]" />
                          ) : (
                            <span className="text-stone-300">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {consultation.review ? (
                            <div className="inline-flex items-center gap-1">
                              <Star size={18} className="text-yellow-500 fill-yellow-500" />
                              <span className="text-sm text-stone-700 font-pretendard">{consultation.review.rating}</span>
                            </div>
                          ) : (
                            <span className="text-stone-300">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full font-pretendard ${
                              statusLabels[consultation.currentStatus]?.color || 'bg-stone-100 text-stone-800'
                            }`}
                          >
                            {statusLabels[consultation.currentStatus]?.label || consultation.currentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => handleOpenDetail(consultation)}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-stone-700 bg-stone-100 rounded-[10px] hover:bg-stone-200 font-pretendard"
                          >
                            <Eye size={14} className="mr-1" />
                            상세
                          </button>
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
        <div className="mt-8 bg-white rounded-xl shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-stone-900 font-pretendard">홈티</h3>
              <Link href="/admin/therapies" className="text-sm text-[#FF6A00] hover:text-[#E55F00] font-pretendard">
                전체 보기 →
              </Link>
            </div>
          </div>
          <div className="p-6">
            {/* Date Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 font-pretendard mb-2">시작일</label>
                <input
                  type="date"
                  value={therapyStartDate}
                  onChange={(e) => setTherapyStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] font-pretendard"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 font-pretendard mb-2">종료일</label>
                <input
                  type="date"
                  value={therapyEndDate}
                  onChange={(e) => setTherapyEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] font-pretendard"
                />
              </div>
            </div>

            {/* Therapies Table */}
            {therapies.length === 0 ? (
              <div className="text-center py-8 text-stone-500 font-pretendard">
                <span className="text-4xl mb-4 block">📅</span>
                <p>홈티 예약이 없습니다.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-[#F9F9F9]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase font-pretendard">예약일시</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase font-pretendard">아동</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase font-pretendard">부모</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase font-pretendard">치료사</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase font-pretendard">회차</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase font-pretendard">금액</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-stone-500 uppercase font-pretendard">일지</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-stone-500 uppercase font-pretendard">후기</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase font-pretendard">상태</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-stone-500 uppercase font-pretendard">작업</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {therapies.slice(0, 5).map((therapy) => (
                      <tr key={therapy.id} className="hover:bg-[#FFF5F0]">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-900 font-pretendard">
                          {new Date(therapy.scheduledAt).toLocaleDateString('ko-KR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-900 font-pretendard">
                          {therapy.child.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-600 font-pretendard">
                          {therapy.parentUser.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-600 font-pretendard">
                          {therapy.therapist.user.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-900 font-pretendard">
                          {therapy.sessionNumber} / {therapy.payment.totalSessions}회
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-900 font-pretendard">
                          ₩{therapy.payment.finalFee.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {therapy.therapistNote ? (
                            <FileText size={18} className="inline text-[#FF6A00]" />
                          ) : (
                            <span className="text-stone-300">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {therapy.review ? (
                            <div className="inline-flex items-center gap-1">
                              <Star size={18} className="text-yellow-500 fill-yellow-500" />
                              <span className="text-sm text-stone-700 font-pretendard">{therapy.review.rating}</span>
                            </div>
                          ) : (
                            <span className="text-stone-300">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full font-pretendard ${
                              statusLabels[therapy.currentStatus]?.color || 'bg-stone-100 text-stone-800'
                            }`}
                          >
                            {statusLabels[therapy.currentStatus]?.label || therapy.currentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => handleOpenDetail(therapy)}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-stone-700 bg-stone-100 rounded-[10px] hover:bg-stone-200 font-pretendard"
                          >
                            <Eye size={14} className="mr-1" />
                            상세
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Detail Modal */}
        {selectedBooking && (
          <AdminBookingDetailModal
            booking={selectedBooking}
            isOpen={isDetailModalOpen}
            onClose={handleCloseDetail}
          />
        )}
      </div>
    </AdminLayout>
  )
}