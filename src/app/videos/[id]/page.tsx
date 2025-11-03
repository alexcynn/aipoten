'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'

interface Video {
  id: string
  title: string
  description: string
  videoUrl: string
  videoPlatform: string
  thumbnailUrl: string | null
  duration: number | null
  targetAgeMin: number
  targetAgeMax: number
  difficulty: string
  developmentCategories: string[]
  recommendedForLevels: string[]
  viewCount: number
  isPublished: boolean
  createdAt: string
}

interface Comment {
  id: string
  content: string
  createdAt: string
  user: {
    id: string
    name: string | null
    avatar: string | null
  }
}

export default function VideoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [video, setVideo] = useState<Video | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [videoId, setVideoId] = useState<string>('')

  const CATEGORY_LABELS: Record<string, string> = {
    GROSS_MOTOR: '대근육',
    FINE_MOTOR: '소근육',
    COGNITIVE: '인지',
    LANGUAGE: '언어',
    SOCIAL: '사회성',
    EMOTIONAL: '정서'
  }

  useEffect(() => {
    const fetchData = async () => {
      const resolvedParams = await params
      setVideoId(resolvedParams.id)

      try {
        // 영상 정보 조회
        const videoRes = await fetch(`/api/videos/${resolvedParams.id}`)
        if (videoRes.ok) {
          const videoData = await videoRes.json()
          setVideo(videoData.video || videoData)
        }

        // 댓글 조회
        const commentsRes = await fetch(`/api/videos/${resolvedParams.id}/comments`)
        if (commentsRes.ok) {
          const commentsData = await commentsRes.json()
          setComments(commentsData.comments || [])
        }
      } catch (error) {
        console.error('데이터 조회 오류:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [params])

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session) {
      alert('로그인이 필요합니다.')
      router.push('/login')
      return
    }

    if (!newComment.trim()) {
      alert('댓글 내용을 입력해주세요.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/videos/${videoId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newComment })
      })

      if (response.ok) {
        const data = await response.json()
        setComments([data.comment, ...comments])
        setNewComment('')
      } else {
        alert('댓글 작성 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('댓글 작성 오류:', error)
      alert('댓글 작성 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCommentDelete = async (commentId: string) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/videos/${videoId}/comments/${commentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setComments(comments.filter(c => c.id !== commentId))
      } else {
        alert('댓글 삭제 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('댓글 삭제 오류:', error)
      alert('댓글 삭제 중 오류가 발생했습니다.')
    }
  }

  const getYouTubeEmbedUrl = (url: string) => {
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)
    if (videoIdMatch) {
      return `https://www.youtube.com/embed/${videoIdMatch[1]}`
    }
    return url
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

  if (!video) {
    return (
      <div className="min-h-screen bg-neutral-light flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">영상을 찾을 수 없습니다.</p>
          <Link
            href="/videos"
            className="inline-flex items-center px-4 py-2 bg-aipoten-green text-white rounded-md hover:bg-aipoten-navy"
          >
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-light">
      <Header />

      <main className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* 뒤로가기 버튼 */}
          <div className="mb-4">
            <Link
              href="/videos"
              className="text-sm text-gray-600 hover:text-aipoten-green"
            >
              ← 목록으로 돌아가기
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 왼쪽: 영상 플레이어 */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-lg overflow-hidden">
                {/* 영상 플레이어 */}
                <div className="aspect-video bg-black">
                  {video.videoPlatform === 'YOUTUBE' ? (
                    <iframe
                      width="100%"
                      height="100%"
                      src={getYouTubeEmbedUrl(video.videoUrl)}
                      title={video.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <div className="text-center">
                        <p className="mb-4">플레이어를 지원하지 않는 플랫폼입니다.</p>
                        <a
                          href={video.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-white text-black rounded-md hover:bg-gray-200"
                        >
                          외부 링크로 시청하기
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* 영상 정보 */}
                <div className="p-6">
                  <div className="flex items-start gap-2 mb-3">
                    <h1 className="text-2xl font-bold text-gray-900">{video.title}</h1>
                    {!video.isPublished && (
                      <span className="inline-block bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full mt-1">
                        비공개
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {video.developmentCategories.map((cat) => (
                      <span
                        key={cat}
                        className="inline-block px-3 py-1 rounded-full text-sm font-medium"
                        style={{ backgroundColor: '#E8F5E9', color: '#386646' }}
                      >
                        {CATEGORY_LABELS[cat] || cat}
                      </span>
                    ))}
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                      {video.targetAgeMin}-{video.targetAgeMax}개월
                    </span>
                  </div>

                  <p className="text-gray-700 mb-4 whitespace-pre-wrap">{video.description}</p>

                  <div className="flex items-center gap-4 text-sm text-gray-500 border-t pt-4">
                    <span>👁️ 조회수 {video.viewCount.toLocaleString()}</span>
                    <span>📅 {new Date(video.createdAt).toLocaleDateString('ko-KR')}</span>
                  </div>
                </div>
              </div>

              {/* 댓글 섹션 */}
              <div className="bg-white shadow rounded-lg mt-6 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  댓글 {comments.length}개
                </h2>

                {/* 댓글 작성 폼 */}
                {session ? (
                  <form onSubmit={handleCommentSubmit} className="mb-6">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="댓글을 입력하세요..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-aipoten-green focus:border-aipoten-green resize-none"
                    />
                    <div className="mt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmitting || !newComment.trim()}
                        className="px-4 py-2 bg-aipoten-green text-white rounded-md hover:bg-aipoten-navy disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? '작성 중...' : '댓글 작성'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-gray-600 mb-2">댓글을 작성하려면 로그인이 필요합니다.</p>
                    <Link
                      href="/login"
                      className="text-aipoten-green hover:text-aipoten-navy"
                    >
                      로그인하기
                    </Link>
                  </div>
                )}

                {/* 댓글 목록 */}
                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">첫 댓글을 작성해보세요!</p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="border-b border-gray-200 pb-4 last:border-0">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                              {comment.user.avatar ? (
                                <img
                                  src={comment.user.avatar}
                                  alt={comment.user.name || '사용자'}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-gray-500">👤</span>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-gray-900">
                                  {comment.user.name || '익명'}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(comment.createdAt).toLocaleString('ko-KR')}
                                </span>
                              </div>
                              <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                            </div>
                          </div>
                          {session && (session.user.id === comment.user.id || session.user.role === 'ADMIN') && (
                            <button
                              onClick={() => handleCommentDelete(comment.id)}
                              className="text-sm text-red-600 hover:text-red-800 ml-2"
                            >
                              삭제
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* 오른쪽: 추가 정보 */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow rounded-lg p-6 sticky top-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">영상 정보</h3>

                <div className="space-y-3 text-sm">
                  <div>
                    <dt className="font-medium text-gray-500">대상 연령</dt>
                    <dd className="text-gray-900">{video.targetAgeMin}-{video.targetAgeMax}개월</dd>
                  </div>

                  <div>
                    <dt className="font-medium text-gray-500">난이도</dt>
                    <dd className="text-gray-900">
                      {video.difficulty === 'EASY' && '쉬움'}
                      {video.difficulty === 'MEDIUM' && '보통'}
                      {video.difficulty === 'HARD' && '어려움'}
                    </dd>
                  </div>

                  {video.duration && (
                    <div>
                      <dt className="font-medium text-gray-500">재생 시간</dt>
                      <dd className="text-gray-900">
                        {Math.floor(video.duration / 60)}분 {video.duration % 60}초
                      </dd>
                    </div>
                  )}

                  <div>
                    <dt className="font-medium text-gray-500">발달 영역</dt>
                    <dd className="flex flex-wrap gap-1 mt-1">
                      {video.developmentCategories.map((cat) => (
                        <span
                          key={cat}
                          className="inline-block px-2 py-1 text-xs rounded-full"
                          style={{ backgroundColor: '#E8F5E9', color: '#386646' }}
                        >
                          {CATEGORY_LABELS[cat] || cat}
                        </span>
                      ))}
                    </dd>
                  </div>
                </div>

                {session?.user?.role === 'ADMIN' && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <Link
                      href={`/videos/edit/${video.id}`}
                      className="block w-full text-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      영상 수정
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
