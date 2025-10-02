'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Board {
  id: string
  name: string
  description: string
  category: string
  _count: {
    posts: number
  }
}

export default function BoardsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [boards, setBoards] = useState<Board[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }

    const fetchBoards = async () => {
      try {
        const response = await fetch('/api/boards')
        if (response.ok) {
          const boardsData = await response.json()
          setBoards(boardsData)
        }
      } catch (error) {
        console.error('게시판 목록을 가져오는 중 오류 발생:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBoards()
  }, [session, status, router])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case '발달': return '📊'
      case '육아': return '👶'
      case '놀이': return '🎮'
      case '교육': return '📚'
      case '건강': return '🏥'
      case '음식': return '🍼'
      case '일상': return '💬'
      default: return '📋'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '발달': return 'bg-blue-100 text-blue-800'
      case '육아': return 'bg-pink-100 text-pink-800'
      case '놀이': return 'bg-green-100 text-green-800'
      case '교육': return 'bg-purple-100 text-purple-800'
      case '건강': return 'bg-red-100 text-red-800'
      case '음식': return 'bg-yellow-100 text-yellow-800'
      case '일상': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
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

  if (!session) {
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
              <Link href="/dashboard" className="text-gray-600 hover:text-aipoten-green">
                대시보드
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
            <h1 className="text-3xl font-bold text-gray-900">커뮤니티</h1>
            <p className="mt-2 text-gray-600">
              다른 부모님들과 육아 경험을 나누고 정보를 공유해보세요.
            </p>
          </div>

          {/* Welcome Card */}
          <div className="bg-gradient-aipoten text-white rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold mb-2">
                  아이포텐 커뮤니티에 오신 것을 환영합니다!
                </h2>
                <p className="text-white/90">
                  같은 고민을 가진 부모님들과 소통하며 함께 성장해나가요.
                </p>
              </div>
              <div className="text-6xl opacity-20">
                👨‍👩‍👧‍👦
              </div>
            </div>
          </div>

          {/* Boards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => (
              <Link
                key={board.id}
                href={`/boards/${board.id}`}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="text-3xl mr-3">
                      {getCategoryIcon(board.category)}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {board.name}
                      </h3>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(board.category)}`}>
                        {board.category}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {board.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>
                    게시글 {board._count.posts}개
                  </span>
                  <span className="text-aipoten-green hover:text-aipoten-navy">
                    게시판 보기 →
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Empty State */}
          {boards.length === 0 && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-12 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">💬</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  아직 게시판이 없습니다
                </h3>
                <p className="text-gray-600">
                  곧 다양한 주제의 게시판이 추가될 예정입니다.
                </p>
              </div>
            </div>
          )}

          {/* Community Guidelines */}
          <div className="mt-8 bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">커뮤니티 이용 안내</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">🤝 서로 존중해요</h4>
                <p className="text-sm text-gray-600">
                  다양한 육아 방식과 의견을 존중하며 따뜻한 마음으로 소통해주세요.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">📝 유익한 정보를 나눠요</h4>
                <p className="text-sm text-gray-600">
                  실제 경험에 기반한 유용한 정보와 팁을 공유해주세요.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">🚫 광고는 금지해요</h4>
                <p className="text-sm text-gray-600">
                  상업적 광고나 홍보성 글은 삭제될 수 있습니다.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">💝 도움이 필요한 분을 도와주세요</h4>
                <p className="text-sm text-gray-600">
                  질문하는 분들께 친절하고 도움이 되는 답변을 해주세요.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          {boards.length > 0 && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <div className="text-2xl font-bold text-aipoten-green mb-1">
                  {boards.length}
                </div>
                <div className="text-sm text-gray-600">개의 게시판</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <div className="text-2xl font-bold text-aipoten-blue mb-1">
                  {boards.reduce((total, board) => total + board._count.posts, 0)}
                </div>
                <div className="text-sm text-gray-600">개의 게시글</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <div className="text-2xl font-bold text-aipoten-orange mb-1">
                  활발
                </div>
                <div className="text-sm text-gray-600">커뮤니티 활동</div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}