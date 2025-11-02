'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/layout/AdminLayout'
import ParentInfoModal from '@/components/modals/ParentInfoModal'
import TherapistInfoModal from '@/components/modals/TherapistInfoModal'
import ReviewViewModal from '@/components/modals/ReviewViewModal'
import JournalViewModal from '@/components/modals/JournalViewModal'
import { Star } from 'lucide-react'

interface Therapy {
  id: string
  scheduledAt: string
  duration: number
  sessionType: string
  status: string
  paidAt: string | null
  finalFee: number
  sessionCount: number
  completedSessions: number
  createdAt: string
  totalSessions: number
  currentStatus: string // 5단계 상태
  parentUser: {
    id: string
    name: string
    email: string
    phone: string | null
  }
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
  bookings?: Array<{
    id: string
    sessionNumber: number
    status: string
    timeSlot?: {
      id: string
      date: string
      startTime: string
      endTime: string
    }
  }>
}

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING_PAYMENT: { label: '결제대기', color: 'bg-gray-100 text-gray-800' },
  PENDING_CONFIRMATION: { label: '예약대기', color: 'bg-yellow-100 text-yellow-800' },
  CONFIRMED: { label: '진행예정', color: 'bg-blue-100 text-blue-800' },
  COMPLETED: { label: '완료', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: '취소', color: 'bg-red-100 text-red-800' },
}

const specialtyLabels: Record<string, string> = {
  SPEECH_THERAPY: '언어치료',
  PLAY_THERAPY: '놀이치료',
  ART_THERAPY: '미술치료',
  MUSIC_THERAPY: '음악치료',
  BEHAVIORAL_THERAPY: '행동치료',
  SENSORY_INTEGRATION: '감각통합',
  PHYSICAL_THERAPY: '물리치료',
  OCCUPATIONAL_THERAPY: '작업치료',
}

const formatSpecialties = (specialties: string | null) => {
  if (!specialties) return '-'
  try {
    const parsed = JSON.parse(specialties)
    if (Array.isArray(parsed)) {
      return parsed.map(s => specialtyLabels[s] || s).join(', ')
    }
    return specialties
  } catch {
    return specialties
  }
}

export default function AdminTherapiesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [therapies, setTherapies] = useState<Therapy[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'PENDING_PAYMENT' | 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'>('ALL')

  // Modal states
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null)
  const [selectedTherapist, setSelectedTherapist] = useState<any>(null)
  const [isParentModalOpen, setIsParentModalOpen] = useState(false)
  const [isTherapistModalOpen, setIsTherapistModalOpen] = useState(false)
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false)

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

    fetchTherapies()
  }, [session, status, router, filter])

  const fetchTherapies = async () => {
    try {
      const response = await fetch(`/api/admin/therapies?status=${filter}`)
      if (response.ok) {
        const data = await response.json()
        setTherapies(data.therapies || [])
      }
    } catch (error) {
      console.error('홈티 목록 조회 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenParentModal = (parentId: string) => {
    setSelectedParentId(parentId)
    setIsParentModalOpen(true)
  }

  const handleOpenTherapistModal = (therapist: any) => {
    setSelectedTherapist(therapist)
    setIsTherapistModalOpen(true)
  }

  const handleOpenReviewModal = (bookingId: string) => {
    setSelectedBookingId(bookingId)
    setIsReviewModalOpen(true)
  }

  const handleOpenJournalModal = (bookingId: string) => {
    setSelectedBookingId(bookingId)
    setIsJournalModalOpen(true)
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
    <AdminLayout title="홈티 관리">
      <div className="space-y-6">
        {/* 필터 */}
        <div className="bg-white shadow rounded-lg p-4">
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setFilter('ALL')}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: filter === 'ALL' ? '#386646' : '#F3F4F6',
                color: filter === 'ALL' ? '#FFFFFF' : '#374151',
              }}
            >
              전체 ({therapies.length})
            </button>
            <button
              onClick={() => setFilter('PENDING_PAYMENT')}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: filter === 'PENDING_PAYMENT' ? '#386646' : '#F3F4F6',
                color: filter === 'PENDING_PAYMENT' ? '#FFFFFF' : '#374151',
              }}
            >
              결제대기
            </button>
            <button
              onClick={() => setFilter('PENDING_CONFIRMATION')}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: filter === 'PENDING_CONFIRMATION' ? '#386646' : '#F3F4F6',
                color: filter === 'PENDING_CONFIRMATION' ? '#FFFFFF' : '#374151',
              }}
            >
              예약대기
            </button>
            <button
              onClick={() => setFilter('CONFIRMED')}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: filter === 'CONFIRMED' ? '#386646' : '#F3F4F6',
                color: filter === 'CONFIRMED' ? '#FFFFFF' : '#374151',
              }}
            >
              진행예정
            </button>
            <button
              onClick={() => setFilter('COMPLETED')}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: filter === 'COMPLETED' ? '#386646' : '#F3F4F6',
                color: filter === 'COMPLETED' ? '#FFFFFF' : '#374151',
              }}
            >
              완료
            </button>
            <button
              onClick={() => setFilter('CANCELLED')}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: filter === 'CANCELLED' ? '#386646' : '#F3F4F6',
                color: filter === 'CANCELLED' ? '#FFFFFF' : '#374151',
              }}
            >
              취소
            </button>
          </div>
        </div>

        {/* 홈티 목록 */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {therapies.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">홈티 내역이 없습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      부모/아이
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      치료사
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      치료 유형
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      주소
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      일정
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      1회 비용
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      평점
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {therapies.map((therapy) => (
                    <tr key={therapy.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenParentModal(therapy.parentUser.id)}
                          className="text-left"
                        >
                          <div className="text-sm font-medium text-aipoten-green hover:text-aipoten-navy cursor-pointer">
                            {therapy.parentUser.name}
                          </div>
                        </button>
                        <button
                          onClick={() => handleOpenParentModal(therapy.parentUser.id)}
                          className="text-left"
                        >
                          <div className="text-sm text-gray-600 hover:text-aipoten-navy cursor-pointer">
                            {therapy.child.name} ({therapy.child.gender === 'MALE' ? '남' : '여'})
                          </div>
                        </button>
                        <div className="text-xs text-gray-400">
                          {therapy.parentUser.phone || therapy.parentUser.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenTherapistModal(therapy.therapist)}
                          className="text-left"
                        >
                          <div className="text-sm text-aipoten-green hover:text-aipoten-navy cursor-pointer">
                            {therapy.therapist.user.name}
                          </div>
                        </button>
                        <div className="text-xs text-gray-500">
                          {therapy.therapist.user.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {formatSpecialties(therapy.therapist.specialties)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {therapy.therapist.address}
                          {therapy.therapist.addressDetail && `, ${therapy.therapist.addressDetail}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {therapy.bookings?.[0]?.timeSlot?.date
                            ? new Date(therapy.bookings[0].timeSlot.date).toLocaleDateString('ko-KR')
                            : new Date(therapy.scheduledAt).toLocaleDateString('ko-KR')}
                        </div>
                        <div className="text-sm text-gray-500">
                          {therapy.bookings?.[0]?.timeSlot?.startTime && therapy.bookings?.[0]?.timeSlot?.endTime
                            ? `${therapy.bookings[0].timeSlot.startTime} - ${therapy.bookings[0].timeSlot.endTime}`
                            : '시간 미정'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ₩{therapy.therapist.sessionFee?.toLocaleString() || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {therapy.bookings?.[0]?.review ? (
                          <div className="flex items-center justify-center space-x-1">
                            <Star className="fill-yellow-400 text-yellow-400" size={16} />
                            <span className="text-sm font-semibold text-gray-900">
                              {therapy.bookings[0].review.rating}.0
                            </span>
                          </div>
                        ) : (
                          <div className="text-center text-sm text-gray-400">-</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            statusLabels[therapy.currentStatus]?.color || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {statusLabels[therapy.currentStatus]?.label || therapy.currentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {therapy.bookings?.[0]?.review && (
                            <button
                              onClick={() => handleOpenReviewModal(therapy.bookings[0].id)}
                              className="px-3 py-1 bg-yellow-500 text-white text-xs font-medium rounded hover:bg-yellow-600 transition-colors"
                            >
                              리뷰보기
                            </button>
                          )}
                          {therapy.bookings?.[0]?.therapistNote && (
                            <button
                              onClick={() => handleOpenJournalModal(therapy.bookings[0].id)}
                              className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors"
                            >
                              상담일지
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ParentInfoModal
        parentId={selectedParentId}
        isOpen={isParentModalOpen}
        onClose={() => setIsParentModalOpen(false)}
      />
      <TherapistInfoModal
        therapist={selectedTherapist}
        isOpen={isTherapistModalOpen}
        onClose={() => setIsTherapistModalOpen(false)}
      />
      <ReviewViewModal
        bookingId={selectedBookingId}
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
      />
      <JournalViewModal
        bookingId={selectedBookingId}
        isOpen={isJournalModalOpen}
        onClose={() => setIsJournalModalOpen(false)}
      />
    </AdminLayout>
  )
}
