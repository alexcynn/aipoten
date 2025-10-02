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
  views: number
  author: {
    name: string
  }
  _count: {
    comments: number
  }
  createdAt: string
}

export default function BoardsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'QUESTION' | 'SHARE' | 'REVIEW'>('ALL')

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    fetchPosts()
  }, [session, status, router])

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts')
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts || [])
      }
    } catch (error) {
      console.error('게시글을 가져오는 중 오류 발생:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredPosts = posts.filter(post => {
    if (filter === 'ALL') return true
    return post.category === filter
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
            <Link href="/dashboard" className="text-xl font-bold text-aipoten-navy">
              아이포텐
            </Link>

            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-aipoten-green">
                대시보드
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
                <h1 className="text-3xl font-bold text-gray-900">커뮤니티</h1>
                <p className="mt-2 text-gray-600">
                  다른 부모님들과 육아 경험을 공유하고 소통해보세요.
                </p>
              </div>
              <Link
                href="/boards/new"
                className="bg-aipoten-green text-white px-4 py-2 rounded-md hover:bg-aipoten-navy"
              >
                글쓰기
              </Link>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {['ALL', 'QUESTION', 'SHARE', 'REVIEW'].map((category) => (
                  <button
                    key={category}
                    onClick={() => setFilter(category as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      filter === category
                        ? 'border-aipoten-green text-aipoten-green'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {category === 'ALL' && '전체'}
                    {category === 'QUESTION' && '질문'}
                    {category === 'SHARE' && '공유'}
                    {category === 'REVIEW' && '후기'}
                    <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                      {category === 'ALL'
                        ? posts.length
                        : posts.filter(p => p.category === category).length
                      }
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Posts List */}
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">💬</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                게시글이 없습니다
              </h3>
              <p className="text-gray-500 mb-4">
                첫 번째 게시글을 작성해보세요!
              </p>
              <Link
                href="/boards/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-aipoten-green hover:bg-aipoten-navy"
              >
                글쓰기
              </Link>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {filteredPosts.map((post) => (
                  <li key={post.id}>
                    <Link href={`/boards/${post.id}`} className="block hover:bg-gray-50">
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center mb-2">
                              {getCategoryBadge(post.category)}
                            </div>
                            <p className="text-lg font-medium text-gray-900 truncate">
                              {post.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {post.content.substring(0, 100)}...
                            </p>
                            <div className="flex items-center mt-3 text-sm text-gray-500">
                              <span>{post.author.name}</span>
                              <span className="mx-2">•</span>
                              <span>조회 {post.views || 0}</span>
                              <span className="mx-2">•</span>
                              <span>댓글 {post._count.comments}</span>
                              <span className="mx-2">•</span>
                              <span>{new Date(post.createdAt).toLocaleDateString('ko-KR')}</span>
                            </div>
                          </div>
                          <div className="ml-4 flex-shrink-0 flex items-center">
                            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
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