'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/layout/Header'

export const dynamic = 'force-dynamic'
interface Video {
  id: string
  title: string
  description: string
  videoUrl: string
  thumbnailUrl: string | null
  targetAgeMin: number
  targetAgeMax: number
  duration: number
  isPublished: boolean
  createdAt: string
}

interface Child {
  id: string
  name: string
  birthDate: string
}

function VideosContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [videos, setVideos] = useState<Video[]>([])
  const [children, setChildren] = useState<Child[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedChildId, setSelectedChildId] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const videosPerPage = 12

  useEffect(() => {
    const fetchData = async () => {
      try {
        const videosRes = await fetch('/api/videos')
        if (videosRes.ok) {
          const videosData = await videosRes.json()
          const videosArray = Array.isArray(videosData) ? videosData : (videosData.videos || [])
          setVideos(videosArray)
        }

        // 로그인한 경우만 children 정보 가져오기
        if (session) {
          const childrenRes = await fetch('/api/children')
          if (childrenRes.ok) {
            const childrenData = await childrenRes.json()
            const childrenArray = Array.isArray(childrenData) ? childrenData : (childrenData.children || [])
            setChildren(childrenArray)

            // URL 파라미터에서 childId가 있으면 자동 선택
            const childIdParam = searchParams.get('childId')
            if (childIdParam && childrenArray.find((c: Child) => c.id === childIdParam)) {
              setSelectedChildId(childIdParam)
            }
          }
        }
      } catch (error) {
        console.error('데이터를 불러오는 중 오류 발생:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [session, searchParams])

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate)
    const today = new Date()
    const ageInMonths = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth())
    return ageInMonths
  }

  const getAgeText = (birthDate: string) => {
    const ageInMonths = calculateAge(birthDate)
    if (ageInMonths < 12) {
      return `${ageInMonths}개월`
    } else {
      const years = Math.floor(ageInMonths / 12)
      const months = ageInMonths % 12
      return months > 0 ? `${years}세 ${months}개월` : `${years}세`
    }
  }

  const filteredVideos = videos.filter(video => {
    // 검색어 필터
    if (searchQuery && !video.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !video.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    // 아이 나이 필터
    if (selectedChildId) {
      const child = children.find(c => c.id === selectedChildId)
      if (child) {
        const ageInMonths = calculateAge(child.birthDate)
        if (ageInMonths < video.targetAgeMin || ageInMonths > video.targetAgeMax) {
          return false
        }
      }
    }

    return true
  })

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredVideos.length / videosPerPage)
  const indexOfLastVideo = currentPage * videosPerPage
  const indexOfFirstVideo = indexOfLastVideo - videosPerPage
  const currentVideos = filteredVideos.slice(indexOfFirstVideo, indexOfLastVideo)

  // 페이지 변경 시 맨 위로 스크롤
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 필터 변경 시 첫 페이지로 리셋
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedChildId, searchQuery])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#386646' }}></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header Section */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">놀이 영상</h1>
              <p className="mt-2 text-gray-600">
                우리 아이의 발달 단계에 맞는 교육 영상을 찾아보세요.
              </p>
            </div>
            {session?.user?.role === 'ADMIN' && (
              <Link
                href="/videos/new"
                className="inline-flex items-center px-4 py-2 border-0 text-sm font-medium rounded-md shadow-sm transition-colors"
                style={{ backgroundColor: '#386646', color: 'white' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2d4f36'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#386646'}
              >
                영상 추가
              </Link>
            )}
          </div>

          {/* Filters */}
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Child Selection */}
              <div>
                <label htmlFor="child-select" className="block text-sm font-medium text-gray-700 mb-2">
                  아이 선택
                </label>
                <select
                  id="child-select"
                  value={selectedChildId}
                  onChange={(e) => setSelectedChildId(e.target.value)}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-aipoten-green focus:border-aipoten-green"
                >
                  <option value="">모든 연령대</option>
                  {children.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.name} ({getAgeText(child.birthDate)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  검색
                </label>
                <input
                  type="text"
                  id="search"
                  placeholder="영상 제목이나 내용으로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-aipoten-green focus:border-aipoten-green"
                />
              </div>
            </div>
          </div>

          {/* Videos Grid */}
          {filteredVideos.length === 0 ? (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-12 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">📹</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  검색 조건에 맞는 영상이 없습니다
                </h3>
                <p className="text-gray-600 mb-6">
                  다른 검색 조건을 시도해보시거나 필터를 초기화해보세요.
                </p>
                <button
                  onClick={() => {
                    setSelectedChildId('')
                    setSearchQuery('')
                  }}
                  className="inline-flex items-center px-4 py-2 border-0 text-sm font-medium rounded-md shadow-sm transition-colors"
                  style={{ backgroundColor: '#386646', color: 'white' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2d4f36'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#386646'}
                >
                  필터 초기화
                </button>
              </div>
            </div>
          ) : (
            <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentVideos.map((video) => (
                <div key={video.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                  {/* Thumbnail - 클릭하면 상세 페이지로 */}
                  <Link href={`/videos/${video.id}`}>
                    <div className="aspect-video bg-gray-200 rounded-t-lg relative overflow-hidden cursor-pointer group">
                      {video.thumbnailUrl ? (
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-4xl text-gray-400">📹</span>
                        </div>
                      )}
                      {/* 재생 아이콘 오버레이 */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all">
                        <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-2xl ml-1">▶️</span>
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                        {formatDuration(video.duration)}
                      </div>
                    </div>
                  </Link>

                  {/* Content */}
                  <div className="p-4">
                    <div className="mb-2">
                      {!video.isPublished && (
                        <span className="inline-block bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full mr-1">
                          비공개
                        </span>
                      )}
                      <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                        {video.targetAgeMin}-{video.targetAgeMax}개월
                      </span>
                    </div>

                    <Link href={`/videos/${video.id}`}>
                      <h3
                        className="font-medium text-gray-900 mb-2 line-clamp-2 cursor-pointer transition-colors"
                        onMouseEnter={(e) => e.currentTarget.style.color = '#386646'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#111827'}
                      >
                        {video.title}
                      </h3>
                    </Link>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {video.description}
                    </p>

                    <div className="flex justify-between items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {new Date(video.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                      <div className="flex gap-2">
                        {session?.user?.role === 'ADMIN' && (
                          <>
                            <Link
                              href={`/videos/edit/${video.id}`}
                              className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                            >
                              수정
                            </Link>
                            <button
                              onClick={async () => {
                                if (confirm('정말 삭제하시겠습니까?')) {
                                  try {
                                    const response = await fetch(`/api/videos/${video.id}`, {
                                      method: 'DELETE'
                                    })
                                    if (response.ok) {
                                      setVideos(videos.filter(v => v.id !== video.id))
                                    } else {
                                      alert('삭제 중 오류가 발생했습니다.')
                                    }
                                  } catch (error) {
                                    alert('삭제 중 오류가 발생했습니다.')
                                  }
                                }
                              }}
                              className="inline-flex items-center px-2 py-1 border border-red-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50"
                            >
                              삭제
                            </button>
                          </>
                        )}
                        <a
                          href={video.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-2 border-0 text-sm font-medium rounded-md transition-colors"
                          style={{ backgroundColor: '#386646', color: 'white' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2d4f36'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#386646'}
                        >
                          시청
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    이전
                  </button>

                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1
                    // 첫 페이지, 마지막 페이지, 현재 페이지 주변만 표시
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`px-4 py-2 rounded-md text-sm font-medium ${
                            currentPage === pageNumber
                              ? 'text-white'
                              : 'text-gray-700 bg-white hover:bg-gray-50 border border-gray-300'
                          }`}
                          style={
                            currentPage === pageNumber
                              ? { backgroundColor: '#386646' }
                              : {}
                          }
                        >
                          {pageNumber}
                        </button>
                      )
                    } else if (
                      pageNumber === currentPage - 2 ||
                      pageNumber === currentPage + 2
                    ) {
                      return <span key={pageNumber} className="px-2 text-gray-500">...</span>
                    }
                    return null
                  })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    다음
                  </button>
                </nav>
              </div>
            )}
            </>
          )}

          {/* Stats */}
          {filteredVideos.length > 0 && (
            <div className="mt-8 bg-white shadow rounded-lg p-6">
              <div className="text-center">
                <p className="text-gray-600">
                  총 <span className="font-semibold" style={{ color: '#386646' }}>{filteredVideos.length}</span>개의 영상이 있습니다
                  {selectedChildId && (
                    <>
                      {' '}• {children.find(c => c.id === selectedChildId)?.name}님의 연령에 맞는 영상입니다
                    </>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function VideosPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#386646' }}></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <VideosContent />
    </Suspense>
  )
}