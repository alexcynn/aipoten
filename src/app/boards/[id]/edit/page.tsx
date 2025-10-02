'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface Post {
  id: string
  title: string
  content: string
  category: string
  author: {
    id: string
    name: string
  }
}

export default function EditPostPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'QUESTION'
  })

  const categories = [
    { value: 'QUESTION', label: '질문' },
    { value: 'SHARE', label: '공유' },
    { value: 'REVIEW', label: '후기' }
  ]

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    fetchPost()
  }, [session, status, router, params.id])

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        const postData = data.post

        // 작성자가 아니면 접근 불가
        if (postData.author.id !== session?.user?.id) {
          alert('수정 권한이 없습니다.')
          router.push(`/boards/${params.id}`)
          return
        }

        setPost(postData)
        setFormData({
          title: postData.title,
          content: postData.content,
          category: postData.category
        })
      } else if (response.status === 404) {
        router.push('/boards')
      }
    } catch (error) {
      console.error('게시글을 가져오는 중 오류 발생:', error)
      router.push('/boards')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/posts/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          category: formData.category
        }),
      })

      if (response.ok) {
        router.push(`/boards/${params.id}`)
      } else {
        const error = await response.json()
        alert(error.error || '게시글 수정 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('게시글 수정 오류:', error)
      alert('게시글 수정 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleDelete = async () => {
    if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      return
    }

    try {
      const response = await fetch(`/api/posts/${params.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        alert('게시글이 삭제되었습니다.')
        router.push('/boards')
      } else {
        const error = await response.json()
        alert(error.error || '게시글 삭제 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('게시글 삭제 오류:', error)
      alert('게시글 삭제 중 오류가 발생했습니다.')
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

  if (!session || !post) {
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
              <Link href="/boards" className="text-gray-600 hover:text-aipoten-green">
                커뮤니티
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
                  <Link href="/boards" className="ml-4 text-gray-400 hover:text-gray-500">
                    커뮤니티
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <Link href={`/boards/${post.id}`} className="ml-4 text-gray-400 hover:text-gray-500">
                    게시글
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-4 text-gray-500">수정</span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Form */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">게시글 수정</h1>
                  <p className="mt-1 text-sm text-gray-600">
                    게시글 정보를 수정할 수 있습니다.
                  </p>
                </div>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  삭제
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  카테고리 <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-aipoten-green focus:border-aipoten-green"
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

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
                  placeholder="제목을 입력해주세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-aipoten-green focus:border-aipoten-green"
                  required
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
                  placeholder="내용을 입력해주세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-aipoten-green focus:border-aipoten-green resize-none"
                  required
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <Link
                  href={`/boards/${post.id}`}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-aipoten-green"
                >
                  취소
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-aipoten-green border border-transparent rounded-md hover:bg-aipoten-navy focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-aipoten-green disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '수정 중...' : '수정완료'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}