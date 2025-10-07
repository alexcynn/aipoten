'use client'

import { use, useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'

interface Post {
  id: string
  title: string
  content: string
  summary?: string | null
  imageUrl?: string | null
  category?: string | null
  views: number
  isSticky: boolean
  author: {
    id: string
    name: string
    avatar?: string | null
  }
  _count: {
    comments: number
  }
  createdAt: string
}

const BOARD_CONFIG = {
  community: {
    title: '육아소통',
    description: '부모님들과 육아 정보를 공유하는 커뮤니티 공간입니다.',
    canWrite: (role?: string) => ['PARENT', 'THERAPIST', 'ADMIN'].includes(role || ''),
    categories: ['질문', '정보공유', '후기', '잡담'],
  },
  news: {
    title: '소식',
    description: '아이포텐의 공지사항, 이벤트, 업데이트 소식을 확인하세요.',
    canWrite: (role?: string) => role === 'ADMIN',
    categories: ['공지사항', '이벤트', '업데이트'],
  },
  notification: {
    title: '알림장',
    description: '치료사와 부모 간 소통하는 알림장입니다.',
    canWrite: (role?: string) => ['THERAPIST', 'ADMIN'].includes(role || ''),
    categories: ['세션 피드백', '과제', '진행상황'],
  },
}

export default function BoardPage({ params }: { params: Promise<{ boardId: string }> }) {
  const { boardId } = use(params)
  const { data: session } = useSession()
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const config = BOARD_CONFIG[boardId as keyof typeof BOARD_CONFIG]

  useEffect(() => {
    if (!config) {
      router.push('/404')
      return
    }
    fetchPosts()
  }, [boardId, currentPage])

  const fetchPosts = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(
        `/api/boards/${boardId}/posts?page=${currentPage}&limit=20`
      )

      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts || [])
        setTotalPages(data.pagination?.totalPages || 1)
      } else if (response.status === 403) {
        alert('이 게시판을 볼 권한이 없습니다.')
        router.push('/')
      }
    } catch (error) {
      console.error('게시글을 가져오는 중 오류 발생:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleWriteClick = () => {
    if (!session) {
      alert('로그인이 필요합니다.')
      router.push('/login')
      return
    }

    if (!config.canWrite(session.user?.role)) {
      alert('이 게시판에 글을 작성할 권한이 없습니다.')
      return
    }

    router.push(`/boards/${boardId}/new`)
  }

  if (!config) {
    return null
  }

  if (isLoading) {
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

  return (
    <div className="min-h-screen bg-neutral-light">
      <Header />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{config.title}</h1>
            <p className="mt-2 text-gray-600">{config.description}</p>
          </div>

          {/* Action Bar */}
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                총 {posts.length}개의 게시글
              </div>
              <button
                onClick={handleWriteClick}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-aipoten-green hover:bg-aipoten-navy"
              >
                글쓰기
              </button>
            </div>
          </div>

          {/* Posts List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">📝</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  아직 게시글이 없습니다
                </h3>
                <p className="text-gray-600 mb-6">
                  첫 번째 게시글을 작성해보세요.
                </p>
                <button
                  onClick={handleWriteClick}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-aipoten-green hover:bg-aipoten-navy"
                >
                  글쓰기
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {posts.map((post) => (
                  <li key={post.id}>
                    <Link
                      href={`/boards/${boardId}/${post.id}`}
                      className="block hover:bg-gray-50 px-4 py-4 sm:px-6"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            {post.isSticky && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                공지
                              </span>
                            )}
                            {post.category && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                {post.category}
                              </span>
                            )}
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {post.title}
                            </h3>
                            {post._count.comments > 0 && (
                              <span className="text-xs text-aipoten-green">
                                [{post._count.comments}]
                              </span>
                            )}
                          </div>
                          {post.summary && (
                            <p className="mt-1 text-sm text-gray-500 line-clamp-1">
                              {post.summary}
                            </p>
                          )}
                          <div className="mt-2 flex items-center text-xs text-gray-500 space-x-4">
                            <span>{post.author.name}</span>
                            <span>조회 {post.views}</span>
                            <span>
                              {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                            </span>
                          </div>
                        </div>
                        {post.imageUrl && (
                          <div className="ml-4 flex-shrink-0">
                            <img
                              src={post.imageUrl}
                              alt={post.title}
                              className="h-16 w-16 rounded object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  이전
                </button>
                <span className="px-4 py-2 text-sm text-gray-700">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  다음
                </button>
              </nav>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
