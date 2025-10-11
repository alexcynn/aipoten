'use client'

import { useState, useEffect } from 'react'
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
  url: string
  thumbnailUrl: string | null
  category: string
  ageMin: number
  ageMax: number
  duration: number
  createdAt: string
}

interface Child {
  id: string
  name: string
  birthDate: string
}

export default function VideosPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [videos, setVideos] = useState<Video[]>([])
  const [children, setChildren] = useState<Child[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedChildId, setSelectedChildId] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')

  const categories = [
    '전체',
    '대근육 발달',
    '소근육 발달',
    '언어 발달',
    '인지 발달',
    '사회성 발달',
    '감정 발달',
    '창의성',
    '음악/리듬',
    '미술/그리기',
    '책 읽기',
    '수학/숫자',
    '과학/탐구'
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        const videosRes = await fetch('/api/videos')
        if (videosRes.ok) {
          const videosData = await videosRes.json()
          setVideos(videosData)
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

    // 카테고리 필터
    if (selectedCategory && selectedCategory !== '전체' && video.category !== selectedCategory) {
      return false
    }

    // 아이 나이 필터
    if (selectedChildId) {
      const child = children.find(c => c.id === selectedChildId)
      if (child) {
        const ageInMonths = calculateAge(child.birthDate)
        if (ageInMonths < video.ageMin || ageInMonths > video.ageMax) {
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
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">추천 영상</h1>
            <p className="mt-2 text-gray-600">
              우리 아이의 발달 단계에 맞는 교육 영상을 찾아보세요.
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              {/* Category Selection */}
              <div>
                <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 mb-2">
                  카테고리
                </label>
                <select
                  id="category-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-aipoten-green focus:border-aipoten-green"
                >
                  {categories.map((category) => (
                    <option key={category} value={category === '전체' ? '' : category}>
                      {category}
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
                    setSelectedCategory('')
                    setSearchQuery('')
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-aipoten-green hover:bg-aipoten-navy"
                >
                  필터 초기화
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredVideos.map((video) => (
                <div key={video.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                  {/* Thumbnail */}
                  <div className="aspect-video bg-gray-200 rounded-t-lg relative overflow-hidden">
                    {video.thumbnailUrl ? (
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl text-gray-400">📹</span>
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      {formatDuration(video.duration)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="mb-2">
                      <span className="inline-block bg-aipoten-accent bg-opacity-20 text-aipoten-green text-xs px-2 py-1 rounded-full">
                        {video.category}
                      </span>
                      <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full ml-1">
                        {video.ageMin}-{video.ageMax}개월
                      </span>
                    </div>

                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                      {video.title}
                    </h3>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {video.description}
                    </p>

                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {new Date(video.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                      <a
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-aipoten-green hover:bg-aipoten-navy"
                      >
                        시청하기
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stats */}
          {filteredVideos.length > 0 && (
            <div className="mt-8 bg-white shadow rounded-lg p-6">
              <div className="text-center">
                <p className="text-gray-600">
                  총 <span className="font-semibold text-aipoten-green">{filteredVideos.length}</span>개의 영상이 있습니다
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