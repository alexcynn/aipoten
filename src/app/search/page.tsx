'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'

export const dynamic = 'force-dynamic'
interface SearchResult {
  id: string
  title: string
  description?: string
  content?: string
  category?: string
  type: string
  url: string
  createdAt?: string
  publishedAt?: string
}

interface SearchResults {
  videos: SearchResult[]
  posts: SearchResult[]
  children: SearchResult[]
  spirituality: SearchResult[]
  news: SearchResult[]
  total: number
}

export default function SearchPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [results, setResults] = useState<SearchResults | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedType, setSelectedType] = useState('all')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }

    const initialQuery = searchParams.get('q')
    if (initialQuery) {
      setQuery(initialQuery)
      performSearch(initialQuery)
    }
  }, [session, status, router, searchParams])

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&type=${selectedType}`)
      if (response.ok) {
        const searchResults = await response.json()
        setResults(searchResults)
      }
    } catch (error) {
      console.error('검색 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      performSearch(query)
      router.push(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return '📹'
      case 'post': return '💬'
      case 'child': return '👶'
      case 'spirituality': return '✨'
      case 'news': return '📰'
      default: return '📄'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'video': return '영상'
      case 'post': return '게시글'
      case 'child': return '아이 프로필'
      case 'spirituality': return '놀이영성'
      case 'news': return '뉴스'
      default: return type
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('ko-KR')
  }

  const highlightQuery = (text: string, query: string) => {
    if (!query) return text
    const regex = new RegExp(`(${query})`, 'gi')
    return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>')
  }

  if (status === 'loading') {
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
      <Header />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Search Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">검색</h1>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="mb-6">
              <div className="flex">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="영상, 게시글, 놀이활동 등을 검색해보세요..."
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-aipoten-green focus:border-aipoten-green"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-400">🔍</span>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-aipoten-green text-white rounded-r-lg hover:bg-aipoten-navy focus:outline-none focus:ring-2 focus:ring-aipoten-green disabled:opacity-50"
                >
                  {isLoading ? '검색 중...' : '검색'}
                </button>
              </div>
            </form>

            {/* Type Filter */}
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: '전체' },
                { value: 'videos', label: '영상' },
                { value: 'spirituality', label: '놀이영성' },
                { value: 'posts', label: '게시글' },
                { value: 'children', label: '아이' },
                { value: 'news', label: '뉴스' }
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => {
                    setSelectedType(type.value)
                    if (query) performSearch(query)
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedType === type.value
                      ? 'bg-aipoten-green text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Results */}
          {results && (
            <div>
              {/* Results Summary */}
              <div className="mb-6 p-4 bg-white rounded-lg shadow">
                <p className="text-gray-600">
                  "<span className="font-semibold">{query}</span>"에 대한 검색 결과:
                  <span className="font-semibold text-aipoten-green ml-1">{results.total}개</span>
                </p>
              </div>

              {/* Results by Type */}
              {results.total === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">🔍</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    검색 결과가 없습니다
                  </h3>
                  <p className="text-gray-600">
                    다른 검색어를 시도해보시거나 철자를 확인해주세요.
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Videos */}
                  {results.videos.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        📹 영상 ({results.videos.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {results.videos.map((item) => (
                          <Link
                            key={item.id}
                            href={item.url}
                            className="block bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start">
                              <div className="text-2xl mr-3">📹</div>
                              <div className="flex-1">
                                <h4
                                  className="font-medium text-gray-900 mb-1"
                                  dangerouslySetInnerHTML={{ __html: highlightQuery(item.title, query) }}
                                />
                                {item.description && (
                                  <p
                                    className="text-sm text-gray-600 mb-2 line-clamp-2"
                                    dangerouslySetInnerHTML={{ __html: highlightQuery(item.description, query) }}
                                  />
                                )}
                                <div className="flex items-center text-xs text-gray-500">
                                  <span>{item.category}</span>
                                  {item.createdAt && (
                                    <>
                                      <span className="mx-1">•</span>
                                      <span>{formatDate(item.createdAt)}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Spirituality Activities */}
                  {results.spirituality.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        ✨ 놀이영성 ({results.spirituality.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {results.spirituality.map((item) => (
                          <Link
                            key={item.id}
                            href={item.url}
                            className="block bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start">
                              <div className="text-2xl mr-3">✨</div>
                              <div className="flex-1">
                                <h4
                                  className="font-medium text-gray-900 mb-1"
                                  dangerouslySetInnerHTML={{ __html: highlightQuery(item.title, query) }}
                                />
                                {item.description && (
                                  <p
                                    className="text-sm text-gray-600 mb-2 line-clamp-2"
                                    dangerouslySetInnerHTML={{ __html: highlightQuery(item.description, query) }}
                                  />
                                )}
                                <div className="flex items-center text-xs text-gray-500">
                                  <span>{item.category}</span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Posts */}
                  {results.posts.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        💬 게시글 ({results.posts.length})
                      </h3>
                      <div className="space-y-3">
                        {results.posts.map((item) => (
                          <Link
                            key={item.id}
                            href={item.url}
                            className="block bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start">
                              <div className="text-2xl mr-3">💬</div>
                              <div className="flex-1">
                                <h4
                                  className="font-medium text-gray-900 mb-1"
                                  dangerouslySetInnerHTML={{ __html: highlightQuery(item.title, query) }}
                                />
                                {(item.content || item.description) && (
                                  <p
                                    className="text-sm text-gray-600 mb-2 line-clamp-2"
                                    dangerouslySetInnerHTML={{ __html: highlightQuery(item.content || item.description || '', query) }}
                                  />
                                )}
                                <div className="flex items-center text-xs text-gray-500">
                                  {item.createdAt && (
                                    <span>{formatDate(item.createdAt)}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Children */}
                  {results.children.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        👶 아이 프로필 ({results.children.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {results.children.map((item) => (
                          <Link
                            key={item.id}
                            href={item.url}
                            className="block bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start">
                              <div className="text-2xl mr-3">👶</div>
                              <div className="flex-1">
                                <h4
                                  className="font-medium text-gray-900 mb-1"
                                  dangerouslySetInnerHTML={{ __html: highlightQuery(item.title, query) }}
                                />
                                <div className="flex items-center text-xs text-gray-500">
                                  {item.createdAt && (
                                    <span>등록일: {formatDate(item.createdAt)}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* News */}
                  {results.news.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        📰 뉴스 ({results.news.length})
                      </h3>
                      <div className="space-y-3">
                        {results.news.map((item) => (
                          <Link
                            key={item.id}
                            href={item.url}
                            className="block bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start">
                              <div className="text-2xl mr-3">📰</div>
                              <div className="flex-1">
                                <h4
                                  className="font-medium text-gray-900 mb-1"
                                  dangerouslySetInnerHTML={{ __html: highlightQuery(item.title, query) }}
                                />
                                {(item.content || item.description) && (
                                  <p
                                    className="text-sm text-gray-600 mb-2 line-clamp-2"
                                    dangerouslySetInnerHTML={{ __html: highlightQuery(item.content || item.description || '', query) }}
                                  />
                                )}
                                <div className="flex items-center text-xs text-gray-500">
                                  {item.publishedAt && (
                                    <span>{formatDate(item.publishedAt)}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Search Tips */}
          {!results && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">검색 도움말</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">🔍 검색 가능한 콘텐츠</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 놀이영상 제목과 설명</li>                    
                    <li>• 커뮤니티 게시글</li>
                    <li>• 아이 프로필</li>
                    <li>• 뉴스 및 공지사항</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">💡 검색 팁</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 키워드는 2글자 이상 입력해주세요</li>
                    <li>• 띄어쓰기로 여러 키워드를 조합하세요</li>
                    <li>• 카테고리 필터를 활용해보세요</li>
                    <li>• 정확한 단어보다 관련 단어로 검색해보세요</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}