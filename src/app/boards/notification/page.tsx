'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface Post {
  id: string
  title: string
  content: string
  views: number
  isSticky: boolean
  author: {
    name: string
    role: string
  }
  _count: {
    comments: number
  }
  createdAt: string
}

export default function NotificationBoardPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/boards/notification/posts')
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aipoten-green mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/logo-text.png"
                alt="AI Poten"
                width={160}
                height={40}
                className="h-10 w-auto"
                priority
              />
            </Link>

            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-aipoten-green">
                홈으로
              </Link>
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
                <h1 className="text-3xl font-bold text-gray-900">알림장</h1>
                <p className="mt-2 text-gray-600">
                  아이포텐의 주요 소식과 알림을 확인하세요
                </p>
              </div>
            </div>
          </div>

          {/* Posts List */}
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📢</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                게시글이 없습니다
              </h3>
              <p className="text-gray-500">
                아직 등록된 알림이 없습니다.
              </p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {posts.map((post) => (
                  <li key={post.id}>
                    <Link href={`/boards/${post.id}`} className="block hover:bg-gray-50">
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center mb-2">
                              {post.isSticky && (
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 mr-2">
                                  공지
                                </span>
                              )}
                              {post.author.role === 'ADMIN' && (
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                  관리자
                                </span>
                              )}
                            </div>
                            <p className="text-lg font-medium text-gray-900 truncate">
                              {post.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {post.content.substring(0, 150).replace(/[#*]/g, '')}...
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
