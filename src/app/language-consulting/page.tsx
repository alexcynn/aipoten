'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/layout/Header'

export default function LanguageConsultingPage() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-[#F5EFE7] py-8 md:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-start">
            {/* Left: Image */}
            <div className="relative h-[280px] sm:h-[350px] md:h-[450px] lg:h-[550px] rounded-2xl overflow-hidden">
              <Image
                src="/images/language-consulting-hero.jpg"
                alt="언어컨설팅"
                fill
                className="object-cover"
              />
            </div>

            {/* Right: Text + Cards */}
            <div className="flex flex-col gap-6 md:gap-8">
              {/* Text Content */}
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-stone-900 mb-3 md:mb-4 leading-tight">
                  우리 아이의 언어발달,<br />
                  검증된 전문가와 정확하게 검사하세요
                </h1>
                <p className="text-sm sm:text-base md:text-base text-stone-700 leading-relaxed">
                  1:1 맞춤 언어 진단 서비스로 아이의 발달 상태와 전문 언어치료사의<br className="hidden lg:block" />
                  관찰과 검사로, 아이포텐이 체계적 검사와 관리 대안까지 알려드립니다.
                </p>
              </div>

              {/* 3 Cards */}
              <div className="grid grid-cols-1 gap-3 md:gap-4">
                {/* Card 1 */}
                <div className="bg-white rounded-2xl p-5 md:p-6 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex-shrink-0 bg-[#FFF5E6] w-12 h-12 rounded-xl flex items-center justify-center">
                    <span className="text-2xl font-bold text-[#FF6A00]">01</span>
                  </div>
                  <div>
                    <h3 className="text-base md:text-lg font-bold text-stone-900 mb-1">
                      전문 언어 치료사의<br />정확한 진단
                    </h3>
                    <p className="text-xs md:text-sm text-stone-600 leading-relaxed">
                      30~90분 동안 체계적 언어검사 도구에<br />따라 현재 언어능력을 알아냅니다.
                    </p>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="bg-white rounded-2xl p-5 md:p-6 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex-shrink-0 bg-[#FFF5E6] w-12 h-12 rounded-xl flex items-center justify-center">
                    <span className="text-2xl font-bold text-[#FF6A00]">02</span>
                  </div>
                  <div>
                    <h3 className="text-base md:text-lg font-bold text-stone-900 mb-1">
                      검사 결과 기반의<br />맞춤형 서포트 제공
                    </h3>
                    <p className="text-xs md:text-sm text-stone-600 leading-relaxed">
                      검사 결과를 바탕으로 진단과 보완이<br />필요한 부분을 안내합니다.
                    </p>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="bg-white rounded-2xl p-5 md:p-6 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex-shrink-0 bg-[#FFF5E6] w-12 h-12 rounded-xl flex items-center justify-center">
                    <span className="text-2xl font-bold text-[#FF6A00]">03</span>
                  </div>
                  <div>
                    <h3 className="text-base md:text-lg font-bold text-stone-900 mb-1">
                      방문 솔루션과<br />맞춤 상담 가이드
                    </h3>
                    <p className="text-xs md:text-sm text-stone-600 leading-relaxed">
                      1:1 맞춤 가정방문 기반하고<br />실제로 가능한 솔루션을 제공합니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 이런분들에게 권해드립니다 Section */}
      <section className="py-8 md:py-12 lg:py-16 bg-[#F5EFE7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-stone-900 mb-6 md:mb-8 lg:mb-12 leading-tight">
            이런분들에게<br />
            권해드립니다.
          </h2>

          <div className="space-y-3 md:space-y-4">
            <div className="bg-white rounded-full px-4 sm:px-5 md:px-6 py-3 md:py-4 shadow-sm flex items-center">
              <span className="text-base sm:text-lg md:text-xl mr-2 sm:mr-3">😊</span>
              <p className="text-xs sm:text-sm md:text-base text-stone-900 font-medium">또래보다 말이 느려 걱정되는 부모님</p>
            </div>
            <div className="bg-white rounded-full px-4 sm:px-5 md:px-6 py-3 md:py-4 shadow-sm flex items-center">
              <span className="text-base sm:text-lg md:text-xl mr-2 sm:mr-3">💬</span>
              <p className="text-xs sm:text-sm md:text-base text-stone-900 font-medium">언어 발달 수준을 정확히 알고 싶은 부모님</p>
            </div>
            <div className="bg-white rounded-full px-4 sm:px-5 md:px-6 py-3 md:py-4 shadow-sm flex items-center">
              <span className="text-base sm:text-lg md:text-xl mr-2 sm:mr-3">🏠</span>
              <p className="text-xs sm:text-sm md:text-base text-stone-900 font-medium">가정에서도 실천 가능한 조언이 필요한 부모님</p>
            </div>
          </div>
        </div>
      </section>

      {/* 언어검사를 이렇게 진행됩니다 Section */}
      <section className="py-8 md:py-12 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-stone-900 text-center mb-8 md:mb-12">
            언어검사를 이렇게 진행됩니다.
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {/* Step 01 */}
            <div className="text-center">
              <div className="mb-3 md:mb-4">
                <span className="inline-block bg-[#FFE5E5] text-[#FF6A00] px-3 md:px-4 py-1 md:py-2 rounded-full text-xs md:text-sm font-semibold">
                  Step 01
                </span>
              </div>
              <div className="bg-[#FFF5E6] w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl mx-auto mb-3 md:mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 md:w-10 md:h-10 text-[#FF6A00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-sm md:text-base font-bold text-[#FF6A00] mb-1 md:mb-2">홈페이지</h3>
              <p className="text-xs md:text-sm text-stone-600 leading-tight">
                서비스 신청(매칭에서<br />
                선택하고 기본 정보)
              </p>
            </div>

            {/* Step 02 */}
            <div className="text-center">
              <div className="mb-3 md:mb-4">
                <span className="inline-block bg-[#FFE5E5] text-[#FF6A00] px-3 md:px-4 py-1 md:py-2 rounded-full text-xs md:text-sm font-semibold">
                  Step 02
                </span>
              </div>
              <div className="bg-[#FFF5E6] w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl mx-auto mb-3 md:mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 md:w-10 md:h-10 text-[#FF6A00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-sm md:text-base font-bold text-[#FF6A00] mb-1 md:mb-2">상담 연결</h3>
              <p className="text-xs md:text-sm text-stone-600 leading-tight">
                내 아이 맞춤형 솔루션을<br />
                집중하는 거시 담당
              </p>
            </div>

            {/* Step 03 */}
            <div className="text-center">
              <div className="mb-3 md:mb-4">
                <span className="inline-block bg-[#FFE5E5] text-[#FF6A00] px-3 md:px-4 py-1 md:py-2 rounded-full text-xs md:text-sm font-semibold">
                  Step 03
                </span>
              </div>
              <div className="bg-[#FFF5E6] w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl mx-auto mb-3 md:mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 md:w-10 md:h-10 text-[#FF6A00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-sm md:text-base font-bold text-[#FF6A00] mb-1 md:mb-2">방문/비대면 상담</h3>
              <p className="text-xs md:text-sm text-stone-600 leading-tight">
                원하는 시간과<br />
                장소에서 예약
              </p>
            </div>

            {/* Step 04 */}
            <div className="text-center">
              <div className="mb-3 md:mb-4">
                <span className="inline-block bg-[#FFE5E5] text-[#FF6A00] px-3 md:px-4 py-1 md:py-2 rounded-full text-xs md:text-sm font-semibold">
                  Step 04
                </span>
              </div>
              <div className="bg-[#FFF5E6] w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl mx-auto mb-3 md:mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 md:w-10 md:h-10 text-[#FF6A00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-sm md:text-base font-bold text-[#FF6A00] mb-1 md:mb-2">진행과 평가</h3>
              <p className="text-xs md:text-sm text-stone-600 leading-tight">
                검사 이후 치료까지<br />
                맞춤 추천 자료까지 획득
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 lg:py-24 bg-gradient-to-br from-[#FF6A00] to-[#FF8533] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 md:mb-6 leading-tight">
            진료가 1:1 상담,<br className="sm:hidden" /> 바로 시작해보세요
          </h2>
          <div className="mb-6 md:mb-8">
            <p className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-2">₩150,000</p>
            <p className="text-white/90 text-base md:text-lg">아이와의 더 나은 가치</p>
          </div>

          {session ? (
            <Link
              href="/parent/therapists"
              className="inline-block bg-white text-[#FF6A00] px-6 sm:px-8 md:px-12 py-3 md:py-4 rounded-full font-bold text-sm sm:text-base md:text-lg hover:bg-stone-100 transition-colors shadow-xl"
            >
              상담 신청하기
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-block bg-white text-[#FF6A00] px-6 sm:px-8 md:px-12 py-3 md:py-4 rounded-full font-bold text-sm sm:text-base md:text-lg hover:bg-stone-100 transition-colors shadow-xl"
            >
              로그인하고 시작하기
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#F9F9F9] py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4 md:mb-6">
            <Image
              src="/images/footer-logo.png"
              alt="AIPOTEN 아이포텐"
              width={150}
              height={24}
              className="opacity-60 md:w-[200px] md:h-[32px]"
            />
          </div>

          <div className="mb-4 md:mb-6">
            <div className="flex flex-wrap gap-2 md:gap-3 text-xs sm:text-sm text-stone-900">
              <Link href="/terms" className="hover:underline">이용약관</Link>
              <span className="text-gray-400">·</span>
              {session?.user?.role === 'THERAPIST' && (
                <>
                  <Link href="/therapist-terms" className="hover:underline">전문가 이용약관</Link>
                  <span className="text-gray-400">·</span>
                </>
              )}
              <Link href="/payment-policy" className="hover:underline">결제 및 환불정책</Link>
              <span className="text-gray-400">·</span>
              <Link href="/privacy" className="font-semibold hover:underline">개인정보 처리방침</Link>
            </div>
          </div>

          <div className="text-[10px] sm:text-xs text-[#999999] space-y-1 mb-4 md:mb-6">
            <p>사업자명: 아이포텐 (AIPOTEN) | 대표: 김은홍 | 사업자 등록번호: 262-08-03275</p>
            <p>주소: 경기도 성남시 수정구 창업로 43, 1층 196호 | 이메일: contact@aipoten.co.kr</p>
          </div>

          <div className="text-[10px] sm:text-xs text-[#999999]">
            <p>&copy; AIPOTEN. All rights reserved</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
