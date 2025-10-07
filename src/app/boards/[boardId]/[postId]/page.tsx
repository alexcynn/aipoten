'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'

interface Comment {
  id: string
  content: string
  author: {
    id: string
    name: string
    avatar?: string | null
  }
  createdAt: string
  replies: Comment[]
}

interface Post {
  id: string
  title: string
  content: string
  summary?: string | null
  imageUrl?: string | null
  category?: string | null
  views: number
  isSticky: boolean
  boardId: string
  author: {
    id: string
    name: string
    avatar?: string | null
  }
  comments: Comment[]
  createdAt: string
  updatedAt: string
}

export default function PostDetailPage({
  params,
}: {
  params: { boardId: string; postId: string }
}) {
  const { boardId, postId } = params
  const { data: session } = useSession()
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchPost()
  }, [boardId, postId])

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/boards/${boardId}/posts/${postId}`)
      if (response.ok) {
        const data = await response.json()
        setPost(data.post)
      } else if (response.status === 404) {
        alert('게시글을 찾을 수 없습니다.')
        router.push(`/boards/${boardId}`)
      }
    } catch (error) {
      console.error('게시글을 가져오는 중 오류 발생:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('정말 이 게시글을 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/boards/${boardId}/posts/${postId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        alert('게시글이 삭제되었습니다.')
        router.push(`/boards/${boardId}`)
      } else {
        const data = await response.json()
        alert(data.error || '게시글 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('게시글 삭제 오류:', error)
      alert('게시글 삭제 중 오류가 발생했습니다.')
    }
  }

  const canEdit = () => {
    if (!session?.user || !post) return false
    return post.author.id === session.user.id || session.user.role === 'ADMIN'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-light">
        <Header />
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aipoten-green mx-auto"></div>
            <p className="mt-4 text-gray-600">로딩 중...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-neutral-light">
        <Header />
        <div className="max-w-4xl mx-auto py-12 px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              게시글을 찾을 수 없습니다
            </h2>
            <Link
              href={`/boards/${boardId}`}
              className="mt-4 inline-block text-aipoten-green hover:text-aipoten-navy"
            >
              목록으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-light">
      <Header />

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Back Button */}
          <div className="mb-4">
            <Link
              href={`/boards/${boardId}`}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← 목록으로 돌아가기
            </Link>
          </div>

          {/* Post Content */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            {/* Header */}
            <div className="px-4 py-5 sm:p-6 border-b border-gray-200">
              <div className="flex items-center space-x-2 mb-2">
                {post.isSticky && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                    공지
                  </span>
                )}
                {post.category && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    {post.category}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {post.title}
              </h1>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <span className="font-medium text-gray-900">
                    {post.author.name}
                  </span>
                  <span>{new Date(post.createdAt).toLocaleString('ko-KR')}</span>
                  <span>조회 {post.views}</span>
                </div>
                {canEdit() && (
                  <div className="flex space-x-2">
                    <Link
                      href={`/boards/${boardId}/${postId}/edit`}
                      className="text-aipoten-green hover:text-aipoten-navy"
                    >
                      수정
                    </Link>
                    <button
                      onClick={handleDelete}
                      className="text-red-600 hover:text-red-800"
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Image */}
            {post.imageUrl && (
              <div className="px-4 py-5 sm:p-6 border-b border-gray-200">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="max-w-full h-auto rounded"
                />
              </div>
            )}

            {/* Summary */}
            {post.summary && (
              <div className="px-4 py-5 sm:p-6 bg-gray-50 border-b border-gray-200">
                <p className="text-gray-700 font-medium">{post.summary}</p>
              </div>
            )}

            {/* Content */}
            <div className="px-4 py-5 sm:p-6">
              <div
                className="prose max-w-none text-gray-900"
                dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br>') }}
              />
            </div>
          </div>

          {/* Comments Section */}
          <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                댓글 {post.comments.length}개
              </h2>

              {post.comments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  첫 번째 댓글을 남겨보세요.
                </p>
              ) : (
                <div className="space-y-6">
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="border-b border-gray-200 pb-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-gray-900">
                              {comment.author.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.createdAt).toLocaleString('ko-KR')}
                            </span>
                          </div>
                          <p className="text-gray-700 whitespace-pre-wrap">
                            {comment.content}
                          </p>

                          {/* Replies */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="mt-4 ml-8 space-y-4">
                              {comment.replies.map((reply) => (
                                <div
                                  key={reply.id}
                                  className="flex items-start space-x-3"
                                >
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <span className="text-sm font-medium text-gray-900">
                                        {reply.author.name}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {new Date(reply.createdAt).toLocaleString(
                                          'ko-KR'
                                        )}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
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
                </div>
              )}

              {/* Comment Form */}
              {session && (
                <div className="mt-6">
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-aipoten-green focus:border-aipoten-green"
                    placeholder="댓글을 입력하세요..."
                  />
                  <div className="mt-2 flex justify-end">
                    <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-aipoten-green hover:bg-aipoten-navy">
                      댓글 작성
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
