'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/layout/AdminLayout'
import Pagination from '@/components/admin/Pagination'

interface Certification {
  id: string
  name: string
  issuingOrganization: string
  issueDate: string
  filePath?: string
}

interface Experience {
  id: string
  employmentType: string
  institutionName?: string
  specialty: string
  startDate: string
  endDate?: string
  description?: string
}

interface Education {
  id?: string
  degree: string
  school: string
  major: string
  graduationYear: string
}

interface PendingUpdateRequest {
  id: string
  requestData: {
    name: string
    gender?: string
    birthYear?: number
    phone?: string
    address?: string
    addressDetail?: string
    specialties: string[]
    childAgeRanges: string[]
    serviceAreas: string[]
    sessionFee?: number
    education?: string
    educations?: Education[]
    isPreTherapist: boolean
    certifications: any[]
    experiences: any[]
  }
  memo?: string
  requestedAt: string
}

interface TherapistProfile {
  id: string
  user: {
    name: string
    email: string
    phone: string
  }
  gender?: string
  birthYear?: number
  address?: string
  specialties: string[]
  childAgeRanges: string[]
  serviceAreas: string[]
  sessionFee?: number
  education?: string
  educations?: Education[]
  isPreTherapist?: boolean
  certifications: Certification[]
  experiences: Experience[]
  approvalStatus: string
  status: string
  approvedAt?: string
  rejectedAt?: string
  rejectionReason?: string
  additionalInfoRequested?: string
  profileUpdateRequested?: boolean
  profileUpdateRequestedAt?: string
  profileUpdateNote?: string
  profileUpdateApprovedAt?: string
  pendingUpdateRequest?: PendingUpdateRequest | null
  canDoConsultation?: boolean
  consultationFee?: number
  consultationSettlementAmount?: number
  createdAt: string
}

export default function AdminTherapistsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [therapists, setTherapists] = useState<TherapistProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'list' | 'updateRequests'>('list')
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'WAITING' | 'APPROVED' | 'REJECTED'>('WAITING')
  const [searchTerm, setSearchTerm] = useState('')
  const [specialtyFilter, setSpecialtyFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedTherapist, setSelectedTherapist] = useState<TherapistProfile | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newStatus, setNewStatus] = useState<string>('')
  const [modalDetailTab, setModalDetailTab] = useState<'info' | 'education' | 'certifications' | 'experience'>('info')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

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

    fetchTherapists()
  }, [session, status, router])

  // Reset to page 1 when search term or specialty filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, specialtyFilter])

  const fetchTherapists = async () => {
    try {
      // 항상 모든 치료사 데이터를 가져옴 (클라이언트 사이드 필터링)
      const response = await fetch(`/api/admin/therapists`)
      if (response.ok) {
        const data = await response.json()
        setTherapists(data)
      }
    } catch (error) {
      console.error('치료사 목록을 가져오는 중 오류 발생:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const openModal = (therapist: TherapistProfile) => {
    setSelectedTherapist(therapist)
    setNewStatus(therapist.approvalStatus)
    setModalDetailTab('info')
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedTherapist(null)
    setNewStatus('')
  }

  const handleStatusChange = async () => {
    if (!selectedTherapist || !newStatus) return
    if (newStatus === selectedTherapist.approvalStatus) {
      alert('현재 상태와 동일합니다.')
      return
    }

    // REJECTED로 변경 시 사유 입력 필요
    let reason = ''
    if (newStatus === 'REJECTED') {
      reason = prompt('반려 사유를 입력해주세요:')
      if (!reason) return
    }

    if (!confirm(`상태를 "${getStatusLabel(newStatus)}"(으)로 변경하시겠습니까?`)) return

    try {
      let endpoint = ''
      let body: any = {}

      if (newStatus === 'REJECTED') {
        endpoint = `/api/admin/therapists/${selectedTherapist.id}/reject`
        body = { reason }
      } else {
        // APPROVED, PENDING, WAITING 모두 update-status API 사용
        endpoint = `/api/admin/therapists/${selectedTherapist.id}/update-status`
        body = { status: newStatus }
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        alert('상태가 변경되었습니다.')
        await fetchTherapists()
        closeModal()
      } else {
        const data = await response.json()
        alert(data.error || '상태 변경에 실패했습니다.')
      }
    } catch (error) {
      console.error('상태 변경 중 오류 발생:', error)
      alert('상태 변경 중 오류가 발생했습니다.')
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      PENDING: '신청',
      WAITING: '대기',
      APPROVED: '승인됨',
      REJECTED: '거부됨'
    }
    return labels[status] || status
  }

  const handleApproveProfileUpdate = async (therapistId: string) => {
    if (!confirm('프로필 수정 요청을 승인하시겠습니까?')) return

    try {
      const response = await fetch(`/api/admin/therapists/${therapistId}/approve-profile-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        alert('프로필 수정 요청이 승인되었습니다.')
        await fetchTherapists()
        closeModal()
      } else {
        const data = await response.json()
        alert(data.error || '승인에 실패했습니다.')
      }
    } catch (error) {
      console.error('프로필 수정 승인 중 오류 발생:', error)
      alert('승인 중 오류가 발생했습니다.')
    }
  }

  const handleRejectProfileUpdate = async (therapistId: string) => {
    const reason = prompt('프로필 수정 요청 거부 사유를 입력해주세요:')
    if (!reason) return

    if (!confirm('프로필 수정 요청을 거부하시겠습니까?')) return

    try {
      const response = await fetch(`/api/admin/therapists/${therapistId}/reject-profile-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      })

      if (response.ok) {
        alert('프로필 수정 요청이 거부되었습니다.')
        await fetchTherapists()
        closeModal()
      } else {
        const data = await response.json()
        alert(data.error || '거부에 실패했습니다.')
      }
    } catch (error) {
      console.error('프로필 수정 거부 중 오류 발생:', error)
      alert('거부 중 오류가 발생했습니다.')
    }
  }

  const handleApprove = async (therapistId: string) => {
    if (!confirm('이 치료사를 승인하시겠습니까?')) return

    try {
      const response = await fetch(`/api/admin/therapists/${therapistId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        alert('치료사가 승인되었습니다.')
        await fetchTherapists()
        closeModal()
      } else {
        const data = await response.json()
        alert(data.error || '승인에 실패했습니다.')
      }
    } catch (error) {
      console.error('치료사 승인 중 오류 발생:', error)
      alert('승인 중 오류가 발생했습니다.')
    }
  }

  const handleReject = async (therapistId: string) => {
    const reason = prompt('반려 사유를 입력해주세요:')
    if (!reason) return

    try {
      const response = await fetch(`/api/admin/therapists/${therapistId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      })

      if (response.ok) {
        alert('치료사 신청이 반려되었습니다.')
        await fetchTherapists()
        closeModal()
      } else {
        const data = await response.json()
        alert(data.error || '반려에 실패했습니다.')
      }
    } catch (error) {
      console.error('치료사 반려 중 오류 발생:', error)
      alert('반려 중 오류가 발생했습니다.')
    }
  }

  const handleToggleConsultation = async (
    therapistId: string,
    currentValue: boolean,
    consultationFee?: number,
    consultationSettlementAmount?: number
  ) => {
    const newValue = !currentValue

    // 권한 제거하는 경우
    if (!newValue) {
      const message = '이 치료사의 언어 컨설팅 권한을 제거하시겠습니까?'
      if (!confirm(message)) return
    }
    // 권한 부여하는 경우 - 비용 입력 필요
    else {
      // 모달이 열려있는 경우 입력 필드에서 값을 가져옴
      // 모달이 닫혀있는 경우 프롬프트로 입력받음
      if (!selectedTherapist) {
        alert('치료사 상세 정보를 먼저 열어주세요.')
        return
      }
    }

    try {
      const body: any = { canDoConsultation: newValue }

      // 권한을 부여하는 경우 비용과 정산금도 함께 전송
      if (newValue) {
        if (consultationFee !== undefined) {
          body.consultationFee = consultationFee
        }
        if (consultationSettlementAmount !== undefined) {
          body.consultationSettlementAmount = consultationSettlementAmount
        }
      }

      const response = await fetch(`/api/admin/therapists/${therapistId}/update-consultation-permission`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        const data = await response.json()
        alert(data.message || '언어 컨설팅 권한이 변경되었습니다.')
        await fetchTherapists()
        // Update the selected therapist state
        if (selectedTherapist && selectedTherapist.id === therapistId) {
          setSelectedTherapist({
            ...selectedTherapist,
            canDoConsultation: newValue,
            consultationFee: data.therapistProfile.consultationFee,
            consultationSettlementAmount: data.therapistProfile.consultationSettlementAmount
          })
        }
      } else {
        const data = await response.json()
        alert(data.error || '권한 변경에 실패했습니다.')
      }
    } catch (error) {
      console.error('권한 변경 중 오류 발생:', error)
      alert('권한 변경 중 오류가 발생했습니다.')
    }
  }


  // 통계 계산 (전체 데이터 기준)
  const stats = {
    total: therapists.length,
    pending: therapists.filter(t => t.approvalStatus === 'PENDING').length,
    waiting: therapists.filter(t => t.approvalStatus === 'WAITING').length,
    approved: therapists.filter(t => t.approvalStatus === 'APPROVED').length,
    rejected: therapists.filter(t => t.approvalStatus === 'REJECTED').length,
    updateRequests: therapists.filter(t => t.profileUpdateRequested === true).length,
  }

  // 프로필 수정 요청 리스트
  const updateRequestTherapists = therapists.filter(t => t.profileUpdateRequested === true)

  // 필터링된 결과 (상태 필터 적용)
  const statusFilteredTherapists = activeTab === 'updateRequests'
    ? updateRequestTherapists
    : therapists.filter(therapist => {
        if (filter === 'ALL') return true
        return therapist.approvalStatus === filter
      })

  // 검색 및 전문분야 필터 적용
  const filteredTherapists = statusFilteredTherapists.filter(therapist => {
    // 검색어 필터
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const matchesName = therapist.user.name.toLowerCase().includes(searchLower)
      const matchesEmail = therapist.user.email.toLowerCase().includes(searchLower)
      const matchesPhone = therapist.user.phone.includes(searchTerm)
      if (!matchesName && !matchesEmail && !matchesPhone) return false
    }

    // 전문분야 필터
    if (specialtyFilter && !therapist.specialties.includes(specialtyFilter)) {
      return false
    }

    return true
  })

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredTherapists.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedTherapists = filteredTherapists.slice(startIndex, endIndex)

  // 각 탭의 숫자 계산 (전체 데이터 기준, 단 activeTab이 updateRequests일 때는 제외)
  const getFilterCount = (statusFilter: string) => {
    // 프로필 수정 요청 탭에서는 필터 숫자를 표시하지 않음
    if (activeTab === 'updateRequests') {
      return 0
    }

    if (statusFilter === 'ALL') {
      return therapists.length
    }
    return therapists.filter(t => t.approvalStatus === statusFilter).length
  }

  const getSpecialtyLabel = (specialty: string) => {
    const labels: { [key: string]: string } = {
      SPEECH_THERAPY: '언어치료',
      SENSORY_INTEGRATION: '감각통합',
      PLAY_THERAPY: '놀이치료',
      ART_THERAPY: '미술치료',
      MUSIC_THERAPY: '음악치료',
      OCCUPATIONAL_THERAPY: '작업치료',
      COGNITIVE_THERAPY: '인지치료',
      BEHAVIORAL_THERAPY: '행동치료',
    }
    return labels[specialty] || specialty
  }

  const getDegreeLabel = (degree: string) => {
    const labels: { [key: string]: string } = {
      HIGH_SCHOOL: '고등학교 졸업',
      ASSOCIATE: '전문학사',
      BACHELOR: '학사',
      MASTER: '석사',
      DOCTORATE: '박사',
    }
    return labels[degree] || degree
  }

  const getAgeRangeLabel = (ageRange: string) => {
    const labels: { [key: string]: string } = {
      AGE_0_12: '0-12개월',
      AGE_13_24: '13-24개월',
      AGE_25_36: '25-36개월',
      AGE_37_48: '37-48개월',
      AGE_49_60: '49-60개월',
      AGE_5_7: '5-7세',
      AGE_8_PLUS: '8세 이상',
    }
    return labels[ageRange] || ageRange
  }

  const getServiceAreaLabel = (area: string) => {
    const labels: { [key: string]: string } = {
      GANGNAM: '강남구',
      SEOCHO: '서초구',
      SONGPA: '송파구',
      GANGDONG: '강동구',
      GWANGJIN: '광진구',
      SEONGDONG: '성동구',
      JUNG: '중구',
      YONGSAN: '용산구',
      SEONGBUK: '성북구',
      GANGBUK: '강북구',
      DOBONG: '도봉구',
      NOWON: '노원구',
      EUNPYEONG: '은평구',
      SEODAEMUN: '서대문구',
      MAPO: '마포구',
      YANGCHEON: '양천구',
      GANGSEO: '강서구',
      GURO: '구로구',
      GEUMCHEON: '금천구',
      YEONGDEUNGPO: '영등포구',
      DONGJAK: '동작구',
      GWANAK: '관악구',
      DONGDAEMUN: '동대문구',
      JUNGNANG: '중랑구',
      JONGNO: '종로구',
    }
    return labels[area] || area
  }

  const getStatusBadge = (status: string) => {
    const badges: { [key: string]: { bg: string; text: string; label: string } } = {
      PENDING: { bg: 'bg-[#FFE5E5]', text: 'text-[#FF6A00]', label: '신청' },
      WAITING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '대기' },
      APPROVED: { bg: 'bg-[#FFE5E5]', text: 'text-[#FF6A00]', label: '승인됨' },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-800', label: '거부됨' }
    }
    const badge = badges[status] || badges.WAITING
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full font-pretendard ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    )
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
    <AdminLayout title="치료사 관리">
      <div className="space-y-6">
        {/* 통계 */}
        <div className="bg-white shadow rounded-xl p-6">
          <div className="flex justify-between items-center">
            <p className="text-stone-600 font-pretendard">
              치료사 가입 승인 및 프로필 관리를 할 수 있습니다.
            </p>
            <div className="flex items-center space-x-4 text-sm font-pretendard">
              <div>
                전체 <span className="font-semibold text-stone-900">{stats.total}</span>명
                <span className="mx-2">|</span>
                신청 <span className="font-semibold text-[#FF6A00]">{stats.pending}</span>명
                <span className="mx-2">|</span>
                대기 <span className="font-semibold text-yellow-600">{stats.waiting}</span>명
                <span className="mx-2">|</span>
                수정 요청 <span className="font-semibold text-[#FF6A00]">{stats.updateRequests}</span>명
              </div>
            </div>
          </div>
        </div>

        {/* Main Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => {
                setActiveTab('list')
                setFilter('ALL')
                setSearchTerm('')
                setSpecialtyFilter('')
                setCurrentPage(1)
              }}
              className={`py-3 px-1 border-b-2 font-medium text-sm font-pretendard ${
                activeTab === 'list'
                  ? 'border-[#FF6A00] text-[#FF6A00]'
                  : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
              }`}
            >
              치료사 목록
            </button>
            <button
              onClick={() => {
                setActiveTab('updateRequests')
                setSearchTerm('')
                setSpecialtyFilter('')
                setCurrentPage(1)
              }}
              className={`py-3 px-1 border-b-2 font-medium text-sm font-pretendard ${
                activeTab === 'updateRequests'
                  ? 'border-[#FF6A00] text-[#FF6A00]'
                  : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
              }`}
            >
              프로필 수정 요청
              {stats.updateRequests > 0 && (
                <span className="ml-2 bg-orange-100 text-orange-600 py-0.5 px-2 rounded-full text-xs font-semibold">
                  {stats.updateRequests}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Filter Tabs (치료사 목록 탭에서만 표시) */}
        {activeTab === 'list' && (
          <div className="bg-white shadow rounded-xl p-4">
            <div className="border-b border-gray-200 mb-4">
              <nav className="-mb-px flex space-x-8">
                {['ALL', 'PENDING', 'WAITING', 'APPROVED', 'REJECTED'].map((statusFilter) => (
                  <button
                    key={statusFilter}
                    onClick={() => {
                      setFilter(statusFilter as any)
                      setSearchTerm('')
                      setSpecialtyFilter('')
                      setCurrentPage(1)
                    }}
                    className={`py-2 px-1 border-b-2 font-medium text-sm font-pretendard ${
                      filter === statusFilter
                        ? 'border-[#FF6A00] text-[#FF6A00]'
                        : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
                    }`}
                  >
                    {statusFilter === 'ALL' && '전체'}
                    {statusFilter === 'PENDING' && '신청'}
                    {statusFilter === 'WAITING' && '대기'}
                    {statusFilter === 'APPROVED' && '승인됨'}
                    {statusFilter === 'REJECTED' && '거부됨'}
                    <span className="ml-2 bg-stone-100 text-stone-900 py-0.5 px-2 rounded-full text-xs">
                      {getFilterCount(statusFilter)}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
            {/* 검색 필터 */}
            <div className="grid grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="이름, 이메일, 전화번호로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] font-pretendard"
              />
              <select
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] font-pretendard"
              >
                <option value="">전문분야: 전체</option>
                <option value="SPEECH_THERAPY">언어치료</option>
                <option value="SENSORY_INTEGRATION">감각통합</option>
                <option value="PLAY_THERAPY">놀이치료</option>
                <option value="ART_THERAPY">미술치료</option>
                <option value="MUSIC_THERAPY">음악치료</option>
                <option value="OCCUPATIONAL_THERAPY">작업치료</option>
                <option value="COGNITIVE_THERAPY">인지치료</option>
                <option value="BEHAVIORAL_THERAPY">행동치료</option>
              </select>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSpecialtyFilter('')
                }}
                className="px-4 py-2 bg-stone-200 text-stone-700 rounded-[10px] hover:bg-stone-300 transition-colors font-pretendard"
              >
                초기화
              </button>
            </div>
          </div>
        )}

        {/* 치료사 목록 */}
        {filteredTherapists.length === 0 ? (
          <div className="bg-white shadow rounded-xl">
            <div className="text-center py-12">
              <div className="text-stone-400 text-6xl mb-4">👨‍⚕️</div>
              <h3 className="text-lg font-medium text-stone-900 font-pretendard mb-2">
                {searchTerm || specialtyFilter ? '검색 결과가 없습니다' :
                 filter === 'ALL' ? '등록된 치료사가 없습니다' :
                 `${filter === 'PENDING' ? '승인 대기 중인' : filter === 'APPROVED' ? '승인된' : '거부된'} 치료사가 없습니다`}
              </h3>
              <p className="text-stone-500 font-pretendard">
                {searchTerm || specialtyFilter ? '다른 검색어를 시도해보세요.' : '새로운 치료사 가입을 기다리고 있습니다.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-xl">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#F9F9F9]">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider font-pretendard">
                      이름
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider font-pretendard">
                      연락처
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider font-pretendard">
                      전문분야
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider font-pretendard">
                      경력
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider font-pretendard">
                      상담료
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider font-pretendard">
                      상태
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-stone-500 uppercase tracking-wider font-pretendard">
                      언어 컨설팅
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider font-pretendard">
                      가입일
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider font-pretendard">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedTherapists.map((therapist) => (
                    <tr key={therapist.id} className="hover:bg-[#FFF5F0]">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 bg-[#FFE5E5] rounded-full flex items-center justify-center">
                              <span className="text-[#FF6A00] font-semibold font-pretendard">
                                {therapist.user.name.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center space-x-2">
                              <div className="text-sm font-medium text-stone-900 font-pretendard">
                                {therapist.user.name}
                              </div>
                              {therapist.profileUpdateRequested && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 font-pretendard">
                                  수정 요청
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-stone-900 font-pretendard">{therapist.user.email}</div>
                        <div className="text-sm text-stone-500 font-pretendard">{therapist.user.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-stone-900 font-pretendard">
                          {therapist.specialties.slice(0, 2).map(s => getSpecialtyLabel(s)).join(', ')}
                          {therapist.specialties.length > 2 && ` 외 ${therapist.specialties.length - 2}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500 font-pretendard">
                        {therapist.experiences.length}건
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-900 font-pretendard">
                        {therapist.sessionFee ? `₩${therapist.sessionFee.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(therapist.approvalStatus)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full font-pretendard ${
                          therapist.canDoConsultation
                            ? 'bg-[#FFE5E5] text-[#FF6A00]'
                            : 'bg-stone-100 text-stone-800'
                        }`}>
                          {therapist.canDoConsultation ? '가능' : '불가'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500 font-pretendard">
                        {new Date(therapist.createdAt).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openModal(therapist)}
                            className="px-3 py-1 bg-[#FF6A00] text-white text-xs font-medium rounded-[10px] hover:bg-[#E55F00] transition-colors font-pretendard"
                          >
                            상세
                          </button>
                          {(therapist.approvalStatus === 'PENDING' || therapist.approvalStatus === 'WAITING') && (
                            <>
                              <button
                                onClick={() => handleApprove(therapist.id)}
                                className="px-3 py-1 bg-[#FF6A00] text-white text-xs font-medium rounded-[10px] hover:bg-[#E55F00] transition-colors font-pretendard"
                              >
                                승인
                              </button>
                              <button
                                onClick={() => handleReject(therapist.id)}
                                className="px-3 py-1 bg-red-600 text-white text-xs font-medium rounded-[10px] hover:bg-red-700 transition-colors font-pretendard"
                              >
                                거부
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredTherapists.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredTherapists.length}
              />
            )}
          </div>
        )}

        {/* 치료사 상세 모달 */}
        {isModalOpen && selectedTherapist && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* 모달 헤더 */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">치료사 상세 정보</h2>
                    {selectedTherapist.isPreTherapist && (
                      <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        예비 치료사
                      </span>
                    )}
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* 탭 네비게이션 */}
                <div className="border-b border-gray-200 -mb-px">
                  <nav className="flex space-x-8">
                    <button
                      onClick={() => setModalDetailTab('info')}
                      className={`py-3 px-1 border-b-2 font-medium text-sm ${
                        modalDetailTab === 'info'
                          ? 'border-green-500 text-green-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      기본 정보
                    </button>
                    <button
                      onClick={() => setModalDetailTab('education')}
                      className={`py-3 px-1 border-b-2 font-medium text-sm ${
                        modalDetailTab === 'education'
                          ? 'border-green-500 text-green-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      학력
                    </button>
                    {!selectedTherapist.isPreTherapist && (
                      <>
                        <button
                          onClick={() => setModalDetailTab('certifications')}
                          className={`py-3 px-1 border-b-2 font-medium text-sm ${
                            modalDetailTab === 'certifications'
                              ? 'border-green-500 text-green-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          자격증
                        </button>
                        <button
                          onClick={() => setModalDetailTab('experience')}
                          className={`py-3 px-1 border-b-2 font-medium text-sm ${
                            modalDetailTab === 'experience'
                              ? 'border-green-500 text-green-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          경력
                        </button>
                      </>
                    )}
                  </nav>
                </div>
              </div>

              {/* 모달 본문 */}
              <div className="px-6 py-6">
                {/* 프로필 수정 요청 알림 */}
                {selectedTherapist.profileUpdateRequested && selectedTherapist.pendingUpdateRequest && (
                  <div className="bg-orange-50 rounded-lg p-3 border border-orange-200 mb-4">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm font-medium text-orange-900">
                        프로필 수정 요청이 있습니다. 변경 사항이 주황색으로 표시됩니다.
                      </p>
                    </div>
                    <div className="mt-2 flex gap-3">
                      <button
                        onClick={() => handleApproveProfileUpdate(selectedTherapist.id)}
                        className="px-3 py-1 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition-colors"
                      >
                        전체 승인
                      </button>
                      <button
                        onClick={() => handleRejectProfileUpdate(selectedTherapist.id)}
                        className="px-3 py-1 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition-colors"
                      >
                        전체 거부
                      </button>
                    </div>
                  </div>
                )}

                {/* 기본 정보 탭 */}
                {modalDetailTab === 'info' && (
                  <div className="space-y-6">
                    {/* 기본 정보 */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b">기본 정보</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">이름</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedTherapist.user.name}</p>
                          {selectedTherapist.pendingUpdateRequest && selectedTherapist.user.name !== selectedTherapist.pendingUpdateRequest.requestData.name && (
                            <p className="mt-1 text-sm text-orange-900 font-medium">→ {selectedTherapist.pendingUpdateRequest.requestData.name}</p>
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">이메일</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedTherapist.user.email}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">전화번호</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedTherapist.user.phone}</p>
                          {selectedTherapist.pendingUpdateRequest && selectedTherapist.user.phone !== selectedTherapist.pendingUpdateRequest.requestData.phone && (
                            <p className="mt-1 text-sm text-orange-900 font-medium">→ {selectedTherapist.pendingUpdateRequest.requestData.phone}</p>
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">성별</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedTherapist.gender === 'MALE' ? '남성' : selectedTherapist.gender === 'FEMALE' ? '여성' : '미입력'}</p>
                          {selectedTherapist.pendingUpdateRequest && selectedTherapist.gender !== selectedTherapist.pendingUpdateRequest.requestData.gender && (
                            <p className="mt-1 text-sm text-orange-900 font-medium">→ {selectedTherapist.pendingUpdateRequest.requestData.gender === 'MALE' ? '남성' : selectedTherapist.pendingUpdateRequest.requestData.gender === 'FEMALE' ? '여성' : '미입력'}</p>
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">생년</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedTherapist.birthYear ? `${selectedTherapist.birthYear}년` : '미입력'}</p>
                          {selectedTherapist.pendingUpdateRequest && selectedTherapist.birthYear !== selectedTherapist.pendingUpdateRequest.requestData.birthYear && (
                            <p className="mt-1 text-sm text-orange-900 font-medium">→ {selectedTherapist.pendingUpdateRequest.requestData.birthYear}년</p>
                          )}
                        </div>
                        <div className="col-span-2">
                          <label className="text-sm font-medium text-gray-500">주소</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedTherapist.address || '미입력'}</p>
                          {selectedTherapist.pendingUpdateRequest && selectedTherapist.address !== selectedTherapist.pendingUpdateRequest.requestData.address && (
                            <p className="mt-1 text-sm text-orange-900 font-medium">→ {selectedTherapist.pendingUpdateRequest.requestData.address}</p>
                          )}
                        </div>
                        <div className="col-span-2">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedTherapist.canDoConsultation || false}
                              onChange={(e) => {
                                // 체크박스만 토글 (실제 저장은 버튼 클릭 시)
                                setSelectedTherapist({ ...selectedTherapist, canDoConsultation: e.target.checked })
                              }}
                              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                            />
                            <span className="text-sm font-medium text-gray-700">언어 컨설팅 권한 부여</span>
                          </label>
                          <p className="ml-6 mt-1 text-xs text-gray-500">
                            이 옵션을 활성화하면 부모가 언어 컨설팅 검색 시 이 치료사를 찾을 수 있습니다.
                          </p>

                          {/* 언어 컨설팅 활성화 시 비용 입력 필드 표시 */}
                          {selectedTherapist.canDoConsultation && (
                            <div className="ml-6 mt-4 space-y-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  부모 결제 금액 (원)
                                </label>
                                <input
                                  type="number"
                                  value={selectedTherapist.consultationFee || 150000}
                                  onChange={(e) => setSelectedTherapist({
                                    ...selectedTherapist,
                                    consultationFee: parseInt(e.target.value) || 0
                                  })}
                                  placeholder="150000"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  치료사 정산금 (원)
                                </label>
                                <input
                                  type="number"
                                  value={selectedTherapist.consultationSettlementAmount || 100000}
                                  onChange={(e) => setSelectedTherapist({
                                    ...selectedTherapist,
                                    consultationSettlementAmount: parseInt(e.target.value) || 0
                                  })}
                                  placeholder="100000"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                                />
                              </div>
                              <div className="text-sm text-gray-600 bg-white p-2 rounded">
                                <strong>플랫폼 수익:</strong> {(
                                  (selectedTherapist.consultationFee || 150000) -
                                  (selectedTherapist.consultationSettlementAmount || 100000)
                                ).toLocaleString()}원
                              </div>
                            </div>
                          )}

                          {/* 저장 버튼 */}
                          <button
                            onClick={() => handleToggleConsultation(
                              selectedTherapist.id,
                              !selectedTherapist.canDoConsultation, // 반대값을 전달 (토글 효과)
                              selectedTherapist.consultationFee,
                              selectedTherapist.consultationSettlementAmount
                            )}
                            className="ml-6 mt-3 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            언어 컨설팅 설정 저장
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* 전문 정보 */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b">전문 정보</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500 mb-2 block">전문 분야</label>
                          <div className="flex flex-wrap gap-2">
                            {selectedTherapist.specialties.map((specialty) => (
                              <span key={specialty} className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
                                {getSpecialtyLabel(specialty)}
                              </span>
                            ))}
                          </div>
                          {selectedTherapist.pendingUpdateRequest && JSON.stringify(selectedTherapist.specialties) !== JSON.stringify(selectedTherapist.pendingUpdateRequest.requestData.specialties) && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              <span className="text-sm text-orange-900 font-medium">→</span>
                              {selectedTherapist.pendingUpdateRequest.requestData.specialties.map((specialty) => (
                                <span key={specialty} className="px-3 py-1 text-sm font-medium bg-orange-100 text-orange-800 rounded-full">
                                  {getSpecialtyLabel(specialty)}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500 mb-2 block">아이 나이 범위</label>
                          <div className="flex flex-wrap gap-2">
                            {selectedTherapist.childAgeRanges && selectedTherapist.childAgeRanges.length > 0 ? (
                              selectedTherapist.childAgeRanges.map((range) => (
                                <span key={range} className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                                  {getAgeRangeLabel(range)}
                                </span>
                              ))
                            ) : (
                              <p className="text-sm text-gray-400">미입력</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500 mb-2 block">서비스 가능 지역</label>
                          <div className="flex flex-wrap gap-2">
                            {selectedTherapist.serviceAreas && selectedTherapist.serviceAreas.length > 0 ? (
                              selectedTherapist.serviceAreas.map((area) => (
                                <span key={area} className="px-3 py-1 text-sm font-medium bg-purple-100 text-purple-800 rounded-full">
                                  {getServiceAreaLabel(area)}
                                </span>
                              ))
                            ) : (
                              <p className="text-sm text-gray-400">미입력</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">세션 비용 (50분 기준)</label>
                          <p className="mt-1 text-sm text-gray-900">₩{selectedTherapist.sessionFee?.toLocaleString() || '-'}</p>
                          {selectedTherapist.pendingUpdateRequest && selectedTherapist.sessionFee !== selectedTherapist.pendingUpdateRequest.requestData.sessionFee && (
                            <p className="mt-1 text-sm text-orange-900 font-medium">→ ₩{selectedTherapist.pendingUpdateRequest.requestData.sessionFee?.toLocaleString()}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 학력 탭 */}
                {modalDetailTab === 'education' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b">학력</h3>
                    {selectedTherapist.educations && selectedTherapist.educations.length > 0 ? (
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-3">현재 학력</p>
                        <div className="space-y-3">
                          {selectedTherapist.educations.map((edu, index) => (
                            <div key={index} className="border-l-4 border-green-500 pl-4 py-2 bg-gray-50 rounded-r">
                              <h4 className="font-bold text-gray-900">{getDegreeLabel(edu.degree)}</h4>
                              <p className="text-gray-700 mt-1">{edu.school} - {edu.major}</p>
                              <p className="text-sm text-gray-500 mt-1">{edu.graduationYear} 졸업</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">등록된 학력 정보가 없습니다.</p>
                    )}
                    {selectedTherapist.pendingUpdateRequest?.requestData.educations &&
                     JSON.stringify(selectedTherapist.educations) !== JSON.stringify(selectedTherapist.pendingUpdateRequest.requestData.educations) && (
                      <div className="mt-6 pt-6 border-t border-orange-200">
                        <p className="text-sm font-medium text-orange-900 mb-3">→ 변경 요청된 학력</p>
                        <div className="space-y-3">
                          {selectedTherapist.pendingUpdateRequest.requestData.educations.map((edu, index) => (
                            <div key={index} className="border-l-4 border-orange-500 pl-4 py-2 bg-orange-50 rounded-r">
                              <h4 className="font-bold text-orange-900">{getDegreeLabel(edu.degree)}</h4>
                              <p className="text-orange-800 mt-1">{edu.school} - {edu.major}</p>
                              <p className="text-sm text-orange-700 mt-1">{edu.graduationYear} 졸업</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 자격증 탭 */}
                {modalDetailTab === 'certifications' && !selectedTherapist.isPreTherapist && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b">자격증</h3>
                    {selectedTherapist.certifications.length > 0 ? (
                      <div className="space-y-3">
                        {selectedTherapist.certifications.map((cert) => (
                          <div key={cert.id} className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded-r">
                            <h4 className="font-bold text-gray-900">{cert.name}</h4>
                            <p className="text-gray-700 mt-1">발급기관: {cert.issuingOrganization}</p>
                            <p className="text-sm text-gray-500 mt-1">취득일: {new Date(cert.issueDate).toLocaleDateString('ko-KR')}</p>
                            {cert.filePath && (
                              <a href={cert.filePath} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline mt-1 inline-block">
                                첨부파일 보기
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">등록된 자격증 정보가 없습니다.</p>
                    )}
                    {selectedTherapist.pendingUpdateRequest?.requestData.certifications && selectedTherapist.pendingUpdateRequest.requestData.certifications.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-orange-200">
                        <p className="text-sm font-medium text-orange-900 mb-3">→ 변경 요청된 자격증 ({selectedTherapist.pendingUpdateRequest.requestData.certifications.length}개)</p>
                        <div className="space-y-3">
                          {selectedTherapist.pendingUpdateRequest.requestData.certifications.map((cert: any, index: number) => (
                            <div key={index} className="border-l-4 border-orange-500 pl-4 py-2 bg-orange-50 rounded-r">
                              <h4 className="font-bold text-orange-900">{cert.name}</h4>
                              <p className="text-orange-800 mt-1">발급기관: {cert.issuingOrganization}</p>
                              <p className="text-sm text-orange-700 mt-1">취득일: {new Date(cert.issueDate).toLocaleDateString('ko-KR')}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 경력 탭 */}
                {modalDetailTab === 'experience' && !selectedTherapist.isPreTherapist && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b">경력</h3>
                    {selectedTherapist.experiences.length > 0 ? (
                      <div className="space-y-3">
                        {selectedTherapist.experiences.map((exp) => (
                          <div key={exp.id} className="border-l-4 border-purple-500 pl-4 py-2 bg-gray-50 rounded-r">
                            <div className="flex items-center space-x-2">
                              <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-200 text-gray-700 rounded">
                                {exp.employmentType === 'INSTITUTION' ? '기관' : '프리랜서'}
                              </span>
                              <h4 className="font-bold text-gray-900">{exp.institutionName || '프리랜서'}</h4>
                            </div>
                            <p className="text-gray-700 mt-1">분야: {getSpecialtyLabel(exp.specialty)}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              기간: {new Date(exp.startDate).toLocaleDateString('ko-KR')} ~ {exp.endDate ? new Date(exp.endDate).toLocaleDateString('ko-KR') : '현재'}
                            </p>
                            {exp.description && <p className="text-gray-600 mt-2">{exp.description}</p>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">등록된 경력 정보가 없습니다.</p>
                    )}
                    {selectedTherapist.pendingUpdateRequest?.requestData.experiences && selectedTherapist.pendingUpdateRequest.requestData.experiences.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-orange-200">
                        <p className="text-sm font-medium text-orange-900 mb-3">→ 변경 요청된 경력 ({selectedTherapist.pendingUpdateRequest.requestData.experiences.length}개)</p>
                        <div className="space-y-3">
                          {selectedTherapist.pendingUpdateRequest.requestData.experiences.map((exp: any, index: number) => (
                            <div key={index} className="border-l-4 border-orange-500 pl-4 py-2 bg-orange-50 rounded-r">
                              <div className="flex items-center space-x-2">
                                <span className="inline-flex px-2 py-1 text-xs font-medium bg-orange-200 text-orange-900 rounded">
                                  {exp.employmentType === 'INSTITUTION' ? '기관' : '프리랜서'}
                                </span>
                                <h4 className="font-bold text-orange-900">{exp.institutionName || '프리랜서'}</h4>
                              </div>
                              <p className="text-orange-800 mt-1">분야: {getSpecialtyLabel(exp.specialty)}</p>
                              <p className="text-sm text-orange-700 mt-1">
                                기간: {new Date(exp.startDate).toLocaleDateString('ko-KR')} ~ {exp.endDate ? new Date(exp.endDate).toLocaleDateString('ko-KR') : '현재'}
                              </p>
                              {exp.description && <p className="text-orange-700 mt-2">{exp.description}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 모달 푸터 */}
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
                {/* 상태 정보 */}
                <div className="mb-4 grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <label className="text-xs font-medium text-gray-500">현재 상태</label>
                    <div className="mt-1">{getStatusBadge(selectedTherapist.approvalStatus)}</div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">가입일</label>
                    <p className="mt-1 text-sm text-gray-900">{new Date(selectedTherapist.createdAt).toLocaleDateString('ko-KR')}</p>
                  </div>
                  {selectedTherapist.approvedAt && (
                    <div>
                      <label className="text-xs font-medium text-gray-500">승인일</label>
                      <p className="mt-1 text-sm text-gray-900">{new Date(selectedTherapist.approvedAt).toLocaleDateString('ko-KR')}</p>
                    </div>
                  )}
                </div>

                {/* 상태 변경 및 버튼 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="PENDING">신청</option>
                      <option value="WAITING">대기</option>
                      <option value="APPROVED">승인됨</option>
                      <option value="REJECTED">거부됨</option>
                    </select>
                    <button
                      onClick={handleStatusChange}
                      disabled={newStatus === selectedTherapist.approvalStatus}
                      className={`px-4 py-2 font-medium rounded-md transition-colors text-sm ${
                        newStatus === selectedTherapist.approvalStatus
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      상태 변경
                    </button>
                  </div>
                  <div className="flex space-x-3">
                    {(selectedTherapist.approvalStatus === 'PENDING' || selectedTherapist.approvalStatus === 'WAITING') && (
                      <>
                        <button
                          onClick={() => handleApprove(selectedTherapist.id)}
                          className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors"
                        >
                          승인
                        </button>
                        <button
                          onClick={() => handleReject(selectedTherapist.id)}
                          className="px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors"
                        >
                          거부
                        </button>
                      </>
                    )}
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 bg-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-400 transition-colors"
                    >
                      닫기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}