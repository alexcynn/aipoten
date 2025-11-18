'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'

function TrialResultContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [resultData, setResultData] = useState({
    ageInMonths: 0,
    gender: '',
    height: '',
    weight: '',
    totalScore: 0,
    maxScore: 30,
    percentage: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const ageInMonths = parseInt(searchParams.get('ageInMonths') || '0')
    const gender = searchParams.get('gender') || ''
    const height = searchParams.get('height') || ''
    const weight = searchParams.get('weight') || ''
    const totalScore = parseInt(searchParams.get('totalScore') || '0')
    const maxScore = parseInt(searchParams.get('maxScore') || '30')
    const percentage = parseInt(searchParams.get('percentage') || '0')

    if (!ageInMonths || !gender) {
      router.push('/assessments/trial/start')
      return
    }

    setResultData({
      ageInMonths,
      gender,
      height,
      weight,
      totalScore,
      maxScore,
      percentage,
    })
    setIsLoading(false)
  }, [searchParams, router])

  const getLevel = (score: number) => {
    // 언어 발달 기준: 24+(빠름), 15-23(또래), 8-14(추적), 0-7(심화)
    if (score >= 24) return { label: '빠른 수준', color: 'text-green-600', bgColor: 'bg-green-50', emoji: '🎉' }
    if (score >= 15) return { label: '또래 수준', color: 'text-blue-600', bgColor: 'bg-blue-50', emoji: '😊' }
    if (score >= 8) return { label: '추적검사 요망', color: 'text-yellow-600', bgColor: 'bg-yellow-50', emoji: '🤔' }
    return { label: '심화평가 권고', color: 'text-red-600', bgColor: 'bg-red-50', emoji: '😟' }
  }

  const getFeedback = (score: number) => {
    if (score >= 24) {
      return '언어 발달이 빠른 수준입니다! 계속해서 다양한 대화와 책 읽기를 통해 언어 능력을 발전시켜 주세요.'
    }
    if (score >= 15) {
      return '언어 발달이 또래 수준입니다. 더 많은 언어 자극과 상호작용을 통해 발달을 촉진할 수 있습니다.'
    }
    if (score >= 8) {
      return '일부 언어 영역에서 추적검사가 필요할 수 있습니다. 전문가 상담을 통해 정확한 평가를 받아보시는 것을 권장합니다.'
    }
    return '언어 발달에 심화평가가 권고됩니다. 전문가와의 상담을 통해 아이에게 맞는 지원 방법을 찾아보세요.'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aipoten-green mx-auto"></div>
          <p className="mt-4 text-gray-600">결과 분석 중...</p>
        </div>
      </div>
    )
  }

  const level = getLevel(resultData.totalScore)
  const feedback = getFeedback(resultData.totalScore)

  return (
    <div className="min-h-screen bg-[#F5EFE7]">
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        {/* Result Card */}
        <div className="bg-white shadow-lg rounded-xl md:rounded-2xl overflow-hidden mb-8">
          {/* Header Banner */}
          <div
            className="p-6 sm:p-8 md:p-10 text-center"
            style={{
              background: 'linear-gradient(135deg, #FFE5E5 0%, #FF9999 100%)'
            }}
          >
            <div className="inline-block bg-[#FF9999] text-white px-3 md:px-4 py-1 rounded-full text-xs md:text-sm font-semibold mb-4">
              체험판 결과
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-stone-900 mb-3 md:mb-4">
              언어 발달 체크 완료!
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-stone-700">
              {resultData.ageInMonths}개월 • {resultData.gender === 'MALE' ? '남아' : '여아'}
            </p>
          </div>

          {/* Score */}
          <div className="p-6 sm:p-8 md:p-10 text-center border-b border-gray-100">
            <div className="inline-flex flex-col items-center">
              <div className="text-5xl sm:text-6xl md:text-7xl mb-4 md:mb-6">{level.emoji}</div>
              <div className="text-sm sm:text-base text-stone-600 mb-3 md:mb-4">언어 발달 수준</div>
              <div className={`inline-flex items-center px-6 sm:px-8 md:px-10 py-3 md:py-4 rounded-full ${level.bgColor}`}>
                <span className={`text-xl sm:text-2xl md:text-3xl font-bold ${level.color}`}>
                  {level.label}
                </span>
              </div>
            </div>
          </div>

          {/* Feedback */}
          <div className="p-6 sm:p-8 md:p-10">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-stone-900 mb-4 md:mb-6">평가 결과</h2>
            <p className="text-sm sm:text-base md:text-lg text-stone-700 leading-relaxed mb-6 md:mb-8">
              {feedback}
            </p>

            {/* Limited Info Box */}
            <div className="bg-[#FFF5E8] border-2 border-[#FFA01B] rounded-xl p-4 sm:p-6">
              <h3 className="text-sm sm:text-base font-bold text-[#FFA01B] mb-3 flex items-center">
                <span className="mr-2">⚠️</span>
                체험판 한계
              </h3>
              <ul className="text-xs sm:text-sm text-stone-700 space-y-2">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>이 결과는 언어 발달 영역만 평가한 것입니다</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>대근육, 소근육, 인지, 사회성 영역은 평가되지 않았습니다</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>결과가 저장되지 않으며, 발달 추이를 확인할 수 없습니다</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>정확한 발달 평가를 위해서는 전체 진단을 권장합니다</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white shadow-lg rounded-xl md:rounded-2xl p-6 sm:p-8 md:p-10 text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-stone-900 mb-3 md:mb-4">
            전체 발달체크로 더 정확한 평가를!
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-stone-600 mb-8 md:mb-12">
            회원가입 후 5개 영역 전체 진단을 받으시면<br />
            상세한 발달 리포트, 맞춤 놀이영상, 발달 추이 그래프를 확인하실 수 있습니다.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
            <div className="bg-[#F5EFE7] rounded-xl p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 bg-[#FF9999]">
                <span className="text-xl sm:text-2xl">📊</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900 mb-2">5개 영역 진단</h3>
              <p className="text-xs sm:text-sm text-stone-600">
                대근육, 소근육, 언어, 인지, 사회성
              </p>
            </div>
            <div className="bg-[#F5EFE7] rounded-xl p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 bg-[#FF9999]">
                <span className="text-xl sm:text-2xl">📈</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900 mb-2">발달 추이</h3>
              <p className="text-xs sm:text-sm text-stone-600">
                시간에 따른 성장 기록
              </p>
            </div>
            <div className="bg-[#F5EFE7] rounded-xl p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 bg-[#FF9999]">
                <span className="text-xl sm:text-2xl">🎯</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900 mb-2">맞춤 추천</h3>
              <p className="text-xs sm:text-sm text-stone-600">
                AI 기반 놀이영상 추천
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-block bg-[#FF6A00] text-white px-6 sm:px-8 md:px-10 py-3 md:py-4 rounded-[10px] font-semibold text-sm sm:text-base md:text-lg hover:bg-[#E55F00] transition-colors shadow-lg"
            >
              회원가입하고 전체 진단받기
            </Link>
            <Link
              href="/login?redirect=/parent/assessments"
              className="inline-block border-2 border-stone-900 text-stone-900 px-6 sm:px-8 md:px-10 py-3 md:py-4 rounded-[10px] font-semibold text-sm sm:text-base md:text-lg hover:bg-gray-50 transition-colors"
            >
              로그인
            </Link>
          </div>

          <div className="mt-6 md:mt-8">
            <Link
              href="/assessments/trial/start"
              className="text-xs sm:text-sm text-stone-600 hover:text-[#FF6A00] underline font-medium transition-colors"
            >
              다시 체험하기
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function TrialResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aipoten-green mx-auto"></div>
          <p className="mt-4 text-gray-600">결과 분석 중...</p>
        </div>
      </div>
    }>
      <TrialResultContent />
    </Suspense>
  )
}
