'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface News {
  id: string
  title: string
  summary: string
  imageUrl: string | null
  views: number
  author: {
    name: string
  }
  createdAt: string
}

export default function NewsPage() {
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

    fetchNews()
  }, [session, status, router])

  const fetchNews = async () => {
    try {
      const response = await fetch('/api/news')
      if (response.ok) {
        const data = await response.json()
        setNews(data.news || [])
      }
    } catch (error) {
      console.error('뉴스를 가져오는 중 오류 발생:', error)
    } finally {
      setIsLoading(false)
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
            <h1 className="text-3xl font-bold text-gray-900">뉴스 및 공지사항</h1>
            <p className="mt-2 text-gray-600">
              아이포텐의 최신 소식과 중요한 공지사항을 확인하세요.
            </p>
          </div>

          {/* News Grid */}
          {news.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📰</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 뉴스가 없습니다</h3>
              <p className="text-gray-500">새로운 소식을 준비 중입니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((item) => (
                <Link key={item.id} href={`/news/${item.id}`}>
                  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    {item.imageUrl && (
                      <div className="aspect-video bg-gray-200">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {item.title}
                      </h3>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {item.summary}
                      </p>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{item.author.name}</span>
                        <div className="flex items-center space-x-2">
                          <span>조회 {item.views}</span>
                          <span>•</span>
                          <span>{new Date(item.createdAt).toLocaleDateString('ko-KR')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}