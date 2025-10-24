'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/layout/AdminLayout'

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

  const getStatusBadge = (status: string) => {
    const badges: { [key: string]: { bg: string; text: string; label: string } } = {
      PENDING: { bg: 'bg-blue-100', text: 'text-blue-800', label: '신청' },
      WAITING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '대기' },
      APPROVED: { bg: 'bg-green-100', text: 'text-green-800', label: '승인됨' },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-800', label: '거부됨' }
    }
    const badge = badges[status] || badges.WAITING
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    )
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
    <AdminLayout title="치료사 관리">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-gray-600">
            치료사 가입 승인 및 프로필 관리를 할 수 있습니다.
          </p>
          <div className="flex items-center space-x-4 text-sm">
            <div>
              전체 <span className="font-semibold text-gray-900">{stats.total}</span>명
              <span className="mx-2">|</span>
              신청 <span className="font-semibold text-blue-600">{stats.pending}</span>명
              <span className="mx-2">|</span>
              대기 <span className="font-semibold text-yellow-600">{stats.waiting}</span>명
              <span className="mx-2">|</span>
              수정 요청 <span className="font-semibold text-orange-600">{stats.updateRequests}</span>명
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
              }}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'list'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              치료사 목록
            </button>
            <button
              onClick={() => {
                setActiveTab('updateRequests')
                setSearchTerm('')
                setSpecialtyFilter('')
              }}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'updateRequests'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {['ALL', 'PENDING', 'WAITING', 'APPROVED', 'REJECTED'].map((statusFilter) => (
                  <button
                    key={statusFilter}
                    onClick={() => {
                      setFilter(statusFilter as any)
                      // 필터 변경 시 검색어와 전문분야 필터 초기화
                      setSearchTerm('')
                      setSpecialtyFilter('')
                    }}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      filter === statusFilter
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {statusFilter === 'ALL' && '전체'}
                    {statusFilter === 'PENDING' && '신청'}
                    {statusFilter === 'WAITING' && '대기'}
                    {statusFilter === 'APPROVED' && '승인됨'}
                    {statusFilter === 'REJECTED' && '거부됨'}
                    <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                      {getFilterCount(statusFilter)}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Therapists Table */}
        {filteredTherapists.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">👨‍⚕️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'ALL' ? '등록된 치료사가 없습니다' : `${filter === 'PENDING' ? '승인 대기 중인' : filter === 'APPROVED' ? '승인된' : '거부된'} 치료사가 없습니다`}
            </h3>
            <p className="text-gray-500">
              새로운 치료사 가입을 기다리고 있습니다.
            </p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      이름
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      연락처
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      전문분야
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      경력
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상담료
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      가입일
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      관리
                    </th>
                  </tr>
                  {/* 검색 필터 행 */}
                  <tr className="bg-white">
                    <th scope="col" className="px-6 py-2">
                      <input
                        type="text"
                        placeholder="이름 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </th>
                    <th scope="col" className="px-6 py-2">
                      <input
                        type="text"
                        placeholder="이메일/전화"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </th>
                    <th scope="col" className="px-6 py-2">
                      <select
                        value={specialtyFilter}
                        onChange={(e) => setSpecialtyFilter(e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">전체</option>
                        <option value="SPEECH_THERAPY">언어치료</option>
                        <option value="SENSORY_INTEGRATION">감각통합</option>
                        <option value="PLAY_THERAPY">놀이치료</option>
                        <option value="ART_THERAPY">미술치료</option>
                        <option value="MUSIC_THERAPY">음악치료</option>
                        <option value="OCCUPATIONAL_THERAPY">작업치료</option>
                        <option value="COGNITIVE_THERAPY">인지치료</option>
                        <option value="BEHAVIORAL_THERAPY">행동치료</option>
                      </select>
                    </th>
                    <th scope="col" className="px-6 py-2"></th>
                    <th scope="col" className="px-6 py-2"></th>
                    <th scope="col" className="px-6 py-2"></th>
                    <th scope="col" className="px-6 py-2"></th>
                    <th scope="col" className="px-6 py-2"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTherapists.map((therapist) => (
                    <tr key={therapist.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 bg-aipoten-blue rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold">
                                {therapist.user.name.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center space-x-2">
                              <div className="text-sm font-medium text-gray-900">
                                {therapist.user.name}
                              </div>
                              {therapist.profileUpdateRequested && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                                  수정 요청
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{therapist.user.email}</div>
                        <div className="text-sm text-gray-500">{therapist.user.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {therapist.specialties.slice(0, 2).map(s => getSpecialtyLabel(s)).join(', ')}
                          {therapist.specialties.length > 2 && ` 외 ${therapist.specialties.length - 2}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {therapist.experiences.length}건
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {therapist.sessionFee ? `₩${therapist.sessionFee.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(therapist.approvalStatus)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(therapist.createdAt).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openModal(therapist)}
                            className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
                          >
                            상세
                          </button>
                          {therapist.approvalStatus === 'WAITING' && (
                            <>
                              <button
                                onClick={() => handleApprove(therapist.id)}
                                className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors"
                              >
                                승인
                              </button>
                              <button
                                onClick={() => handleReject(therapist.id)}
                                className="px-3 py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-colors"
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
          </div>
        )}

        {/* 치료사 상세 모달 */}
        {isModalOpen && selectedTherapist && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* 모달 헤더 */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">치료사 상세 정보</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* 모달 본문 */}
              <div className="px-6 py-6 space-y-6">
                {/* 기본 정보 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">이름</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedTherapist.user.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">이메일</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedTherapist.user.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">전화번호</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedTherapist.user.phone}</p>
                    </div>
                    {selectedTherapist.gender && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">성별</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedTherapist.gender === 'MALE' ? '남성' : '여성'}
                        </p>
                      </div>
                    )}
                    {selectedTherapist.birthYear && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">생년</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedTherapist.birthYear}년</p>
                      </div>
                    )}
                    {selectedTherapist.address && (
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-gray-500">주소</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedTherapist.address}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 전문 정보 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">전문 정보</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">전문 분야</label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedTherapist.specialties.map((specialty) => (
                          <span
                            key={specialty}
                            className="inline-flex px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full"
                          >
                            {getSpecialtyLabel(specialty)}
                          </span>
                        ))}
                      </div>
                    </div>
                    {selectedTherapist.childAgeRanges.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">대상 아동 연령</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedTherapist.childAgeRanges.join(', ')}
                        </p>
                      </div>
                    )}
                    {selectedTherapist.serviceAreas.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">서비스 가능 지역</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedTherapist.serviceAreas.join(', ')}
                        </p>
                      </div>
                    )}
                    {selectedTherapist.sessionFee && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">상담료 (50분 기준)</label>
                        <p className="mt-1 text-sm text-gray-900">
                          ₩{selectedTherapist.sessionFee.toLocaleString()}
                        </p>
                      </div>
                    )}
                    {selectedTherapist.education && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">학력</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedTherapist.education}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 자격증 정보 */}
                {selectedTherapist.certifications.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">자격증 정보</h3>
                    <div className="space-y-4">
                      {selectedTherapist.certifications.map((cert, index) => (
                        <div key={cert.id} className="border-l-4 border-blue-500 pl-4">
                          <h4 className="font-medium text-gray-900">{cert.name}</h4>
                          <p className="text-sm text-gray-600">발급기관: {cert.issuingOrganization}</p>
                          <p className="text-sm text-gray-600">
                            취득일: {new Date(cert.issueDate).toLocaleDateString('ko-KR')}
                          </p>
                          {cert.filePath && (
                            <a
                              href={cert.filePath}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              첨부파일 보기
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 경력 정보 */}
                {selectedTherapist.experiences.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">경력 정보</h3>
                    <div className="space-y-4">
                      {selectedTherapist.experiences.map((exp, index) => (
                        <div key={exp.id} className="border-l-4 border-green-500 pl-4">
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-200 text-gray-700 rounded">
                              {exp.employmentType === 'INSTITUTION' ? '기관' : '프리랜서'}
                            </span>
                            <h4 className="font-medium text-gray-900">
                              {exp.institutionName || '프리랜서'}
                            </h4>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            분야: {getSpecialtyLabel(exp.specialty)}
                          </p>
                          <p className="text-sm text-gray-600">
                            기간: {new Date(exp.startDate).toLocaleDateString('ko-KR')} ~{' '}
                            {exp.endDate
                              ? new Date(exp.endDate).toLocaleDateString('ko-KR')
                              : '현재'}
                          </p>
                          {exp.description && (
                            <p className="text-sm text-gray-600 mt-2">{exp.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 프로필 수정 요청 정보 */}
                {selectedTherapist.profileUpdateRequested && selectedTherapist.pendingUpdateRequest && (
                  <div className="bg-orange-50 rounded-lg p-4 border-2 border-orange-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <h3 className="text-lg font-semibold text-orange-900">프로필 수정 요청 비교</h3>
                    </div>

                    <div className="space-y-4 mt-4">
                      {/* Request Info */}
                      <div className="bg-white rounded p-3">
                        <div className="text-sm text-orange-700">
                          <strong>요청 시각:</strong> {new Date(selectedTherapist.pendingUpdateRequest.requestedAt).toLocaleString('ko-KR')}
                        </div>
                        {selectedTherapist.pendingUpdateRequest.memo && (
                          <div className="text-sm text-orange-700 mt-1">
                            <strong>메모:</strong> {selectedTherapist.pendingUpdateRequest.memo}
                          </div>
                        )}
                      </div>

                      {/* Comparison Table */}
                      <div className="bg-white rounded overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">항목</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">현재</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">변경 요청</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {/* Name */}
                            {selectedTherapist.user.name !== selectedTherapist.pendingUpdateRequest.requestData.name && (
                              <tr className="bg-yellow-50">
                                <td className="px-3 py-2 text-sm font-medium text-gray-900">이름</td>
                                <td className="px-3 py-2 text-sm text-gray-500">{selectedTherapist.user.name}</td>
                                <td className="px-3 py-2 text-sm text-orange-900 font-medium">{selectedTherapist.pendingUpdateRequest.requestData.name}</td>
                              </tr>
                            )}
                            {/* Phone */}
                            {selectedTherapist.user.phone !== selectedTherapist.pendingUpdateRequest.requestData.phone && (
                              <tr className="bg-yellow-50">
                                <td className="px-3 py-2 text-sm font-medium text-gray-900">전화번호</td>
                                <td className="px-3 py-2 text-sm text-gray-500">{selectedTherapist.user.phone}</td>
                                <td className="px-3 py-2 text-sm text-orange-900 font-medium">{selectedTherapist.pendingUpdateRequest.requestData.phone}</td>
                              </tr>
                            )}
                            {/* Gender */}
                            {selectedTherapist.gender !== selectedTherapist.pendingUpdateRequest.requestData.gender && (
                              <tr className="bg-yellow-50">
                                <td className="px-3 py-2 text-sm font-medium text-gray-900">성별</td>
                                <td className="px-3 py-2 text-sm text-gray-500">{selectedTherapist.gender === 'MALE' ? '남성' : selectedTherapist.gender === 'FEMALE' ? '여성' : '-'}</td>
                                <td className="px-3 py-2 text-sm text-orange-900 font-medium">{selectedTherapist.pendingUpdateRequest.requestData.gender === 'MALE' ? '남성' : selectedTherapist.pendingUpdateRequest.requestData.gender === 'FEMALE' ? '여성' : '-'}</td>
                              </tr>
                            )}
                            {/* Birth Year */}
                            {selectedTherapist.birthYear !== selectedTherapist.pendingUpdateRequest.requestData.birthYear && (
                              <tr className="bg-yellow-50">
                                <td className="px-3 py-2 text-sm font-medium text-gray-900">생년</td>
                                <td className="px-3 py-2 text-sm text-gray-500">{selectedTherapist.birthYear || '-'}</td>
                                <td className="px-3 py-2 text-sm text-orange-900 font-medium">{selectedTherapist.pendingUpdateRequest.requestData.birthYear || '-'}</td>
                              </tr>
                            )}
                            {/* Address */}
                            {selectedTherapist.address !== selectedTherapist.pendingUpdateRequest.requestData.address && (
                              <tr className="bg-yellow-50">
                                <td className="px-3 py-2 text-sm font-medium text-gray-900">주소</td>
                                <td className="px-3 py-2 text-sm text-gray-500">{selectedTherapist.address || '-'}</td>
                                <td className="px-3 py-2 text-sm text-orange-900 font-medium">{selectedTherapist.pendingUpdateRequest.requestData.address || '-'}</td>
                              </tr>
                            )}
                            {/* Specialties */}
                            {JSON.stringify(selectedTherapist.specialties) !== JSON.stringify(selectedTherapist.pendingUpdateRequest.requestData.specialties) && (
                              <tr className="bg-yellow-50">
                                <td className="px-3 py-2 text-sm font-medium text-gray-900">전문 분야</td>
                                <td className="px-3 py-2 text-sm text-gray-500">
                                  {selectedTherapist.specialties.map(s => getSpecialtyLabel(s)).join(', ')}
                                </td>
                                <td className="px-3 py-2 text-sm text-orange-900 font-medium">
                                  {selectedTherapist.pendingUpdateRequest.requestData.specialties.map(s => getSpecialtyLabel(s)).join(', ')}
                                </td>
                              </tr>
                            )}
                            {/* Session Fee */}
                            {selectedTherapist.sessionFee !== selectedTherapist.pendingUpdateRequest.requestData.sessionFee && (
                              <tr className="bg-yellow-50">
                                <td className="px-3 py-2 text-sm font-medium text-gray-900">세션 비용</td>
                                <td className="px-3 py-2 text-sm text-gray-500">₩{selectedTherapist.sessionFee?.toLocaleString() || '-'}</td>
                                <td className="px-3 py-2 text-sm text-orange-900 font-medium">₩{selectedTherapist.pendingUpdateRequest.requestData.sessionFee?.toLocaleString() || '-'}</td>
                              </tr>
                            )}
                            {/* Education */}
                            {selectedTherapist.education !== selectedTherapist.pendingUpdateRequest.requestData.education && (
                              <tr className="bg-yellow-50">
                                <td className="px-3 py-2 text-sm font-medium text-gray-900">학력</td>
                                <td className="px-3 py-2 text-sm text-gray-500">{selectedTherapist.education || '-'}</td>
                                <td className="px-3 py-2 text-sm text-orange-900 font-medium">{selectedTherapist.pendingUpdateRequest.requestData.education || '-'}</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Certifications and Experiences changes note */}
                      {(selectedTherapist.pendingUpdateRequest.requestData.certifications.length > 0 ||
                        selectedTherapist.pendingUpdateRequest.requestData.experiences.length > 0) && (
                        <div className="bg-white rounded p-3 text-sm text-orange-700">
                          <p className="font-medium">📋 자격증 및 경력 정보가 변경됩니다.</p>
                          <p className="text-xs mt-1">• 자격증: {selectedTherapist.pendingUpdateRequest.requestData.certifications.length}개</p>
                          <p className="text-xs">• 경력: {selectedTherapist.pendingUpdateRequest.requestData.experiences.length}개</p>
                        </div>
                      )}

                      <div className="pt-2">
                        <button
                          onClick={() => handleApproveProfileUpdate(selectedTherapist.id)}
                          className="w-full px-4 py-2 bg-orange-600 text-white font-medium rounded-md hover:bg-orange-700 transition-colors"
                        >
                          프로필 수정 요청 승인
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 상태 정보 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">상태 정보</h3>
                  <div className="space-y-4">
                    {/* 현재 상태 표시 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">현재 상태</label>
                        <div className="mt-1">{getStatusBadge(selectedTherapist.approvalStatus)}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">가입일</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {new Date(selectedTherapist.createdAt).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                      {selectedTherapist.approvedAt && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">승인일</label>
                          <p className="mt-1 text-sm text-gray-900">
                            {new Date(selectedTherapist.approvedAt).toLocaleDateString('ko-KR')}
                          </p>
                        </div>
                      )}
                      {selectedTherapist.rejectedAt && (
                        <div className="col-span-2">
                          <label className="text-sm font-medium text-gray-500">거부 사유</label>
                          <p className="mt-1 text-sm text-red-600">
                            {selectedTherapist.rejectionReason}
                          </p>
                        </div>
                      )}
                      {selectedTherapist.profileUpdateApprovedAt && (
                        <div className="col-span-2">
                          <label className="text-sm font-medium text-gray-500">최근 프로필 수정 승인일</label>
                          <p className="mt-1 text-sm text-gray-900">
                            {new Date(selectedTherapist.profileUpdateApprovedAt).toLocaleDateString('ko-KR')}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* 상태 변경 */}
                    <div className="border-t border-gray-200 pt-4">
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        상태 변경
                      </label>
                      <div className="flex items-center space-x-3">
                        <select
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="PENDING">신청</option>
                          <option value="WAITING">대기</option>
                          <option value="APPROVED">승인됨</option>
                          <option value="REJECTED">거부됨</option>
                        </select>
                        <button
                          onClick={handleStatusChange}
                          disabled={newStatus === selectedTherapist.approvalStatus}
                          className={`px-4 py-2 font-medium rounded-md transition-colors ${
                            newStatus === selectedTherapist.approvalStatus
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          변경
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 모달 푸터 */}
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
                {selectedTherapist.approvalStatus === 'WAITING' && (
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
        )}
      </div>
    </AdminLayout>
  )
}