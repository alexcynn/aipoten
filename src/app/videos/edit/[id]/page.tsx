'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'

export default function EditVideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [videoId, setVideoId] = useState<string>('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    videoPlatform: 'YOUTUBE',
    thumbnailUrl: '',
    duration: '',
    targetAgeMin: '',
    targetAgeMax: '',
    difficulty: 'EASY',
    priority: '5',
    isPublished: false
  })
  const [developmentCategories, setDevelopmentCategories] = useState<string[]>([])
  const [recommendedForLevels, setRecommendedForLevels] = useState<string[]>([])

  const difficulties = [
    { value: 'EASY', label: '쉬움' },
    { value: 'MEDIUM', label: '보통' },
    { value: 'HARD', label: '어려움' }
  ]

  const platforms = [
    { value: 'YOUTUBE', label: 'YouTube' },
    { value: 'VIMEO', label: 'Vimeo' },
    { value: 'OTHER', label: '기타' }
  ]

  const developmentCategoryOptions = [
    { value: 'GROSS_MOTOR', label: '대근육' },
    { value: 'FINE_MOTOR', label: '소근육' },
    { value: 'COGNITIVE', label: '인지' },
    { value: 'LANGUAGE', label: '언어' },
    { value: 'SOCIAL', label: '사회성' },
    { value: 'EMOTIONAL', label: '정서' }
  ]

  const developmentLevelOptions = [
    { value: 'ADVANCED', label: '빠른 수준' },
    { value: 'NORMAL', label: '또래 수준' },
    { value: 'NEEDS_TRACKING', label: '추적검사 요망' },
    { value: 'NEEDS_ASSESSMENT', label: '심화평가 권고' }
  ]

  useEffect(() => {
    const fetchVideo = async () => {
      const resolvedParams = await params
      setVideoId(resolvedParams.id)

      try {
        const response = await fetch(`/api/videos/${resolvedParams.id}`)
        if (response.ok) {
          const data = await response.json()
          const video = data.video || data

          setFormData({
            title: video.title || '',
            description: video.description || '',
            videoUrl: video.videoUrl || '',
            videoPlatform: video.videoPlatform || 'YOUTUBE',
            thumbnailUrl: video.thumbnailUrl || '',
            duration: video.duration ? String(video.duration) : '',
            targetAgeMin: video.targetAgeMin ? String(video.targetAgeMin) : '',
            targetAgeMax: video.targetAgeMax ? String(video.targetAgeMax) : '',
            difficulty: video.difficulty || 'EASY',
            priority: video.priority ? String(video.priority) : '5',
            isPublished: video.isPublished || false
          })

          setDevelopmentCategories(video.developmentCategories || [])
          setRecommendedForLevels(video.recommendedForLevels || [])
        } else {
          alert('영상을 불러오는 중 오류가 발생했습니다.')
          router.push('/videos')
        }
      } catch (error) {
        console.error('영상 조회 오류:', error)
        alert('영상을 불러오는 중 오류가 발생했습니다.')
        router.push('/videos')
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user?.role === 'ADMIN') {
      fetchVideo()
    }
  }, [params, session, router])

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-[#F5EFE7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6A00] mx-auto"></div>
          <p className="mt-4 text-stone-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user?.role !== 'ADMIN') {
    router.push('/login')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.description.trim() || !formData.videoUrl.trim()) {
      alert('제목, 설명, 영상 URL은 필수입니다.')
      return
    }

    if (!formData.targetAgeMin || !formData.targetAgeMax) {
      alert('대상 연령을 설정해주세요.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/videos/${videoId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          targetAgeMin: parseInt(formData.targetAgeMin),
          targetAgeMax: parseInt(formData.targetAgeMax),
          priority: parseInt(formData.priority),
          duration: formData.duration ? parseInt(formData.duration) : null,
          developmentCategories,
          recommendedForLevels
        }),
      })

      if (response.ok) {
        router.push('/videos')
      } else {
        const error = await response.json()
        alert(error.error || '영상 수정 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('영상 수정 오류:', error)
      alert('영상 수정 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  return (
    <div className="min-h-screen bg-[#F5EFE7]">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="py-6">
          {/* Form */}
          <div className="bg-white shadow-sm rounded-xl md:rounded-2xl">
            <div className="px-4 sm:px-6 py-4 border-b border-stone-200">
              <h1 className="text-xl sm:text-2xl font-bold text-stone-900">영상 수정</h1>
              <p className="mt-1 text-sm text-stone-600">
                영상 정보를 수정합니다.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="title" className="block text-sm font-medium text-stone-700 mb-2">
                    제목 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="영상 제목을 입력해주세요"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:border-[#FF6A00]"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-stone-700 mb-2">
                    설명 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="영상에 대한 설명을 입력해주세요"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:border-[#FF6A00] resize-none"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="videoPlatform" className="block text-sm font-medium text-stone-700 mb-2">
                    플랫폼 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="videoPlatform"
                    name="videoPlatform"
                    value={formData.videoPlatform}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:border-[#FF6A00]"
                  >
                    {platforms.map((platform) => (
                      <option key={platform.value} value={platform.value}>
                        {platform.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="videoUrl" className="block text-sm font-medium text-stone-700 mb-2">
                    영상 URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    id="videoUrl"
                    name="videoUrl"
                    value={formData.videoUrl}
                    onChange={handleChange}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:border-[#FF6A00]"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="thumbnailUrl" className="block text-sm font-medium text-stone-700 mb-2">
                    썸네일 URL
                  </label>
                  <input
                    type="url"
                    id="thumbnailUrl"
                    name="thumbnailUrl"
                    value={formData.thumbnailUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/thumbnail.jpg"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:border-[#FF6A00]"
                  />
                </div>

                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-stone-700 mb-2">
                    재생 시간 (초)
                  </label>
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder="예: 300 (5분)"
                    min="1"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:border-[#FF6A00]"
                  />
                </div>
              </div>

              {/* Age Range */}
              <div>
                <h3 className="text-lg font-medium text-stone-900 mb-4">대상 연령</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="targetAgeMin" className="block text-sm font-medium text-stone-700 mb-2">
                      최소 연령 (개월) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="targetAgeMin"
                      name="targetAgeMin"
                      value={formData.targetAgeMin}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      max="144"
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:border-[#FF6A00]"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="targetAgeMax" className="block text-sm font-medium text-stone-700 mb-2">
                      최대 연령 (개월) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="targetAgeMax"
                      name="targetAgeMax"
                      value={formData.targetAgeMax}
                      onChange={handleChange}
                      placeholder="144"
                      min="0"
                      max="144"
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:border-[#FF6A00]"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Additional Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="difficulty" className="block text-sm font-medium text-stone-700 mb-2">
                    난이도 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="difficulty"
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:border-[#FF6A00]"
                  >
                    {difficulties.map((difficulty) => (
                      <option key={difficulty.value} value={difficulty.value}>
                        {difficulty.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-stone-700 mb-2">
                    우선순위 (1-10)
                  </label>
                  <input
                    type="number"
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    placeholder="5"
                    min="1"
                    max="10"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:border-[#FF6A00]"
                  />
                </div>
              </div>

              {/* Development Categories */}
              <div>
                <h3 className="text-lg font-medium text-stone-900 mb-4">발달 영역</h3>
                <p className="text-sm text-stone-500 mb-3">
                  이 영상이 도움이 되는 발달 영역을 선택하세요 (다중 선택 가능)
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {developmentCategoryOptions.map((option) => (
                    <div key={option.value} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`category-${option.value}`}
                        value={option.value}
                        checked={developmentCategories.includes(option.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setDevelopmentCategories([...developmentCategories, option.value])
                          } else {
                            setDevelopmentCategories(developmentCategories.filter(c => c !== option.value))
                          }
                        }}
                        className="h-4 w-4 text-[#FF6A00] focus:ring-[#FF6A00] border-stone-300 rounded"
                      />
                      <label htmlFor={`category-${option.value}`} className="ml-2 block text-sm text-stone-900">
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended For Levels */}
              <div>
                <h3 className="text-lg font-medium text-stone-900 mb-4">추천 대상 레벨</h3>
                <p className="text-sm text-stone-500 mb-3">
                  이 영상을 추천할 발달 레벨을 선택하세요 (선택 안 하면 모든 레벨에 추천)
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {developmentLevelOptions.map((option) => (
                    <div key={option.value} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`level-${option.value}`}
                        value={option.value}
                        checked={recommendedForLevels.includes(option.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setRecommendedForLevels([...recommendedForLevels, option.value])
                          } else {
                            setRecommendedForLevels(recommendedForLevels.filter(l => l !== option.value))
                          }
                        }}
                        className="h-4 w-4 text-[#FF6A00] focus:ring-[#FF6A00] border-stone-300 rounded"
                      />
                      <label htmlFor={`level-${option.value}`} className="ml-2 block text-sm text-stone-900">
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Publishing */}
              <div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublished"
                    name="isPublished"
                    checked={formData.isPublished}
                    onChange={handleChange}
                    className="h-4 w-4 text-[#FF6A00] focus:ring-[#FF6A00] border-stone-300 rounded"
                  />
                  <label htmlFor="isPublished" className="ml-2 block text-sm text-stone-900">
                    게시
                  </label>
                </div>
                <p className="mt-1 text-sm text-stone-500">
                  체크하면 영상이 사용자에게 공개됩니다.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-stone-200">
                <Link
                  href="/videos"
                  className="px-4 py-2 text-sm font-medium text-stone-700 bg-white border border-stone-300 rounded-[10px] hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF6A00]"
                >
                  취소
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#FF6A00] border border-transparent rounded-[10px] hover:bg-[#E55F00] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF6A00] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '수정 중...' : '수정 완료'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
