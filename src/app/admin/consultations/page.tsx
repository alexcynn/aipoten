'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/layout/AdminLayout'
import AdminBookingDetailModal from '@/components/modals/AdminBookingDetailModal'
import ParentInfoModal from '@/components/modals/ParentInfoModal'
import TherapistInfoModal from '@/components/modals/TherapistInfoModal'
import ReviewViewModal from '@/components/modals/ReviewViewModal'
import JournalViewModal from '@/components/modals/JournalViewModal'
import { Star, FileText, Eye, CreditCard } from 'lucide-react'

interface Consultation {
  id: string
  scheduledAt: string
  status: string
  therapistNote: string | null
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
    bank: string | null
    accountNumber: string | null
    accountHolder: string | null
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
  review: {
    id: string
    rating: number
    content: string | null
    createdAt: string
  } | null
  payment: {
    id: string
    finalFee: number
    status: string
    sessionType: string
    totalSessions: number
    originalFee: number
    discountRate: number
    paidAt: string | null
    settlementAmount: number | null
    settledAt: string | null
    settlementNote: string | null
  }
}

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING_PAYMENT: { label: '결제대기', color: 'bg-stone-100 text-stone-800' },
  PENDING_CONFIRMATION: { label: '예약대기', color: 'bg-yellow-100 text-yellow-800' },
  CONFIRMED: { label: '진행예정', color: 'bg-[#FFE5E5] text-[#FF6A00]' },
  PENDING_SETTLEMENT: { label: '정산대기', color: 'bg-purple-100 text-purple-800' },
  SETTLEMENT_COMPLETED: { label: '정산완료', color: 'bg-[#FFE5E5] text-[#FF6A00]' },
  COMPLETED: { label: '완료', color: 'bg-[#FFE5E5] text-[#FF6A00]' },
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

// 날짜 기본값 계산 함수
const getDefaultDates = () => {
  const today = new Date()
  const oneMonthAgo = new Date(today)
  oneMonthAgo.setMonth(today.getMonth() - 1)

  return {
    startDate: oneMonthAgo.toISOString().split('T')[0],
    endDate: today.toISOString().split('T')[0]
  }
}

export default function AdminConsultationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [allConsultations, setAllConsultations] = useState<Consultation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'PENDING_PAYMENT' | 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'PENDING_SETTLEMENT' | 'SETTLEMENT_COMPLETED' | 'CANCELLED'>('ALL')

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // 날짜 검색
  const defaultDates = getDefaultDates()
  const [startDate, setStartDate] = useState(defaultDates.startDate)
  const [endDate, setEndDate] = useState(defaultDates.endDate)

  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

  // Modal states
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null)
  const [selectedTherapist, setSelectedTherapist] = useState<any>(null)
  const [isParentModalOpen, setIsParentModalOpen] = useState(false)
  const [isTherapistModalOpen, setIsTherapistModalOpen] = useState(false)
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

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
  }, [session, status, router, filter, startDate, endDate])

  // 페이지 변경시 페이지네이션 적용
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    setConsultations(allConsultations.slice(startIndex, endIndex))
  }, [currentPage, allConsultations])

  const fetchConsultations = async () => {
    try {
      console.log('🔍 [관리자] 언어 컨설팅 API 호출, 필터:', filter)

      let url = `/api/admin/consultations?status=${filter}`
      if (startDate) url += `&startDate=${startDate}`
      if (endDate) url += `&endDate=${endDate}`

      const response = await fetch(url)
      console.log('🔍 [관리자] API 응답 상태:', response.status, response.ok)

      if (response.ok) {
        const data = await response.json()
        console.log('🔍 [관리자] 응답 데이터:', data)
        console.log('🔍 [관리자] 컨설팅 수:', data.consultations?.length || 0)

        setAllConsultations(data.consultations || [])
        setCurrentPage(1) // 검색 시 첫 페이지로
      } else {
        const errorText = await response.text()
        console.error('❌ [관리자] API 오류 응답:', response.status, errorText)
      }
    } catch (error) {
      console.error('❌ [관리자] 컨설팅 목록 조회 오류:', error)
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

  const handleOpenDetailModal = (bookingId: string) => {
    setSelectedBookingId(bookingId)
    setIsDetailModalOpen(true)
  }

  const handleSettlement = async (bookingId: string) => {
    if (!confirm('정산을 진행하시겠습니까?')) return

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/settlement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: '정산이 완료되었습니다.' })
        fetchConsultations()
      } else {
        const data = await response.json()
        setMessage({ type: 'error', text: data.error || '정산에 실패했습니다.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '서버 오류가 발생했습니다.' })
    }
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
    <AdminLayout title="언어 컨설팅 관리">
      <div className="space-y-6">
        {/* 메시지 */}
        {message && (
          <div
            className={`p-4 rounded-xl font-pretendard ${
              message.type === 'success'
                ? 'bg-[#FFE5E5] text-[#FF6A00] border border-orange-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* 필터 */}
        <div className="bg-white shadow rounded-xl p-4">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-4 py-2 rounded-[10px] text-sm font-medium font-pretendard transition-colors ${
                filter === 'ALL'
                  ? 'bg-[#FF6A00] text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              전체 ({allConsultations.length})
            </button>
            <button
              onClick={() => setFilter('PENDING_PAYMENT')}
              className={`px-4 py-2 rounded-[10px] text-sm font-medium font-pretendard transition-colors ${
                filter === 'PENDING_PAYMENT'
                  ? 'bg-[#FF6A00] text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              결제대기
            </button>
            <button
              onClick={() => setFilter('PENDING_CONFIRMATION')}
              className={`px-4 py-2 rounded-[10px] text-sm font-medium font-pretendard transition-colors ${
                filter === 'PENDING_CONFIRMATION'
                  ? 'bg-[#FF6A00] text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              예약대기
            </button>
            <button
              onClick={() => setFilter('CONFIRMED')}
              className={`px-4 py-2 rounded-[10px] text-sm font-medium font-pretendard transition-colors ${
                filter === 'CONFIRMED'
                  ? 'bg-[#FF6A00] text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              진행예정
            </button>
            <button
              onClick={() => setFilter('PENDING_SETTLEMENT')}
              className={`px-4 py-2 rounded-[10px] text-sm font-medium font-pretendard transition-colors ${
                filter === 'PENDING_SETTLEMENT'
                  ? 'bg-[#FF6A00] text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              정산대기
            </button>
            <button
              onClick={() => setFilter('SETTLEMENT_COMPLETED')}
              className={`px-4 py-2 rounded-[10px] text-sm font-medium font-pretendard transition-colors ${
                filter === 'SETTLEMENT_COMPLETED'
                  ? 'bg-[#FF6A00] text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              정산완료
            </button>
            <button
              onClick={() => setFilter('CANCELLED')}
              className={`px-4 py-2 rounded-[10px] text-sm font-medium font-pretendard transition-colors ${
                filter === 'CANCELLED'
                  ? 'bg-[#FF6A00] text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              취소
            </button>
          </div>
        </div>

        {/* 날짜 검색 */}
        <div className="bg-white shadow rounded-xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2 font-pretendard">시작일</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:border-transparent font-pretendard"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2 font-pretendard">종료일</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:border-transparent font-pretendard"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchConsultations}
                className="w-full px-4 py-2 bg-[#FF6A00] text-white rounded-[10px] hover:bg-[#E55F00] transition-colors font-pretendard"
              >
                검색
              </button>
            </div>
          </div>
        </div>

        {/* 컨설팅 목록 */}
        <div className="bg-white shadow rounded-xl overflow-hidden">
          {consultations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-stone-500 font-pretendard">언어 컨설팅 내역이 없습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#F9F9F9]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider font-pretendard">
                      부모/아이
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider font-pretendard">
                      치료사
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider font-pretendard">
                      일정
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider font-pretendard">
                      금액
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider font-pretendard">
                      상담일지
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider font-pretendard">
                      후기
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider font-pretendard">
                      정산
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider font-pretendard">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider font-pretendard">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {consultations.map((consultation) => (
                    <tr key={consultation.id} className="hover:bg-[#FFF5F0]">
                      {/* 부모/아이 */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenParentModal(consultation.parentUser.id)}
                          className="text-left"
                        >
                          <div className="text-sm font-medium text-[#FF6A00] hover:text-[#E55F00] cursor-pointer font-pretendard">
                            {consultation.parentUser.name}
                          </div>
                          <div className="text-sm text-stone-600 hover:text-[#FF6A00] cursor-pointer font-pretendard">
                            {consultation.child.name} ({consultation.child.gender === 'MALE' ? '남' : '여'})
                          </div>
                        </button>
                      </td>

                      {/* 치료사 */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenTherapistModal(consultation.therapist)}
                          className="text-left"
                        >
                          <div className="text-sm text-[#FF6A00] hover:text-[#E55F00] cursor-pointer font-pretendard">
                            {consultation.therapist.user.name}
                          </div>
                        </button>
                      </td>

                      {/* 일정 */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-stone-900 font-pretendard">
                          {new Date(consultation.scheduledAt).toLocaleDateString('ko-KR')}
                        </div>
                      </td>

                      {/* 금액 */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-stone-900 font-pretendard">
                          ₩{consultation.payment.finalFee.toLocaleString()}
                        </div>
                        {consultation.payment.settlementAmount && (
                          <div className="text-xs text-[#FF6A00] font-pretendard">
                            정산: ₩{consultation.payment.settlementAmount.toLocaleString()}
                          </div>
                        )}
                      </td>

                      {/* 상담일지 */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {consultation.therapistNote ? (
                          <button
                            onClick={() => handleOpenJournalModal(consultation.id)}
                            className="inline-flex items-center px-2 py-1 bg-[#FFE5E5] text-[#FF6A00] text-xs font-medium rounded-[10px] hover:bg-orange-200 transition-colors font-pretendard"
                          >
                            <FileText size={14} className="mr-1" />
                            보기
                          </button>
                        ) : (
                          <span className="text-stone-400 text-xs font-pretendard">-</span>
                        )}
                      </td>

                      {/* 후기 */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {consultation.review ? (
                          <button
                            onClick={() => handleOpenReviewModal(consultation.id)}
                            className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-[10px] hover:bg-yellow-200 transition-colors font-pretendard"
                          >
                            <Star size={14} className="mr-1 fill-yellow-400 text-yellow-400" />
                            {consultation.review.rating}.0
                          </button>
                        ) : (
                          <span className="text-stone-400 text-xs font-pretendard">-</span>
                        )}
                      </td>

                      {/* 정산 */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {consultation.payment.settledAt ? (
                          <span className="inline-flex items-center px-2 py-1 bg-[#FFE5E5] text-[#FF6A00] text-xs font-medium rounded-[10px] font-pretendard">
                            완료
                          </span>
                        ) : consultation.currentStatus === 'PENDING_SETTLEMENT' ? (
                          <button
                            onClick={() => handleSettlement(consultation.id)}
                            className="inline-flex items-center px-2 py-1 bg-[#FF6A00] text-white text-xs font-medium rounded-[10px] hover:bg-[#E55F00] transition-colors font-pretendard"
                          >
                            <CreditCard size={14} className="mr-1" />
                            정산
                          </button>
                        ) : (
                          <span className="text-stone-400 text-xs font-pretendard">-</span>
                        )}
                      </td>

                      {/* 상태 */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full font-pretendard ${
                            statusLabels[consultation.currentStatus]?.color || 'bg-stone-100 text-stone-800'
                          }`}
                        >
                          {statusLabels[consultation.currentStatus]?.label || consultation.currentStatus}
                        </span>
                      </td>

                      {/* 작업 */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleOpenDetailModal(consultation.id)}
                          className="inline-flex items-center px-3 py-1 bg-stone-600 text-white text-xs font-medium rounded-[10px] hover:bg-stone-700 transition-colors font-pretendard"
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

        {/* 페이지네이션 */}
        {allConsultations.length > itemsPerPage && (
          <div className="bg-white shadow rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-stone-700 font-pretendard">
                전체 {allConsultations.length}건 중 {Math.min((currentPage - 1) * itemsPerPage + 1, allConsultations.length)}-{Math.min(currentPage * itemsPerPage, allConsultations.length)}건 표시
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-[10px] text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-pretendard"
                >
                  이전
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.ceil(allConsultations.length / itemsPerPage) }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 border rounded-[10px] text-sm font-medium transition-colors font-pretendard ${
                        currentPage === page
                          ? 'bg-[#FF6A00] text-white border-[#FF6A00]'
                          : 'border-gray-300 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(allConsultations.length / itemsPerPage), prev + 1))}
                  disabled={currentPage === Math.ceil(allConsultations.length / itemsPerPage)}
                  className="px-3 py-1 border border-gray-300 rounded-[10px] text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-pretendard"
                >
                  다음
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AdminBookingDetailModal
        bookingId={selectedBookingId}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onUpdate={fetchConsultations}
      />
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
