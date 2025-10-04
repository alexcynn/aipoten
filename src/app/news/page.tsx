'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'

interface News {
  id: string
  title: string
  summary: string
  imageUrl: string | null
  views: number
  category: string
  createdAt: string
}

export default function NewsPage() {
  const { data: session } = useSession()
  const [news, setNews] = useState<News[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchNews()
  }, [])

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

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      ANNOUNCEMENT: '공지사항',
      DEVELOPMENT_GUIDE: '발달가이드',
      PARENTING_TIP: '육아팁',
      EVENT: '이벤트',
      UPDATE: '업데이트'
    }
    return labels[category] || '기타'
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
              {session && (
                <span className="text-gray-700">{session.user?.name}님</span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">육아정보</h1>
            <p className="mt-2 text-gray-600">
              전문가가 제공하는 다양한 육아 정보와 발달 가이드를 확인하세요
            </p>
          </div>

          {/* News Grid */}
          {news.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📰</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 육아정보가 없습니다</h3>
              <p className="text-gray-500">새로운 정보를 준비 중입니다.</p>
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
                      <div className="flex items-center mb-2">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {getCategoryLabel(item.category)}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {item.title}
                      </h3>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {item.summary}
                      </p>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>조회 {item.views}</span>
                        <span>{new Date(item.createdAt).toLocaleDateString('ko-KR')}</span>
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