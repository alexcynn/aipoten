'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/layout/AdminLayout'
import Pagination from '@/components/admin/Pagination'
import TherapistDetailModal from '@/components/modals/TherapistDetailModal'

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
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedTherapist(null)
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
        <TherapistDetailModal
          therapist={selectedTherapist}
          isOpen={isModalOpen}
          onClose={closeModal}
          onUpdate={fetchTherapists}
        />
      </div>
    </AdminLayout>
  )
}