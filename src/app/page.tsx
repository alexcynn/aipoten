'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/layout/Header'

export default function Home() {
  const { data: session, status } = useSession()

  return (
    <div className="min-h-screen bg-neutral-light">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[400px] md:h-[500px] lg:h-[600px] flex items-center justify-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-background.png"
            alt="Hero Background"
            fill
            className="object-cover"
            priority
          />
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-stone-900 leading-tight">
            아이포텐이 우리 아이를 위한
            <br />
            최적의 전문가를 찾아드립니다
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 md:mb-8 text-stone-700">
            세계적인 분석과 검증된 전문가로 아이의 건강한 성장을 지원합니다
          </p>
          <Link
            href="/parent/therapists"
            className="inline-block bg-[#FF6A00] text-white px-6 sm:px-8 md:px-10 py-3 md:py-4 rounded-[10px] font-semibold text-base md:text-lg hover:bg-[#E55F00] transition-colors shadow-lg"
          >
            전문가 추천받기
          </Link>
        </div>
      </section>

      {/* Golden Time Section */}
      <section className="py-12 md:py-16 bg-[#F5EFE7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-stone-900 mb-3 md:mb-4">
            아이의 발달, 골든타임을 놓치지 마세요
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-stone-700">
            아이포텐은 우리아이의 발달을 빠르고 정확하게 이해하도록 돕습니다
          </p>
        </div>
      </section>

      {/* 3단계 발달 케어 솔루션 Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Title */}
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-stone-900 mb-1 md:mb-2">
              아이포텐과 함께하는
            </h2>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-stone-900">
              3단계 발달 케어 솔루션
            </h2>
          </div>

          {/* Step 1 - 발달 체크 */}
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12 mb-12 md:mb-24">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-block bg-[#FF6A00] text-white px-4 py-2 rounded-md text-xs sm:text-sm font-semibold mb-4 md:mb-6">
                01. 발달 체크
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-stone-900 mb-3 md:mb-4">
                3단계 문진으로,
                <br />
                아이의 발달 상태를 한눈에.
              </h3>
              <p className="text-sm sm:text-base md:text-lg text-stone-600">
                1분개월~6세 아이들의 대근육·소근육·언어·인지·정서
                <br className="hidden md:block" />
                발달을 분석하고 분석 리포트를 즉시 제공합니다.
              </p>
            </div>
            <div className="flex-1 relative">
              <Image
                src="/images/step1-phone.png"
                alt="발달 체크 화면"
                width={500}
                height={500}
                className="w-full max-w-[280px] sm:max-w-sm md:max-w-md mx-auto"
              />
            </div>
          </div>

          {/* Step 2 - 전문가 매칭 */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-6 md:gap-12 mb-12 md:mb-24">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-block bg-[#FF6A00] text-white px-4 py-2 rounded-md text-xs sm:text-sm font-semibold mb-4 md:mb-6">
                02. 전문가 매칭
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-stone-900 mb-3 md:mb-4">
                발달 평가 데이터 기반
                <br />
                맞춤 전문가 연결
              </h3>
              <p className="text-sm sm:text-base md:text-lg text-stone-600">
                분석 결과를 기반으로 분야별 전문가를 찾아드립니다.
                <br className="hidden md:block" />
                주기와 일정 범위내에서 상담 예약하세요.
              </p>
            </div>
            <div className="flex-1 relative">
              <Image
                src="/images/step2-phone.png"
                alt="전문가 매칭 화면"
                width={500}
                height={500}
                className="w-full max-w-[280px] sm:max-w-sm md:max-w-md mx-auto"
              />
            </div>
          </div>

          {/* Step 3 - 안심서비스 */}
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-block bg-[#FF6A00] text-white px-4 py-2 rounded-md text-xs sm:text-sm font-semibold mb-4 md:mb-6">
                03. 안심서비스
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-stone-900 mb-3 md:mb-4">
                전문 언어치료사와 함께
                <br />
                60분 심층 평가 진행
              </h3>
              <p className="text-sm sm:text-base md:text-lg text-stone-600">
                수출 표준 언어 능력을 전반적으로 점검하고
                <br className="hidden md:block" />
                가정에서도 실천 가능한 코칭 플랜을 제공합니다.
              </p>
            </div>
            <div className="flex-1 relative">
              <Image
                src="/images/step3-image.png"
                alt="안심서비스"
                width={500}
                height={500}
                className="w-full max-w-[280px] sm:max-w-sm md:max-w-md mx-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 무료 발달체크 Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-[#FFE5E5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Title */}
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-stone-900 mb-3 md:mb-4">
              지금, 무료 언어 발달체크로 시작하세요.
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-stone-700">
              간단한 문진만으로 우리 아이의 발달 상태를 빠르게 확인할 수 있습니다.
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
            {/* Step 1 */}
            <div className="bg-white rounded-xl md:rounded-2xl p-4 sm:p-6 md:p-8 text-center relative">
              <div className="inline-block bg-[#FF9999] text-white px-3 md:px-4 py-1 rounded-full text-xs md:text-sm font-semibold mb-4 md:mb-6">
                STEP 01
              </div>
              {/* Arrow */}
              <div className="hidden lg:block absolute top-1/2 right-0 transform translate-x-[12px] -translate-y-1/2 z-10">
                <Image
                  src="/images/Arrow.svg"
                  alt="arrow"
                  width={48}
                  height={48}
                />
              </div>
              <div className="mb-3 md:mb-4 flex justify-center">
                <Image
                  src="/images/ic_step_01.svg"
                  alt="아이정보 입력"
                  width={48}
                  height={48}
                  className="w-12 h-12 md:w-16 md:h-16"
                />
              </div>
              <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-stone-900 mb-2 md:mb-3">
                아이정보 입력
              </h3>
              <p className="text-xs md:text-sm text-blue-600">⏱ 30초 소요</p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-xl md:rounded-2xl p-4 sm:p-6 md:p-8 text-center relative">
              <div className="inline-block bg-[#FF9999] text-white px-3 md:px-4 py-1 rounded-full text-xs md:text-sm font-semibold mb-4 md:mb-6">
                STEP 02
              </div>
              {/* Arrow */}
              <div className="hidden lg:block absolute top-1/2 right-0 transform translate-x-[12px] -translate-y-1/2 z-10">
                <Image
                  src="/images/Arrow.svg"
                  alt="arrow"
                  width={48}
                  height={48}
                />
              </div>
              <div className="mb-3 md:mb-4 flex justify-center">
                <Image
                  src="/images/ic_step_02.svg"
                  alt="3단계 문진 체크"
                  width={48}
                  height={48}
                  className="w-12 h-12 md:w-16 md:h-16"
                />
              </div>
              <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-stone-900 mb-2 md:mb-3">
                3단계 문진 체크
              </h3>
              <p className="text-xs md:text-sm text-blue-600">⏱ 2-3분 소요</p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-xl md:rounded-2xl p-4 sm:p-6 md:p-8 text-center relative">
              <div className="inline-block bg-[#FF9999] text-white px-3 md:px-4 py-1 rounded-full text-xs md:text-sm font-semibold mb-4 md:mb-6">
                STEP 03
              </div>
              {/* Arrow */}
              <div className="hidden lg:block absolute top-1/2 right-0 transform translate-x-[12px] -translate-y-1/2 z-10">
                <Image
                  src="/images/Arrow.svg"
                  alt="arrow"
                  width={48}
                  height={48}
                />
              </div>
              <div className="mb-3 md:mb-4 flex justify-center">
                <Image
                  src="/images/ic_step_03.svg"
                  alt="AI 분석 리포트"
                  width={48}
                  height={48}
                  className="w-12 h-12 md:w-16 md:h-16"
                />
              </div>
              <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-stone-900 mb-2 md:mb-3">
                AI 분석 리포트
              </h3>
              <p className="text-xs md:text-sm text-blue-600">📧 추가 발송 확인</p>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-xl md:rounded-2xl p-4 sm:p-6 md:p-8 text-center">
              <div className="inline-block bg-[#FF9999] text-white px-3 md:px-4 py-1 rounded-full text-xs md:text-sm font-semibold mb-4 md:mb-6">
                STEP 04
              </div>
              <div className="mb-3 md:mb-4 flex justify-center">
                <Image
                  src="/images/ic_step_04.svg"
                  alt="맞춤 솔루션 추천"
                  width={48}
                  height={48}
                  className="w-12 h-12 md:w-16 md:h-16"
                />
              </div>
              <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-stone-900 mb-2 md:mb-3">
                맞춤 솔루션 추천
              </h3>
              <p className="text-xs md:text-sm text-blue-600">📋 실용적인 안내</p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <Link
              href="/assessments/trial"
              className="inline-block bg-[#FF9999] text-white px-6 sm:px-8 md:px-12 py-3 md:py-4 rounded-full font-semibold text-sm sm:text-base md:text-lg hover:bg-[#FF8888] transition-colors shadow-lg"
            >
              3분 안에 무료 발달체크 시작하기
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#F9F9F9] py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="mb-4 md:mb-6">
            <Image
              src="/images/footer-logo.png"
              alt="AIPOTEN 아이포텐"
              width={150}
              height={24}
              className="opacity-60 md:w-[200px] md:h-[32px]"
            />
          </div>

          {/* Links */}
          <div className="mb-4 md:mb-6">
            <div className="flex gap-3 md:gap-4 text-xs sm:text-sm text-stone-900">
              <Link href="/terms" className="hover:underline">이용약관</Link>
              <span className="text-gray-400">·</span>
              <Link href="/privacy" className="font-semibold hover:underline">개인정보 처리방침</Link>
            </div>
          </div>

          {/* Company Info */}
          <div className="text-[10px] sm:text-xs text-[#999999] space-y-1 mb-4 md:mb-6">
            <p>주식: UNAI 주식회사 대표이사: 김OO 사업자: 사업자 등록번호: 000-00-00000</p>
            <p>사업자주소: 00시 00구 · 대표: 대표번호 · 사업자번호: 262-08-00275 · 통신판매업 번호: 11-1111</p>
          </div>

          {/* Copyright */}
          <div className="text-[10px] sm:text-xs text-[#999999]">
            <p>© AIPOTEN. All rights reserved</p>
          </div>
        </div>
      </footer>
    </div>
  )
}