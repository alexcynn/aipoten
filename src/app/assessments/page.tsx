'use client'

import Link from 'next/link'
import Header from '@/components/layout/Header'

export default function AssessmentsLandingPage() {
  const categories = [
    {
      id: 'GROSS_MOTOR',
      name: '대근육 운동',
      icon: '🤸',
      description: '걷기, 달리기, 점프 등 큰 근육을 사용하는 운동 능력을 평가합니다.',
      examples: '• 계단 오르내리기\n• 공 던지고 받기\n• 균형 잡고 서기',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      id: 'FINE_MOTOR',
      name: '소근육 운동',
      icon: '✋',
      description: '손가락, 손목 등 작은 근육을 사용하는 정교한 동작 능력을 평가합니다.',
      examples: '• 블록 쌓기\n• 크레용으로 그리기\n• 단추 끼우기',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
    {
      id: 'LANGUAGE',
      name: '언어 발달',
      icon: '💬',
      description: '말하기, 이해하기, 의사소통 능력을 평가합니다.',
      examples: '• 단어와 문장 말하기\n• 질문에 대답하기\n• 이야기 이해하기',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      isPopular: true,
    },
    {
      id: 'COGNITIVE',
      name: '인지 발달',
      icon: '🧠',
      description: '생각하기, 문제 해결, 기억력 등 인지 능력을 평가합니다.',
      examples: '• 색깔과 모양 구분\n• 숫자 세기\n• 원인과 결과 이해',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
    },
    {
      id: 'SOCIAL',
      name: '사회성 발달',
      icon: '👥',
      description: '다른 사람과의 상호작용, 사회적 규칙 이해 능력을 평가합니다.',
      examples: '• 친구와 놀이하기\n• 차례 지키기\n• 감정 표현하기',
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
    },
    {
      id: 'EMOTIONAL',
      name: '정서 발달',
      icon: '❤️',
      description: '감정 조절, 정서적 안정성, 자기 인식 능력을 평가합니다.',
      examples: '• 감정 인식하기\n• 스트레스 대처하기\n• 자신감 갖기',
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
  ]

  return (
    <div className="min-h-screen bg-neutral-light">
      <Header />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-brand-accent bg-opacity-20 text-brand-green mb-4">
            무료 체험
          </span>
          <h1 className="text-4xl font-bold text-brand-navy mb-4">
            발달체크 소개
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            우리 아이의 발달 상태를 6가지 영역으로 체계적으로 평가합니다
          </p>
          <p className="text-gray-500">
            로그인 없이 언어 발달 영역을 무료로 체험해보세요
          </p>
        </div>

        {/* Development Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            6가지 발달 영역
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`relative bg-white rounded-lg shadow-md border-2 ${category.borderColor} overflow-hidden hover:shadow-lg transition-shadow`}
              >
                {category.isPopular && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-yellow-400 text-gray-900">
                      ⭐ 체험 가능
                    </span>
                  </div>
                )}
                <div className={`h-2 bg-gradient-to-r ${category.color}`}></div>
                <div className="p-6">
                  <div className="text-4xl mb-3 text-center">{category.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {category.description}
                  </p>
                  <div className={`${category.bgColor} rounded-lg p-3`}>
                    <p className="text-xs font-semibold text-gray-700 mb-1">평가 예시:</p>
                    <p className="text-xs text-gray-600 whitespace-pre-line">
                      {category.examples}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trial vs Full Comparison */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            체험판 vs 전체 진단 비교
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">기능</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                    체험판 (비로그인)
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                    전체 진단 (로그인)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">진단 영역</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-600">
                    언어 발달만
                  </td>
                  <td className="px-6 py-4 text-sm text-center text-green-600 font-semibold">
                    전체 6개 영역
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">문항 수</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-600">10문항</td>
                  <td className="px-6 py-4 text-sm text-center text-green-600 font-semibold">
                    60문항
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">결과 저장</td>
                  <td className="px-6 py-4 text-sm text-center text-red-600">✗</td>
                  <td className="px-6 py-4 text-sm text-center text-green-600 font-semibold">✓</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">발달 추이 그래프</td>
                  <td className="px-6 py-4 text-sm text-center text-red-600">✗</td>
                  <td className="px-6 py-4 text-sm text-center text-green-600 font-semibold">✓</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">맞춤 놀이영상 추천</td>
                  <td className="px-6 py-4 text-sm text-center text-red-600">✗</td>
                  <td className="px-6 py-4 text-sm text-center text-green-600 font-semibold">✓</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">치료사 연결</td>
                  <td className="px-6 py-4 text-sm text-center text-red-600">✗</td>
                  <td className="px-6 py-4 text-sm text-center text-green-600 font-semibold">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link
            href="/assessments/trial/start"
            style={{ backgroundColor: '#F78C6B' }}
            className="w-full sm:w-auto px-10 py-5 text-white rounded-xl hover:opacity-90 transition-all font-bold text-xl shadow-2xl text-center transform hover:scale-105"
          >
            언어 발달 체험하기 →
          </Link>
          <Link
            href="/login?redirect=/parent/assessments/new"
            style={{ borderColor: '#193149', borderWidth: '3px' }}
            className="w-full sm:w-auto px-10 py-5 bg-white rounded-xl hover:bg-gray-50 transition-all font-bold text-xl shadow-lg text-center"
          >
            <span style={{ color: '#193149' }}>전체 진단 시작하기</span>
          </Link>
        </div>

        {/* Info Notice */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6 text-center">
          <p className="text-sm text-blue-900">
            💡 <strong>체험판</strong>은 언어 발달 영역 10문항만 평가하며, 결과는 저장되지 않습니다.<br />
            전체 6개 영역 진단과 맞춤 서비스를 이용하시려면 회원가입이 필요합니다.
          </p>
        </div>
      </main>
    </div>
  )
}
