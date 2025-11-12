'use client'

import { use, useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'

const BOARD_CONFIG = {
  community: {
    title: '육아소통',
    canWrite: (role?: string) => ['PARENT', 'THERAPIST', 'ADMIN'].includes(role || ''),
    categories: ['질문', '정보공유', '후기', '잡담'],
  },
  notice: {
    title: '공지사항',
    canWrite: (role?: string) => role === 'ADMIN',
    categories: ['공지', '업데이트', '중요'],
  },
  'parent-guide': {
    title: '부모 이용안내',
    canWrite: (role?: string) => role === 'ADMIN',
    categories: ['서비스 이용', '결제', '예약', '기타'],
  },
  'therapist-guide': {
    title: '전문가 이용안내',
    canWrite: (role?: string) => role === 'ADMIN',
    categories: ['서비스 이용', '정산', '스케줄', '기타'],
  },
  faq: {
    title: '자주하는 질문',
    canWrite: (role?: string) => role === 'ADMIN',
    categories: ['일반', '결제', '예약', '서비스'],
  },
}

export default function NewPostPage({ params }: { params: Promise<{ boardId: string }> }) {
  const { boardId } = use(params)
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    isSticky: false,
  })

  const config = BOARD_CONFIG[boardId as keyof typeof BOARD_CONFIG]

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      alert('로그인이 필요합니다.')
      router.push('/login')
      return
    }

    if (!config) {
      alert('존재하지 않는 게시판입니다.')
      router.push('/boards')
      return
    }

    if (!config.canWrite(session.user?.role)) {
      alert('이 게시판에 글을 작성할 권한이 없습니다.')
      router.push(`/boards/${boardId}`)
      return
    }
  }, [session, status, boardId, config, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      alert('제목을 입력해주세요.')
      return
    }

    if (!formData.content.trim()) {
      alert('내용을 입력해주세요.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/boards/${boardId}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '게시글 작성 중 오류가 발생했습니다.')
      }

      alert('게시글이 작성되었습니다.')
      router.push(`/boards/${boardId}/${data.post.id}`)
    } catch (err: any) {
      alert(err.message)
      setIsSubmitting(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6A00] mx-auto"></div>
            <p className="mt-4 text-stone-600 font-pretendard">로딩 중...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!session || !config) {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-stone-900 font-pretendard">새 게시글 작성</h1>
            <p className="mt-1 text-sm text-stone-600 font-pretendard">{config.title}</p>
          </div>

          <div className="bg-white shadow-md rounded-xl">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* 카테고리 */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-stone-700 mb-2 font-pretendard">
                  카테고리
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:border-transparent font-pretendard"
                >
                  <option value="">선택하세요</option>
                  {config.categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* 제목 */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-stone-700 mb-2 font-pretendard">
                  제목 *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="제목을 입력하세요"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:border-transparent font-pretendard"
                />
              </div>

              {/* 내용 */}
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-stone-700 mb-2 font-pretendard">
                  내용 *
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="내용을 입력하세요"
                  rows={15}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:border-transparent font-pretendard"
                />
              </div>

              {/* 공지로 등록 (관리자만) */}
              {session.user?.role === 'ADMIN' && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isSticky"
                    name="isSticky"
                    checked={formData.isSticky}
                    onChange={handleChange}
                    className="h-4 w-4 text-[#FF6A00] focus:ring-[#FF6A00] border-gray-300 rounded"
                  />
                  <label htmlFor="isSticky" className="ml-2 block text-sm text-stone-700 font-pretendard">
                    공지사항으로 고정
                  </label>
                </div>
              )}

              {/* 버튼 */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-[10px] text-stone-700 bg-white hover:bg-gray-50 text-sm font-medium transition-colors font-pretendard"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 px-4 py-2 rounded-[10px] text-white text-sm font-medium transition-colors shadow-md font-pretendard ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-[#FF6A00] hover:bg-[#E55F00]'
                  }`}
                >
                  {isSubmitting ? '작성 중...' : '작성 완료'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
