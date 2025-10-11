'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'

interface UserDetail {
  id: string
  name: string
  email: string
  phone: string
  role: string
  avatar: string | null
  createdAt: string
  children: Array<{
    id: string
    name: string
    birthDate: string
    gender: string
    createdAt: string
  }>
  consultations: Array<{
    id: string
    scheduledAt: string
    status: string
    fee: number
    child: {
      name: string
    }
  }>
  therapistProfile?: {
    id: string
    specialty: string
    experience: number
    status: string
    consultationFee: number
  }
}

export default function AdminUserDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [user, setUser] = useState<UserDetail | null>(null)
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

    fetchUser()
  }, [session, status, router, params.id])

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/admin/users/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setUser(data)
      } else {
        router.push('/admin/users')
      }
    } catch (error) {
      console.error('사용자 정보를 가져오는 중 오류 발생:', error)
      router.push('/admin/users')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleUpdate = async (newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (response.ok) {
        await fetchUser()
      }
    } catch (error) {
      console.error('역할 업데이트 중 오류 발생:', error)
    }
  }

  const handleDeleteUser = async () => {
    if (!confirm('정말로 이 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${params.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/admin/users')
      }
    } catch (error) {
      console.error('사용자 삭제 중 오류 발생:', error)
    }
  }

  const getRoleBadge = (role: string) => {
    const badges: { [key: string]: { bg: string; text: string; label: string } } = {
      PARENT: { bg: 'bg-blue-100', text: 'text-blue-800', label: '부모' },
      THERAPIST: { bg: 'bg-green-100', text: 'text-green-800', label: '치료사' },
      ADMIN: { bg: 'bg-purple-100', text: 'text-purple-800', label: '관리자' }
    }
    const badge = badges[role] || badges.PARENT
    return (
      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    )
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

  if (!session || !user) {
    return null
  }

  const completedConsultations = user.consultations.filter(c => c.status === 'COMPLETED')
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
                {user.avatar ? (
                  <img
                    className="w-16 h-16 rounded-full mr-4"
                    src={user.avatar}
                    alt={user.name}
                  />
                ) : (
                  <div className="w-16 h-16 bg-aipoten-blue rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-2xl">
                      {user.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                  <p className="text-gray-600">{user.email}</p>
                  <div className="mt-2">
                    {getRoleBadge(user.role)}
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                {user.role !== 'ADMIN' && (
                  <>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleUpdate(e.target.value)}
                      className="border border-gray-300 rounded px-3 py-2"
                    >
                      <option value="PARENT">부모</option>
                      <option value="THERAPIST">치료사</option>
                      <option value="ADMIN">관리자</option>
                    </select>
                    <button
                      onClick={handleDeleteUser}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                    >
                      사용자 삭제
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">👶</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">등록된 아이</p>
                  <p className="text-2xl font-bold text-gray-900">{user.children.length}명</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">💬</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">상담 건수</p>
                  <p className="text-2xl font-bold text-gray-900">{user.consultations.length}회</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">💰</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {user.role === 'THERAPIST' ? '수익' : '지출'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">₩{totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* User Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">기본 정보</h3>
              <div className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">이름</dt>
                  <dd className="text-sm text-gray-900">{user.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">이메일</dt>
                  <dd className="text-sm text-gray-900">{user.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">전화번호</dt>
                  <dd className="text-sm text-gray-900">{user.phone}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">역할</dt>
                  <dd className="text-sm text-gray-900">{getRoleBadge(user.role)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">가입일</dt>
                  <dd className="text-sm text-gray-900">{new Date(user.createdAt).toLocaleDateString('ko-KR')}</dd>
                </div>
              </div>
            </div>

            {/* Role Specific Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {user.role === 'THERAPIST' ? '치료사 정보' : '활동 정보'}
              </h3>
              {user.therapistProfile ? (
                <div className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">전문 분야</dt>
                    <dd className="text-sm text-gray-900">{getSpecialtyLabel(user.therapistProfile.specialty)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">경력</dt>
                    <dd className="text-sm text-gray-900">{user.therapistProfile.experience}년</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">상담료</dt>
                    <dd className="text-sm text-gray-900">₩{user.therapistProfile.consultationFee.toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">승인 상태</dt>
                    <dd className="text-sm text-gray-900">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.therapistProfile.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        user.therapistProfile.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {user.therapistProfile.status === 'APPROVED' ? '승인됨' :
                         user.therapistProfile.status === 'PENDING' ? '승인 대기' : '거부됨'}
                      </span>
                    </dd>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <span className="text-4xl mb-4 block">
                    {user.role === 'PARENT' ? '👨‍👩‍👧‍👦' : '👑'}
                  </span>
                  <p>
                    {user.role === 'PARENT' ? '부모 사용자입니다.' : '관리자 사용자입니다.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Children List (for parents) */}
          {user.role === 'PARENT' && user.children.length > 0 && (
            <div className="mt-8 bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">등록된 아이들</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {user.children.map((child) => (
                    <div key={child.id} className="border rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-aipoten-accent rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-semibold text-sm">
                            {child.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{child.name}</div>
                          <div className="text-sm text-gray-500">
                            {child.gender === 'MALE' ? '남아' : '여아'} •
                            {Math.floor((new Date().getTime() - new Date(child.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25))}세
                          </div>
                          <div className="text-xs text-gray-400">
                            등록일: {new Date(child.createdAt).toLocaleDateString('ko-KR')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Consultation History */}
          {user.consultations.length > 0 && (
            <div className="mt-8 bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">상담 내역</h3>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          날짜
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          아이
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
                      {user.consultations.slice(0, 10).map((consultation) => (
                        <tr key={consultation.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(consultation.scheduledAt).toLocaleString('ko-KR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {consultation.child.name}
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
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}