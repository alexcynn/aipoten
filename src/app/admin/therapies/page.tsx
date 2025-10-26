'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminLayout from '@/components/layout/AdminLayout'

interface Therapy {
  id: string
  scheduledAt: string
  duration: number
  sessionType: string
  status: string
  paidAt: string | null
  finalFee: number
  sessionCount: number
  completedSessions: number
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
  }
  therapist: {
    id: string
    user: {
      name: string
      phone: string | null
    }
  }
  timeSlot: {
    date: string
    startTime: string
    endTime: string
  }
}

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING_CONFIRMATION: { label: '확인 대기', color: 'bg-yellow-100 text-yellow-800' },
  CONFIRMED: { label: '확정됨', color: 'bg-green-100 text-green-800' },
  IN_PROGRESS: { label: '진행 중', color: 'bg-blue-100 text-blue-800' },
  COMPLETED: { label: '완료', color: 'bg-gray-100 text-gray-800' },
  CANCELLED: { label: '취소됨', color: 'bg-red-100 text-red-800' },
  REJECTED: { label: '거절됨', color: 'bg-red-100 text-red-800' },
  NO_SHOW: { label: '노쇼', color: 'bg-red-100 text-red-800' },
}

export default function AdminTherapiesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [therapies, setTherapies] = useState<Therapy[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'>('ALL')

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

    fetchTherapies()
  }, [session, status, router, filter])

  const fetchTherapies = async () => {
    try {
      const response = await fetch(`/api/admin/therapies?status=${filter}`)
      if (response.ok) {
        const data = await response.json()
        setTherapies(data.therapies || [])
      }
    } catch (error) {
      console.error('홈티 목록 조회 오류:', error)
    } finally {
      setIsLoading(false)
    }
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
    <AdminLayout title="홈티 관리">
      <div className="space-y-6">
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
              전체 ({therapies.length})
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

        {/* 홈티 목록 */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {therapies.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">홈티 내역이 없습니다.</p>
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
                      진행 상황
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      비용
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      결제
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {therapies.map((therapy) => (
                    <tr key={therapy.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {therapy.parentUser.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {therapy.child.name} ({therapy.child.gender === 'MALE' ? '남' : '여'})
                        </div>
                        <div className="text-xs text-gray-400">
                          {therapy.parentUser.phone || therapy.parentUser.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {therapy.therapist.user.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {therapy.therapist.user.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(therapy.scheduledAt).toLocaleDateString('ko-KR')}
                        </div>
                        <div className="text-sm text-gray-500">
                          {therapy.timeSlot.startTime} - {therapy.timeSlot.endTime}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {therapy.completedSessions} / {therapy.sessionCount} 회
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-aipoten-green h-2 rounded-full"
                            style={{
                              width: `${(therapy.completedSessions / therapy.sessionCount) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            statusLabels[therapy.status]?.color || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {statusLabels[therapy.status]?.label || therapy.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ₩{therapy.finalFee.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {therapy.paidAt ? (
                          <div>
                            <div className="text-sm text-green-600 font-medium">결제 완료</div>
                            <div className="text-xs text-gray-500">
                              {new Date(therapy.paidAt).toLocaleDateString('ko-KR')}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-orange-600 font-medium">결제 대기</div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
