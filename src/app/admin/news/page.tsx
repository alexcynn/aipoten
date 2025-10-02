'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface News {
  id: string
  title: string
  content: string
  summary: string
  imageUrl: string | null
  isPublished: boolean
  views: number
  author: {
    name: string
  }
  createdAt: string
  updatedAt: string
}

export default function AdminNewsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [news, setNews] = useState<News[]>([])
  const [isLoading, setIsLoading] = useState(true)

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

    fetchNews()
  }, [session, status, router])

  const fetchNews = async () => {
    try {
      const response = await fetch('/api/admin/news')
      if (response.ok) {
        const data = await response.json()
        setNews(data)
      }
    } catch (error) {
      console.error('뉴스 목록을 가져오는 중 오류 발생:', error)
    } finally {
      setIsLoading(false)
    }
  }


  const handleTogglePublish = async (newsId: string, isPublished: boolean) => {
    try {
      const response = await fetch(`/api/admin/news/${newsId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isPublished: !isPublished }),
      })

      if (response.ok) {
        await fetchNews()
      }
    } catch (error) {
      console.error('뉴스 발행 상태 업데이트 중 오류 발생:', error)
    }
  }

  const handleDeleteNews = async (newsId: string) => {
    if (!confirm('정말로 이 뉴스를 삭제하시겠습니까?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/news/${newsId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchNews()
      }
    } catch (error) {
      console.error('뉴스 삭제 중 오류 발생:', error)
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
              <span className="ml-2 text-gray-600">뉴스 관리</span>
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
                <h1 className="text-3xl font-bold text-gray-900">뉴스 관리</h1>
                <p className="mt-2 text-gray-600">
                  뉴스 및 공지사항을 추가, 수정, 삭제할 수 있습니다.
                </p>
              </div>
              <Link
                href="/admin/news/new"
                className="inline-block bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 font-medium"
                style={{ backgroundColor: '#386646' }}
              >
                새 뉴스 추가
              </Link>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">📰</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">전체 뉴스</p>
                  <p className="text-2xl font-bold text-gray-900">{news.length}개</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">✅</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">발행된 뉴스</p>
                  <p className="text-2xl font-bold text-gray-900">{news.filter(n => n.isPublished).length}개</p>
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
                  <p className="text-2xl font-bold text-gray-900">{news.reduce((sum, n) => sum + (n.views || 0), 0).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">📝</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">초안</p>
                  <p className="text-2xl font-bold text-gray-900">{news.filter(n => !n.isPublished).length}개</p>
                </div>
              </div>
            </div>
          </div>


          {/* News List */}
          {news.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📰</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 뉴스가 없습니다</h3>
              <p className="text-gray-500">새로운 뉴스를 추가해보세요.</p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {news.map((item) => (
                  <li key={item.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-start flex-1">
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-16 h-16 object-cover rounded-lg mr-4"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center">
                              <h3 className="text-lg font-medium text-gray-900 truncate">
                                {item.title}
                              </h3>
                              <div className="ml-2">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  item.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {item.isPublished ? '발행됨' : '초안'}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {item.summary}
                            </p>
                            <div className="flex items-center text-sm text-gray-500 mt-2">
                              <span>작성자: {item.author.name}</span>
                              <span className="mx-2">•</span>
                              <span>조회수: {(item.views || 0).toLocaleString()}</span>
                              <span className="mx-2">•</span>
                              <span>{new Date(item.createdAt).toLocaleDateString('ko-KR')}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => handleTogglePublish(item.id, item.isPublished)}
                            className={`px-3 py-1 text-sm rounded ${
                              item.isPublished
                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                          >
                            {item.isPublished ? '비공개' : '발행'}
                          </button>
                          <Link
                            href={`/admin/news/${item.id}`}
                            className="text-aipoten-green hover:text-aipoten-navy text-sm font-medium"
                          >
                            편집
                          </Link>
                          <button
                            onClick={() => handleDeleteNews(item.id)}
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