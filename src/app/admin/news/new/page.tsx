'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewNewsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    imageUrl: '',
    isPublished: false
  })

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

    if (!formData.title.trim() || !formData.content.trim()) {
      alert('제목과 내용은 필수입니다.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/admin/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push('/admin/news')
      } else {
        const error = await response.json()
        alert(error.error || '뉴스 추가 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('뉴스 추가 오류:', error)
      alert('뉴스 추가 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
              <Link href="/admin/news" className="ml-2 text-gray-600 hover:text-aipoten-green">
                뉴스 관리
              </Link>
              <span className="ml-2 text-gray-400">/</span>
              <span className="ml-2 text-gray-600">새 뉴스 추가</span>
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
              <h1 className="text-2xl font-bold text-gray-900">새 뉴스 추가</h1>
              <p className="mt-1 text-sm text-gray-600">
                새로운 뉴스나 공지사항을 추가합니다.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  제목 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="뉴스 제목을 입력해주세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-aipoten-green focus:border-aipoten-green"
                  required
                />
              </div>

              {/* Summary */}
              <div>
                <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">
                  요약
                </label>
                <textarea
                  id="summary"
                  name="summary"
                  value={formData.summary}
                  onChange={handleChange}
                  rows={3}
                  placeholder="뉴스의 간단한 요약을 입력해주세요 (선택사항)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-aipoten-green focus:border-aipoten-green resize-none"
                />
              </div>

              {/* Content */}
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  내용 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows={12}
                  placeholder="뉴스 내용을 입력해주세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-aipoten-green focus:border-aipoten-green resize-none"
                  required
                />
              </div>

              {/* Image URL */}
              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  이미지 URL
                </label>
                <input
                  type="url"
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-aipoten-green focus:border-aipoten-green"
                />
                <p className="mt-1 text-sm text-gray-500">
                  뉴스와 함께 표시될 이미지 URL을 입력하세요 (선택사항)
                </p>
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
                  체크하면 뉴스가 즉시 사용자에게 공개됩니다.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <Link
                  href="/admin/news"
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-aipoten-green"
                >
                  취소
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-aipoten-green border border-transparent rounded-md hover:bg-aipoten-navy focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-aipoten-green disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '추가 중...' : '뉴스 추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}