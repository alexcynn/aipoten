'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/layout/AdminLayout'

interface InquiryMessage {
  id: string
  inquiryId: string
  senderId: string
  senderType: 'USER' | 'ADMIN'
  content: string
  isRead: boolean
  createdAt: string
}

interface Inquiry {
  id: string
  userId: string
  category: string
  title: string
  content: string
  status: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
    role: string
    phone?: string
    address?: string
    addressDetail?: string
    therapistProfile?: any
  }
}

export default function AdminInquiriesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [messages, setMessages] = useState<InquiryMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'>('ALL')
  const [showUserModal, setShowUserModal] = useState(false)

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

  // 메시지 목록 자동 스크롤
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 자동 새로고침 (선택된 문의의 메시지만)
  useEffect(() => {
    if (!selectedInquiry) return

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/admin/inquiries/${selectedInquiry.id}/messages`)
        if (response.ok) {
          const data = await response.json()
          setMessages(data.messages || [])
        }
      } catch (error) {
        console.error('메시지 자동 새로고침 오류:', error)
      }
    }, 10000) // 10초마다

    return () => clearInterval(interval)
  }, [selectedInquiry?.id])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchInquiries = async () => {
    try {
      const response = await fetch('/api/admin/inquiries')
      if (response.ok) {
        const data = await response.json()
        setInquiries(data.inquiries || [])
      } else {
        const errorData = await response.json()
        console.error('문의 목록 조회 실패:', response.status, errorData)
        alert(`문의 목록을 불러올 수 없습니다: ${errorData.error || '알 수 없는 오류'}`)
      }
    } catch (error) {
      console.error('문의 목록 조회 오류:', error)
      alert('문의 목록 조회 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMessages = async (inquiryId: string) => {
    try {
      const response = await fetch(`/api/admin/inquiries/${inquiryId}/messages`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('메시지 조회 오류:', error)
    }
  }

  const handleSelectInquiry = async (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry)
    await fetchMessages(inquiry.id)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedInquiry || !newMessage.trim() || isSendingMessage) {
      return
    }

    setIsSendingMessage(true)

    try {
      const response = await fetch(`/api/admin/inquiries/${selectedInquiry.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage.trim() }),
      })

      if (response.ok) {
        setNewMessage('')
        await fetchMessages(selectedInquiry.id)
        await fetchInquiries()
      } else {
        const data = await response.json()
        alert(data.error || '메시지 전송에 실패했습니다.')
      }
    } catch (error) {
      console.error('메시지 전송 오류:', error)
      alert('메시지 전송 중 오류가 발생했습니다.')
    } finally {
      setIsSendingMessage(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedInquiry) return

    try {
      const response = await fetch(`/api/admin/inquiries/${selectedInquiry.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        await fetchInquiries()
        setSelectedInquiry({ ...selectedInquiry, status: newStatus })
      }
    } catch (error) {
      console.error('상태 변경 오류:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      RESOLVED: 'bg-green-100 text-green-800',
      CLOSED: 'bg-gray-100 text-gray-800',
    }
    const labels = {
      PENDING: '대기',
      IN_PROGRESS: '처리중',
      RESOLVED: '해결됨',
      CLOSED: '종료됨',
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const getCategoryLabel = (category: string) => {
    const labels = {
      SERVICE: '서비스',
      PAYMENT: '결제',
      TECHNICAL: '기술',
      OTHER: '기타',
    }
    return labels[category as keyof typeof labels] || category
  }

  const filteredInquiries = inquiries.filter(inquiry => {
    if (filter !== 'ALL' && inquiry.status !== filter) return false
    return true
  })

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">1:1 문의 관리</h1>
          <div className="flex gap-2">
            {(['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {f === 'ALL' ? '전체' : f === 'PENDING' ? '대기' : f === 'IN_PROGRESS' ? '처리중' : f === 'RESOLVED' ? '해결됨' : '종료됨'}
              </button>
            ))}
          </div>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="grid grid-cols-3 gap-6 h-[calc(100vh-250px)]">
          {/* 문의 목록 */}
          <div className="col-span-1 bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h2 className="font-semibold text-gray-900">문의 목록</h2>
              <p className="text-sm text-gray-600 mt-1">총 {filteredInquiries.length}건</p>
            </div>
            <div className="overflow-y-auto h-[calc(100%-80px)]">
              {filteredInquiries.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  문의가 없습니다
                </div>
              ) : (
                filteredInquiries.map((inquiry) => (
                  <div
                    key={inquiry.id}
                    onClick={() => handleSelectInquiry(inquiry)}
                    className={`p-4 border-b cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedInquiry?.id === inquiry.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 text-sm line-clamp-1">
                          {inquiry.title}
                        </h3>
                        <p className="text-xs text-gray-600 mt-1">
                          {inquiry.user.name} ({inquiry.user.role === 'PARENT' ? '부모' : '치료사'})
                        </p>
                      </div>
                      <div className="ml-2">
                        {getStatusBadge(inquiry.status)}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {getCategoryLabel(inquiry.category)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(inquiry.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 메시지 영역 */}
          <div className="col-span-2 bg-white rounded-lg shadow flex flex-col">
            {selectedInquiry ? (
              <>
                {/* 채팅 헤더 */}
                <div className="p-4 border-b bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h2 className="font-semibold text-gray-900">{selectedInquiry.title}</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedInquiry.user.name} ({selectedInquiry.user.role === 'PARENT' ? '부모' : '치료사'})
                        {selectedInquiry.user.email && ` • ${selectedInquiry.user.email}`}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        <strong>최초 문의:</strong> {selectedInquiry.content}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowUserModal(true)}
                        className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        사용자 정보
                      </button>
                      <select
                        value={selectedInquiry.status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="px-3 py-1.5 border border-gray-300 rounded text-sm"
                      >
                        <option value="PENDING">대기</option>
                        <option value="IN_PROGRESS">처리중</option>
                        <option value="RESOLVED">해결됨</option>
                        <option value="CLOSED">종료됨</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 메시지 목록 */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      아직 메시지가 없습니다. 첫 메시지를 보내보세요!
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderType === 'ADMIN' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-2 ${
                            message.senderType === 'ADMIN'
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.senderType === 'ADMIN' ? 'text-green-100' : 'text-gray-500'
                          }`}>
                            {new Date(message.createdAt).toLocaleString('ko-KR')}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* 메시지 입력 */}
                <form onSubmit={handleSendMessage} className="p-4 border-t bg-gray-50">
                  <div className="flex gap-2">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="메시지를 입력하세요..."
                      rows={3}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                      disabled={isSendingMessage}
                    />
                    <button
                      type="submit"
                      disabled={isSendingMessage || !newMessage.trim()}
                      className="px-6 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSendingMessage ? '전송중...' : '전송'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                왼쪽에서 문의를 선택하세요
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 사용자 정보 모달 */}
      {showUserModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">사용자 정보</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedInquiry.user.role === 'PARENT' ? '부모' : '치료사'} 정보
                  </p>
                </div>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">기본 정보</h3>
                <div className="bg-gray-50 p-4 rounded-md space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">이름</span>
                    <span className="text-sm font-medium text-gray-900">{selectedInquiry.user.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">이메일</span>
                    <span className="text-sm font-medium text-gray-900">{selectedInquiry.user.email}</span>
                  </div>
                  {selectedInquiry.user.phone && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">전화번호</span>
                      <span className="text-sm font-medium text-gray-900">{selectedInquiry.user.phone}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">사용자 유형</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedInquiry.user.role === 'PARENT' ? '부모' : '치료사'}
                    </span>
                  </div>
                  {selectedInquiry.user.address && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">주소</span>
                      <span className="text-sm font-medium text-gray-900 text-right">
                        {selectedInquiry.user.address}
                        {selectedInquiry.user.addressDetail && `, ${selectedInquiry.user.addressDetail}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 치료사 추가 정보 */}
              {selectedInquiry.user.role === 'THERAPIST' && selectedInquiry.user.therapistProfile && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">치료사 정보</h3>
                  <div className="bg-gray-50 p-4 rounded-md space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">승인 상태</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedInquiry.user.therapistProfile.approvalStatus === 'APPROVED' ? '승인됨' :
                         selectedInquiry.user.therapistProfile.approvalStatus === 'PENDING' ? '신청' :
                         selectedInquiry.user.therapistProfile.approvalStatus === 'WAITING' ? '대기' : '거절됨'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-gray-50">
              <button
                onClick={() => setShowUserModal(false)}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
