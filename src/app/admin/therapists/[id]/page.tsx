'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'

interface TherapistDetail {
  id: string
  user: {
    name: string
    email: string
    phone: string
    createdAt: string
  }
  specialty: string
  experience: number
  education: string
  certifications: string[]
  consultationFee: number
  description: string
  status: string
  createdAt: string
  consultations: Array<{
    id: string
    status: string
    scheduledAt: string
    fee: number
  }>
}

export default function AdminTherapistDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [therapist, setTherapist] = useState<TherapistDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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

    fetchTherapist()
  }, [session, status, router, params.id])

  const fetchTherapist = async () => {
    try {
      const response = await fetch(`/api/admin/therapists/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setTherapist(data)
      } else {
        router.push('/admin/therapists')
      }
    } catch (error) {
      console.error('치료사 정보를 가져오는 중 오류 발생:', error)
      router.push('/admin/therapists')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/therapists/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        await fetchTherapist()
      }
    } catch (error) {
      console.error('상태 업데이트 중 오류 발생:', error)
    }
  }

  const getSpecialtyLabel = (specialty: string) => {
    const labels: { [key: string]: string } = {
      SPEECH: '언어치료',
      OCCUPATIONAL: '작업치료',
      PHYSICAL: '물리치료',
      BEHAVIORAL: '행동치료',
      ART: '미술치료',
      MUSIC: '음악치료',
      PLAY: '놀이치료'
    }
    return labels[specialty] || specialty
  }

  const getStatusBadge = (status: string) => {
    const badges: { [key: string]: { bg: string; text: string; label: string } } = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '승인 대기' },
      APPROVED: { bg: 'bg-green-100', text: 'text-green-800', label: '승인됨' },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-800', label: '거부됨' }
    }
    const badge = badges[status] || badges.PENDING
    return (
      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${badge.bg} ${badge.text}`}>
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

  if (!session || !therapist) {
    return null
  }

  const completedConsultations = therapist.consultations.filter(c => c.status === 'COMPLETED')
  const totalRevenue = completedConsultations.reduce((sum, c) => sum + c.fee, 0)

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-aipoten-blue rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold text-2xl">
                    {therapist.user.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{therapist.user.name}</h1>
                  <p className="text-gray-600">{getSpecialtyLabel(therapist.specialty)} 치료사</p>
                  <div className="mt-2">
                    {getStatusBadge(therapist.status)}
                  </div>
                </div>
              </div>

              {therapist.status === 'PENDING' && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleStatusUpdate('APPROVED')}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  >
                    승인
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('REJECTED')}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                  >
                    거부
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">💬</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">총 상담 건수</p>
                  <p className="text-2xl font-bold text-gray-900">{therapist.consultations.length}회</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">✅</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">완료된 상담</p>
                  <p className="text-2xl font-bold text-gray-900">{completedConsultations.length}회</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">💰</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">총 수익</p>
                  <p className="text-2xl font-bold text-gray-900">₩{totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">기본 정보</h3>
              <div className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">이메일</dt>
                  <dd className="text-sm text-gray-900">{therapist.user.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">전화번호</dt>
                  <dd className="text-sm text-gray-900">{therapist.user.phone}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">전문 분야</dt>
                  <dd className="text-sm text-gray-900">
                    {therapist.specialty ? getSpecialtyLabel(therapist.specialty) : '미등록'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">경력</dt>
                  <dd className="text-sm text-gray-900">
                    {therapist.experience ? `${therapist.experience}년` : '미등록'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">상담료</dt>
                  <dd className="text-sm text-gray-900">
                    {therapist.sessionFee || therapist.consultationFee
                      ? `₩${(therapist.sessionFee || therapist.consultationFee).toLocaleString()}`
                      : '미등록'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">가입일</dt>
                  <dd className="text-sm text-gray-900">{new Date(therapist.user.createdAt).toLocaleDateString('ko-KR')}</dd>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">전문 정보</h3>
              <div className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">학력</dt>
                  <dd className="text-sm text-gray-900">{therapist.education || '미등록'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">자격증</dt>
                  <dd className="text-sm text-gray-900">
                    <div className="flex flex-wrap gap-1 mt-1">
                      {therapist.certifications && therapist.certifications.length > 0 ? (
                        therapist.certifications.map((cert, index) => (
                          <span
                            key={index}
                            className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded"
                          >
                            {typeof cert === 'string' ? cert : cert.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500">미등록</span>
                      )}
                    </div>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">소개</dt>
                  <dd className="text-sm text-gray-900 mt-1">
                    {therapist.description || '소개글이 없습니다.'}
                  </dd>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Consultations */}
          <div className="mt-8 bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">최근 상담 내역</h3>
            </div>
            <div className="p-6">
              {therapist.consultations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <span className="text-4xl mb-4 block">💬</span>
                  <p>아직 상담 내역이 없습니다.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          날짜
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          상태
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          상담료
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {therapist.consultations.slice(0, 10).map((consultation) => (
                        <tr key={consultation.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(consultation.scheduledAt).toLocaleString('ko-KR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              consultation.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                              consultation.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {consultation.status === 'COMPLETED' ? '완료' :
                               consultation.status === 'SCHEDULED' ? '예정' : consultation.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₩{consultation.fee.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}