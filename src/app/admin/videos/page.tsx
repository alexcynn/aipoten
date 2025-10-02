'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Video {
  id: string
  title: string
  description: string
  youtubeUrl: string
  thumbnailUrl: string
  category: string
  ageGroup: string
  tags: string[]
  views: number
  isActive: boolean
  createdAt: string
}

export default function AdminVideosPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [videos, setVideos] = useState<Video[]>([])
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

    fetchVideos()
  }, [session, status, router])

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/admin/videos')
      if (response.ok) {
        const data = await response.json()
        setVideos(data)
      }
    } catch (error) {
      console.error('비디오 목록을 가져오는 중 오류 발생:', error)
    } finally {
      setIsLoading(false)
    }
  }


  const handleToggleActive = async (videoId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/videos/${videoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (response.ok) {
        await fetchVideos()
      }
    } catch (error) {
      console.error('비디오 상태 업데이트 중 오류 발생:', error)
    }
  }

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('정말로 이 비디오를 삭제하시겠습니까?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/videos/${videoId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchVideos()
      }
    } catch (error) {
      console.error('비디오 삭제 중 오류 발생:', error)
    }
  }

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      DEVELOPMENT: '발달',
      EDUCATION: '교육',
      PLAY: '놀이',
      THERAPY: '치료',
      PARENTING: '육아'
    }
    return labels[category] || category
  }

  const getAgeGroupLabel = (ageGroup: string) => {
    const labels: { [key: string]: string } = {
      INFANT: '영아 (0-12개월)',
      TODDLER: '유아 (1-3세)',
      PRESCHOOL: '학령전기 (3-6세)',
      SCHOOL: '학령기 (6-12세)',
      ALL: '전체 연령'
    }
    return labels[ageGroup] || ageGroup
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
              <span className="ml-2 text-gray-600">영상 관리</span>
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
                <h1 className="text-3xl font-bold text-gray-900">영상 관리</h1>
                <p className="mt-2 text-gray-600">
                  추천 영상을 추가, 수정, 삭제할 수 있습니다.
                </p>
              </div>
              <Link
                href="/admin/videos/new"
                className="inline-block bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 font-medium"
                style={{ backgroundColor: '#386646' }}
              >
                새 영상 추가
              </Link>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">📹</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">전체 영상</p>
                  <p className="text-2xl font-bold text-gray-900">{videos.length}개</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">✅</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">활성 영상</p>
                  <p className="text-2xl font-bold text-gray-900">{videos.filter(v => v.isActive).length}개</p>
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
                  <p className="text-2xl font-bold text-gray-900">{videos.reduce((sum, v) => sum + v.views, 0).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">❌</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">비활성 영상</p>
                  <p className="text-2xl font-bold text-gray-900">{videos.filter(v => !v.isActive).length}개</p>
                </div>
              </div>
            </div>
          </div>


          {/* Videos List */}
          {videos.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📹</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 영상이 없습니다</h3>
              <p className="text-gray-500">새로운 영상을 추가해보세요.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <div key={video.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="aspect-video bg-gray-200">
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
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-medium text-gray-900 line-clamp-2">
                        {video.title}
                      </h3>
                      <div className="flex items-center ml-2">
                        <button
                          onClick={() => handleToggleActive(video.id, video.isActive)}
                          className={`w-6 h-6 rounded-full ${
                            video.isActive ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        />
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {video.description}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <span>{getCategoryLabel(video.category)}</span>
                      <span>{getAgeGroupLabel(video.ageGroup)}</span>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {video.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {video.tags.length > 3 && (
                        <span className="text-xs text-gray-500">+{video.tags.length - 3}</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>조회수 {(video.views || 0).toLocaleString()}</span>
                      <span>{new Date(video.createdAt).toLocaleDateString('ko-KR')}</span>
                    </div>

                    <div className="flex space-x-2">
                      <a
                        href={video.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-center px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                      >
                        YouTube에서 보기
                      </a>
                      <button
                        onClick={() => handleDeleteVideo(video.id)}
                        className="px-3 py-2 bg-red-100 text-red-800 text-sm rounded hover:bg-red-200"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}