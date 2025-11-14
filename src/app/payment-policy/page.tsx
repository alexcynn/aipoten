import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function PaymentPolicyPage() {
  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Header with Logo */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="inline-block">
            <Image
              src="/images/footer-logo.png"
              alt="AIPOTEN 아이포텐"
              width={150}
              height={24}
              className="h-6 w-auto"
            />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-10">
          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-stone-900 mb-2">
            아이포텐 결제 및 환불 정책
          </h1>
          <p className="text-sm text-stone-600 mb-8">
            시행일: 2025년 11월 4일
          </p>

          <div className="space-y-8">
            {/* Article 1 */}
            <section>
              <h2 className="text-xl md:text-2xl font-bold text-stone-900 mb-4">
                제1조 (목적)
              </h2>
              <p className="text-stone-700 leading-relaxed">
                본 정책은 아이포텐(이하 "회사")의 유료 서비스(전문가 매칭, 언어 컨설팅) 이용료 결제, 예약 취소, 위약금 및 환불에 관한 기준을 정함을 목적으로 합니다. 본 정책은 '서비스 이용약관' 및 '전문가 이용약관'의 일부를 구성합니다.
              </p>
            </section>

            {/* Article 2 */}
            <section>
              <h2 className="text-xl md:text-2xl font-bold text-stone-900 mb-4">
                제2조 (결제 및 중개자 고지)
              </h2>
              <div className="space-y-3 text-stone-700">
                <p>
                  <span className="font-medium">가.</span> 부모회원(이하 "이용자")은 전문가 매칭, 언어 컨설팅 등 유료서비스 이용 시 회사가 정한 결제수단(신용카드, 간편결제 등)을 통해 '서비스 이용료'를 결제해야 합니다.
                </p>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                  <p className="text-blue-900">
                    <span className="font-bold">나. [중개자 고지]</span> 아이포텐은 통신판매중개자로서 결제 시스템을 제공하며, 서비스 제공(세션)의 당사자가 아닙니다. 서비스의 환불에 대한 최종 책임은 전문가에게 있습니다.
                  </p>
                </div>
              </div>
            </section>

            {/* Article 3 */}
            <section>
              <h2 className="text-xl md:text-2xl font-bold text-stone-900 mb-4">
                제3조 (무료 서비스)
              </h2>
              <p className="text-stone-700">
                회사가 무료로 제공하는 'AI 발달리포트' 및 '홈케어 콘텐츠'는 결제가 발생하지 않으므로 환불 대상에 해당하지 않습니다.
              </p>
            </section>

            {/* Article 4 */}
            <section>
              <h2 className="text-xl md:text-2xl font-bold text-stone-900 mb-4">
                제4조 (다회권의 유효기간)
              </h2>
              <div className="space-y-3 text-stone-700">
                <p>
                  <span className="font-medium">가.</span> 부모회원이 2회 이상의 세션을 일괄 결제한 경우(이하 "다회권"), 해당 세션 이용 권한은 최초 결제일로부터 1년(365일)간 유효합니다.
                </p>
                <p>
                  <span className="font-medium">나.</span> 부모회원은 반드시 유효기간 내에 구매한 세션을 모두 사용해야 하며, 유효기간 연장은 원칙적으로 불가합니다.
                </p>
                <p>
                  <span className="font-medium">다.</span> 유효기간이 만료된 후 미사용한 세션 이용권은 자동으로 소멸되며, 이에 대해 회사는 별도의 환불이나 보상을 하지 않습니다.
                </p>
                <p>
                  <span className="font-medium">라.</span> 회사는 유효기간 만료 30일 전, 7일 전에 회원에게 알림(이메일, 앱 푸시 등)을 통해 유효기간 만료 사실을 고지하기 위해 노력합니다.
                </p>
              </div>
            </section>

            {/* Article 5 */}
            <section>
              <h2 className="text-xl md:text-2xl font-bold text-stone-900 mb-4">
                제5조 (다회권의 중도 환불)
              </h2>
              <div className="space-y-3 text-stone-700">
                <p>
                  <span className="font-medium">가.</span> 부모회원이 유효기간(제4조) 만료 이전에 다회권의 잔여 세션에 대한 환불을 요청하는 경우, 다음 기준에 따라 환불 금액을 산정합니다.
                </p>
                <div className="bg-stone-50 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="font-medium mb-2">1. 결제일로부터 5개월(150일) 이내 요청 시:</p>
                    <p className="ml-4 font-mono text-sm">환불금액 = 총 결제금액 - (이용 횟수 X 해당 서비스의 1회 정상 단가)</p>
                    <p className="ml-4 text-sm text-stone-600">(전액 환불, 위약금 없음)</p>
                  </div>
                  <div>
                    <p className="font-medium mb-2">2. 결제일로부터 5개월(150일) 경과 후 ~ 1년(365일) 이내 요청 시:</p>
                    <p className="ml-4 font-mono text-sm">환불금액 = [총 결제금액 - (이용 횟수 X 해당 서비스의 1회 정상 단가)]의 90%</p>
                    <p className="ml-4 text-sm text-stone-600">(카드 망 취소 기한 경과로 인한 '수동 환불 처리 수수료(위약금)' 10% 공제)</p>
                  </div>
                </div>
                <p>
                  <span className="font-medium">나.</span> '1회 정상 단가'란 할인이 적용되지 않은 1회 세션의 표준 가격을 의미합니다.
                </p>
                <p>
                  <span className="font-medium">다.</span> 만약 (이용 횟수 X 1회 정상 단가)의 합계가 총 결제금액을 초과하는 경우에는 환불하지 않습니다.
                </p>
              </div>
            </section>

            {/* Article 6 */}
            <section>
              <h2 className="text-xl md:text-2xl font-bold text-stone-900 mb-4">
                제6조 (전문가 매칭/컨설팅 환불 - 부모회원 귀책)
              </h2>
              <p className="text-stone-700 mb-4">
                이용자(부모회원)의 사정으로 확정된 세션을 취소하는 경우, 전문가의 기회비용을 고려하여 다음과 같이 위약금이 발생합니다.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-stone-300 text-sm">
                  <thead className="bg-stone-50">
                    <tr>
                      <th className="border border-stone-300 px-4 py-3 text-left font-semibold">취소 시점</th>
                      <th className="border border-stone-300 px-4 py-3 text-left font-semibold">환불 규정</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-stone-300 px-4 py-3">세션 시작 48시간 이전</td>
                      <td className="border border-stone-300 px-4 py-3">결제금액 <span className="font-bold text-green-600">100% 환불</span> (위약금 0%)</td>
                    </tr>
                    <tr className="bg-stone-50">
                      <td className="border border-stone-300 px-4 py-3">세션 시작 48시간 이내 ~ 24시간 전</td>
                      <td className="border border-stone-300 px-4 py-3">결제금액의 <span className="font-bold">70% 환불</span> (위약금 30%)</td>
                    </tr>
                    <tr>
                      <td className="border border-stone-300 px-4 py-3">세션 시작 24시간 이내 ~ 3시간 전</td>
                      <td className="border border-stone-300 px-4 py-3">결제금액의 <span className="font-bold">50% 환불</span> (위약금 50%)</td>
                    </tr>
                    <tr className="bg-stone-50">
                      <td className="border border-stone-300 px-4 py-3">세션 시작 3시간 이내 또는 노쇼(No-Show)</td>
                      <td className="border border-stone-300 px-4 py-3"><span className="font-bold text-red-600">환불 불가</span> (위약금 100%)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-stone-600 mt-2">
                (참고: 위약금은 전문가의 시간 보전을 위해 사용됩니다.)
              </p>
            </section>

            {/* Article 7 */}
            <section>
              <h2 className="text-xl md:text-2xl font-bold text-stone-900 mb-4">
                제7조 (전문가 매칭/컨설팅 환불 - 전문가 귀책)
              </h2>
              <div className="space-y-3 text-stone-700">
                <p>
                  <span className="font-medium">가.</span> 전문가의 사정(세션 시작 3시간 이전 통보)으로 세션이 취소되는 경우, 이용자에게 결제금액 100% 전액 환불 처리됩니다.
                </p>
                <div className="bg-green-50 border-l-4 border-green-500 p-4">
                  <p className="text-green-900">
                    <span className="font-bold">나.</span> 전문가의 귀책사유(세션 시작 3시간 이내의 일방적 취소, 노쇼, 연락 두절 등)로 세션이 취소된 경우, 이용자에게 100% 전액 환불 및 플랫폼 신뢰도 하락 보상을 위한 <span className="font-bold">[5,000원] 아이포텐 보상 쿠폰</span>을 지급합니다.
                  </p>
                </div>
                <p>
                  <span className="font-medium">다.</span> 회사는 상기 사유 발생 시 '전문가 이용약관'에 따라 해당 전문가에게 페널티를 부과합니다.
                </p>
              </div>
            </section>

            {/* Article 8 */}
            <section>
              <h2 className="text-xl md:text-2xl font-bold text-stone-900 mb-4">
                제8조 (환불 절차)
              </h2>
              <div className="space-y-3 text-stone-700">
                <p>
                  <span className="font-medium">가.</span> 환불 요청은 서비스 내 "마이페이지 &gt; 결제내역"을 통해 접수해야 합니다.
                </p>
                <p>
                  <span className="font-medium">나.</span> 회사는 환불 요청 접수 후 3영업일 이내에 결제 취소 또는 환불을 처리합니다.
                </p>
                <p>
                  <span className="font-medium">다.</span> 환불은 결제한 수단과 동일한 방식으로 처리됨을 원칙으로 하나, 불가능할 경우 이용자 명의의 계좌로 환불합니다.
                </p>
              </div>
            </section>
          </div>
        </div>

        {/* Back to Home Button */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-block bg-[#FF6A00] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#E55F00] transition-colors"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#F9F9F9] py-8 md:py-12 mt-12">
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

          <div className="text-[10px] sm:text-xs text-[#999999]">
            <p>&copy; AIPOTEN. All rights reserved</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
