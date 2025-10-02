'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewVideoPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
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
      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          targetAgeMin: parseInt(formData.targetAgeMin),
          targetAgeMax: parseInt(formData.targetAgeMax),
          priority: parseInt(formData.priority),
          duration: formData.duration ? parseInt(formData.duration) : null
        }),
      })

      if (response.ok) {
        router.push('/admin/videos')
      } else {
        const error = await response.json()
        alert(error.error || '영상 추가 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('영상 추가 오류:', error)
      alert('영상 추가 중 오류가 발생했습니다.')
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
              <Link href="/admin/videos" className="ml-2 text-gray-600 hover:text-aipoten-green">
                영상 관리
              </Link>
              <span className="ml-2 text-gray-400">/</span>
              <span className="ml-2 text-gray-600">새 영상 추가</span>
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
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Form */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">새 영상 추가</h1>
              <p className="mt-1 text-sm text-gray-600">
                새로운 추천 영상을 추가합니다.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    제목 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="영상 제목을 입력해주세요"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-aipoten-green focus:border-aipoten-green"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    설명 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="영상에 대한 설명을 입력해주세요"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-aipoten-green focus:border-aipoten-green resize-none"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="videoPlatform" className="block text-sm font-medium text-gray-700 mb-2">
                    플랫폼 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="videoPlatform"
                    name="videoPlatform"
                    value={formData.videoPlatform}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-aipoten-green focus:border-aipoten-green"
                  >
                    {platforms.map((platform) => (
                      <option key={platform.value} value={platform.value}>
                        {platform.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-2">
                    영상 URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    id="videoUrl"
                    name="videoUrl"
                    value={formData.videoUrl}
                    onChange={handleChange}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-aipoten-green focus:border-aipoten-green"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="thumbnailUrl" className="block text-sm font-medium text-gray-700 mb-2">
                    썸네일 URL
                  </label>
                  <input
                    type="url"
                    id="thumbnailUrl"
                    name="thumbnailUrl"
                    value={formData.thumbnailUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/thumbnail.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-aipoten-green focus:border-aipoten-green"
                  />
                </div>

                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-aipoten-green focus:border-aipoten-green"
                  />
                </div>
              </div>

              {/* Age Range */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">대상 연령</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="targetAgeMin" className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-aipoten-green focus:border-aipoten-green"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="targetAgeMax" className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-aipoten-green focus:border-aipoten-green"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Additional Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
                    난이도 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="difficulty"
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-aipoten-green focus:border-aipoten-green"
                  >
                    {difficulties.map((difficulty) => (
                      <option key={difficulty.value} value={difficulty.value}>
                        {difficulty.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-aipoten-green focus:border-aipoten-green"
                  />
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
                    className="h-4 w-4 text-aipoten-green focus:ring-aipoten-green border-gray-300 rounded"
                  />
                  <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-900">
                    즉시 게시
                  </label>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  체크하면 영상이 즉시 사용자에게 공개됩니다.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <Link
                  href="/admin/videos"
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-aipoten-green"
                >
                  취소
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-aipoten-green border border-transparent rounded-md hover:bg-aipoten-navy focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-aipoten-green disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '추가 중...' : '영상 추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}