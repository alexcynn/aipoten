'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/layout/AdminLayout'
import ChildInfoModal from '@/components/modals/ChildInfoModal'
import TherapistInfoModal from '@/components/modals/TherapistInfoModal'

interface Consultation {
  id: string
  scheduledAt: string
  duration: number
  sessionType: string
  status: string
  paidAt: string | null
  finalFee: number
  originalFee: number
  completedSessions: number
  sessionCount: number
  totalSessions: number
  settlementAmount: number | null
  settledAt: string | null
  settlementNote: string | null
  createdAt: string
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

interface AccountInfo {
  bankName: string | null
  accountNumber: string | null
  accountHolder: string | null
  consultationBaseFee: number | null
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

export default function AdminConsultationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'PENDING_PAYMENT' | 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'>('ALL')

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Modal states
  const [selectedChild, setSelectedChild] = useState<any>(null)
  const [selectedTherapist, setSelectedTherapist] = useState<any>(null)
  const [isChildModalOpen, setIsChildModalOpen] = useState(false)
  const [isTherapistModalOpen, setIsTherapistModalOpen] = useState(false)

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

    fetchConsultations()
  }, [session, status, router, filter])

  const fetchConsultations = async () => {
    try {
      const response = await fetch(`/api/admin/consultations?status=${filter}`)
      if (response.ok) {
        const data = await response.json()
        setConsultations(data.consultations || [])
        setAccountInfo(data.accountInfo || null)
      }
    } catch (error) {
      console.error('컨설팅 목록 조회 오류:', error)
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
    <AdminLayout title="언어 컨설팅 관리">
      <div className="space-y-6">
        {/* 메시지 */}
        {message && (
          <div
            className={`p-4 rounded-md ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* 계좌 정보 */}
        {accountInfo && (accountInfo.bankName || accountInfo.accountNumber) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">아이포텐 입금 계좌 정보</h3>
            <p className="text-sm text-blue-800">
              {accountInfo.bankName} {accountInfo.accountNumber} ({accountInfo.accountHolder})
            </p>
            <p className="text-xs text-blue-600 mt-1">
              기본 요금: ₩{accountInfo.consultationBaseFee?.toLocaleString()}
            </p>
          </div>
        )}

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
              전체 ({consultations.length})
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

        {/* 컨설팅 목록 */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {consultations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">언어 컨설팅 내역이 없습니다.</p>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {consultations.map((consultation) => (
                    <tr key={consultation.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {consultation.parentUser.name}
                        </div>
                        <button
                          onClick={() => handleOpenChildModal(consultation.child)}
                          className="text-left"
                        >
                          <div className="text-sm text-aipoten-green hover:text-aipoten-navy cursor-pointer">
                            {consultation.child.name} ({consultation.child.gender === 'MALE' ? '남' : '여'})
                          </div>
                        </button>
                        <div className="text-xs text-gray-400">
                          {consultation.parentUser.phone || consultation.parentUser.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenTherapistModal(consultation.therapist)}
                          className="text-left"
                        >
                          <div className="text-sm text-aipoten-green hover:text-aipoten-navy cursor-pointer">
                            {consultation.therapist.user.name}
                          </div>
                        </button>
                        <div className="text-xs text-gray-500">
                          {consultation.therapist.user.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {formatSpecialties(consultation.therapist.specialties)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {consultation.therapist.address}
                          {consultation.therapist.addressDetail && `, ${consultation.therapist.addressDetail}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {consultation.bookings?.[0]?.timeSlot?.date
                            ? new Date(consultation.bookings[0].timeSlot.date).toLocaleDateString('ko-KR')
                            : new Date(consultation.scheduledAt).toLocaleDateString('ko-KR')}
                        </div>
                        <div className="text-sm text-gray-500">
                          {consultation.bookings?.[0]?.timeSlot?.startTime && consultation.bookings?.[0]?.timeSlot?.endTime
                            ? `${consultation.bookings[0].timeSlot.startTime} - ${consultation.bookings[0].timeSlot.endTime}`
                            : '시간 미정'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ₩{consultation.therapist.sessionFee?.toLocaleString() || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            statusLabels[consultation.currentStatus]?.color || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {statusLabels[consultation.currentStatus]?.label || consultation.currentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col gap-1">
                          <a
                            href={`/admin/consultations/${consultation.id}`}
                            className="text-aipoten-green hover:text-aipoten-navy"
                          >
                            상세보기
                          </a>
                          {consultation.currentStatus === 'COMPLETED' && (
                            <a
                              href={`/admin/consultations/${consultation.id}/journal`}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              상담일지
                            </a>
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
    </AdminLayout>
  )
}
