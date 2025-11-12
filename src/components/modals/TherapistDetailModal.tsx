'use client'

import { useState, useEffect } from 'react'

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

interface TherapistDetailModalProps {
  therapist: TherapistProfile | null
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
}

export default function TherapistDetailModal({
  therapist,
  isOpen,
  onClose,
  onUpdate,
}: TherapistDetailModalProps) {
  const [modalDetailTab, setModalDetailTab] = useState<'info' | 'education' | 'certifications' | 'experience'>('info')
  const [newStatus, setNewStatus] = useState<string>('')
  const [selectedTherapist, setSelectedTherapist] = useState<TherapistProfile | null>(null)

  // Update local state when therapist prop changes
  useEffect(() => {
    if (therapist) {
      setSelectedTherapist(therapist)
      setNewStatus(therapist.approvalStatus)
      setModalDetailTab('info')
    }
  }, [therapist])

  if (!isOpen || !selectedTherapist) return null

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
        onUpdate()
        onClose()
      } else {
        const data = await response.json()
        alert(data.error || '상태 변경에 실패했습니다.')
      }
    } catch (error) {
      console.error('상태 변경 중 오류 발생:', error)
      alert('상태 변경 중 오류가 발생했습니다.')
    }
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
        onUpdate()
        onClose()
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
        onUpdate()
        onClose()
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
        onUpdate()
        onClose()
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
        onUpdate()
        onClose()
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
    canDoConsultation: boolean,
    consultationFee?: number,
    consultationSettlementAmount?: number
  ) => {
    // 권한 부여하는 경우 - 필수 입력 검증
    if (canDoConsultation) {
      // 비용 필수 검증
      if (!consultationFee || consultationFee <= 0) {
        alert('언어컨설팅 비용(부모 결제 금액)을 입력해주세요.')
        return
      }

      // 정산금 필수 검증
      if (!consultationSettlementAmount || consultationSettlementAmount <= 0) {
        alert('언어컨설팅 정산금(치료사 정산금)을 입력해주세요.')
        return
      }

      // 정산금 > 비용 검증
      if (consultationSettlementAmount > consultationFee) {
        alert('정산금이 비용보다 클 수 없습니다.')
        return
      }
    }

    // 권한 제거하는 경우
    if (!canDoConsultation) {
      const message = '이 치료사의 언어 컨설팅 권한을 제거하시겠습니까?'
      if (!confirm(message)) return
    }

    try {
      const body: any = { canDoConsultation }

      // 권한을 부여하는 경우 비용과 정산금 전송 (필수 검증 통과 후)
      if (canDoConsultation) {
        body.consultationFee = consultationFee
        body.consultationSettlementAmount = consultationSettlementAmount
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
        onUpdate()
        // Update the selected therapist state
        if (selectedTherapist && selectedTherapist.id === therapistId) {
          setSelectedTherapist({
            ...selectedTherapist,
            canDoConsultation: data.therapistProfile.canDoConsultation,
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

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      PENDING: '신청',
      WAITING: '대기',
      APPROVED: '승인됨',
      REJECTED: '거부됨'
    }
    return labels[status] || status
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* 모달 헤더 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-stone-900 font-pretendard">치료사 상세 정보</h2>
              {selectedTherapist.isPreTherapist && (
                <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium font-pretendard">
                  예비 치료사
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-600 transition-colors"
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
                className={`py-3 px-1 border-b-2 font-medium text-sm font-pretendard ${
                  modalDetailTab === 'info'
                    ? 'border-[#FF6A00] text-[#FF6A00]'
                    : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
                }`}
              >
                기본 정보
              </button>
              <button
                onClick={() => setModalDetailTab('education')}
                className={`py-3 px-1 border-b-2 font-medium text-sm font-pretendard ${
                  modalDetailTab === 'education'
                    ? 'border-[#FF6A00] text-[#FF6A00]'
                    : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
                }`}
              >
                학력
              </button>
              {!selectedTherapist.isPreTherapist && (
                <>
                  <button
                    onClick={() => setModalDetailTab('certifications')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm font-pretendard ${
                      modalDetailTab === 'certifications'
                        ? 'border-[#FF6A00] text-[#FF6A00]'
                        : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
                    }`}
                  >
                    자격증
                  </button>
                  <button
                    onClick={() => setModalDetailTab('experience')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm font-pretendard ${
                      modalDetailTab === 'experience'
                        ? 'border-[#FF6A00] text-[#FF6A00]'
                        : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
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
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200 mb-6">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-medium text-orange-900 font-pretendard">
                  프로필 수정 요청이 있습니다. 변경 사항이 주황색으로 표시됩니다.
                </p>
              </div>
              <div className="mt-3 flex gap-3">
                <button
                  onClick={() => handleApproveProfileUpdate(selectedTherapist.id)}
                  className="px-4 py-2 bg-[#FF6A00] text-white text-sm font-medium rounded-[10px] hover:bg-[#E55F00] transition-colors font-pretendard"
                >
                  전체 승인
                </button>
                <button
                  onClick={() => handleRejectProfileUpdate(selectedTherapist.id)}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-[10px] hover:bg-red-700 transition-colors font-pretendard"
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
                <h3 className="text-lg font-bold text-stone-900 mb-4 pb-2 border-b font-pretendard">기본 정보</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-stone-500 font-pretendard">이름</label>
                    <p className="mt-1 text-sm text-stone-900 font-pretendard">{selectedTherapist.user.name}</p>
                    {selectedTherapist.pendingUpdateRequest && selectedTherapist.user.name !== selectedTherapist.pendingUpdateRequest.requestData.name && (
                      <p className="mt-1 text-sm text-orange-900 font-medium font-pretendard">→ {selectedTherapist.pendingUpdateRequest.requestData.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-stone-500 font-pretendard">이메일</label>
                    <p className="mt-1 text-sm text-stone-900 font-pretendard">{selectedTherapist.user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-stone-500 font-pretendard">전화번호</label>
                    <p className="mt-1 text-sm text-stone-900 font-pretendard">{selectedTherapist.user.phone}</p>
                    {selectedTherapist.pendingUpdateRequest && selectedTherapist.user.phone !== selectedTherapist.pendingUpdateRequest.requestData.phone && (
                      <p className="mt-1 text-sm text-orange-900 font-medium font-pretendard">→ {selectedTherapist.pendingUpdateRequest.requestData.phone}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-stone-500 font-pretendard">성별</label>
                    <p className="mt-1 text-sm text-stone-900 font-pretendard">{selectedTherapist.gender === 'MALE' ? '남성' : selectedTherapist.gender === 'FEMALE' ? '여성' : '미입력'}</p>
                    {selectedTherapist.pendingUpdateRequest && selectedTherapist.gender !== selectedTherapist.pendingUpdateRequest.requestData.gender && (
                      <p className="mt-1 text-sm text-orange-900 font-medium font-pretendard">→ {selectedTherapist.pendingUpdateRequest.requestData.gender === 'MALE' ? '남성' : selectedTherapist.pendingUpdateRequest.requestData.gender === 'FEMALE' ? '여성' : '미입력'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-stone-500 font-pretendard">생년</label>
                    <p className="mt-1 text-sm text-stone-900 font-pretendard">{selectedTherapist.birthYear ? `${selectedTherapist.birthYear}년` : '미입력'}</p>
                    {selectedTherapist.pendingUpdateRequest && selectedTherapist.birthYear !== selectedTherapist.pendingUpdateRequest.requestData.birthYear && (
                      <p className="mt-1 text-sm text-orange-900 font-medium font-pretendard">→ {selectedTherapist.pendingUpdateRequest.requestData.birthYear}년</p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-stone-500 font-pretendard">주소</label>
                    <p className="mt-1 text-sm text-stone-900 font-pretendard">{selectedTherapist.address || '미입력'}</p>
                    {selectedTherapist.pendingUpdateRequest && selectedTherapist.address !== selectedTherapist.pendingUpdateRequest.requestData.address && (
                      <p className="mt-1 text-sm text-orange-900 font-medium font-pretendard">→ {selectedTherapist.pendingUpdateRequest.requestData.address}</p>
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
                        className="h-4 w-4 text-[#FF6A00] focus:ring-[#FF6A00] border-gray-300 rounded"
                      />
                      <span className="text-sm font-medium text-stone-700 font-pretendard">언어 컨설팅 권한 부여</span>
                    </label>
                    <p className="ml-6 mt-1 text-xs text-stone-500 font-pretendard">
                      이 옵션을 활성화하면 부모가 언어 컨설팅 검색 시 이 치료사를 찾을 수 있습니다.
                    </p>

                    {/* 언어 컨설팅 활성화 시 비용 입력 필드 표시 */}
                    {selectedTherapist.canDoConsultation && (
                      <div className="ml-6 mt-4 space-y-3 p-4 bg-[#FFF5F0] border border-orange-200 rounded-xl">
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-1 font-pretendard">
                            부모 결제 금액 (원) <span className="text-red-600">*</span>
                          </label>
                          <input
                            type="number"
                            value={selectedTherapist.consultationFee || ''}
                            onChange={(e) => setSelectedTherapist({
                              ...selectedTherapist,
                              consultationFee: parseInt(e.target.value) || 0
                            })}
                            placeholder="필수 입력 (예: 150000)"
                            className="w-full px-3 py-2 border border-gray-300 rounded-[10px] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:border-transparent font-pretendard"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-1 font-pretendard">
                            치료사 정산금 (원) <span className="text-red-600">*</span>
                          </label>
                          <input
                            type="number"
                            value={selectedTherapist.consultationSettlementAmount || ''}
                            onChange={(e) => setSelectedTherapist({
                              ...selectedTherapist,
                              consultationSettlementAmount: parseInt(e.target.value) || 0
                            })}
                            placeholder="필수 입력 (예: 100000)"
                            className="w-full px-3 py-2 border border-gray-300 rounded-[10px] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:border-transparent font-pretendard"
                            required
                          />
                        </div>
                        <div className="text-sm text-stone-600 bg-white p-3 rounded-[10px] font-pretendard">
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
                        selectedTherapist.canDoConsultation, // 현재 상태를 그대로 전달
                        selectedTherapist.consultationFee,
                        selectedTherapist.consultationSettlementAmount
                      )}
                      className="ml-6 mt-3 px-4 py-2 bg-[#FF6A00] text-white text-sm font-medium rounded-[10px] hover:bg-[#E55F00] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF6A00] transition-colors font-pretendard"
                    >
                      언어 컨설팅 설정 저장
                    </button>
                  </div>
                </div>
              </div>

              {/* 전문 정보 */}
              <div>
                <h3 className="text-lg font-bold text-stone-900 mb-4 pb-2 border-b font-pretendard">전문 정보</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-stone-500 mb-2 block font-pretendard">전문 분야</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedTherapist.specialties.map((specialty) => (
                        <span key={specialty} className="px-3 py-1 text-sm font-semibold bg-[#FFE5E5] text-[#FF6A00] rounded-full font-pretendard">
                          {getSpecialtyLabel(specialty)}
                        </span>
                      ))}
                    </div>
                    {selectedTherapist.pendingUpdateRequest && JSON.stringify(selectedTherapist.specialties) !== JSON.stringify(selectedTherapist.pendingUpdateRequest.requestData.specialties) && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="text-sm text-orange-900 font-medium font-pretendard">→</span>
                        {selectedTherapist.pendingUpdateRequest.requestData.specialties.map((specialty) => (
                          <span key={specialty} className="px-3 py-1 text-sm font-semibold bg-orange-100 text-orange-800 rounded-full font-pretendard">
                            {getSpecialtyLabel(specialty)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-stone-500 mb-2 block font-pretendard">아이 나이 범위</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedTherapist.childAgeRanges && selectedTherapist.childAgeRanges.length > 0 ? (
                        selectedTherapist.childAgeRanges.map((range) => (
                          <span key={range} className="px-3 py-1 text-sm font-semibold bg-blue-100 text-blue-800 rounded-full font-pretendard">
                            {getAgeRangeLabel(range)}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-stone-400 font-pretendard">미입력</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-stone-500 mb-2 block font-pretendard">서비스 가능 지역</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedTherapist.serviceAreas && selectedTherapist.serviceAreas.length > 0 ? (
                        selectedTherapist.serviceAreas.map((area) => (
                          <span key={area} className="px-3 py-1 text-sm font-semibold bg-purple-100 text-purple-800 rounded-full font-pretendard">
                            {area}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-stone-400 font-pretendard">미입력</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-stone-500 font-pretendard">세션 비용 (50분 기준)</label>
                    <p className="mt-1 text-sm text-stone-900 font-pretendard">₩{selectedTherapist.sessionFee?.toLocaleString() || '-'}</p>
                    {selectedTherapist.pendingUpdateRequest && selectedTherapist.sessionFee !== selectedTherapist.pendingUpdateRequest.requestData.sessionFee && (
                      <p className="mt-1 text-sm text-orange-900 font-medium font-pretendard">→ ₩{selectedTherapist.pendingUpdateRequest.requestData.sessionFee?.toLocaleString()}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 학력 탭 */}
          {modalDetailTab === 'education' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-stone-900 mb-4 pb-2 border-b font-pretendard">학력</h3>
              {selectedTherapist.educations && selectedTherapist.educations.length > 0 ? (
                <div>
                  <p className="text-sm font-medium text-stone-500 mb-3 font-pretendard">현재 학력</p>
                  <div className="space-y-3">
                    {selectedTherapist.educations.map((edu, index) => (
                      <div key={index} className="border-l-4 border-[#FF6A00] pl-4 py-2 bg-[#F9F9F9] rounded-r-[10px]">
                        <h4 className="font-bold text-stone-900 font-pretendard">{getDegreeLabel(edu.degree)}</h4>
                        <p className="text-stone-700 mt-1 font-pretendard">{edu.school} - {edu.major}</p>
                        <p className="text-sm text-stone-500 mt-1 font-pretendard">{edu.graduationYear} 졸업</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-stone-500 text-center py-8 font-pretendard">등록된 학력 정보가 없습니다.</p>
              )}
              {selectedTherapist.pendingUpdateRequest?.requestData.educations &&
               JSON.stringify(selectedTherapist.educations) !== JSON.stringify(selectedTherapist.pendingUpdateRequest.requestData.educations) && (
                <div className="mt-6 pt-6 border-t border-orange-200">
                  <p className="text-sm font-medium text-orange-900 mb-3 font-pretendard">→ 변경 요청된 학력</p>
                  <div className="space-y-3">
                    {selectedTherapist.pendingUpdateRequest.requestData.educations.map((edu, index) => (
                      <div key={index} className="border-l-4 border-orange-500 pl-4 py-2 bg-orange-50 rounded-r-[10px]">
                        <h4 className="font-bold text-orange-900 font-pretendard">{getDegreeLabel(edu.degree)}</h4>
                        <p className="text-orange-800 mt-1 font-pretendard">{edu.school} - {edu.major}</p>
                        <p className="text-sm text-orange-700 mt-1 font-pretendard">{edu.graduationYear} 졸업</p>
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
              <h3 className="text-lg font-bold text-stone-900 mb-4 pb-2 border-b font-pretendard">자격증</h3>
              {selectedTherapist.certifications.length > 0 ? (
                <div className="space-y-3">
                  {selectedTherapist.certifications.map((cert) => (
                    <div key={cert.id} className="border-l-4 border-blue-500 pl-4 py-2 bg-[#F9F9F9] rounded-r-[10px]">
                      <h4 className="font-bold text-stone-900 font-pretendard">{cert.name}</h4>
                      <p className="text-stone-700 mt-1 font-pretendard">발급기관: {cert.issuingOrganization}</p>
                      <p className="text-sm text-stone-500 mt-1 font-pretendard">취득일: {new Date(cert.issueDate).toLocaleDateString('ko-KR')}</p>
                      {cert.filePath && (
                        <a href={cert.filePath} target="_blank" rel="noopener noreferrer" className="text-sm text-[#FF6A00] hover:underline mt-1 inline-block font-pretendard">
                          첨부파일 보기
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-stone-500 text-center py-8 font-pretendard">등록된 자격증 정보가 없습니다.</p>
              )}
              {selectedTherapist.pendingUpdateRequest?.requestData.certifications && selectedTherapist.pendingUpdateRequest.requestData.certifications.length > 0 && (
                <div className="mt-6 pt-6 border-t border-orange-200">
                  <p className="text-sm font-medium text-orange-900 mb-3 font-pretendard">→ 변경 요청된 자격증 ({selectedTherapist.pendingUpdateRequest.requestData.certifications.length}개)</p>
                  <div className="space-y-3">
                    {selectedTherapist.pendingUpdateRequest.requestData.certifications.map((cert: any, index: number) => (
                      <div key={index} className="border-l-4 border-orange-500 pl-4 py-2 bg-orange-50 rounded-r-[10px]">
                        <h4 className="font-bold text-orange-900 font-pretendard">{cert.name}</h4>
                        <p className="text-orange-800 mt-1 font-pretendard">발급기관: {cert.issuingOrganization}</p>
                        <p className="text-sm text-orange-700 mt-1 font-pretendard">취득일: {new Date(cert.issueDate).toLocaleDateString('ko-KR')}</p>
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
              <h3 className="text-lg font-bold text-stone-900 mb-4 pb-2 border-b font-pretendard">경력</h3>
              {selectedTherapist.experiences.length > 0 ? (
                <div className="space-y-3">
                  {selectedTherapist.experiences.map((exp) => (
                    <div key={exp.id} className="border-l-4 border-purple-500 pl-4 py-2 bg-[#F9F9F9] rounded-r-[10px]">
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-stone-200 text-stone-700 rounded font-pretendard">
                          {exp.employmentType === 'INSTITUTION' ? '기관' : '프리랜서'}
                        </span>
                        <h4 className="font-bold text-stone-900 font-pretendard">{exp.institutionName || '프리랜서'}</h4>
                      </div>
                      <p className="text-stone-700 mt-1 font-pretendard">분야: {getSpecialtyLabel(exp.specialty)}</p>
                      <p className="text-sm text-stone-500 mt-1 font-pretendard">
                        기간: {new Date(exp.startDate).toLocaleDateString('ko-KR')} ~ {exp.endDate ? new Date(exp.endDate).toLocaleDateString('ko-KR') : '현재'}
                      </p>
                      {exp.description && <p className="text-stone-600 mt-2 font-pretendard">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-stone-500 text-center py-8 font-pretendard">등록된 경력 정보가 없습니다.</p>
              )}
              {selectedTherapist.pendingUpdateRequest?.requestData.experiences && selectedTherapist.pendingUpdateRequest.requestData.experiences.length > 0 && (
                <div className="mt-6 pt-6 border-t border-orange-200">
                  <p className="text-sm font-medium text-orange-900 mb-3 font-pretendard">→ 변경 요청된 경력 ({selectedTherapist.pendingUpdateRequest.requestData.experiences.length}개)</p>
                  <div className="space-y-3">
                    {selectedTherapist.pendingUpdateRequest.requestData.experiences.map((exp: any, index: number) => (
                      <div key={index} className="border-l-4 border-orange-500 pl-4 py-2 bg-orange-50 rounded-r-[10px]">
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex px-2 py-1 text-xs font-medium bg-orange-200 text-orange-900 rounded font-pretendard">
                            {exp.employmentType === 'INSTITUTION' ? '기관' : '프리랜서'}
                          </span>
                          <h4 className="font-bold text-orange-900 font-pretendard">{exp.institutionName || '프리랜서'}</h4>
                        </div>
                        <p className="text-orange-800 mt-1 font-pretendard">분야: {getSpecialtyLabel(exp.specialty)}</p>
                        <p className="text-sm text-orange-700 mt-1 font-pretendard">
                          기간: {new Date(exp.startDate).toLocaleDateString('ko-KR')} ~ {exp.endDate ? new Date(exp.endDate).toLocaleDateString('ko-KR') : '현재'}
                        </p>
                        {exp.description && <p className="text-orange-700 mt-2 font-pretendard">{exp.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 모달 푸터 */}
        <div className="sticky bottom-0 bg-[#F9F9F9] border-t border-gray-200 px-6 py-4">
          {/* 상태 정보 */}
          <div className="mb-4 grid grid-cols-3 gap-4 text-sm">
            <div>
              <label className="text-xs font-medium text-stone-500 font-pretendard">현재 상태</label>
              <div className="mt-1">{getStatusBadge(selectedTherapist.approvalStatus)}</div>
            </div>
            <div>
              <label className="text-xs font-medium text-stone-500 font-pretendard">가입일</label>
              <p className="mt-1 text-sm text-stone-900 font-pretendard">{new Date(selectedTherapist.createdAt).toLocaleDateString('ko-KR')}</p>
            </div>
            {selectedTherapist.approvedAt && (
              <div>
                <label className="text-xs font-medium text-stone-500 font-pretendard">승인일</label>
                <p className="mt-1 text-sm text-stone-900 font-pretendard">{new Date(selectedTherapist.approvedAt).toLocaleDateString('ko-KR')}</p>
              </div>
            )}
          </div>

          {/* 상태 변경 및 버튼 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:border-transparent font-pretendard"
              >
                <option value="PENDING">신청</option>
                <option value="WAITING">대기</option>
                <option value="APPROVED">승인됨</option>
                <option value="REJECTED">거부됨</option>
              </select>
              <button
                onClick={handleStatusChange}
                disabled={newStatus === selectedTherapist.approvalStatus}
                className={`px-4 py-2 font-medium rounded-[10px] transition-colors text-sm font-pretendard ${
                  newStatus === selectedTherapist.approvalStatus
                    ? 'bg-gray-300 text-stone-500 cursor-not-allowed'
                    : 'bg-[#FF6A00] text-white hover:bg-[#E55F00]'
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
                    className="px-4 py-2 bg-[#FF6A00] text-white font-medium rounded-[10px] hover:bg-[#E55F00] transition-colors font-pretendard"
                  >
                    승인
                  </button>
                  <button
                    onClick={() => handleReject(selectedTherapist.id)}
                    className="px-4 py-2 bg-red-600 text-white font-medium rounded-[10px] hover:bg-red-700 transition-colors font-pretendard"
                  >
                    거부
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 bg-stone-300 text-stone-700 font-medium rounded-[10px] hover:bg-stone-400 transition-colors font-pretendard"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
