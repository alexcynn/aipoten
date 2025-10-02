'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface NewsDetail {
  id: string
  title: string
  content: string
  summary: string
  imageUrl: string | null
  views: number
  author?: {
    name: string
  }
  createdAt: string
  updatedAt: string
}

export default function NewsDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [news, setNews] = useState<NewsDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    fetchNews()
  }, [session, status, router, params.id])

  const fetchNews = async () => {
    try {
      const response = await fetch(`/api/news/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setNews(data.news)
      } else {
        router.push('/news')
      }
    } catch (error) {
      console.error('뉴스를 가져오는 중 오류 발생:', error)
      router.push('/news')
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

  if (!session || !news) {
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
              <Link href="/news" className="text-gray-600 hover:text-aipoten-green">
                뉴스 목록
              </Link>
              <Link href="/dashboard" className="text-gray-600 hover:text-aipoten-green">
                대시보드
              </Link>
              <span className="text-gray-700">{session.user?.name}님</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Breadcrumb */}
          <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <Link href="/dashboard" className="text-gray-400 hover:text-gray-500">
                  대시보드
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <Link href="/news" className="ml-4 text-gray-400 hover:text-gray-500">
                    뉴스
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-4 text-gray-500">뉴스 상세</span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Article */}
          <article className="bg-white shadow rounded-lg overflow-hidden">
            {/* Featured Image */}
            {news.imageUrl && (
              <div className="aspect-video bg-gray-200">
                <img
                  src={news.imageUrl}
                  alt={news.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="p-6 sm:p-8">
              {/* Title */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {news.title}
              </h1>

              {/* Meta Information */}
              <div className="flex items-center text-sm text-gray-500 mb-6 pb-6 border-b border-gray-200">
                <span>작성자: {news.author?.name || '관리자'}</span>
                <span className="mx-2">•</span>
                <span>{new Date(news.createdAt).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
                <span className="mx-2">•</span>
                <span>조회수 {news.views.toLocaleString()}</span>
                {news.updatedAt !== news.createdAt && (
                  <>
                    <span className="mx-2">•</span>
                    <span>수정됨 {new Date(news.updatedAt).toLocaleDateString('ko-KR')}</span>
                  </>
                )}
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">요약</h2>
                <p className="text-gray-700">{news.summary}</p>
              </div>

              {/* Content */}
              <div className="prose prose-lg max-w-none">
                <div className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                  {news.content}
                </div>
              </div>
            </div>
          </article>

          {/* Back Button */}
          <div className="mt-8 text-center">
            <Link
              href="/news"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-aipoten-green hover:bg-aipoten-navy"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              뉴스 목록으로 돌아가기
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}