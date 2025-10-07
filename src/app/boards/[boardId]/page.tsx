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
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Board Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{config.title}</h1>
          <p className="mt-1 text-sm text-gray-600">{config.description}</p>
        </div>

        {/* Board Controls */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600">
            전체 글 <span className="font-semibold">{posts.length}</span>개
          </div>
          <button
            onClick={handleWriteClick}
            className="px-4 py-2 bg-aipoten-green text-white text-sm font-medium rounded hover:bg-aipoten-navy transition-colors"
          >
            글쓰기
          </button>
        </div>

        {/* BBS Table */}
        <div className="bg-white border border-gray-300 rounded">
          {posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 mb-4">등록된 게시글이 없습니다.</p>
              <button
                onClick={handleWriteClick}
                className="px-4 py-2 bg-aipoten-green text-white text-sm font-medium rounded hover:bg-aipoten-navy transition-colors"
              >
                첫 게시글 작성하기
              </button>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="hidden md:grid md:grid-cols-12 border-b border-gray-300 bg-gray-50 text-sm font-medium text-gray-700">
                <div className="col-span-1 py-3 px-4 text-center">번호</div>
                <div className="col-span-6 py-3 px-4">제목</div>
                <div className="col-span-2 py-3 px-4 text-center">작성자</div>
                <div className="col-span-2 py-3 px-4 text-center">작성일</div>
                <div className="col-span-1 py-3 px-4 text-center">조회</div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-200">
                {posts.map((post, index) => (
                  <Link
                    key={post.id}
                    href={`/boards/${boardId}/${post.id}`}
                    className="grid grid-cols-1 md:grid-cols-12 py-3 px-4 hover:bg-gray-50 transition-colors"
                  >
                    {/* 모바일: 전체 레이아웃 */}
                    <div className="md:hidden space-y-2">
                      <div className="flex items-center space-x-2">
                        {post.isSticky && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded">
                            공지
                          </span>
                        )}
                        {post.category && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                            {post.category}
                          </span>
                        )}
                        <h3 className="text-sm font-medium text-gray-900 flex-1">
                          {post.title}
                          {post._count.comments > 0 && (
                            <span className="ml-1 text-aipoten-green">
                              [{post._count.comments}]
                            </span>
                          )}
                        </h3>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{post.author.name}</span>
                        <div className="flex items-center space-x-3">
                          <span>{new Date(post.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}</span>
                          <span>조회 {post.views}</span>
                        </div>
                      </div>
                    </div>

                    {/* 데스크탑: 테이블 레이아웃 */}
                    <div className="hidden md:block md:col-span-1 text-center text-sm text-gray-600">
                      {post.isSticky ? (
                        <span className="font-medium text-red-600">공지</span>
                      ) : (
                        posts.length - index
                      )}
                    </div>
                    <div className="hidden md:block md:col-span-6">
                      <div className="flex items-center space-x-2">
                        {post.category && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                            {post.category}
                          </span>
                        )}
                        <span className="text-sm text-gray-900 font-medium">
                          {post.title}
                        </span>
                        {post._count.comments > 0 && (
                          <span className="text-sm text-aipoten-green">
                            [{post._count.comments}]
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="hidden md:block md:col-span-2 text-center text-sm text-gray-600">
                      {post.author.name}
                    </div>
                    <div className="hidden md:block md:col-span-2 text-center text-sm text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                    </div>
                    <div className="hidden md:block md:col-span-1 text-center text-sm text-gray-500">
                      {post.views}
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <nav className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 border text-sm rounded ${
                    currentPage === page
                      ? 'bg-aipoten-green text-white border-aipoten-green'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ›
              </button>
            </nav>
          </div>
        )}
      </main>
    </div>
  )
}
