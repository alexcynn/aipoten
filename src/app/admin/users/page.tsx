'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/layout/AdminLayout'
import Pagination from '@/components/admin/Pagination'
import ParentInfoModal from '@/components/modals/ParentInfoModal'

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
    bookings: number
  }
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
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

    fetchUsers()
  }, [session, status, router])

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

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

  const handleOpenModal = (userId: string) => {
    setSelectedParentId(userId)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedParentId(null)
  }

  // 부모만 필터링
  const parentUsers = users.filter(user => user.role === 'PARENT')

  const filteredUsers = parentUsers.filter(user => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return user.name.toLowerCase().includes(searchLower) ||
           user.email.toLowerCase().includes(searchLower) ||
           user.phone.includes(searchTerm)
  })

  // 통계 계산
  const stats = {
    total: parentUsers.length,
    totalChildren: parentUsers.reduce((sum, u) => sum + u._count.children, 0),
    totalConsultations: parentUsers.reduce((sum, u) => sum + u._count.consultations, 0),
    totalBookings: parentUsers.reduce((sum, u) => sum + u._count.bookings, 0),
  }

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

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
    <AdminLayout title="부모 관리">
      <div className="space-y-6">
        {/* 통계 */}
        <div className="bg-white shadow rounded-xl p-6">
          <div className="flex justify-between items-center">
            <p className="text-stone-600 font-pretendard">
              플랫폼에 가입한 부모 회원을 관리할 수 있습니다.
            </p>
            <div className="flex items-center space-x-4 text-sm font-pretendard">
              <div>
                전체 <span className="font-semibold text-stone-900">{stats.total}</span>명
                <span className="mx-2">|</span>
                아이 <span className="font-semibold text-[#FF6A00]">{stats.totalChildren}</span>명
                <span className="mx-2">|</span>
                언어 컨설팅 <span className="font-semibold text-[#FF6A00]">{stats.totalConsultations}</span>회
                <span className="mx-2">|</span>
                홈티 <span className="font-semibold text-[#FF6A00]">{stats.totalBookings}</span>회
              </div>
            </div>
          </div>
        </div>

        {/* 검색 */}
        <div className="bg-white shadow rounded-xl p-4">
          <input
            type="text"
            placeholder="이름, 이메일, 전화번호로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:border-transparent font-pretendard"
          />
        </div>

        {/* 부모 목록 */}
        {filteredUsers.length === 0 ? (
          <div className="bg-white shadow rounded-xl">
            <div className="text-center py-12">
              <div className="text-stone-400 text-6xl mb-4">👨‍👩‍👧‍👦</div>
              <h3 className="text-lg font-medium text-stone-900 font-pretendard mb-2">
                {searchTerm ? '검색 결과가 없습니다' : '등록된 부모가 없습니다'}
              </h3>
              <p className="text-stone-500 font-pretendard">
                {searchTerm ? '다른 검색어를 시도해보세요.' : '부모 회원 가입을 기다리고 있습니다.'}
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
                        이메일
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider font-pretendard">
                        전화번호
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-stone-500 uppercase tracking-wider font-pretendard">
                        등록 아이
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-stone-500 uppercase tracking-wider font-pretendard">
                        언어 컨설팅
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-stone-500 uppercase tracking-wider font-pretendard">
                        홈티
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
                    {paginatedUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-[#FFF5F0]">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {user.avatar ? (
                                <img
                                  className="h-10 w-10 rounded-full"
                                  src={user.avatar}
                                  alt={user.name}
                                />
                              ) : (
                                <div className="h-10 w-10 bg-[#FFE5E5] rounded-full flex items-center justify-center">
                                  <span className="text-[#FF6A00] font-semibold font-pretendard">
                                    {user.name.charAt(0)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-stone-900 font-pretendard">
                                {user.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-stone-900 font-pretendard">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-stone-900 font-pretendard">{user.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-stone-900 font-pretendard">
                          {user._count.children}명
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-stone-900 font-pretendard">
                          {user._count.consultations}회
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-stone-900 font-pretendard">
                          {user._count.bookings}회
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500 font-pretendard">
                          {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleOpenModal(user.id)}
                            className="px-3 py-1 bg-[#FF6A00] text-white text-xs font-medium rounded-[10px] hover:bg-[#E55F00] transition-colors font-pretendard"
                          >
                            상세
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredUsers.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={filteredUsers.length}
                />
              )}
            </div>
        )}
      </div>

      {/* 부모 정보 모달 */}
      <ParentInfoModal
        parentId={selectedParentId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </AdminLayout>
  )
}