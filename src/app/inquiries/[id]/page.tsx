'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'

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
  }
}

export default function InquiryDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [inquiry, setInquiry] = useState<Inquiry | null>(null)
  const [messages, setMessages] = useState<InquiryMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSendingMessage, setIsSendingMessage] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    fetchInquiryAndMessages()
  }, [session, status, router, params.id])

  // 메시지 목록 자동 스크롤
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 자동 새로고침 (10초마다)
  useEffect(() => {
    if (!params.id) return

    const interval = setInterval(async () => {
      try {
        const messagesResponse = await fetch(`/api/inquiry/${params.id}/messages`)
        if (messagesResponse.ok) {
          const messagesData = await messagesResponse.json()
          setMessages(messagesData.messages || [])
        }
      } catch (error) {
        console.error('자동 새로고침 오류:', error)
      }
    }, 10000) // 10초마다

    return () => clearInterval(interval)
  }, [params.id])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchInquiryAndMessages = async () => {
    try {
      // 문의 정보 조회
      const inquiryResponse = await fetch(`/api/inquiry/${params.id}`)
      if (inquiryResponse.ok) {
        const inquiryData = await inquiryResponse.json()
        setInquiry(inquiryData.inquiry)
      } else {
        alert('문의를 찾을 수 없습니다.')
        router.back()
        return
      }

      // 메시지 목록 조회
      const messagesResponse = await fetch(`/api/inquiry/${params.id}/messages`)
      if (messagesResponse.ok) {
        const messagesData = await messagesResponse.json()
        setMessages(messagesData.messages || [])
      } else {
        const errorData = await messagesResponse.json()
        console.error('메시지 조회 실패:', messagesResponse.status, errorData)
        if (messagesResponse.status === 403) {
          alert('메시지를 볼 권한이 없습니다.')
        }
      }
    } catch (error) {
      console.error('데이터 조회 오류:', error)
      alert('데이터를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || isSendingMessage) {
      return
    }

    setIsSendingMessage(true)

    try {
      const response = await fetch(`/api/inquiry/${params.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage.trim() }),
      })

      if (response.ok) {
        setNewMessage('')
        await fetchInquiryAndMessages()
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    )
  }

  if (!inquiry) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">문의를 찾을 수 없습니다.</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto p-6">

        {/* 문의 정보 카드 */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{inquiry.title}</h1>
                <div className="flex gap-3 text-sm text-gray-600">
                  <span className="px-2 py-1 bg-gray-100 rounded">
                    {getCategoryLabel(inquiry.category)}
                  </span>
                  {getStatusBadge(inquiry.status)}
                  <span>{new Date(inquiry.createdAt).toLocaleString('ko-KR')}</span>
                </div>
              </div>
              <button
                onClick={() => fetchInquiryAndMessages()}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                새로고침
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm font-medium text-gray-700 mb-2">최초 문의 내용</p>
              <p className="text-gray-900 whitespace-pre-wrap">{inquiry.content}</p>
            </div>
          </div>

          {/* 메시지 목록 */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">메시지</h2>
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  아직 메시지가 없습니다. 관리자의 답변을 기다려주세요.
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderType === 'ADMIN' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-3 ${
                        message.senderType === 'ADMIN'
                          ? 'bg-gray-100 text-gray-900'
                          : 'bg-green-600 text-white'
                      }`}
                    >
                      <div className={`text-xs mb-1 ${
                        message.senderType === 'ADMIN' ? 'text-gray-600' : 'text-green-100'
                      }`}>
                        {message.senderType === 'ADMIN' ? '관리자' : '나'}
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.senderType === 'ADMIN' ? 'text-gray-500' : 'text-green-100'
                      }`}>
                        {new Date(message.createdAt).toLocaleString('ko-KR')}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* 메시지 입력 폼 */}
            {inquiry.status !== 'CLOSED' && (
              <form onSubmit={handleSendMessage} className="border-t pt-4">
                <div className="space-y-3">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="메시지를 입력하세요..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    disabled={isSendingMessage}
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSendingMessage || !newMessage.trim()}
                      className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSendingMessage ? '전송중...' : '메시지 전송'}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {inquiry.status === 'CLOSED' && (
              <div className="border-t pt-4">
                <p className="text-center text-gray-500 text-sm">
                  이 문의는 종료되었습니다. 새로운 문의를 등록해주세요.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
