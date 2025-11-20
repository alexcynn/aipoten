'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'

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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-[5px] border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-block">
              <Image
                src="/images/logo.png"
                alt="AIPOTEN 아이포텐"
                width={160}
                height={22}
                priority
              />
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-stone-900 hover:text-[#FF6A00] transition-colors font-pretendard"
            >
              로그인
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-3 md:mb-4 font-pretendard">
            아이포텐 회원가입
          </h1>
          <p className="text-base md:text-lg text-stone-600 font-pretendard">
            회원 유형을 선택해주세요
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
          {/* 부모 회원가입 */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-100">
            <div className="h-2 bg-gradient-to-r from-[#FF6A00] to-[#FFB300]"></div>
            <div className="p-6 md:p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#FFE5E5] flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl md:text-4xl">👨‍👩‍👧‍👦</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-stone-900 mb-2 font-pretendard">
                  부모 회원가입
                </h2>
                <p className="text-stone-600 text-sm font-pretendard">
                  아이의 발달을 체크하고 전문가와 연결됩니다
                </p>
              </div>

              <ul className="space-y-3 mb-6 md:mb-8">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#FF6A00] mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-stone-700 font-pretendard">5개 영역 발달 체크</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#FF6A00] mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-stone-700 font-pretendard">맞춤 놀이영상 추천</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#FF6A00] mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-stone-700 font-pretendard">전문 치료사 매칭</span>
                </li>
                {/* <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#FF6A00] mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-stone-700 font-pretendard">발달 추이 그래프</span>
                </li> */}
              </ul>

              <Link
                href="/signup/parent"
                className="block w-full text-center py-3 md:py-4 px-4 rounded-[10px] bg-[#FF6A00] text-white font-semibold hover:bg-[#E55F00] transition-colors shadow-lg font-pretendard"
              >
                부모로 시작하기
              </Link>
            </div>
          </div>

          {/* 치료사 회원가입 */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-100">
            <div className="h-2 bg-gradient-to-r from-[#7BC545] to-[#2B9FD9]"></div>
            <div className="p-6 md:p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#F5EFE7] flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl md:text-4xl">👨‍⚕️</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-stone-900 mb-2 font-pretendard">
                  치료사 회원가입
                </h2>
                <p className="text-stone-600 text-sm font-pretendard">
                  전문 치료사로 활동하며 아이들을 돕습니다
                </p>
              </div>

              <ul className="space-y-3 mb-6 md:mb-8">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#7BC545] mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-stone-700 font-pretendard">전문 프로필 등록</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#7BC545] mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-stone-700 font-pretendard">스케줄 자유 관리</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#7BC545] mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-stone-700 font-pretendard">부모 매칭 시스템</span>
                </li>
                {/* <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#7BC545] mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-stone-700 font-pretendard">상담 일정 관리</span>
                </li> */}
              </ul>

              <Link
                href="/signup/therapist"
                className="block w-full text-center py-3 md:py-4 px-4 rounded-[10px] bg-[#7BC545] text-white font-semibold hover:bg-[#6AB038] transition-colors shadow-lg font-pretendard"
              >
                치료사로 시작하기
              </Link>

              <p className="mt-4 text-xs text-center text-stone-500 font-pretendard">
                * 관리자 승인 후 이용 가능합니다
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 md:mt-12 text-center">
          <p className="text-sm text-stone-600 font-pretendard">
            이미 계정이 있으신가요?{' '}
            <Link
              href="/login"
              className="font-medium text-[#FF6A00] hover:text-[#E55F00] transition-colors"
            >
              로그인하기
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
