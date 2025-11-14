import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function TherapistTermsPage() {
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
            아이포텐 전문가 이용약관
          </h1>
          <p className="text-sm text-stone-600 mb-2">
            (전문가회원용)
          </p>
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
                본 약관은 아이포텐(이하 "회사")의 "아이포텐" 서비스에 전문가회원으로 가입하여 부모회원에게 아동 발달 관련 언어 컨설팅·상담·치료 등(이하 "세션")을 제공하는 전문가회원의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            {/* Article 2 */}
            <section>
              <h2 className="text-xl md:text-2xl font-bold text-stone-900 mb-4">
                제2조 (전문가의 법적 지위)
              </h2>
              <div className="space-y-3 text-stone-700">
                <p>
                  <span className="font-medium">가.</span> 전문가회원은 회사의 직원, 근로자, 대리인이 아니며, 독립된 사업자(프리랜서)로서 자신의 판단과 책임 하에 서비스를 제공합니다.
                </p>
                <p>
                  <span className="font-medium">나.</span> 회사는 전문가회원에게 근로기준법상 급여, 4대보험, 퇴직금 등을 제공하지 않으며, 전문가는 스스로 소득신고 및 세금 납부 의무를 이행해야 합니다.
                </p>
                <p>
                  <span className="font-medium">다.</span> 회사는 전문가회원과 부모회원 간의 세션 계약을 중개할 뿐, 고용 또는 도급 관계에 있지 않습니다.
                </p>
              </div>
            </section>

            {/* Article 3 */}
            <section>
              <h2 className="text-xl md:text-2xl font-bold text-stone-900 mb-4">
                제3조 (전문가 등록 및 자격 검증)
              </h2>
              <div className="space-y-3 text-stone-700">
                <p>
                  <span className="font-medium">가.</span> 전문가회원으로 가입하기 위해서는 회사가 정한 절차에 따라 자격증, 학위증, 경력증명서 등 자격을 증명하는 서류를 제출해야 합니다.
                </p>
                <p>
                  <span className="font-medium">나.</span> 전문가회원은 제출한 모든 정보가 진실되고 정확함을 보증해야 합니다.
                </p>
                <p>
                  <span className="font-medium">다.</span> 회사는 제출된 서류를 성실하게 확인하는 검증 절차를 이행합니다.
                </p>
                <p>
                  <span className="font-medium">라.</span> 허위 또는 위조 사실이 확인될 경우, 회사는 즉시 자격을 박탈하고 정산을 보류할 수 있으며, 이로 인한 모든 법적 책임은 전문가회원에게 있습니다.
                </p>
              </div>
            </section>

            {/* Article 4 */}
            <section>
              <h2 className="text-xl md:text-2xl font-bold text-stone-900 mb-4">
                제4조 (전문가회원의 의무)
              </h2>
              <div className="space-y-3 text-stone-700">
                <p>
                  <span className="font-medium">가. [성실 의무]</span> 세션 예약 및 일정을 성실히 준수해야 하며, 무단 취소, 지각, 연락 두절 등으로 부모회원에게 피해를 주어서는 안 됩니다.
                </p>
                <p>
                  <span className="font-medium">나. [비밀유지 의무]</span> 세션 중 알게 된 부모회원 및 아동의 모든 개인정보(특히 건강, 발달 관련 민감정보, 주소)를 회사의 동의 없이 외부에 유출하거나 사적으로 이용해서는 안 되며, 이는 자격 탈퇴 후에도 유효합니다.
                </p>
                <p>
                  <span className="font-medium">다. [안전 의무]</span> 세션 진행 중 아동의 안전을 최우선으로 확보해야 하며, 아동학대 등 비윤리적, 불법적 행위를 해서는 안 됩니다.
                </p>
              </div>
            </section>

            {/* Article 5 */}
            <section>
              <h2 className="text-xl md:text-2xl font-bold text-stone-900 mb-4">
                제5조 (직거래 금지)
              </h2>
              <div className="space-y-3 text-stone-700">
                <p>
                  <span className="font-medium">가.</span> 전문가회원은 서비스를 통해 알게 된 부모회원을 대상으로 플랫폼 외부에서 직접 거래(직거래)를 유도하거나 제안, 수락해서는 안 됩니다.
                </p>
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
                  <p className="font-medium text-amber-900">
                    <span className="font-bold">나.</span> 직거래 행위가 적발될 경우, 회사는 즉시 해당 전문가의 자격을 영구 정지시킬 수 있습니다. 또한, 직거래는 회사의 영업권을 침해하는 중대한 계약 위반행위이므로, 전문가는 회사에 위약금(손해배상액의 예정)으로 <span className="text-red-600 font-bold">금 일백만원(1,000,000원)</span>을 배상해야 합니다. 이 위약금은 전문가가 직거래를 통해 얻은 이익 또는 세션 횟수와 관계없이 청구됩니다.
                  </p>
                </div>
              </div>
            </section>

            {/* Article 6 */}
            <section>
              <h2 className="text-xl md:text-2xl font-bold text-stone-900 mb-4">
                제6조 (수수료 및 정산)
              </h2>
              <div className="space-y-3 text-stone-700">
                <p>
                  <span className="font-medium">가.</span> 회사는 전문가회원과 부모회원 간의 매칭 중개 및 결제 시스템 제공의 대가로 "결제 및 환불 정책"에서 정한 중개 수수료를 부과합니다.
                </p>
                <p>
                  <span className="font-medium">나.</span> 회사는 부모회원이 결제한 '서비스 이용료'에서 중개 수수료를 공제한 후, 세션이 정상적으로 완료되었음을 전문가의 상담일지 등록을 통해 확인한 뒤, 본 조 마항에서 정한 주기에 따라 전문가회원에게 정산합니다.
                </p>
                <p>
                  <span className="font-medium">다.</span> 부모회원의 정당한 환불 요청이 발생한 경우, 해당 금액은 정산에서 제외되거나 이미 정산된 경우 차후 정산금에서 상계됩니다.
                </p>
                <p>
                  <span className="font-medium">라.</span> 회사는 전문가회원의 세금 신고(종합소득세 등)를 대행하지 않으며, 전문가는 관련 세법에 따라 세무 의무를 직접 이행해야 합니다.
                </p>
                <p>
                  <span className="font-medium">마.</span> 회사는 세션 완료(상담일지 등록)가 확인된 날로부터 14영업일 이내에 전문가가 지정한 계좌로 정산 금액을 지급함을 원칙으로 합니다.
                </p>
              </div>
            </section>

            {/* Article 7 */}
            <section>
              <h2 className="text-xl md:text-2xl font-bold text-stone-900 mb-4">
                제7조 (전문가 사유 취소 및 페널티)
              </h2>
              <div className="space-y-3 text-stone-700">
                <p>
                  <span className="font-medium">가.</span> 전문가회원의 귀책사유(세션 시작 3시간 이내의 일방적 취소, 노쇼, 연락 두절 등)로 인해 세션이 취소되는 경우, 회사는 부모회원에게 이용료를 전액 환불합니다.
                </p>
                <div className="bg-red-50 border-l-4 border-red-500 p-4">
                  <p className="text-red-900">
                    <span className="font-bold">나.</span> 회사는 제1항의 경우, 부모회원에 대한 보상(쿠폰 지급 등) 및 플랫폼 신뢰도 훼손에 대한 페널티로서 전문가회원에게 위약금(손해배상액의 예정)으로 <span className="font-bold">금 삼만원(30,000원)</span>을 부과합니다.
                  </p>
                </div>
                <p>
                  <span className="font-medium">다.</span> 본 위약금은 전문가의 차후 정산금액에서 우선 공제합니다.
                </p>
                <p>
                  <span className="font-medium">라.</span> 정산할 금액이 없는 경우, 계정은 즉시 정지되며 페널티 납부 전까지 플랫폼 이용 및 신규 매칭이 제한됩니다.
                </p>
                <p>
                  <span className="font-medium">마.</span> 반복적인 취소 또는 페널티 미납 시, 회사는 사전 통보 후 전문가 자격을 영구 해지(탈퇴)할 수 있습니다.
                </p>
              </div>
            </section>

            {/* Article 8 */}
            <section>
              <h2 className="text-xl md:text-2xl font-bold text-stone-900 mb-4">
                제8조 (게시물의 관리)
              </h2>
              <p className="text-stone-700">
                전문가회원은 자신이 작성하는 게시물(프로필, 후기 답변 등)이 타인의 명예를 훼손하거나 관련 법령에 위배되지 않도록 해야 하며, 회사는 서비스 이용약관 제10조에 따라 문제가 되는 게시물을 제재할 수 있습니다.
              </p>
            </section>

            {/* Article 9 */}
            <section>
              <h2 className="text-xl md:text-2xl font-bold text-stone-900 mb-4">
                제9조 (면책조항)
              </h2>
              <div className="space-y-3 text-stone-700">
                <p>
                  <span className="font-medium">가.</span> 회사는 중개자로서 전문가회원의 소득을 보장하지 않으며, 매칭 건수에 대해 보증하지 않습니다.
                </p>
                <p>
                  <span className="font-medium">나.</span> 전문가회원은 부모회원과의 세션 중 발생한 모든 분쟁, 안전사고, 기물 파손 등에 대해 전적인 책임을 부담합니다.
                </p>
                <p>
                  <span className="font-medium">다.</span> 전문가회원은 자신의 세션 제공 행위가 관련 법령(의료법, 자격기본법 등)을 위반하지 않도록 스스로 확인하고 준수할 책임이 있습니다.
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
