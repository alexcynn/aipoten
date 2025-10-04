'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface Stats {
  users: number
  children: number
  assessments: number
  videos: number
  posts: number
  news: number
  therapists: number
  consultations: number
  pendingTherapists: number
  monthlyRevenue: number
  recentUsers: number
  recentActivities: Array<{
    name: string
    email: string
    role: string
    createdAt: string
  }>
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    // 관리자 권한 확인
    if (session.user?.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }

    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats')
        if (response.ok) {
          const statsData = await response.json()
          setStats(statsData)
        }
      } catch (error) {
        console.error('통계 데이터를 가져오는 중 오류 발생:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [session, status, router])

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
              <Link href="/dashboard" className="flex items-center">
                <Image
                  src="/images/logo-text.png"
                  alt="AI Poten"
                  width={160}
                  height={40}
                  className="h-10 w-auto"
                  priority
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/boards/notification" className="text-gray-600 hover:text-aipoten-green px-3 py-2 rounded-md text-sm font-medium">알림장</Link>
              <Link href="/news" className="text-gray-600 hover:text-aipoten-green px-3 py-2 rounded-md text-sm font-medium">육아정보</Link>
              <Link href="/boards/parenting" className="text-gray-600 hover:text-aipoten-green px-3 py-2 rounded-md text-sm font-medium">육아소통</Link>
              <Link href="/videos" className="text-gray-600 hover:text-aipoten-green px-3 py-2 rounded-md text-sm font-medium">놀이영상</Link>
              <span className="text-gray-700">{session.user?.name}님</span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-gray-600 hover:text-aipoten-green"
              >
                로그아웃
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-aipoten-green hover:bg-gray-100 focus:outline-none"
              >
                {isMobileMenuOpen ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link href="/boards/notification" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-aipoten-green hover:bg-gray-100">알림장</Link>
              <Link href="/news" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-aipoten-green hover:bg-gray-100">육아정보</Link>
              <Link href="/boards/parenting" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-aipoten-green hover:bg-gray-100">육아소통</Link>
              <Link href="/videos" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-aipoten-green hover:bg-gray-100">놀이영상</Link>
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="px-3 py-2 text-sm text-gray-700">{session.user?.name}님</div>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-aipoten-green hover:bg-gray-100"
                >
                  로그아웃
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">관리자 패널</h1>
            <p className="mt-2 text-gray-600">
              아이포텐 플랫폼의 전반적인 현황을 관리하고 모니터링할 수 있습니다.
            </p>
          </div>

          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">총 사용자</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.users}명</p>
                    <p className="text-xs text-green-600">최근 7일: +{stats.recentUsers}명</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl">👩‍⚕️</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">치료사</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.therapists}명</p>
                    {stats.pendingTherapists > 0 && (
                      <p className="text-xs text-yellow-600">승인 대기: {stats.pendingTherapists}명</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl">💬</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">상담</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.consultations}회</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">이번 달 수익</p>
                    <p className="text-2xl font-bold text-gray-900">₩{stats.monthlyRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl">👶</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">등록된 아이</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.children}명</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">발달체크</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.assessments}회</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl">📹</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">추천 영상</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.videos}개</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl">📰</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">게시글/뉴스</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.posts + stats.news}개</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Management Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Content Management */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">콘텐츠 관리</h3>
              <div className="space-y-3">
                <Link
                  href="/boards/notification/new"
                  className="block p-3 rounded-md hover:bg-gray-50 transition-colors border-2 border-aipoten-green"
                >
                  <div className="flex items-center">
                    <span className="text-lg mr-3">📝</span>
                    <div>
                      <div className="font-medium text-aipoten-green">알림장 새글 작성</div>
                      <div className="text-sm text-gray-500">새로운 알림장 게시글 추가</div>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/news/new"
                  className="block p-3 rounded-md hover:bg-gray-50 transition-colors border-2 border-aipoten-blue"
                >
                  <div className="flex items-center">
                    <span className="text-lg mr-3">📰</span>
                    <div>
                      <div className="font-medium text-aipoten-blue">육아정보 새글 작성</div>
                      <div className="text-sm text-gray-500">새로운 육아정보 추가</div>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/videos/new"
                  className="block p-3 rounded-md hover:bg-gray-50 transition-colors border-2 border-aipoten-orange"
                >
                  <div className="flex items-center">
                    <span className="text-lg mr-3">📹</span>
                    <div>
                      <div className="font-medium text-aipoten-orange">놀이영상 추가</div>
                      <div className="text-sm text-gray-500">새로운 놀이영상 등록</div>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/admin/boards"
                  className="block p-3 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <span className="text-lg mr-3">💬</span>
                    <div>
                      <div className="font-medium">게시판 관리</div>
                      <div className="text-sm text-gray-500">전체 게시글 관리</div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* User Management */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">사용자 관리</h3>
              <div className="space-y-3">
                <Link
                  href="/admin/users"
                  className="block p-3 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <span className="text-lg mr-3">👥</span>
                    <div>
                      <div className="font-medium">사용자 목록</div>
                      <div className="text-sm text-gray-500">전체 사용자 관리</div>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/admin/therapists"
                  className="block p-3 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <span className="text-lg mr-3">👩‍⚕️</span>
                    <div>
                      <div className="font-medium">치료사 관리</div>
                      <div className="text-sm text-gray-500">치료사 승인 및 관리</div>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/admin/children"
                  className="block p-3 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <span className="text-lg mr-3">👶</span>
                    <div>
                      <div className="font-medium">아이 프로필</div>
                      <div className="text-sm text-gray-500">등록된 아이 현황</div>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/admin/assessments"
                  className="block p-3 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <span className="text-lg mr-3">📊</span>
                    <div>
                      <div className="font-medium">발달체크 현황</div>
                      <div className="text-sm text-gray-500">평가 결과 통계</div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* System Settings */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">시스템 설정</h3>
              <div className="space-y-3">
                <Link
                  href="/admin/settings"
                  className="block p-3 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <span className="text-lg mr-3">⚙️</span>
                    <div>
                      <div className="font-medium">전역 설정</div>
                      <div className="text-sm text-gray-500">시스템 환경 설정</div>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/admin/backup"
                  className="block p-3 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <span className="text-lg mr-3">💾</span>
                    <div>
                      <div className="font-medium">백업 관리</div>
                      <div className="text-sm text-gray-500">데이터 백업 및 복원</div>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/admin/logs"
                  className="block p-3 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <span className="text-lg mr-3">📝</span>
                    <div>
                      <div className="font-medium">로그 조회</div>
                      <div className="text-sm text-gray-500">시스템 로그 및 활동 기록</div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8 bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">최근 활동</h3>
            </div>
            <div className="p-6">
              <div className="text-center py-8 text-gray-500">
                <span className="text-4xl mb-4 block">📊</span>
                <p>최근 활동 데이터를 불러오는 중입니다...</p>
                <p className="text-sm mt-2">실제 운영 시 사용자 활동, 새 가입, 발달체크 등의 실시간 데이터가 표시됩니다.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}