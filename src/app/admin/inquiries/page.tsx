'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/layout/AdminLayout'

interface Inquiry {
  id: string
  userId: string
  category: string
  title: string
  content: string
  status: string
  response: string | null
  respondedBy: string | null
  respondedAt: string | null
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}

export default function AdminInquiriesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'>('ALL')
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'SERVICE' | 'PAYMENT' | 'TECHNICAL' | 'OTHER'>('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [responseText, setResponseText] = useState('')
  const [responseStatus, setResponseStatus] = useState('RESOLVED')

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

    fetchInquiries()
  }, [session, status, router])

  const fetchInquiries = async () => {
    try {
      const response = await fetch('/api/admin/inquiries')
      if (response.ok) {
        const data = await response.json()
        setInquiries(data.inquiries || [])
      }
    } catch (error) {
      console.error('문의 목록을 가져오는 중 오류 발생:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRespond = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedInquiry || !responseText.trim()) {
      alert('답변 내용을 입력해주세요.')
      return
    }

    try {
      const response = await fetch(`/api/admin/inquiries/${selectedInquiry.id}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          response: responseText,
          status: responseStatus,
        }),
      })

      if (response.ok) {
        alert('답변이 등록되었습니다.')
        setSelectedInquiry(null)
        setResponseText('')
        setResponseStatus('RESOLVED')
        fetchInquiries()
      } else {
        const data = await response.json()
        alert(data.error || '답변 등록에 실패했습니다.')
      }
    } catch (error) {
      console.error('답변 등록 중 오류:', error)
      alert('답변 등록 중 오류가 발생했습니다.')
    }
  }

  const handleStatusChange = async (inquiryId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/inquiries/${inquiryId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchInquiries()
      } else {
        const data = await response.json()
        alert(data.error || '상태 변경에 실패했습니다.')
      }
    } catch (error) {
      console.error('상태 변경 중 오류:', error)
      alert('상태 변경 중 오류가 발생했습니다.')
    }
  }

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesStatusFilter = filter === 'ALL' || inquiry.status === filter
    const matchesCategoryFilter = categoryFilter === 'ALL' || inquiry.category === categoryFilter
    const matchesSearch =
      inquiry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatusFilter && matchesCategoryFilter && matchesSearch
  })

  const categoryLabels: Record<string, string> = {
    SERVICE: '서비스 이용',
    PAYMENT: '결제/환불',
    TECHNICAL: '기술 지원',
    OTHER: '기타',
  }

  const statusLabels: Record<string, { text: string; color: string }> = {
    PENDING: { text: '답변 대기', color: 'bg-yellow-100 text-yellow-800' },
    IN_PROGRESS: { text: '처리 중', color: 'bg-blue-100 text-blue-800' },
    RESOLVED: { text: '해결됨', color: 'bg-green-100 text-green-800' },
    CLOSED: { text: '종료됨', color: 'bg-gray-100 text-gray-800' },
  }

  const roleLabels: Record<string, string> = {
    PARENT: '부모',
    THERAPIST: '치료사',
    ADMIN: '관리자',
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
    <AdminLayout title="1:1 문의 관리">
      <div className="space-y-6">
        <div>
          <div className="mb-6">
            <p className="mt-2 text-gray-600">
              사용자의 문의를 확인하고 답변할 수 있습니다.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="제목, 내용, 사용자 이름 또는 이메일로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aipoten-green focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700 flex items-center">상태:</span>
              {['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status as any)}
                  className={`px-3 py-1 text-sm font-medium rounded-md ${
                    filter === status
                      ? 'bg-aipoten-green text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {status === 'ALL' && '전체'}
                  {status === 'PENDING' && '답변 대기'}
                  {status === 'IN_PROGRESS' && '처리 중'}
                  {status === 'RESOLVED' && '해결됨'}
                  {status === 'CLOSED' && '종료됨'}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700 flex items-center">카테고리:</span>
              {['ALL', 'SERVICE', 'PAYMENT', 'TECHNICAL', 'OTHER'].map((category) => (
                <button
                  key={category}
                  onClick={() => setCategoryFilter(category as any)}
                  className={`px-3 py-1 text-sm font-medium rounded-md ${
                    categoryFilter === category
                      ? 'bg-aipoten-green text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {category === 'ALL' ? '전체' : categoryLabels[category]}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-600">전체 문의</div>
              <div className="text-2xl font-bold text-gray-900">{inquiries.length}</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg shadow">
              <div className="text-sm text-yellow-800">답변 대기</div>
              <div className="text-2xl font-bold text-yellow-900">
                {inquiries.filter(i => i.status === 'PENDING').length}
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg shadow">
              <div className="text-sm text-blue-800">처리 중</div>
              <div className="text-2xl font-bold text-blue-900">
                {inquiries.filter(i => i.status === 'IN_PROGRESS').length}
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg shadow">
              <div className="text-sm text-green-800">해결됨</div>
              <div className="text-2xl font-bold text-green-900">
                {inquiries.filter(i => i.status === 'RESOLVED').length}
              </div>
            </div>
          </div>

          {/* Inquiries List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {filteredInquiries.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">💬</div>
                <p className="text-gray-500">
                  {searchTerm || filter !== 'ALL' || categoryFilter !== 'ALL'
                    ? '검색 결과가 없습니다.'
                    : '문의 내역이 없습니다.'}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {filteredInquiries.map((inquiry) => (
                  <li key={inquiry.id} className="hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              statusLabels[inquiry.status]?.color || 'bg-gray-100 text-gray-800'
                            }`}>
                              {statusLabels[inquiry.status]?.text || inquiry.status}
                            </span>
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                              {categoryLabels[inquiry.category]}
                            </span>
                            <span className="text-xs text-gray-500">
                              {roleLabels[inquiry.user.role]} • {inquiry.user.name}
                            </span>
                          </div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-1">{inquiry.title}</h4>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{inquiry.content}</p>
                          <div className="text-xs text-gray-500">
                            {new Date(inquiry.createdAt).toLocaleString('ko-KR')}
                            {inquiry.respondedAt && (
                              <span> • 답변일: {new Date(inquiry.respondedAt).toLocaleString('ko-KR')}</span>
                            )}
                          </div>

                          {/* Response */}
                          {inquiry.response && (
                            <div className="mt-3 p-3 bg-green-50 rounded-md border border-green-200">
                              <div className="text-xs font-semibold text-green-800 mb-1">관리자 답변</div>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{inquiry.response}</p>
                            </div>
                          )}
                        </div>

                        <div className="ml-4 flex flex-col gap-2">
                          <button
                            onClick={() => {
                              setSelectedInquiry(inquiry)
                              setResponseText(inquiry.response || '')
                              setResponseStatus(inquiry.status)
                            }}
                            className="px-3 py-1 text-xs rounded-md transition-colors"
                            style={{
                              backgroundColor: '#386646',
                              color: '#FFFFFF'
                            }}
                          >
                            {inquiry.response ? '답변 수정' : '답변하기'}
                          </button>

                          {inquiry.status !== 'CLOSED' && (
                            <select
                              value={inquiry.status}
                              onChange={(e) => handleStatusChange(inquiry.id, e.target.value)}
                              className="text-xs border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-aipoten-green"
                            >
                              <option value="PENDING">답변 대기</option>
                              <option value="IN_PROGRESS">처리 중</option>
                              <option value="RESOLVED">해결됨</option>
                              <option value="CLOSED">종료됨</option>
                            </select>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Response Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">문의 답변</h3>
                <button
                  onClick={() => {
                    setSelectedInquiry(null)
                    setResponseText('')
                    setResponseStatus('RESOLVED')
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>

              {/* Inquiry Details */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                    {categoryLabels[selectedInquiry.category]}
                  </span>
                  <span className="text-xs text-gray-600">
                    {roleLabels[selectedInquiry.user.role]} • {selectedInquiry.user.name} ({selectedInquiry.user.email})
                  </span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{selectedInquiry.title}</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap mb-2">{selectedInquiry.content}</p>
                <div className="text-xs text-gray-500">
                  {new Date(selectedInquiry.createdAt).toLocaleString('ko-KR')}
                </div>
              </div>

              {/* Response Form */}
              <form onSubmit={handleRespond} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    답변 내용
                  </label>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="답변 내용을 입력해주세요"
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aipoten-green"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    문의 상태
                  </label>
                  <select
                    value={responseStatus}
                    onChange={(e) => setResponseStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aipoten-green"
                  >
                    <option value="IN_PROGRESS">처리 중</option>
                    <option value="RESOLVED">해결됨</option>
                    <option value="CLOSED">종료됨</option>
                  </select>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-md transition-colors font-medium"
                    style={{
                      backgroundColor: '#386646',
                      color: '#FFFFFF'
                    }}
                  >
                    답변 등록
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedInquiry(null)
                      setResponseText('')
                      setResponseStatus('RESOLVED')
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                  >
                    취소
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
