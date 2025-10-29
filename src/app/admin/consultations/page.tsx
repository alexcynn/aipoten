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
  settlementAmount: number | null
  settledAt: string | null
  settlementNote: string | null
  createdAt: string
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
  timeSlot: {
    date: string
    startTime: string
    endTime: string
  }
}

interface AccountInfo {
  bankName: string | null
  accountNumber: string | null
  accountHolder: string | null
  consultationBaseFee: number | null
}

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING_PAYMENT: { label: '결제대기', color: 'bg-gray-100 text-gray-800' },
  BOOKING_IN_PROGRESS: { label: '예약 중', color: 'bg-yellow-100 text-yellow-800' },
  CONFIRMED: { label: '예약 확인', color: 'bg-blue-100 text-blue-800' },
  SESSION_COMPLETED: { label: '세션 완료', color: 'bg-green-100 text-green-800' },
  SETTLEMENT_COMPLETED: { label: '정산 완료', color: 'bg-purple-100 text-purple-800' },
  REFUNDED: { label: '환불', color: 'bg-red-100 text-red-800' },
  CANCELLED: { label: '취소', color: 'bg-red-100 text-red-800' },
  // 레거시
  PENDING_CONFIRMATION: { label: '예약 중', color: 'bg-yellow-100 text-yellow-800' },
  IN_PROGRESS: { label: '진행 중', color: 'bg-blue-100 text-blue-800' },
  COMPLETED: { label: '완료', color: 'bg-gray-100 text-gray-800' },
}

export default function AdminConsultationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'>('ALL')

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

  const handleStatusChange = async (id: string, newStatus: string) => {
    if (!confirm(`상태를 "${statusLabels[newStatus]?.label}"(으)로 변경하시겠습니까?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/bookings/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: '상태가 변경되었습니다.' })
        fetchConsultations()
      } else {
        const data = await response.json()
        setMessage({ type: 'error', text: data.error || '상태 변경 중 오류가 발생했습니다.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '서버 오류가 발생했습니다.' })
    }

    setTimeout(() => setMessage(null), 3000)
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
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'ALL'
                  ? 'bg-aipoten-green text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              전체 ({consultations.length})
            </button>
            <button
              onClick={() => setFilter('PENDING')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'PENDING'
                  ? 'bg-aipoten-green text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              결제 대기
            </button>
            <button
              onClick={() => setFilter('IN_PROGRESS')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'IN_PROGRESS'
                  ? 'bg-aipoten-green text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              진행 중
            </button>
            <button
              onClick={() => setFilter('COMPLETED')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'COMPLETED'
                  ? 'bg-aipoten-green text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              완료/취소
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
                      일정
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      세션 진행
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(consultation.scheduledAt).toLocaleDateString('ko-KR')}
                        </div>
                        <div className="text-sm text-gray-500">
                          {consultation.timeSlot.startTime} - {consultation.timeSlot.endTime}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {consultation.completedSessions} / {consultation.sessionCount} 회
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-aipoten-green h-2 rounded-full"
                            style={{
                              width: `${(consultation.completedSessions / consultation.sessionCount) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={consultation.status}
                          onChange={(e) => handleStatusChange(consultation.id, e.target.value)}
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            statusLabels[consultation.status]?.color || 'bg-gray-100 text-gray-800'
                          } border-none cursor-pointer`}
                        >
                          <option value="PENDING_PAYMENT">결제대기</option>
                          <option value="BOOKING_IN_PROGRESS">예약 중</option>
                          <option value="CONFIRMED">예약 확인</option>
                          <option value="SESSION_COMPLETED">세션 완료</option>
                          <option value="SETTLEMENT_COMPLETED">정산 완료</option>
                          <option value="REFUNDED">환불</option>
                          <option value="CANCELLED">취소</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <a
                          href={`/admin/consultations/${consultation.id}`}
                          className="text-aipoten-green hover:text-aipoten-navy"
                        >
                          상세보기
                        </a>
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
