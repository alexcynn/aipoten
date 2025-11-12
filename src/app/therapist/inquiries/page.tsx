'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'

export default function TherapistInquiriesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [inquiries, setInquiries] = useState<any[]>([])
  const [showInquiryForm, setShowInquiryForm] = useState(false)
  const [inquiryForm, setInquiryForm] = useState({
    category: 'SERVICE',
    title: '',
    content: '',
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    if (session.user?.role !== 'THERAPIST') {
      router.push('/dashboard')
      return
    }

    fetchInquiries()
  }, [session, status, router])

  const fetchInquiries = async () => {
    try {
      const response = await fetch('/api/inquiry')
      if (response.ok) {
        const data = await response.json()
        setInquiries(data.inquiries || [])
      }
    } catch (error) {
      console.error('문의 목록 조회 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inquiryForm.title.trim() || !inquiryForm.content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.')
      return
    }

    try {
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inquiryForm),
      })

      if (response.ok) {
        alert('문의가 등록되었습니다.')
        setInquiryForm({ category: 'SERVICE', title: '', content: '' })
        setShowInquiryForm(false)
        fetchInquiries()
      } else {
        const data = await response.json()
        alert(data.error || '문의 등록에 실패했습니다.')
      }
    } catch (error) {
      console.error('문의 등록 오류:', error)
      alert('문의 등록 중 오류가 발생했습니다.')
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-[#F5EFE7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6A00] mx-auto"></div>
          <p className="mt-4 text-stone-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const categoryLabels: Record<string, string> = {
    SERVICE: '서비스 이용',
    PAYMENT: '결제/환불',
    TECHNICAL: '기술 지원',
    OTHER: '기타',
  }

  const statusLabels: Record<string, { text: string; color: string; bgColor: string }> = {
    PENDING: { text: '답변 대기', color: '#F59E0B', bgColor: '#FEF3C7' },
    IN_PROGRESS: { text: '처리 중', color: '#3B82F6', bgColor: '#DBEAFE' },
    RESOLVED: { text: '해결됨', color: '#10B981', bgColor: '#D1FAE5' },
    CLOSED: { text: '종료됨', color: '#6B7280', bgColor: '#F3F4F6' },
  }

  return (
    <div className="min-h-screen bg-[#F5EFE7] font-pretendard">
      <Header />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="bg-white overflow-hidden shadow-sm rounded-xl mb-6">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-stone-900 mb-2">
                    1:1 문의
                  </h1>
                  <p className="text-stone-600">
                    궁금하신 사항을 문의해주세요. 빠르게 답변 드리겠습니다.
                  </p>
                </div>
                <button
                  onClick={() => setShowInquiryForm(!showInquiryForm)}
                  className={`px-6 py-3 rounded-[10px] transition-colors font-semibold shadow-lg text-white text-sm ${
                    showInquiryForm ? 'bg-stone-500 hover:bg-stone-600' : 'bg-[#FF6A00] hover:bg-[#E55F00]'
                  }`}
                >
                  {showInquiryForm ? '취소' : '+ 새 문의하기'}
                </button>
              </div>
            </div>
          </div>

          {/* 문의 작성 폼 */}
          {showInquiryForm && (
            <div className="bg-white shadow-sm overflow-hidden sm:rounded-[10px] mb-6">
              <div className="px-4 py-5 sm:p-6">
                <div className="bg-[#FFE5E5] border-2 border-[#FF9999] rounded-xl p-6">
                  <h4 className="text-md font-semibold text-stone-900 mb-4">문의 작성</h4>
                  <form onSubmit={handleInquirySubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        카테고리
                      </label>
                      <select
                        value={inquiryForm.category}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
                      >
                        <option value="SERVICE">서비스 이용 문의</option>
                        <option value="PAYMENT">결제/환불 문의</option>
                        <option value="TECHNICAL">기술 지원</option>
                        <option value="OTHER">기타</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        제목
                      </label>
                      <input
                        type="text"
                        value={inquiryForm.title}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, title: e.target.value })}
                        placeholder="문의 제목을 입력해주세요"
                        className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        내용
                      </label>
                      <textarea
                        value={inquiryForm.content}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, content: e.target.value })}
                        placeholder="문의 내용을 자세히 입력해주세요"
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
                        required
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="px-6 py-2 rounded-[10px] transition-colors font-semibold shadow bg-[#FF6A00] text-white hover:bg-[#E55F00]"
                      >
                        문의 등록
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowInquiryForm(false)}
                        className="px-6 py-2 border-2 border-stone-300 rounded-[10px] text-stone-700 hover:bg-[#FFE5E5] hover:border-[#FF6A00] hover:text-[#FF6A00] transition-colors font-semibold"
                      >
                        취소
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* 문의 목록 */}
          <div className="bg-white shadow-sm overflow-hidden sm:rounded-[10px]">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-stone-900">
                문의 내역
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-stone-500">
                등록하신 문의 내역입니다.
              </p>
            </div>

            <div className="px-4 pb-5">
              {inquiries.length === 0 ? (
                <div className="text-center py-12 bg-[#F5EFE7] rounded-xl">
                  <div className="text-4xl mb-3">💬</div>
                  <p className="text-stone-600 text-sm">문의 내역이 없습니다.</p>
                  <p className="text-stone-500 text-xs mt-2">
                    궁금하신 사항이 있으시면 새 문의를 등록해주세요.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {inquiries.map((inquiry: any) => {
                    const statusInfo = statusLabels[inquiry.status] || statusLabels.PENDING

                    return (
                      <div
                        key={inquiry.id}
                        className="bg-[#F5EFE7] border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-stone-700">
                                {categoryLabels[inquiry.category]}
                              </span>
                              <span
                                className="text-xs px-2 py-1 rounded-full font-medium"
                                style={{
                                  backgroundColor: statusInfo.bgColor,
                                  color: statusInfo.color
                                }}
                              >
                                {statusInfo.text}
                              </span>
                            </div>
                            <h5 className="font-semibold text-stone-900 mb-1 text-sm">{inquiry.title}</h5>
                            <p className="text-xs text-stone-600 line-clamp-2 mb-1">{inquiry.content}</p>
                            <div className="text-xs text-stone-500">
                              {new Date(inquiry.createdAt).toLocaleDateString('ko-KR')}
                            </div>
                          </div>
                        </div>

                        {/* 상세보기 버튼 */}
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <Link
                            href={`/therapist/inquiries/${inquiry.id}`}
                            className="inline-block px-3 py-1.5 bg-[#FF6A00] text-white text-xs rounded-[10px] hover:bg-[#E55F00] transition-colors font-semibold"
                          >
                            상세보기 / 메시지
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
