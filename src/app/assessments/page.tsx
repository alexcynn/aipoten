'use client'

import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function AssessmentsPage() {
  const categories = [
    {
      id: 'GROSS_MOTOR',
      name: '대근육운동',
      icon: '/images/assess-category-01.svg',
      description: '걷고, 뛰고, 균형 잡는힘',
    },
    {
      id: 'FINE_MOTOR',
      name: '소근육운동',
      icon: '/images/assess-category-02.svg',
      description: '섬세한 손동작의 발달',
    },
    {
      id: 'LANGUAGE',
      name: '언어발달',
      icon: '/images/assess-category-03.svg',
      description: '말과 이해의 시작',
      isFree: true,
    },
    {
      id: 'COGNITIVE',
      name: '인지 발달',
      icon: '/images/assess-category-04.svg',
      description: '생각하고 탐구하는 힘',
    },
    {
      id: 'SOCIAL',
      name: '사회성 발달',
      icon: '/images/assess-category-05.svg',
      description: '함께 자라는 힘',
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section with Background */}
      <section className="relative bg-[#fffaf3] overflow-hidden">
        {/* Background Image with Backdrop Blur */}
        <div className="absolute inset-0 w-full h-[398px]">
          <div className="absolute inset-0">
            <img
              src="/images/assess-hero-bg.png"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div
            className="absolute inset-0 bg-[rgba(239,218,195,0.7)]"
            style={{
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)'
            }}
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-[1280px] mx-auto px-[80px] py-[101px]">
          <div className="flex flex-col items-center gap-[12px] max-w-[900px] mx-auto text-center">
            <h1 className="font-bold text-[40px] leading-[64px] text-[#1e1307]">
              아이포텐에서 우리아이 발달체크하기
            </h1>
            <div className="text-[24px] leading-[34px] text-[#1e1307] tracking-[0.24px]">
              <p className="mb-0">아이포텐은 언어치료사,작업치료사 등 각 분야 전문가가 설계한</p>
              <p>정교한 발달체크를 제공합니다.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Cards Section */}
      <section className="bg-[#fffaf3] py-[80px]">
        <div className="max-w-[1280px] mx-auto px-[80px]">
          <div className="flex flex-col gap-[32px] items-end">
            {/* First Row - 3 cards */}
            <div className="flex gap-[30px] w-full">
              {categories.slice(0, 3).map((category) => (
                <div
                  key={category.id}
                  className="relative bg-white rounded-[30px] shadow-[0px_4px_20px_0px_rgba(204,137,88,0.3)] px-[50px] py-[40px] flex flex-col items-center gap-[30px] w-[406px] h-[340px]"
                >
                  {category.isFree && (
                    <div className="absolute right-[21px] top-[21px] bg-[#ff6a00] rounded-[100px] flex items-center gap-[4px] px-[10px] py-[10px] z-10">
                      <div className="w-[20px] h-[19px]">
                        <img src="/images/assess-icon-star.svg" alt="" className="w-full h-full" />
                      </div>
                      <p className="font-bold text-[21px] text-white tracking-[0.21px]">
                        무료체험
                      </p>
                    </div>
                  )}
                  <div className="w-[136px] h-[136px] flex items-center justify-center relative">
                    {category.id === 'GROSS_MOTOR' && (
                      <div className="text-[80px]">🏃</div>
                    )}
                    {category.id === 'FINE_MOTOR' && (
                      <>
                        <img src="/images/assess-icon-bg-orange.svg" alt="" className="absolute inset-0 w-full h-full" />
                        <img src="/images/assess-icon-hand.svg" alt="" className="absolute inset-[25%] w-1/2 h-1/2" />
                      </>
                    )}
                    {category.id === 'LANGUAGE' && (
                      <img src="/images/assess-category-03.svg" alt="" className="w-full h-full" />
                    )}
                  </div>
                  <div className="flex flex-col items-center gap-[8px] text-center">
                    <p className="font-semibold text-[36px] tracking-[0.36px] text-[#1e1307]">
                      {category.name}
                    </p>
                    <p className="text-[24px] leading-[34px] tracking-[0.24px] text-[#555555]">
                      {category.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Second Row - 2 cards centered */}
            <div className="flex gap-[30px] justify-center w-full">
              {categories.slice(3).map((category) => (
                <div
                  key={category.id}
                  className="bg-white rounded-[30px] shadow-[0px_4px_20px_0px_rgba(204,137,88,0.3)] px-[50px] py-[40px] flex flex-col items-center gap-[30px] w-[406px] h-[340px]"
                >
                  <div className="w-[136px] h-[136px] flex items-center justify-center relative">
                    {category.id === 'COGNITIVE' && (
                      <div className="text-[80px]">💡</div>
                    )}
                    {category.id === 'SOCIAL' && (
                      <div className="text-[80px]">😊</div>
                    )}
                  </div>
                  <div className="flex flex-col items-center gap-[8px] text-center">
                    <p className="font-semibold text-[36px] tracking-[0.36px] text-[#1e1307]">
                      {category.name}
                    </p>
                    <p className="text-[24px] leading-[34px] tracking-[0.24px] text-[#555555]">
                      {category.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table Section */}
      <section className="bg-[#fffaf3] pb-[100px]">
        <div className="max-w-[1280px] mx-auto px-[80px]">
          <div className="bg-[#fdf2e4] rounded-[40px] px-[100px] pt-[80px] pb-[40px] flex flex-col items-center gap-[40px]">
            {/* Title */}
            <div className="flex flex-col items-center gap-[8px] text-center">
              <h2 className="font-bold text-[40px] tracking-[0.4px] text-[#1e1307]">
                체험판 vs 전체 진단 비교
              </h2>
              <p className="text-[24px] leading-normal tracking-[0.24px] text-[#555555]">
                언어발달 무료 체험으로 시작하고, 전체 진단으로 더 깊은 분석까지 받아보세요.
              </p>
            </div>

            {/* Table */}
            <div className="w-full">
              <div className="flex flex-col">
                {/* Header Row */}
                <div className="flex items-center justify-between border-b border-[#f8e6da] py-[24px]">
                  <p className="text-[24px] leading-normal text-[#1e1307] w-[240px]">
                    진단 영역
                  </p>
                  <div className="flex items-center text-center">
                    <p className="font-semibold text-[24px] leading-normal text-[#1e1307] w-[330px]">
                      언어 발달만
                    </p>
                    <p className="font-semibold text-[24px] leading-normal text-[#1e1307] w-[330px]">
                      전체 5개 영역
                    </p>
                  </div>
                </div>

                {/* Row 1 */}
                <div className="flex items-center justify-between border-b border-[#f8e6da] py-[24px]">
                  <p className="text-[24px] leading-normal text-[#1e1307] w-[240px]">
                    문항 수
                  </p>
                  <div className="flex items-center text-center">
                    <p className="font-bold text-[24px] leading-normal text-[#1e1307] w-[330px]">
                      10문항
                    </p>
                    <p className="font-semibold text-[24px] leading-normal text-[#1e1307] w-[330px]">
                      40문항
                    </p>
                  </div>
                </div>

                {/* Row 2 */}
                <div className="flex items-center justify-between border-b border-[#f8e6da] py-[24px]">
                  <p className="text-[24px] leading-normal text-[#1e1307] w-[240px]">
                    결과지 제공
                  </p>
                  <div className="flex items-center">
                    <p className="text-[30px] leading-normal text-[#1e1307] text-center w-[330px]">
                      -
                    </p>
                    <div className="w-[330px] flex justify-center">
                      <span className="text-[36px] text-[#ff6a00]">✓</span>
                    </div>
                  </div>
                </div>

                {/* Row 3 */}
                <div className="flex items-center justify-between border-b border-[#f8e6da] py-[24px]">
                  <p className="text-[24px] leading-normal text-[#1e1307] w-[240px]">
                    발달 수준 그래프
                  </p>
                  <div className="flex items-center">
                    <p className="text-[30px] leading-normal text-[#1e1307] text-center w-[330px]">
                      -
                    </p>
                    <div className="w-[330px] flex justify-center">
                      <span className="text-[36px] text-[#ff6a00]">✓</span>
                    </div>
                  </div>
                </div>

                {/* Row 4 */}
                <div className="flex items-center justify-between border-b border-[#f8e6da] py-[24px]">
                  <p className="text-[24px] leading-normal text-[#1e1307] w-[240px]">
                    맞춤 놀이영상 추천
                  </p>
                  <div className="flex items-center">
                    <p className="text-[30px] leading-normal text-[#1e1307] text-center w-[330px]">
                      -
                    </p>
                    <div className="w-[330px] flex justify-center">
                      <span className="text-[36px] text-[#ff6a00]">✓</span>
                    </div>
                  </div>
                </div>

                {/* Row 5 */}
                <div className="flex items-center justify-between py-[24px]">
                  <p className="text-[24px] leading-normal text-[#1e1307] w-[240px]">
                    치료사 연계
                  </p>
                  <div className="flex items-center">
                    <p className="text-[30px] leading-normal text-[#1e1307] text-center w-[330px]">
                      -
                    </p>
                    <div className="w-[330px] flex justify-center">
                      <span className="text-[36px] text-[#ff6a00]">✓</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notice */}
              <p className="text-[18px] leading-[30px] text-[#555555] mt-[20px]">
                💡 체험판은 언어 발달 영역 8문항만 평가하며, 결과는 저장되지 않습니다. 전체 5개 영역 진단과 맞춤 서비스를 이용하시려면 회원가입이 필요합니다.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-[40px] items-center">
              <Link
                href="/assessments/trial/start"
                className="border-[3px] border-[#ff6a00] rounded-[100px] h-[80px] w-[360px] flex items-center justify-center px-[10px] py-[10px] hover:bg-[#fff5eb] transition-colors"
              >
                <p className="font-bold text-[24px] leading-normal text-[#ff6a00]">
                  언어발달체험하기
                </p>
              </Link>
              <Link
                href="/login?redirect=/parent/assessments/new"
                className="bg-[#ff6a00] rounded-[100px] h-[80px] w-[360px] flex items-center justify-center px-[10px] py-[10px] hover:bg-[#e55f00] transition-colors"
              >
                <p className="font-bold text-[24px] leading-normal text-white">
                  전체 진단 시작하기
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
