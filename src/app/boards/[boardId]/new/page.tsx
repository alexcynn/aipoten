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
      <div className="min-h-screen bg-neutral-light">
        <Header />
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aipoten-green mx-auto"></div>
            <p className="mt-4 text-gray-600">로딩 중...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!session || !config) {
    return null
  }

  return (
    <div className="min-h-screen bg-neutral-light">
      <Header />

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">새 게시글 작성</h1>
            <p className="mt-1 text-sm text-gray-600">{config.title}</p>
          </div>

          <div className="bg-white shadow rounded-lg">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* 카테고리 */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  카테고리
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aipoten-green"
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
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aipoten-green"
                />
              </div>

              {/* 내용 */}
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aipoten-green"
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
                    className="h-4 w-4 text-aipoten-green focus:ring-aipoten-green border-gray-300 rounded"
                  />
                  <label htmlFor="isSticky" className="ml-2 block text-sm text-gray-700">
                    공지사항으로 고정
                  </label>
                </div>
              )}

              {/* 버튼 */}
              <div style={{ display: 'flex', gap: '12px', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => router.back()}
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    color: '#374151',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'white',
                    backgroundColor: isSubmitting ? '#D1D5DB' : '#386646',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting) e.currentTarget.style.backgroundColor = '#2D5238'
                  }}
                  onMouseLeave={(e) => {
                    if (!isSubmitting) e.currentTarget.style.backgroundColor = '#386646'
                  }}
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
