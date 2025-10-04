'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  const { data: session, status } = useSession()
  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Navigation Header */}
      <nav className="bg-neutral-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/">
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
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/assessments" className="text-gray-600 hover:text-aipoten-green px-3 py-2 rounded-md text-sm font-medium">발달체크</Link>
                <Link href="/news" className="text-gray-600 hover:text-aipoten-green px-3 py-2 rounded-md text-sm font-medium">뉴스</Link>
                <Link href="/boards" className="text-gray-600 hover:text-aipoten-green px-3 py-2 rounded-md text-sm font-medium">게시판</Link>
                <Link href="/videos" className="text-gray-600 hover:text-aipoten-green px-3 py-2 rounded-md text-sm font-medium">놀이영상</Link>
                {session && (
                  <Link href="/search" className="text-gray-600 hover:text-aipoten-green px-3 py-2 rounded-md text-sm font-medium">🔍</Link>
                )}
                {session ? (
                  <Link href="/dashboard" className="btn-aipoten-primary">대시보드</Link>
                ) : (
                  <Link href="/login" className="btn-aipoten-primary">로그인</Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-aipoten text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            우리 아이의 건강한 성장을 위한
            <br />
            <span className="text-aipoten-accent">아이포텐</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90">
            영유아 발달 체크부터 놀이 영성, 맞춤형 콘텐츠까지
            <br />
            아이의 잠재력을 키우는 모든 것
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {session ? (
              <>
                <Link href="/assessments" className="bg-white text-aipoten-green px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors text-center">
                  발달체크 시작하기
                </Link>
                <Link href="/dashboard" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-white hover:text-aipoten-green transition-colors text-center">
                  대시보드로 이동
                </Link>
              </>
            ) : (
              <>
                <Link href="/signup" className="bg-aipoten-accent text-aipoten-navy px-8 py-3 rounded-lg font-semibold text-lg hover:bg-aipoten-orange hover:text-white transition-colors text-center shadow-lg">
                  회원가입하고 시작하기
                </Link>
                <Link href="/login" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-white hover:text-aipoten-green transition-colors text-center">
                  로그인하기
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-neutral-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-aipoten-navy mb-4">
              아이포텐의 핵심 서비스
            </h2>
            <p className="text-lg text-aipoten-green font-medium">
              전문적이고 체계적인 발달 지원 서비스를 제공합니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card-aipoten p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-aipoten-blue rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-aipoten-navy mb-3">발달체크</h3>
              <p className="text-gray-600">
                월령별 발달 단계를 체크하고 맞춤형 가이드를 받아보세요
              </p>
            </div>

            <div className="card-aipoten p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-aipoten-orange rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white">📹</span>
              </div>
              <h3 className="text-xl font-semibold text-aipoten-navy mb-3">놀이영상</h3>
              <p className="text-gray-600">
                아이의 발달 단계에 맞는 다양한 놀이 영상을 제공합니다
              </p>
            </div>

            <div className="card-aipoten p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-aipoten-green rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white">👥</span>
              </div>
              <h3 className="text-xl font-semibold text-aipoten-navy mb-3">커뮤니티</h3>
              <p className="text-gray-600">
                같은 관심사를 가진 부모들과 정보를 나누고 소통해보세요
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16" style={{backgroundColor: '#386646'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            지금 시작해보세요
          </h2>
          <p className="text-xl text-aipoten-accent mb-8">
            우리 아이만을 위한 맞춤형 발달 지원 서비스
          </p>
          {session ? (
            <Link href="/dashboard" className="bg-aipoten-accent text-aipoten-navy px-8 py-4 rounded-lg font-semibold text-lg hover:bg-aipoten-orange hover:text-white transition-colors shadow-lg inline-block">
              대시보드로 이동하기
            </Link>
          ) : (
            <Link href="/signup" className="bg-aipoten-accent text-aipoten-navy px-8 py-4 rounded-lg font-semibold text-lg hover:bg-aipoten-orange hover:text-white transition-colors shadow-lg inline-block">
              회원가입하고 시작하기
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-white py-12" style={{backgroundColor: '#193149'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Image
                src="/images/logo-full.png"
                alt="AI Poten"
                width={180}
                height={140}
                className="mb-4 brightness-0 invert"
              />
              <p className="text-gray-300">
                영유아의 건강한 성장을 지원하는 통합 플랫폼
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-aipoten-accent">서비스</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/assessments" className="hover:text-aipoten-accent">발달체크</Link></li>
                <li><Link href="/videos" className="hover:text-aipoten-accent">놀이영상</Link></li>
                <li><Link href="/boards" className="hover:text-aipoten-accent">게시판</Link></li>
                <li><Link href="/news" className="hover:text-aipoten-accent">뉴스</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-aipoten-accent">지원</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-aipoten-accent">도움말</a></li>
                <li><a href="#" className="hover:text-aipoten-accent">고객지원</a></li>
                <li><a href="#" className="hover:text-aipoten-accent">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-aipoten-accent">연락처</h4>
              <p className="text-gray-300">
                이메일: support@aipoten.com
                <br />
                전화: 1588-0000
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 아이포텐. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}