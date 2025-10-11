'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'

export default function TrialAssessmentPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    ageInMonths: '',
    gender: '',
    height: '',
    weight: '',
  })
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.ageInMonths || !formData.gender) {
      setError('개월 수와 성별은 필수 입력 항목입니다.')
      return
    }

    const ageInMonths = parseInt(formData.ageInMonths)
    if (isNaN(ageInMonths) || ageInMonths < 0 || ageInMonths > 120) {
      setError('올바른 개월 수를 입력해주세요. (0-120개월)')
      return
    }

    // URL에 데이터를 담아서 질문 페이지로 이동
    const params = new URLSearchParams({
      ageInMonths: formData.ageInMonths,
      gender: formData.gender,
      ...(formData.height && { height: formData.height }),
      ...(formData.weight && { weight: formData.weight }),
    })

    router.push(`/assessments/trial/questions?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-neutral-light">
      <Header />

      {/* Main Content */}
      <main className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8">
            {/* Title */}
            <div className="text-center mb-8">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-aipoten-accent bg-opacity-20 text-aipoten-green mb-4">
                무료 체험
              </span>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                언어 발달 체크 체험하기
              </h1>
              <p className="text-gray-600">
                간단한 정보를 입력하고 바로 시작하세요 (약 3분 소요)
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Age in Months */}
              <div>
                <label htmlFor="ageInMonths" className="block text-sm font-medium text-gray-700 mb-2">
                  아이 개월 수 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="ageInMonths"
                  value={formData.ageInMonths}
                  onChange={(e) => setFormData({ ...formData, ageInMonths: e.target.value })}
                  placeholder="예: 24 (만 2세는 24개월)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aipoten-green"
                  min="0"
                  max="120"
                />
                <p className="mt-1 text-sm text-gray-500">
                  생후 개월 수를 입력해주세요 (0-120개월)
                </p>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  성별 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: 'MALE' })}
                    className={`p-4 border-2 rounded-lg transition-colors ${
                      formData.gender === 'MALE'
                        ? 'border-aipoten-green bg-aipoten-green bg-opacity-10'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <span className="text-2xl mb-2 block">👦</span>
                    <span className="font-medium">남아</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: 'FEMALE' })}
                    className={`p-4 border-2 rounded-lg transition-colors ${
                      formData.gender === 'FEMALE'
                        ? 'border-aipoten-green bg-aipoten-green bg-opacity-10'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <span className="text-2xl mb-2 block">👧</span>
                    <span className="font-medium">여아</span>
                  </button>
                </div>
              </div>

              {/* Optional: Height */}
              <div>
                <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-2">
                  키 (cm) <span className="text-gray-400 text-xs">선택사항</span>
                </label>
                <input
                  type="number"
                  id="height"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  placeholder="예: 85"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aipoten-green"
                  step="0.1"
                />
              </div>

              {/* Optional: Weight */}
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
                  몸무게 (kg) <span className="text-gray-400 text-xs">선택사항</span>
                </label>
                <input
                  type="number"
                  id="weight"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="예: 12.5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aipoten-green"
                  step="0.1"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Info Box */}
              <div className="bg-blue-50 rounded-md p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">
                  체험판 안내
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• 언어 발달 영역 10문항만 평가합니다</li>
                  <li>• 결과는 저장되지 않습니다</li>
                  <li>• 전체 6개 영역 진단은 회원가입 후 이용 가능합니다</li>
                </ul>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full px-6 py-3 bg-aipoten-green text-white rounded-md hover:bg-aipoten-navy transition-colors font-medium text-lg"
              >
                발달체크 시작하기
              </button>
            </form>

            {/* Bottom CTA */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 mb-2">
                이미 회원이신가요?
              </p>
              <Link
                href="/login?redirect=/parent/assessments"
                className="text-aipoten-green hover:underline font-medium"
              >
                로그인하고 전체 발달체크 하기 →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
