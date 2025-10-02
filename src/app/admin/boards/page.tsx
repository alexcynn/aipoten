'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Post {
  id: string
  title: string
  content: string
  category: string
  isHidden: boolean
  views: number
  author: {
    name: string
  }
  _count: {
    comments: number
  }
  createdAt: string
  updatedAt: string
}

export default function AdminBoardsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'QUESTION' | 'SHARE' | 'REVIEW' | 'HIDDEN'>('ALL')
  const [searchTerm, setSearchTerm] = useState('')

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

    fetchPosts()
  }, [session, status, router])

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/admin/posts')
      if (response.ok) {
        const data = await response.json()
        setPosts(data)
      }
    } catch (error) {
      console.error('게시글 목록을 가져오는 중 오류 발생:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleHidden = async (postId: string, isHidden: boolean) => {
    try {
      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isHidden: !isHidden }),
      })

      if (response.ok) {
        await fetchPosts()
      }
    } catch (error) {
      console.error('게시글 상태 업데이트 중 오류 발생:', error)
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchPosts()
      }
    } catch (error) {
      console.error('게시글 삭제 중 오류 발생:', error)
    }
  }

  const filteredPosts = posts.filter(post => {
    const matchesFilter = filter === 'ALL' ||
                         (filter === 'HIDDEN' ? post.isHidden : post.category === filter)
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.author.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      QUESTION: '질문',
      SHARE: '공유',
      REVIEW: '후기',
      NOTICE: '공지'
    }
    return labels[category] || category
  }

  const getCategoryBadge = (category: string) => {
    const badges: { [key: string]: { bg: string; text: string } } = {
      QUESTION: { bg: 'bg-blue-100', text: 'text-blue-800' },
      SHARE: { bg: 'bg-green-100', text: 'text-green-800' },
      REVIEW: { bg: 'bg-purple-100', text: 'text-purple-800' },
      NOTICE: { bg: 'bg-red-100', text: 'text-red-800' }
    }
    const badge = badges[category] || { bg: 'bg-gray-100', text: 'text-gray-800' }
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${badge.bg} ${badge.text}`}>
        {getCategoryLabel(category)}
      </span>
    )
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
    <div className="min-h-screen bg-neutral-light">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/admin" className="text-xl font-bold text-aipoten-navy">
                아이포텐 관리자
              </Link>
              <span className="ml-2 text-gray-400">/</span>
              <span className="ml-2 text-gray-600">게시판 관리</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="text-gray-600 hover:text-aipoten-green">
                관리자 패널
              </Link>
              <span className="text-gray-700">{session.user?.name}님</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">게시판 관리</h1>
                <p className="mt-2 text-gray-600">
                  커뮤니티 게시글을 관리하고 모니터링할 수 있습니다.
                </p>
              </div>
              <Link
                href="/boards"
                className="inline-block bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 font-medium"
                style={{ backgroundColor: '#386646' }}
              >
                커뮤니티 보기
              </Link>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="제목 또는 작성자로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aipoten-green focus:border-transparent"
              />
            </div>
            <div className="flex space-x-2">
              {['ALL', 'QUESTION', 'SHARE', 'REVIEW', 'HIDDEN'].map((category) => (
                <button
                  key={category}
                  onClick={() => setFilter(category as any)}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    filter === category
                      ? 'bg-aipoten-green text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {category === 'ALL' && '전체'}
                  {category === 'QUESTION' && '질문'}
                  {category === 'SHARE' && '공유'}
                  {category === 'REVIEW' && '후기'}
                  {category === 'HIDDEN' && '숨김'}
                  <span className="ml-2 bg-gray-200 text-gray-700 py-0.5 px-2 rounded-full text-xs">
                    {category === 'ALL'
                      ? posts.length
                      : category === 'HIDDEN'
                      ? posts.filter(p => p.isHidden).length
                      : posts.filter(p => p.category === category).length
                    }
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">💬</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">전체 게시글</p>
                  <p className="text-2xl font-bold text-gray-900">{posts.length}개</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">❓</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">질문</p>
                  <p className="text-2xl font-bold text-gray-900">{posts.filter(p => p.category === 'QUESTION').length}개</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">👁️</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">총 조회수</p>
                  <p className="text-2xl font-bold text-gray-900">{posts.reduce((sum, p) => sum + (p.views || 0), 0).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">🚫</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">숨겨진 게시글</p>
                  <p className="text-2xl font-bold text-gray-900">{posts.filter(p => p.isHidden).length}개</p>
                </div>
              </div>
            </div>
          </div>

          {/* Posts List */}
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">💬</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? '검색 결과가 없습니다' : '게시글이 없습니다'}
              </h3>
              <p className="text-gray-500">
                {searchTerm ? '다른 검색어를 시도해보세요.' : '새로운 게시글을 기다리고 있습니다.'}
              </p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {filteredPosts.map((post) => (
                  <li key={post.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            {getCategoryBadge(post.category)}
                            {post.isHidden && (
                              <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                숨김
                              </span>
                            )}
                          </div>
                          <div className="mt-2">
                            <h3 className="text-lg font-medium text-gray-900">
                              {post.title}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {post.content.substring(0, 100)}...
                            </p>
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mt-2">
                            <span>작성자: {post.author.name}</span>
                            <span className="mx-2">•</span>
                            <span>조회수: {(post.views || 0).toLocaleString()}</span>
                            <span className="mx-2">•</span>
                            <span>댓글: {post._count.comments}개</span>
                            <span className="mx-2">•</span>
                            <span>{new Date(post.createdAt).toLocaleDateString('ko-KR')}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => handleToggleHidden(post.id, post.isHidden)}
                            className={`px-3 py-1 text-sm rounded ${
                              post.isHidden
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            }`}
                          >
                            {post.isHidden ? '복원' : '숨김'}
                          </button>
                          <Link
                            href={`/boards/${post.id}`}
                            className="text-aipoten-green hover:text-aipoten-navy text-sm font-medium"
                          >
                            보기
                          </Link>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}