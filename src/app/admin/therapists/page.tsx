'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminLayout from '@/components/layout/AdminLayout'

interface TherapistProfile {
  id: string
  user: {
    name: string
    email: string
    phone: string
  }
  specialty: string
  experience: number
  education: string
  certifications: string[]
  consultationFee: number
  description: string
  status: string
  createdAt: string
}

export default function AdminTherapistsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [therapists, setTherapists] = useState<TherapistProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL')

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
      const response = await fetch('/api/admin/therapists')
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
    try {
      const response = await fetch(`/api/admin/therapists/${therapistId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'APPROVED' }),
      })

      if (response.ok) {
        await fetchTherapists()
      }
    } catch (error) {
      console.error('치료사 승인 중 오류 발생:', error)
    }
  }

  const handleReject = async (therapistId: string) => {
    try {
      const response = await fetch(`/api/admin/therapists/${therapistId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'REJECTED' }),
      })

      if (response.ok) {
        await fetchTherapists()
      }
    } catch (error) {
      console.error('치료사 거부 중 오류 발생:', error)
    }
  }

  const filteredTherapists = therapists.filter(therapist => {
    if (filter === 'ALL') return true
    return therapist.status === filter
  })

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
                {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      filter === status
                        ? 'border-aipoten-green text-aipoten-green'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {status === 'ALL' && '전체'}
                    {status === 'PENDING' && '승인 대기'}
                    {status === 'APPROVED' && '승인됨'}
                    {status === 'REJECTED' && '거부됨'}
                    <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                      {status === 'ALL'
                        ? therapists.length
                        : therapists.filter(t => t.status === status).length
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
                                {getStatusBadge(therapist.status)}
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">
                              {therapist.user.email} • {therapist.user.phone}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {getSpecialtyLabel(therapist.specialty)} •
                              경력 {therapist.experience}년 •
                              상담료 ₩{therapist.consultationFee.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/admin/therapists/${therapist.id}`}
                            className="text-aipoten-green hover:text-aipoten-navy text-sm font-medium"
                          >
                            상세보기
                          </Link>
                          {therapist.status === 'PENDING' && (
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

                      {therapist.description && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {therapist.description}
                          </p>
                        </div>
                      )}

                      <div className="mt-3 flex flex-wrap gap-2">
                        {therapist.certifications.map((cert, index) => (
                          <span
                            key={index}
                            className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded"
                          >
                            {cert}
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
      </div>
    </AdminLayout>
  )
}