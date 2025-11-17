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
      <section className="relative bg-[#F5EFE7] overflow-hidden h-[204px] lg:h-[1103px] lg:min-w-[1280px]">
        {/* Combined Background Image with Deco Round */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src="/images/lang-hero-bg.png"
            alt="언어 컨설팅 배경"
            className="w-full h-full object-cover opacity-80"
          />
        </div>

        {/* Decorative Round Shape - Mobile */}
        <div className="lg:hidden absolute left-0 top-[113px] w-full h-[145px] overflow-hidden">
          <img
            src="/images/lang-mo-hero-deco.svg"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>

        {/* Decorative Round Shape - Desktop */}
        <div className="hidden lg:block absolute left-0 top-[435.5px] w-full h-[322.496px]">
          <img
            src="/images/lang-hero-deco.svg"
            alt=""
            className="w-full h-full"
          />
        </div>

        {/* Bottom Gradient Layer - Desktop only */}
        <div className="hidden lg:block absolute left-0 top-[723px] w-full h-[380px] bg-gradient-to-t from-[#ffe6c8] to-[#fcebd5]" />

        {/* Content */}
        <div className="relative z-10 h-full">
          {/* Mobile Title */}
          <div className="lg:hidden flex items-center justify-center h-full px-[80px] py-[36px]">
            <div className="relative w-[199px] h-[96px]">
              <img
                src="/images/lang-mo-hero-title.svg"
                alt="우리 아이의 언어발달, 검증된 전문가와 정확하게 검사하세요"
                className="block w-full h-full"
              />
            </div>
          </div>

          {/* Desktop Title & Text */}
          <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 top-[198px]">
            <div className="flex flex-col gap-[22px] items-start">
              {/* Title */}
              <div className="relative h-[128px] w-[737px]">
                <div className="absolute left-[1.56px] top-[10.22px] h-[107.056px] w-[733.76px]">
                  <img
                    src="/images/lang-hero-title.svg"
                    alt="우리 아이의 언어발달, 검증된 전문가와 정확하게 검사하세요"
                    className="block w-full h-full max-w-none"
                  />
                </div>
              </div>

              {/* Description */}
              <p className="font-['Pretendard'] text-[24px] leading-[34px] text-[#555555] whitespace-pre-line">
                <span>과학적 검사와 1:1 맞춤 상담으로 우리 아이의 발달 수준과 방향을 정확히 확인하세요.{'\n'}</span>
                <span className="font-bold">진단부터 실천까지, AiPOTEN의 체계적 3단계 언어 컨설팅이 함께합니다.</span>
              </p>
            </div>
          </div>

          {/* 3 Cards - Desktop only */}
          <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 top-[573px] gap-[40px] items-center">
            {/* Card 1 */}
            <div className="relative bg-white rounded-[60px] shadow-[0px_4px_24px_0px_rgba(82,45,0,0.15)] pt-[40px] pb-[60px] px-[40px] w-[400px] flex flex-col gap-[68px]">
              <div className="bg-[#ffeb7a] w-[60px] h-[60px] rounded-full flex items-center justify-center p-[10px]">
                <span className="text-[24px] font-semibold text-[#ff7300] leading-normal">01</span>
              </div>
              <div className="flex flex-col gap-[20px]">
                <h3 className="text-[30px] font-semibold leading-[40px] text-[#1e1307] whitespace-nowrap">
                  전문 언어 치료사의<br />정확한 진단
                </h3>
                <p className="text-[22px] leading-[34px] text-[#555555] tracking-[-0.44px]">
                  60~90분 표준화 검사로 아이의 언어 발달 단계를 객관적으로 평가합니다.
                </p>
              </div>
              {/* Icon positioned absolutely */}
              <div className="absolute left-[265px] top-[40px] w-[95px] h-[70px]">
                <div className="relative w-full h-full">
                  <div className="absolute left-[35px] top-0 w-[51px] h-[54px] bg-[#ffb701] rounded-[10px] rotate-[15deg] scale-y-[-1]" />
                  <div className="absolute left-[6px] top-[13px] w-[51px] h-[54px] bg-white border-2 border-[#ffa201] rounded-[10px]" />
                  <span className="absolute left-[21px] top-[27px] text-[22px] font-bold text-[#ffa201] leading-normal">아</span>
                  <span className="absolute left-[53px] top-[17px] text-[22px] font-bold text-white leading-normal rotate-[15deg]">이</span>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="relative bg-white rounded-[40px] shadow-[0px_4px_24px_0px_rgba(82,45,0,0.15)] pt-[40px] pb-[60px] px-[40px] w-[400px] flex flex-col gap-[68px]">
              <div className="bg-[#ffd18d] w-[60px] h-[60px] rounded-full flex items-center justify-center p-[10px]">
                <span className="text-[24px] font-semibold text-[#ff5100] leading-normal text-center">02</span>
              </div>
              <div className="flex flex-col gap-[20px]">
                <h3 className="text-[30px] font-semibold leading-[40px] text-[#1e1307] whitespace-nowrap">
                  검사 결과 기반의<br />맞춤형 레포트 제공
                </h3>
                <p className="text-[22px] leading-[34px] text-[#555555] tracking-[-0.44px]">
                  분석 결과를 바탕으로 강점과 보완이 필요한 영역을 한눈에 확인합니다.
                </p>
              </div>
              {/* Icon positioned absolutely */}
              <div className="absolute left-[290px] top-[40px] w-[70px] h-[70px]">
                <img
                  src="/images/lang-card-02-icon.svg"
                  alt=""
                  className="block w-full h-full"
                />
              </div>
            </div>

            {/* Card 3 */}
            <div className="relative bg-white rounded-[40px] shadow-[0px_4px_24px_0px_rgba(82,45,0,0.15)] pt-[40px] pb-[60px] px-[40px] w-[400px] flex flex-col gap-[68px]">
              <div className="bg-[#ffb1a6] w-[60px] h-[60px] rounded-full flex items-center justify-center p-[10px] overflow-hidden">
                <span className="text-[24px] font-semibold text-[#e23d25] leading-[40px]">03</span>
              </div>
              <div className="flex flex-col gap-[20px] leading-[0]">
                <h3 className="text-[30px] font-semibold leading-[40px] text-[#1e1307] whitespace-nowrap">
                  맞춤 솔루션과<br />발달 실천 가이드
                </h3>
                <p className="text-[22px] leading-[34px] text-[#555555] tracking-[-0.44px]">
                  1:1 컨설팅 기반으로 가정에서<br />실천 가능한 솔루션을 제공합니다.
                </p>
              </div>
              {/* Icon positioned absolutely */}
              <div className="absolute left-[275px] top-[40px] w-[85px] h-[70px]">
                <img
                  src="/images/lang-card-03-icon.svg"
                  alt=""
                  className="block w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Description & Cards Section */}
      <section className="lg:hidden bg-gradient-to-t from-[#ffe6c8] to-[#fcebd5] pt-[20px] pb-[80px] px-[40px] flex flex-col gap-[40px] items-center">
        {/* Description Text */}
        <div className="text-[14px] leading-[22px] text-[#555555] text-center">
          <p className="mb-0">과학적 검사와 1:1 맞춤 상담으로</p>
          <p className="mb-0">우리 아이의 발달 수준과 방향을 정확히 확인하세요.</p>
          <p className="mb-0 font-bold">진단부터 실천까지, AiPOTEN의</p>
          <p className="font-bold">체계적 3단계 언어 컨설팅이 함께합니다.</p>
        </div>

        {/* Cards - Mobile Version */}
        <div className="flex flex-col gap-[20px] w-full max-w-[280px]">
          {/* Card 1 */}
          <div className="relative bg-white rounded-[30px] shadow-[0px_2.606px_15.636px_0px_rgba(82,45,0,0.15)] p-[24px] flex flex-col gap-[20px]">
            <div className="bg-[#ffeb7a] w-[38px] h-[38px] rounded-full flex items-center justify-center">
              <img src="/images/lang-mo-card-num-01.svg" alt="01" className="w-[16.355px] h-[11.967px]" />
            </div>
            <div className="flex flex-col gap-[10px]">
              <h3 className="text-[20px] font-semibold leading-[28px] text-[#1e1307]">
                전문 언어 치료사의<br />정확한 진단
              </h3>
              <p className="text-[13px] leading-[20px] text-[#555555] tracking-[-0.26px]">
                60~90분 표준화 검사로 아이의 언어 발달 단계를 객관적으로 평가합니다.
              </p>
            </div>
            <div className="absolute right-[24px] top-[24px] w-[60px] h-[46px]">
              <div className="relative w-full h-full">
                <div className="absolute left-[18.86px] top-px w-[33.192px] h-[35.44px] bg-[#ffb701] rounded-[6px] rotate-[195deg] scale-y-[-1]" />
                <div className="absolute left-0 top-[9.54px] w-[33.171px] h-[35.463px] bg-white border-[1.303px] border-[#ffa201] rounded-[6px]" />
                <span className="absolute left-[9.76px] top-[18.73px] text-[14.333px] font-bold text-[#ffa201]">아</span>
                <span className="absolute left-[30.69px] top-[12.16px] text-[14.333px] font-bold text-white rotate-[15deg]">이</span>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="relative bg-white rounded-[30px] shadow-[0px_2.606px_15.636px_0px_rgba(82,45,0,0.15)] p-[24px] flex flex-col gap-[20px]">
            <div className="bg-[#ffd18d] w-[38px] h-[38px] rounded-full flex items-center justify-center">
              <img src="/images/lang-mo-card-num-02.svg" alt="02" className="w-[19.122px] h-[11.967px]" />
            </div>
            <div className="flex flex-col gap-[10px]">
              <h3 className="text-[20px] font-semibold leading-[28px] text-[#1e1307]">
                검사 결과 기반의<br />맞춤형 레포트 제공
              </h3>
              <p className="text-[13px] leading-[20px] text-[#555555] tracking-[-0.26px]">
                분석 결과를 바탕으로 강점과 보완이 필요한 영역을 한눈에 확인합니다.
              </p>
            </div>
            <div className="absolute right-[24px] top-[24px] w-[46px] h-[46px]">
              <img src="/images/lang-mo-card-02-icon.svg" alt="" className="block w-full h-full" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="relative bg-white rounded-[30px] shadow-[0px_2.606px_15.636px_0px_rgba(82,45,0,0.15)] p-[24px] flex flex-col gap-[20px]">
            <div className="bg-[#ffb1a6] w-[38px] h-[38px] rounded-full flex items-center justify-center overflow-hidden">
              <img src="/images/lang-mo-card-num-03.svg" alt="03" className="w-[18.955px] h-[11.967px]" />
            </div>
            <div className="flex flex-col gap-[10px]">
              <h3 className="text-[20px] font-semibold leading-[28px] text-[#1e1307]">
                맞춤 솔루션과<br />발달 실천 가이드
              </h3>
              <p className="text-[13px] leading-[20px] text-[#555555] tracking-[-0.26px]">
                1:1 컨설팅 기반으로 가정에서<br />실천 가능한 솔루션을 제공합니다.
              </p>
            </div>
            <div className="absolute right-[24px] top-[24px] w-[55px] h-[46px]">
              <img src="/images/lang-mo-card-03-icon.svg" alt="" className="block w-full h-full" />
            </div>
          </div>
        </div>
      </section>

      {/* 이런분들에게 권해드립니다 Section */}
      <section className="bg-[#ffe6c8] pt-[60px] lg:pt-[80px] pb-[60px] lg:pb-[100px] px-[40px] lg:px-[320px] flex flex-col gap-[10px] items-center justify-center">
        <div className="flex flex-col lg:flex-row items-center justify-between w-full max-w-[1280px] gap-[40px] lg:gap-0">
          {/* Title - Mobile */}
          <div className="lg:hidden relative w-[157px] h-[76px]">
            <img
              src="/images/lang-mo-recommend-title.svg"
              alt="이런분들에게 권해드립니다."
              className="block w-full h-full"
            />
          </div>

          {/* Title - Desktop */}
          <div className="hidden lg:block relative h-[132px] w-[277px]">
            <div className="absolute left-[1.72px] top-[11.22px] h-[108.667px] w-[272.132px]">
              <img
                src="/images/lang-recommend-title.svg"
                alt="이런분들에게 권해드립니다."
                className="block w-full h-full max-w-none"
              />
            </div>
          </div>

          {/* Cards */}
          <div className="flex flex-col gap-[20px] lg:gap-[30px] w-full lg:w-[679px]">
            <div className="bg-white h-[80px] lg:h-[100px] w-full lg:w-[670px] rounded-[40px] lg:rounded-[80px] shadow-[0px_2px_20px_0px_rgba(0,0,0,0.05)] flex items-center px-[30px] lg:px-[50px] py-[15px] lg:py-[20px]">
              <p className="font-semibold text-[18px] lg:text-[30px] text-[#1e1307] leading-normal lg:whitespace-nowrap">
                🧒 또래보다 말이 느려 걱정되는 부모님
              </p>
            </div>
            <div className="bg-white h-[80px] lg:h-[100px] w-full lg:w-[670px] rounded-[40px] lg:rounded-[80px] shadow-[0px_2px_20px_0px_rgba(0,0,0,0.05)] flex items-center px-[30px] lg:px-[50px] py-[15px] lg:py-[20px]">
              <p className="font-semibold text-[18px] lg:text-[30px] text-[#1e1307] leading-normal lg:whitespace-nowrap">
                💬 현재 발달 수준을 정확히 알고 싶은 부모님
              </p>
            </div>
            <div className="bg-white h-[80px] lg:h-[100px] w-full lg:w-[670px] rounded-[40px] lg:rounded-[80px] shadow-[0px_2px_20px_0px_rgba(0,0,0,0.05)] flex items-center px-[30px] lg:px-[50px] py-[15px] lg:py-[20px]">
              <p className="font-semibold text-[18px] lg:text-[30px] text-[#1e1307] leading-normal lg:whitespace-nowrap">
                🏠 가정에서도 실천 가능한 조언이 필요한 부모님
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 언어컨설팅 이렇게 진행됩니다 Section */}
      <section className="bg-[#fffbf6] py-[60px] lg:py-[120px]">
        <div className="flex flex-col gap-[40px] lg:gap-[80px] items-center px-[40px] lg:px-0">
          {/* Title - Mobile */}
          <div className="lg:hidden relative w-[246px] h-[29px]">
            <img
              src="/images/lang-mo-process-title.svg"
              alt="언어컨설팅 이렇게 진행됩니다."
              className="block w-full h-full"
            />
          </div>

          {/* Title - Desktop */}
          <div className="hidden lg:block relative h-[59px] w-[1280px]">
            <div className="absolute left-1/2 -translate-x-1/2 top-[7.56px] h-[43.555px] w-[601.841px]">
              <img
                src="/images/lang-process-title.svg"
                alt="언어컨설팅 이렇게 진행됩니다."
                className="block w-full h-full max-w-none"
              />
            </div>
          </div>

          {/* Timeline Container - Desktop */}
          <div className="hidden lg:block relative w-[1916px]">
            {/* Timeline Line */}
            <div className="absolute left-0 top-[69px] w-full h-0 border-t-2 border-dashed border-[#ffa726]">
              <img
                src="/images/lang-timeline-line.svg"
                alt=""
                className="absolute top-[-1px] left-0 w-full h-[2px]"
              />
            </div>

            {/* Steps Container - Desktop */}
            <div className="relative flex items-start justify-between mx-[318px]">
              {/* Step 01 */}
              <div className="flex flex-col gap-[40px] items-center w-[200px]">
                <div className="flex flex-col gap-[28px] items-center">
                  <p className="font-bold text-[24px] leading-[30px] text-[#ff6a00] text-center">
                    Step 01
                  </p>
                  <div className="relative w-[22px] h-[22px]">
                    <img
                      src="/images/lang-step-dot.svg"
                      alt=""
                      className="block w-full h-full"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-[40px] items-center">
                  {/* Icon */}
                  <div className="relative w-[150px] h-[150px]">
                    <img
                      src="/images/lang-step-01-bg.svg"
                      alt=""
                      className="absolute inset-0 w-full h-full"
                    />
                    <div className="absolute left-[16px] top-[20px] w-[116px] h-[90px]">
                      <div className="absolute inset-0 bg-[#6a6a6a] rounded-[11px]" />
                      <div className="absolute left-[4px] top-[4px] w-[108px] h-[82px] bg-white rounded-[7px]" />
                      <div className="absolute left-[39px] top-[25px] w-[40px] h-[40px] bg-[#ff793a] rounded-[9px]" />
                      <div className="absolute left-[47px] top-[32px] w-[25px] h-[25px]">
                        <img
                          src="/images/lang-step-01-icon.svg"
                          alt=""
                          className="block w-full h-full"
                        />
                      </div>
                      <div className="absolute left-[53px] top-[45px] w-[56px] h-[64px]">
                        <img
                          src="/images/lang-step-01-hand.svg"
                          alt=""
                          className="block w-full h-full rotate-[5deg]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Text */}
                  <div className="flex flex-col gap-[10px] items-center text-center">
                    <p className="font-bold text-[22px] leading-normal text-[#ff5d12]">
                      회원가입
                    </p>
                    <div className="text-[20px] leading-[30px] text-[#1e1307]">
                      <p>아이포텐 웹사이트에서</p>
                      <p className="font-bold">간편하게 가입</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Arrow 1 */}
              <div className="absolute left-[269px] top-[59px] w-[22px] h-[22px] rotate-90">
                <div className="absolute left-[13.34%] top-[9.09%] right-[13.34%] bottom-1/4">
                  <img
                    src="/images/lang-arrow.svg"
                    alt=""
                    className="block w-full h-full"
                  />
                </div>
              </div>

              {/* Step 02 */}
              <div className="flex flex-col gap-[40px] items-center w-[200px]">
                <div className="flex flex-col gap-[28px] items-center">
                  <p className="font-bold text-[24px] leading-[30px] text-[#ff6a00] text-center">
                    Step 02
                  </p>
                  <div className="relative w-[22px] h-[22px]">
                    <img
                      src="/images/lang-step-dot.svg"
                      alt=""
                      className="block w-full h-full"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-[40px] items-center">
                  {/* Icon */}
                  <div className="relative w-[150px] h-[152px]">
                    <img
                      src="/images/lang-step-02-icon.svg"
                      alt=""
                      className="block w-full h-full"
                    />
                  </div>

                  {/* Text */}
                  <div className="flex flex-col gap-[10px] items-center text-center">
                    <p className="font-bold text-[22px] leading-normal text-[#ff6a00]">
                      상담신청
                    </p>
                    <div className="text-[20px] leading-[30px] text-[#1e1307]">
                      <p><span className="font-bold">내 아이 정보를 등록</span>하고</p>
                      <p>언어컨설팅 메뉴 선택</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Arrow 2 */}
              <div className="absolute left-[629px] top-[59px] w-[22px] h-[22px] rotate-90">
                <div className="absolute left-[13.34%] top-[9.09%] right-[13.34%] bottom-1/4">
                  <img
                    src="/images/lang-arrow.svg"
                    alt=""
                    className="block w-full h-full"
                  />
                </div>
              </div>

              {/* Step 03 */}
              <div className="flex flex-col gap-[40px] items-center w-[200px]">
                <div className="flex flex-col gap-[28px] items-center">
                  <p className="font-bold text-[24px] leading-[30px] text-[#ff6a00] text-center">
                    Step 03
                  </p>
                  <div className="relative w-[22px] h-[22px]">
                    <img
                      src="/images/lang-step-dot.svg"
                      alt=""
                      className="block w-full h-full"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-[40px] items-center">
                  {/* Icon */}
                  <div className="bg-[#fff2e1] w-[150px] h-[150px] rounded-[75px] flex items-center justify-center px-[34px] py-[32px]">
                    <div className="relative w-[82px] h-[85.921px]">
                      <img
                        src="/images/lang-step-03-icon.svg"
                        alt=""
                        className="block w-full h-full"
                      />
                    </div>
                  </div>

                  {/* Text */}
                  <div className="flex flex-col gap-[10px] items-center text-center">
                    <p className="font-bold text-[22px] leading-normal text-[#ff6a00]">
                      날짜/시간 선택
                    </p>
                    <div className="text-[20px] leading-[30px] text-[#1e1307]">
                      <p>원하는 시간에</p>
                      <p className="font-bold">간편하게 예약</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Arrow 3 */}
              <div className="absolute left-[989px] top-[59px] w-[22px] h-[22px] rotate-90">
                <div className="absolute left-[13.34%] top-[9.09%] right-[13.34%] bottom-1/4">
                  <img
                    src="/images/lang-arrow.svg"
                    alt=""
                    className="block w-full h-full"
                  />
                </div>
              </div>

              {/* Step 04 */}
              <div className="flex flex-col gap-[40px] items-center w-[200px]">
                <div className="flex flex-col gap-[28px] items-center">
                  <p className="font-bold text-[24px] leading-[30px] text-[#ff6a00] text-center">
                    Step 04
                  </p>
                  <div className="relative w-[22px] h-[22px]">
                    <img
                      src="/images/lang-step-04-dot.svg"
                      alt=""
                      className="block w-full h-full"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-[40px] items-center">
                  {/* Icon */}
                  <div className="relative w-[150px] h-[150px]">
                    <img
                      src="/images/lang-step-04-icon.svg"
                      alt=""
                      className="block w-full h-full"
                    />
                  </div>

                  {/* Text */}
                  <div className="flex flex-col gap-[10px] items-center text-center">
                    <p className="font-bold text-[22px] leading-normal text-[#ff6d2a]">
                      컨설팅 진행
                    </p>
                    <div className="text-[20px] leading-[30px] text-[#1e1307]">
                      <p>전문가와 <span className="font-bold">1:1</span></p>
                      <p><span className="font-bold">맞춤 언어 컨설팅</span> 시작</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Vertical Timeline */}
          <div className="lg:hidden flex flex-col gap-[20px] w-full max-w-[280px]">
            {/* Step 01 */}
            <div className="flex flex-col items-center gap-[20px]">
              <div className="flex flex-col gap-[10px] items-center">
                <p className="font-bold text-[16px] leading-normal text-[#ff6a00]">
                  Step 01
                </p>
                <div className="relative w-[15px] h-[15px]">
                  <img
                    src="/images/lang-step-dot.svg"
                    alt=""
                    className="block w-full h-full"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-[20px] items-center">
                {/* Icon */}
                <div className="relative w-[100px] h-[100px]">
                  <img
                    src="/images/lang-step-01-bg.svg"
                    alt=""
                    className="absolute inset-0 w-full h-full"
                  />
                  <div className="absolute left-[10.67px] top-[13.33px] w-[77.33px] h-[60px]">
                    <div className="absolute inset-0 bg-[#6a6a6a] rounded-[7.33px]" />
                    <div className="absolute left-[2.67px] top-[2.67px] w-[72px] h-[54.67px] bg-white rounded-[4.67px]" />
                    <div className="absolute left-[26px] top-[16.67px] w-[26.67px] h-[26.67px] bg-[#ff793a] rounded-[6px]" />
                    <div className="absolute left-[31.33px] top-[21.33px] w-[16.67px] h-[16.67px]">
                      <img
                        src="/images/lang-step-01-icon.svg"
                        alt=""
                        className="block w-full h-full"
                      />
                    </div>
                    <div className="absolute left-[35.33px] top-[30px] w-[37.33px] h-[42.67px]">
                      <img
                        src="/images/lang-step-01-hand.svg"
                        alt=""
                        className="block w-full h-full rotate-[5deg]"
                      />
                    </div>
                  </div>
                </div>

                {/* Text */}
                <div className="flex flex-col gap-[5px] items-center text-center">
                  <p className="font-bold text-[16px] leading-normal text-[#ff5d12]">
                    회원가입
                  </p>
                  <div className="text-[13px] leading-[20px] text-[#1e1307]">
                    <p>아이포텐 웹사이트에서</p>
                    <p className="font-bold">간편하게 가입</p>
                  </div>
                </div>
              </div>

              {/* Arrow down */}
              <div className="w-[15px] h-[15px]">
                <div className="w-full h-full">
                  <img
                    src="/images/lang-arrow.svg"
                    alt=""
                    className="block w-full h-full rotate-180"
                  />
                </div>
              </div>
            </div>

            {/* Step 02 */}
            <div className="flex flex-col items-center gap-[20px]">
              <div className="flex flex-col gap-[10px] items-center">
                <p className="font-bold text-[16px] leading-normal text-[#ff6a00]">
                  Step 02
                </p>
                <div className="relative w-[15px] h-[15px]">
                  <img
                    src="/images/lang-step-dot.svg"
                    alt=""
                    className="block w-full h-full"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-[20px] items-center">
                {/* Icon */}
                <div className="relative w-[100px] h-[101.33px]">
                  <img
                    src="/images/lang-step-02-icon.svg"
                    alt=""
                    className="block w-full h-full"
                  />
                </div>

                {/* Text */}
                <div className="flex flex-col gap-[5px] items-center text-center">
                  <p className="font-bold text-[16px] leading-normal text-[#ff6a00]">
                    상담신청
                  </p>
                  <div className="text-[13px] leading-[20px] text-[#1e1307]">
                    <p><span className="font-bold">내 아이 정보를 등록</span>하고</p>
                    <p>언어컨설팅 메뉴 선택</p>
                  </div>
                </div>
              </div>

              {/* Arrow down */}
              <div className="w-[15px] h-[15px]">
                <div className="w-full h-full">
                  <img
                    src="/images/lang-arrow.svg"
                    alt=""
                    className="block w-full h-full rotate-180"
                  />
                </div>
              </div>
            </div>

            {/* Step 03 */}
            <div className="flex flex-col items-center gap-[20px]">
              <div className="flex flex-col gap-[10px] items-center">
                <p className="font-bold text-[16px] leading-normal text-[#ff6a00]">
                  Step 03
                </p>
                <div className="relative w-[15px] h-[15px]">
                  <img
                    src="/images/lang-step-dot.svg"
                    alt=""
                    className="block w-full h-full"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-[20px] items-center">
                {/* Icon */}
                <div className="bg-[#fff2e1] w-[100px] h-[100px] rounded-[50px] flex items-center justify-center px-[22.67px] py-[21.33px]">
                  <div className="relative w-[54.67px] h-[57.28px]">
                    <img
                      src="/images/lang-step-03-icon.svg"
                      alt=""
                      className="block w-full h-full"
                    />
                  </div>
                </div>

                {/* Text */}
                <div className="flex flex-col gap-[5px] items-center text-center">
                  <p className="font-bold text-[16px] leading-normal text-[#ff6a00]">
                    날짜/시간 선택
                  </p>
                  <div className="text-[13px] leading-[20px] text-[#1e1307]">
                    <p>원하는 시간에</p>
                    <p className="font-bold">간편하게 예약</p>
                  </div>
                </div>
              </div>

              {/* Arrow down */}
              <div className="w-[15px] h-[15px]">
                <div className="w-full h-full">
                  <img
                    src="/images/lang-arrow.svg"
                    alt=""
                    className="block w-full h-full rotate-180"
                  />
                </div>
              </div>
            </div>

            {/* Step 04 */}
            <div className="flex flex-col items-center gap-[20px]">
              <div className="flex flex-col gap-[10px] items-center">
                <p className="font-bold text-[16px] leading-normal text-[#ff6a00]">
                  Step 04
                </p>
                <div className="relative w-[15px] h-[15px]">
                  <img
                    src="/images/lang-step-04-dot.svg"
                    alt=""
                    className="block w-full h-full"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-[20px] items-center">
                {/* Icon */}
                <div className="relative w-[100px] h-[100px]">
                  <img
                    src="/images/lang-step-04-icon.svg"
                    alt=""
                    className="block w-full h-full"
                  />
                </div>

                {/* Text */}
                <div className="flex flex-col gap-[5px] items-center text-center">
                  <p className="font-bold text-[16px] leading-normal text-[#ff6d2a]">
                    컨설팅 진행
                  </p>
                  <div className="text-[13px] leading-[20px] text-[#1e1307]">
                    <p>전문가와 <span className="font-bold">1:1</span></p>
                    <p><span className="font-bold">맞춤 언어 컨설팅</span> 시작</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative h-[326px] lg:h-[560px] overflow-hidden">
        {/* Mobile Background */}
        <div className="lg:hidden absolute inset-0">
          {/* Background Logo */}
          <div className="absolute left-1/2 -translate-x-1/2 top-[37px] w-[316.886px] h-[260.011px]">
            <img
              src="/images/lang-mo-cta-bg-logo.svg"
              alt=""
              className="block w-full h-full max-w-none"
            />
          </div>
          {/* Backdrop Blur Overlay */}
          <div
            className="absolute inset-0 bg-[rgba(254,114,13,0.8)]"
            style={{
              backdropFilter: 'blur(5px)',
              WebkitBackdropFilter: 'blur(5px)'
            }}
          />
        </div>

        {/* Desktop Background */}
        <div className="hidden lg:block absolute inset-0">
          {/* Background Logo */}
          <div className="absolute left-1/2 -translate-x-1/2 top-[78px] w-[1407.19px] h-[402.706px]">
            <img
              src="/images/lang-cta-bg-logo.svg"
              alt=""
              className="block w-full h-full max-w-none"
            />
          </div>
          {/* Backdrop Blur Overlay */}
          <div
            className="absolute inset-0 bg-[rgba(254,114,13,0.8)]"
            style={{
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)'
            }}
          />
        </div>

        {/* Content */}
        <div className="relative h-full flex flex-col items-center justify-center gap-[30px] lg:gap-[50px] z-10">
          {/* Mobile Content */}
          <div className="lg:hidden flex flex-col items-center gap-[10px] w-full">
            {/* Title Image */}
            <img
              src="/images/lang-mo-cta-title.svg"
              alt="전문가 1:1 상담, 바로 시작해보세요"
              className="w-[277px] h-[24px]"
            />
            {/* Price */}
            <p className="font-bold text-[30px] leading-normal text-white">
              ₩150,000
            </p>
            <p className="text-[14px] leading-normal text-white/80">
              언어컨설팅 이용 가격
            </p>
          </div>

          {/* Desktop Content */}
          <div className="hidden lg:flex flex-col gap-[33px] items-center w-full max-w-[1280px]">
            <img
              src="/images/lang-cta-title.svg"
              alt="우리 아이 언어발달 전문가와 함께하세요"
              className="h-auto"
            />
            <div className="flex flex-col gap-[5px] items-center text-center">
              <p className="font-bold text-[70px] leading-normal text-white">
                ₩150,000
              </p>
              <p className="text-[27px] leading-normal text-white/80">
                언어컨설팅 이용 가격
              </p>
            </div>
          </div>

          {/* Button */}
          {session ? (
            <Link
              href="/parent/therapists"
              className="bg-white rounded-[100px] h-[50px] lg:h-[80px] w-full max-w-[257px] lg:max-w-[400px] flex items-center justify-center px-[40px] py-[15px] lg:py-[30px] hover:bg-stone-100 transition-colors"
            >
              <p className="font-bold text-[16px] lg:text-[24px] leading-normal text-[#ff6a00] whitespace-nowrap">
                상담 신청하기
              </p>
            </Link>
          ) : (
            <Link
              href="/login"
              className="bg-white rounded-[100px] h-[50px] lg:h-[80px] w-full max-w-[257px] lg:max-w-[400px] flex items-center justify-center px-[40px] py-[15px] lg:py-[30px] hover:bg-stone-100 transition-colors"
            >
              <p className="font-bold text-[16px] lg:text-[24px] leading-normal text-[#ff6a00] text-center lg:whitespace-nowrap">
                로그인 하고 컨설팅 시작하기
              </p>
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
