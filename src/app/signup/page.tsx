'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from 'next-auth/react'
import Link from 'next/link'

export default function SignupSelectionPage() {
  const router = useRouter()

  useEffect(() => {
    // 이미 로그인된 사용자라면 대시보드로 리다이렉트
    const checkSession = async () => {
      const session = await getSession()
      if (session) {
        router.push('/dashboard')
      }
    }
    checkSession()
  }, [router])

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-brand-navy">
              아이포텐
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-brand-navy hover:text-brand-green"
            >
              로그인
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-brand-navy mb-4">
            아이포텐 회원가입
          </h1>
          <p className="text-lg text-gray-600">
            회원 유형을 선택해주세요
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* 부모 회원가입 */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div
              className="h-3"
              style={{ background: 'linear-gradient(to right, #98C15E, #5D93B3)' }}
            ></div>
            <div className="p-8">
              <div className="text-center mb-6">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: '#98C15E' }}
                >
                  <span className="text-4xl">👨‍👩‍👧‍👦</span>
                </div>
                <h2 className="text-2xl font-bold text-brand-navy mb-2">
                  부모 회원가입
                </h2>
                <p className="text-gray-600 text-sm">
                  아이의 발달을 체크하고 전문가와 연결됩니다
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-brand-green mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-700">6개 영역 발달 체크</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-brand-green mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-700">맞춤 놀이영상 추천</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-brand-green mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-700">전문 치료사 매칭</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-brand-green mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-700">발달 추이 그래프</span>
                </li>
              </ul>

              <Link
                href="/signup/parent"
                className="block w-full text-center py-3 px-4 rounded-md text-white font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#98C15E' }}
              >
                부모로 시작하기
              </Link>
            </div>
          </div>

          {/* 치료사 회원가입 */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div
              className="h-3"
              style={{ background: 'linear-gradient(to right, #386646, #5D93B3)' }}
            ></div>
            <div className="p-8">
              <div className="text-center mb-6">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: '#386646' }}
                >
                  <span className="text-4xl">👨‍⚕️</span>
                </div>
                <h2 className="text-2xl font-bold text-brand-navy mb-2">
                  치료사 회원가입
                </h2>
                <p className="text-gray-600 text-sm">
                  전문 치료사로 활동하며 아이들을 돕습니다
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-brand-navy mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-700">전문 프로필 등록</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-brand-navy mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-700">스케줄 자유 관리</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-brand-navy mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-700">부모 매칭 시스템</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-brand-navy mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-700">상담 일정 관리</span>
                </li>
              </ul>

              <Link
                href="/signup/therapist"
                className="block w-full text-center py-3 px-4 rounded-md text-white font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#386646' }}
              >
                치료사로 시작하기
              </Link>

              <p className="mt-4 text-xs text-center text-gray-500">
                * 관리자 승인 후 이용 가능합니다
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-600">
            이미 계정이 있으신가요?{' '}
            <Link
              href="/login"
              className="font-medium text-brand-green hover:text-brand-navy"
            >
              로그인하기
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
