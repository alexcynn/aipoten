'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminLayout from '@/components/layout/AdminLayout'

interface User {
  id: string
  name: string
  email: string
  phone: string
  role: string
  avatar: string | null
  createdAt: string
  _count: {
    children: number
    consultations: number
  }
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'PARENT' | 'THERAPIST' | 'ADMIN'>('ALL')
  const [searchTerm, setSearchTerm] = useState('')

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

    fetchUsers()
  }, [session, status, router])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('사용자 목록을 가져오는 중 오류 발생:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleUpdate = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (response.ok) {
        await fetchUsers()
      }
    } catch (error) {
      console.error('사용자 역할 업데이트 중 오류 발생:', error)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === 'ALL' || user.role === filter
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const getRoleBadge = (role: string) => {
    const badges: { [key: string]: { bg: string; text: string; label: string } } = {
      PARENT: { bg: 'bg-blue-100', text: 'text-blue-800', label: '부모' },
      THERAPIST: { bg: 'bg-green-100', text: 'text-green-800', label: '치료사' },
      ADMIN: { bg: 'bg-purple-100', text: 'text-purple-800', label: '관리자' }
    }
    const badge = badges[role] || badges.PARENT
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
    <AdminLayout title="사용자 관리">
      <div className="space-y-6">
        <div>
          <div className="mb-6">
            <p className="mt-2 text-gray-600">
              플랫폼에 가입한 모든 사용자를 관리할 수 있습니다.
            </p>
          </div>

          {/* Search and Filter */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="이름 또는 이메일로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aipoten-green focus:border-transparent"
              />
            </div>
            <div className="flex space-x-2">
              {['ALL', 'PARENT', 'THERAPIST', 'ADMIN'].map((role) => (
                <button
                  key={role}
                  onClick={() => setFilter(role as any)}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    filter === role
                      ? 'bg-aipoten-green text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {role === 'ALL' && '전체'}
                  {role === 'PARENT' && '부모'}
                  {role === 'THERAPIST' && '치료사'}
                  {role === 'ADMIN' && '관리자'}
                  <span className="ml-2 bg-gray-200 text-gray-700 py-0.5 px-2 rounded-full text-xs">
                    {role === 'ALL'
                      ? users.length
                      : users.filter(u => u.role === role).length
                    }
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">👥</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">전체 사용자</p>
                  <p className="text-2xl font-bold text-gray-900">{users.length}명</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">👨‍👩‍👧‍👦</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">부모</p>
                  <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === 'PARENT').length}명</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">👩‍⚕️</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">치료사</p>
                  <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === 'THERAPIST').length}명</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">👑</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">관리자</p>
                  <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === 'ADMIN').length}명</p>
                </div>
              </div>
            </div>
          </div>

          {/* Users List */}
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">👥</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? '검색 결과가 없습니다' : '사용자가 없습니다'}
              </h3>
              <p className="text-gray-500">
                {searchTerm ? '다른 검색어를 시도해보세요.' : '새로운 사용자 가입을 기다리고 있습니다.'}
              </p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <li key={user.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            {user.avatar ? (
                              <img
                                className="w-12 h-12 rounded-full"
                                src={user.avatar}
                                alt={user.name}
                              />
                            ) : (
                              <div className="w-12 h-12 bg-aipoten-blue rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold text-lg">
                                  {user.name.charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <div className="text-lg font-medium text-gray-900">
                                {user.name}
                              </div>
                              <div className="ml-2">
                                {getRoleBadge(user.role)}
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email} • {user.phone}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {user.role === 'PARENT' && `등록 아이 ${user._count.children}명`}
                              {user.role === 'THERAPIST' && `상담 ${user._count.consultations}회`}
                              {user.role === 'ADMIN' && '시스템 관리자'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="text-aipoten-green hover:text-aipoten-navy text-sm font-medium"
                          >
                            상세보기
                          </Link>
                          {user.role !== 'ADMIN' && (
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleUpdate(user.id, e.target.value)}
                              className="text-sm border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="PARENT">부모</option>
                              <option value="THERAPIST">치료사</option>
                              <option value="ADMIN">관리자</option>
                            </select>
                          )}
                        </div>
                      </div>

                      <div className="mt-2 text-xs text-gray-400">
                        가입일: {new Date(user.createdAt).toLocaleDateString('ko-KR')}
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