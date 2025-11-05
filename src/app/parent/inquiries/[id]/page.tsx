'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'

export default function InquiryDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const inquiryId = params.id as string

  const [inquiry, setInquiry] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newMessage, setNewMessage] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }

    fetchInquiry()
    fetchMessages()
  }, [session, status, router, inquiryId])

  const fetchInquiry = async () => {
    try {
      const response = await fetch(`/api/inquiry/${inquiryId}`)
      if (response.ok) {
        const data = await response.json()
        setInquiry(data.inquiry || data)
      }
    } catch (error) {
      console.error('Error fetching inquiry:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/inquiry/${inquiryId}/messages`)
      if (response.ok) {
        const data = await response.json()
        setMessages(Array.isArray(data) ? data : (data.messages || []))
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim()) return

    try {
      const response = await fetch(`/api/inquiry/${inquiryId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage })
      })

      if (response.ok) {
        setNewMessage('')
        fetchMessages()
      } else {
        alert('메시지 전송에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('메시지 전송 중 오류가 발생했습니다.')
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

  if (!inquiry) {
    return (
      <div className="min-h-screen bg-neutral-light flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">문의를 찾을 수 없습니다.</p>
          <Link href="/parent/inquiries" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
            문의 목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-light">
      <Header />

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Back Button */}
          <Link
            href="/parent/inquiries"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
          >
            ← 문의 목록으로 돌아가기
          </Link>

          {/* Inquiry Header */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{inquiry.title}</h1>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 text-sm rounded-full ${
                    inquiry.status === 'RESOLVED'
                      ? 'bg-green-100 text-green-800'
                      : inquiry.status === 'IN_PROGRESS'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {inquiry.status === 'RESOLVED' ? '답변 완료' :
                     inquiry.status === 'IN_PROGRESS' ? '답변 중' : '대기 중'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(inquiry.createdAt).toLocaleString('ko-KR')}
                  </span>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <p className="text-gray-700 whitespace-pre-wrap">{inquiry.content}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">답변</h2>
            </div>
            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-center text-gray-500 py-8">아직 답변이 없습니다.</p>
              ) : (
                messages.map((message: any) => (
                  <div
                    key={message.id}
                    className={`p-4 rounded-lg ${
                      message.isAdmin
                        ? 'bg-blue-50 border-l-4 border-blue-500'
                        : 'bg-gray-50 border-l-4 border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm text-gray-900">
                        {message.isAdmin ? '관리자' : '나'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(message.createdAt).toLocaleString('ko-KR')}
                      </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{message.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Reply Form */}
          {inquiry.status !== 'RESOLVED' && (
            <form onSubmit={handleSendMessage} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">추가 메시지</h3>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 mb-4"
                placeholder="추가 메시지를 입력하세요..."
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                >
                  전송
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}
