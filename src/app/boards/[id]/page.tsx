'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface Comment {
  id: string
  content: string
  author: {
    id: string
    name: string
    role: string
  }
  replies: Comment[]
  createdAt: string
}

interface Post {
  id: string
  title: string
  content: string
  category: string
  views: number
  author: {
    id: string
    name: string
    role: string
  }
  comments: Comment[]
  createdAt: string
}

export default function PostDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')

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
        setPost(data.post)
      } else if (response.status === 404) {
        router.push('/boards')
      }
    } catch (error) {
      console.error('게시글을 가져오는 중 오류 발생:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newComment.trim()) {
      alert('댓글 내용을 입력해주세요.')
      return
    }

    setIsSubmittingComment(true)

    try {
      const response = await fetch(`/api/posts/${params.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment,
          parentId: null
        }),
      })

      if (response.ok) {
        setNewComment('')
        fetchPost()
      } else {
        const error = await response.json()
        alert(error.error || '댓글 작성 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('댓글 작성 오류:', error)
      alert('댓글 작성 중 오류가 발생했습니다.')
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleReplySubmit = async (parentId: string) => {
    if (!replyContent.trim()) {
      alert('답글 내용을 입력해주세요.')
      return
    }

    try {
      const response = await fetch(`/api/posts/${params.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: replyContent,
          parentId
        }),
      })

      if (response.ok) {
        setReplyContent('')
        setReplyTo(null)
        fetchPost()
      } else {
        const error = await response.json()
        alert(error.error || '답글 작성 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('답글 작성 오류:', error)
      alert('답글 작성 중 오류가 발생했습니다.')
    }
  }

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      QUESTION: '질문',
      SHARE: '공유',
      REVIEW: '후기',
      NOTICE: '공지'
    }
    return labels[category] || category
  }

  const getCategoryBadge = (category: string) => {
    const badges: { [key: string]: { bg: string; text: string } } = {
      QUESTION: { bg: 'bg-blue-100', text: 'text-blue-800' },
      SHARE: { bg: 'bg-green-100', text: 'text-green-800' },
      REVIEW: { bg: 'bg-purple-100', text: 'text-purple-800' },
      NOTICE: { bg: 'bg-red-100', text: 'text-red-800' }
    }
    const badge = badges[category] || { bg: 'bg-gray-100', text: 'text-gray-800' }
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${badge.bg} ${badge.text}`}>
        {getCategoryLabel(category)}
      </span>
    )
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
                  <span className="ml-4 text-gray-500">게시글</span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Post Content */}
          <div className="bg-white shadow rounded-lg mb-6">
            {/* Post Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {getCategoryBadge(post.category)}
                </div>
                {session.user?.id === post.author.id && (
                  <div className="flex space-x-2">
                    <Link
                      href={`/boards/${post.id}/edit`}
                      className="text-sm text-gray-600 hover:text-aipoten-green"
                    >
                      수정
                    </Link>
                    <button className="text-sm text-red-600 hover:text-red-800">
                      삭제
                    </button>
                  </div>
                )}
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                {post.title}
              </h1>

              <div className="flex items-center text-sm text-gray-500 space-x-4">
                <span>{post.author.name}</span>
                <span>•</span>
                <span>{new Date(post.createdAt).toLocaleDateString('ko-KR')}</span>
                <span>•</span>
                <span>조회 {post.views || 0}</span>
                <span>•</span>
                <span>댓글 {post.comments.length}</span>
              </div>
            </div>

            {/* Post Content */}
            <div className="px-6 py-6">
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-900">
                  {post.content}
                </div>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                댓글 {post.comments.length}개
              </h2>
            </div>

            {/* Comment Form */}
            <div className="px-6 py-4 border-b border-gray-200">
              <form onSubmit={handleCommentSubmit}>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="댓글을 입력해주세요..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-aipoten-green focus:border-aipoten-green resize-none"
                />
                <div className="mt-3 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingComment}
                    className="px-4 py-2 text-sm font-medium text-white bg-aipoten-green border border-transparent rounded-md hover:bg-aipoten-navy focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-aipoten-green disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingComment ? '작성 중...' : '댓글 작성'}
                  </button>
                </div>
              </form>
            </div>

            {/* Comments List */}
            <div className="divide-y divide-gray-200">
              {post.comments.map((comment) => (
                <div key={comment.id} className="px-6 py-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-aipoten-green rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {comment.author.name.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {comment.author.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                      <div className="mt-2">
                        <button
                          onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                          className="text-xs text-gray-500 hover:text-aipoten-green"
                        >
                          답글
                        </button>
                      </div>

                      {/* Reply Form */}
                      {replyTo === comment.id && (
                        <div className="mt-3">
                          <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="답글을 입력해주세요..."
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-aipoten-green focus:border-aipoten-green resize-none text-sm"
                          />
                          <div className="mt-2 flex justify-end space-x-2">
                            <button
                              onClick={() => {
                                setReplyTo(null)
                                setReplyContent('')
                              }}
                              className="px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                              취소
                            </button>
                            <button
                              onClick={() => handleReplySubmit(comment.id)}
                              className="px-3 py-1 text-xs font-medium text-white bg-aipoten-green border border-transparent rounded-md hover:bg-aipoten-navy"
                            >
                              답글 작성
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Replies */}
                      {comment.replies.length > 0 && (
                        <div className="mt-4 ml-4 space-y-3">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs font-medium">
                                    {reply.author.name.charAt(0)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-xs font-medium text-gray-900">
                                    {reply.author.name}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(reply.createdAt).toLocaleDateString('ko-KR')}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-700 whitespace-pre-wrap">
                                  {reply.content}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {post.comments.length === 0 && (
                <div className="px-6 py-8 text-center">
                  <div className="text-gray-400 text-4xl mb-3">💬</div>
                  <p className="text-gray-500">아직 댓글이 없습니다.</p>
                  <p className="text-gray-400 text-sm mt-1">첫 번째 댓글을 작성해보세요!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}