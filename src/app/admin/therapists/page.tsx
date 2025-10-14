'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
  createdAt: string
}

export default function AdminTherapistsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [therapists, setTherapists] = useState<TherapistProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'PENDING_ADDITIONAL_INFO'>('PENDING')

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
  }, [session, status, router, filter])

  const fetchTherapists = async () => {
    try {
      const queryParam = filter !== 'ALL' ? `?status=${filter}` : ''
      const response = await fetch(`/api/admin/therapists${queryParam}`)
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
      } else {
        const data = await response.json()
        alert(data.error || '반려에 실패했습니다.')
      }
    } catch (error) {
      console.error('치료사 반려 중 오류 발생:', error)
      alert('반려 중 오류가 발생했습니다.')
    }
  }

  const handleRequestInfo = async (therapistId: string) => {
    const requestMessage = prompt('요청할 추가 정보를 입력해주세요:')
    if (!requestMessage) return

    try {
      const response = await fetch(`/api/admin/therapists/${therapistId}/request-info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requestMessage }),
      })

      if (response.ok) {
        alert('추가 자료 요청이 전송되었습니다.')
        await fetchTherapists()
      } else {
        const data = await response.json()
        alert(data.error || '요청에 실패했습니다.')
      }
    } catch (error) {
      console.error('추가 자료 요청 중 오류 발생:', error)
      alert('요청 중 오류가 발생했습니다.')
    }
  }

  const filteredTherapists = therapists.filter(therapist => {
    if (filter === 'ALL') return true
    return therapist.approvalStatus === filter
  })

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
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '승인 대기' },
      PENDING_ADDITIONAL_INFO: { bg: 'bg-orange-100', text: 'text-orange-800', label: '추가 자료 요청' },
      APPROVED: { bg: 'bg-green-100', text: 'text-green-800', label: '승인됨' },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-800', label: '거부됨' }
    }
    const badge = badges[status] || badges.PENDING
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
        <div>
          <p className="text-gray-600">
            치료사 가입 승인 및 프로필 관리를 할 수 있습니다.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {['ALL', 'PENDING', 'PENDING_ADDITIONAL_INFO', 'APPROVED', 'REJECTED'].map((statusFilter) => (
                <button
                  key={statusFilter}
                  onClick={() => setFilter(statusFilter as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    filter === statusFilter
                      ? 'border-aipoten-green text-aipoten-green'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {statusFilter === 'ALL' && '전체'}
                  {statusFilter === 'PENDING' && '승인 대기'}
                  {statusFilter === 'PENDING_ADDITIONAL_INFO' && '추가 자료 요청'}
                  {statusFilter === 'APPROVED' && '승인됨'}
                  {statusFilter === 'REJECTED' && '거부됨'}
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                    {statusFilter === 'ALL'
                      ? therapists.length
                      : therapists.filter(t => t.approvalStatus === statusFilter).length
                    }
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Therapists List */}
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
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredTherapists.map((therapist) => (
                <li key={therapist.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-aipoten-blue rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-lg">
                              {therapist.user.name.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <div className="text-lg font-medium text-gray-900">
                              {therapist.user.name}
                            </div>
                            <div className="ml-2">
                              {getStatusBadge(therapist.approvalStatus)}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {therapist.user.email} • {therapist.user.phone}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {therapist.specialties.map(s => getSpecialtyLabel(s)).join(', ')} •
                            경력 {therapist.experiences.length}건 •
                            {therapist.sessionFee && `상담료 ₩${therapist.sessionFee.toLocaleString()}`}
                          </div>
                          {therapist.serviceAreas.length > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              서비스 지역: {therapist.serviceAreas.slice(0, 3).join(', ')}
                              {therapist.serviceAreas.length > 3 && ` 외 ${therapist.serviceAreas.length - 3}곳`}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/admin/therapists/${therapist.id}`}
                          className="text-aipoten-green hover:text-aipoten-navy text-sm font-medium"
                        >
                          상세보기
                        </Link>
                        {therapist.approvalStatus === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApprove(therapist.id)}
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                            >
                              승인
                            </button>
                            <button
                              onClick={() => handleRequestInfo(therapist.id)}
                              className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700"
                            >
                              추가 자료 요청
                            </button>
                            <button
                              onClick={() => handleReject(therapist.id)}
                              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                            >
                              거부
                            </button>
                          </>
                        )}
                        {therapist.approvalStatus === 'PENDING_ADDITIONAL_INFO' && (
                          <>
                            <button
                              onClick={() => handleApprove(therapist.id)}
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                            >
                              승인
                            </button>
                            <button
                              onClick={() => handleReject(therapist.id)}
                              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                            >
                              거부
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {therapist.additionalInfoRequested && (
                      <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-md">
                        <p className="text-sm text-orange-800">
                          <span className="font-medium">추가 자료 요청:</span> {therapist.additionalInfoRequested}
                        </p>
                      </div>
                    )}

                    {therapist.rejectionReason && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-800">
                          <span className="font-medium">반려 사유:</span> {therapist.rejectionReason}
                        </p>
                      </div>
                    )}

                    <div className="mt-3 flex flex-wrap gap-2">
                      {therapist.certifications.map((cert) => (
                        <span
                          key={cert.id}
                          className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded"
                        >
                          {cert.name}
                        </span>
                      ))}
                    </div>

                    <div className="mt-2 text-xs text-gray-400">
                      가입일: {new Date(therapist.createdAt).toLocaleDateString('ko-KR')}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}