'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ChildInfoModal from '@/components/modals/ChildInfoModal'
import TherapistInfoModal from '@/components/modals/TherapistInfoModal'

interface BookingGroup {
  groupId: string
  bookingIds: string[]
  sessionType: string
  totalFee: number
  totalSessions: number
  completedSessions: number
  status: string
  paidAt: string | null
  refundAmount: number | null
  child: {
    id: string
    name: string
    birthDate: string
    gender: string
    gestationalWeeks: number | null
    birthWeight: number | null
    currentHeight: number | null
    currentWeight: number | null
    medicalHistory: string | null
    familyHistory: string | null
    treatmentHistory: string | null
    notes: string | null
  }
  therapist: {
    id: string
    userId: string
    gender: string | null
    birthYear: number | null
    address: string | null
    addressDetail: string | null
    specialties: string | null
    childAgeRanges: string | null
    serviceAreas: string | null
    sessionFee: number | null
    isPreTherapist: boolean
    canDoConsultation: boolean
    education: string | null
    introduction: string | null
    user: {
      name: string
      email: string
      phone: string | null
    }
    certifications?: Array<{
      id: string
      name: string
      issuingOrganization: string
      issueDate: string
    }>
    experiences?: Array<{
      id: string
      employmentType: string
      institutionName: string | null
      specialty: string
      startDate: string
      endDate: string | null
      description: string | null
    }>
    educations?: Array<{
      id: string
      degree: string
      school: string
      major: string
      graduationYear: string
    }>
  }
  scheduledAt: string
  createdAt: string
  bookingCount: number
  timeSlot: {
    startTime: string
    endTime: string
  }
}

interface AccountInfo {
  bankName: string | null
  accountNumber: string | null
  accountHolder: string | null
}

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING_PAYMENT: { label: '결제대기', color: 'bg-orange-100 text-orange-800' },
  BOOKING_IN_PROGRESS: { label: '예약 중', color: 'bg-yellow-100 text-yellow-800' },
  CONFIRMED: { label: '예약 확인', color: 'bg-blue-100 text-blue-800' },
  SESSION_COMPLETED: { label: '세션 완료', color: 'bg-green-100 text-green-800' },
  SETTLEMENT_COMPLETED: { label: '정산 완료', color: 'bg-purple-100 text-purple-800' },
  REFUNDED: { label: '환불', color: 'bg-red-100 text-red-800' },
  CANCELLED: { label: '취소', color: 'bg-red-100 text-red-800' },
}

export default function MyBookingsPage() {
  const router = useRouter()
  const [pendingBookings, setPendingBookings] = useState<BookingGroup[]>([])
  const [paidBookings, setPaidBookings] = useState<BookingGroup[]>([])
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // 탭
  const [activeTab, setActiveTab] = useState<'pending' | 'paid'>('pending')

  // Modal states
  const [selectedChild, setSelectedChild] = useState<any>(null)
  const [selectedTherapist, setSelectedTherapist] = useState<any>(null)
  const [isChildModalOpen, setIsChildModalOpen] = useState(false)
  const [isTherapistModalOpen, setIsTherapistModalOpen] = useState(false)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    setIsLoading(true)
    try {
      const [pendingRes, paidRes] = await Promise.all([
        fetch('/api/bookings/grouped?filter=PENDING'),
        fetch('/api/bookings/grouped?filter=PAID'),
      ])

      if (pendingRes.ok) {
        const pendingData = await pendingRes.json()
        setPendingBookings(pendingData.bookings || [])
        setAccountInfo(pendingData.accountInfo || null)
      }

      if (paidRes.ok) {
        const paidData = await paidRes.json()
        setPaidBookings(paidData.bookings || [])
      }
    } catch (err) {
      setError('데이터를 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChildModal = (child: any) => {
    setSelectedChild(child)
    setIsChildModalOpen(true)
  }

  const handleOpenTherapistModal = (therapist: any) => {
    setSelectedTherapist(therapist)
    setIsTherapistModalOpen(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  const currentBookings = activeTab === 'pending' ? pendingBookings : paidBookings

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">내 예약</h1>
          <Link
            href="/parent/therapists"
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            새 예약 만들기
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* 결제대기 탭일 때만 계좌 정보 표시 */}
        {activeTab === 'pending' && accountInfo && (accountInfo.bankName || accountInfo.accountNumber) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-base font-semibold text-blue-900 mb-3">입금 계좌 안내</h3>
            <div className="space-y-2">
              <p className="text-sm text-blue-800">
                <span className="font-medium">은행:</span> {accountInfo.bankName}
              </p>
              <p className="text-sm text-blue-800">
                <span className="font-medium">계좌번호:</span> {accountInfo.accountNumber}
              </p>
              <p className="text-sm text-blue-800">
                <span className="font-medium">예금주:</span> {accountInfo.accountHolder}
              </p>
            </div>
            <p className="text-xs text-blue-600 mt-3">
              * 입금 후 관리자 확인 시 예약이 자동으로 승인됩니다.
            </p>
          </div>
        )}

        {/* 탭 메뉴 */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'pending'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                결제대기 ({pendingBookings.length})
              </button>
              <button
                onClick={() => setActiveTab('paid')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'paid'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                결제내역 ({paidBookings.length})
              </button>
            </nav>
          </div>
        </div>

        {/* 예약 목록 */}
        {currentBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 mb-4">
              {activeTab === 'pending' ? '결제대기 중인 예약이 없습니다.' : '결제 내역이 없습니다.'}
            </p>
            <Link
              href="/parent/therapists"
              className="inline-block px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              치료사 찾기
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {currentBookings.map((booking) => (
              <div
                key={booking.groupId}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <button
                        onClick={() => handleOpenTherapistModal(booking.therapist)}
                        className="text-lg font-semibold text-green-600 hover:text-green-700 cursor-pointer"
                      >
                        {booking.therapist.user.name} 치료사
                      </button>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          statusLabels[booking.status]?.color || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {statusLabels[booking.status]?.label || booking.status}
                      </span>
                    </div>

                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        👤 자녀:{' '}
                        <button
                          onClick={() => handleOpenChildModal(booking.child)}
                          className="text-green-600 hover:text-green-700 cursor-pointer font-medium"
                        >
                          {booking.child.name}
                        </button>{' '}
                        ({booking.child.gender === 'MALE' ? '남' : '여'})
                      </p>
                      <p>
                        📅 일시:{' '}
                        {new Date(booking.scheduledAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          weekday: 'short',
                        })}{' '}
                        {booking.timeSlot.startTime} - {booking.timeSlot.endTime}
                      </p>
                      <p>
                        💊 유형: {booking.sessionType === 'CONSULTATION' ? '언어 컨설팅' : '홈티'} -{' '}
                        {booking.totalSessions}회
                        {booking.bookingCount > 1 && ` (${booking.bookingCount}건 묶음)`}
                      </p>
                      {activeTab === 'paid' && (
                        <p>
                          📊 진행 상황: {booking.completedSessions} / {booking.totalSessions} 회 완료
                        </p>
                      )}
                      <p className="font-semibold text-gray-900 text-base mt-2">
                        💰 금액: ₩{booking.totalFee.toLocaleString()}
                      </p>
                      {booking.refundAmount && (
                        <p className="text-red-600 text-xs">
                          환불: ₩{booking.refundAmount.toLocaleString()}
                        </p>
                      )}
                      {booking.paidAt && (
                        <p className="text-xs text-green-600">
                          결제 완료: {new Date(booking.paidAt).toLocaleDateString('ko-KR')}
                        </p>
                      )}
                    </div>
                  </div>

                  <Link
                    href={`/parent/bookings/${booking.bookingIds[0]}`}
                    className="ml-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    상세보기
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <ChildInfoModal
        child={selectedChild}
        isOpen={isChildModalOpen}
        onClose={() => setIsChildModalOpen(false)}
      />
      <TherapistInfoModal
        therapist={selectedTherapist}
        isOpen={isTherapistModalOpen}
        onClose={() => setIsTherapistModalOpen(false)}
      />
    </div>
  )
}
