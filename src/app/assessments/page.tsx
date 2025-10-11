'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'

export default function AssessmentsLandingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  return (
    <div className="min-h-screen bg-neutral-light">
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              우리 아이 발달체크
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              아이의 성장 단계를 체크하고 맞춤 가이드를 받아보세요
            </p>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Guest Assessment */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-aipoten-blue to-aipoten-accent p-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  간편 체험하기
                </h2>
                <p className="text-white opacity-90">
                  로그인 없이 바로 시작
                </p>
              </div>
              <div className="p-6">
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <span className="text-aipoten-green mr-2">✓</span>
                    <span className="text-gray-700">간단한 아이 정보 입력</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-aipoten-green mr-2">✓</span>
                    <span className="text-gray-700">언어 발달 10문항 체크</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-aipoten-green mr-2">✓</span>
                    <span className="text-gray-700">즉시 결과 확인</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-400 mr-2">✗</span>
                    <span className="text-gray-400">기록 저장 불가</span>
                  </li>
                </ul>
                <Link
                  href="/assessments/trial"
                  className="block w-full text-center px-6 py-3 bg-aipoten-blue text-white rounded-md hover:bg-aipoten-navy transition-colors font-medium"
                >
                  체험하기
                </Link>
              </div>
            </div>

            {/* Full Assessment (Login Required) */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-aipoten-green">
              <div className="bg-gradient-to-r from-aipoten-green to-aipoten-accent p-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold text-white">
                    전체 발달체크
                  </h2>
                  <span className="bg-white text-aipoten-green text-xs font-bold px-2 py-1 rounded">
                    추천
                  </span>
                </div>
                <p className="text-white opacity-90">
                  회원 전용 전체 평가
                </p>
              </div>
              <div className="p-6">
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <span className="text-aipoten-green mr-2">✓</span>
                    <span className="text-gray-700">6개 영역 전체 평가 (60문항)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-aipoten-green mr-2">✓</span>
                    <span className="text-gray-700">상세한 발달 분석 리포트</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-aipoten-green mr-2">✓</span>
                    <span className="text-gray-700">발달 기록 저장 및 추적</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-aipoten-green mr-2">✓</span>
                    <span className="text-gray-700">맞춤 놀이영상 추천</span>
                  </li>
                </ul>
                {session ? (
                  <Link
                    href="/parent/assessments"
                    className="block w-full text-center px-6 py-3 bg-aipoten-green text-white rounded-md hover:bg-aipoten-navy transition-colors font-medium"
                  >
                    내 발달체크 보기
                  </Link>
                ) : (
                  <Link
                    href="/login?redirect=/parent/assessments"
                    className="block w-full text-center px-6 py-3 bg-aipoten-green text-white rounded-md hover:bg-aipoten-navy transition-colors font-medium"
                  >
                    로그인하고 시작하기
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="mt-16 bg-white rounded-lg shadow p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              발달체크란?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-aipoten-blue rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">6개 발달 영역</h4>
                <p className="text-sm text-gray-600">
                  대근육, 소근육, 언어, 인지, 사회성, 정서 영역을 체계적으로 평가합니다.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-aipoten-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📈</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">성장 추적</h4>
                <p className="text-sm text-gray-600">
                  정기적인 체크로 아이의 발달 과정을 기록하고 추적할 수 있습니다.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-aipoten-orange rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">맞춤 가이드</h4>
                <p className="text-sm text-gray-600">
                  결과에 따라 아이에게 필요한 놀이와 활동을 추천받습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
