import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function TermsOfServicePage() {
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
            아이포텐 서비스 이용약관
          </h1>
          <p className="text-sm text-stone-600 mb-8">
            시행일: 2025년 11월 4일
          </p>

          {/* Chapter 1 */}
          <section className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-stone-900 mb-6">
              제1장 총칙
            </h2>

            <div className="space-y-6">
              {/* Article 1 */}
              <div>
                <h3 className="text-lg font-bold text-stone-900 mb-3">
                  제1조 (목적)
                </h3>
                <p className="text-stone-700 leading-relaxed">
                  본 약관은 아이포텐(대표 김은홍, 사업자번호 262-08-03275, 이하 "회사")이 운영하는 AI 기반 아동발달 통합 플랫폼 "아이포텐"(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
                </p>
              </div>

              {/* Article 2 */}
              <div>
                <h3 className="text-lg font-bold text-stone-900 mb-3">
                  제2조 (용어의 정의)
                </h3>
                <p className="text-stone-700 mb-3">
                  본 약관에서 사용하는 용어의 정의는 다음과 같습니다.
                </p>
                <div className="space-y-3 text-stone-700">
                  <div>
                    <p className="font-medium mb-2">가. "서비스"란 회사가 제공하는 다음 각 호의 기능을 포함하는 플랫폼을 말합니다.</p>
                    <ul className="list-none ml-6 space-y-1">
                      <li>1. AI 자가 발달체크 및 무료 발달리포트 생성 서비스</li>
                      <li>2. 맞춤형 놀이영상 등 무료 홈케어 콘텐츠 제공 서비스</li>
                      <li>3. 전문가가 아동의 '언어' 발달 상태를 관찰/분석하는 '언어 컨설팅' 중개 서비스</li>
                      <li>4. 아동 발달 분야 전문가(언어·놀이·감각통합 등)를 연결하는 '전문가 매칭 및 예약/결제' 중개 서비스</li>
                    </ul>
                  </div>
                  <p>
                    <span className="font-medium">나.</span> "부모회원(보호자)"이란 본 약관에 동의하고 자녀의 발달 체크 및 전문가 매칭 서비스를 이용하는 회원을 말합니다.
                  </p>
                  <p>
                    <span className="font-medium">다.</span> "전문가회원"이란 자신의 전문역량을 등록하고 회사와의 별도 약관에 따라 부모회원에게 컨설팅·상담·치료 등(이하 "세션")을 제공하는 회원을 말합니다.
                  </p>
                  <p>
                    <span className="font-medium">라.</span> "AI 발달리포트"란 발달체크 결과를 기반으로 생성되는 참고용 분석 정보이며, 의료행위 또는 전문 진단을 대체하지 않습니다.
                  </p>
                  <p>
                    <span className="font-medium">마.</span> "게시물"이란 회원이 서비스 내에 업로드한 후기, 피드백, 질문, 이미지 등 모든 정보를 말합니다.
                  </p>
                </div>
              </div>

              {/* Article 3 */}
              <div>
                <h3 className="text-lg font-bold text-stone-900 mb-3">
                  제3조 (약관의 명시 및 개정)
                </h3>
                <div className="space-y-3 text-stone-700">
                  <p>
                    <span className="font-medium">가.</span> 회사는 본 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 초기화면에 게시합니다.
                  </p>
                  <p>
                    <span className="font-medium">나.</span> 회사는 「약관의 규제에 관한 법률」, 「전자상거래 등에서의 소비자보호에 관한 법률」 등 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.
                  </p>
                  <p>
                    <span className="font-medium">다.</span> 약관 개정 시, 적용일자 7일 전(회원에게 불리한 경우 30일 전)에 공지하며, 회원이 명시적인 거부 의사 없이 서비스를 계속 이용할 경우 개정약관에 동의한 것으로 봅니다.
                  </p>
                </div>
              </div>

              {/* Article 4 */}
              <div>
                <h3 className="text-lg font-bold text-stone-900 mb-3">
                  제4조 (회사의 법적 지위 - 통신판매중개자)
                </h3>
                <div className="space-y-3 text-stone-700">
                  <p>
                    <span className="font-medium">가.</span> 회사는 통신판매중개자로서, 부모회원과 전문가회원 간의 자유로운 서비스 계약(세션)을 위한 시스템을 운영 및 관리, 제공할 뿐입니다.
                  </p>
                  <p>
                    <span className="font-medium">나.</span> 회사는 부모회원 또는 전문가회원을 대리하지 않으며, 회원 사이에 성립된 서비스(컨설팅, 상담, 치료 등) 및 거래와 관련된 일체의 책임은 해당 회원이 직접 부담합니다.
                  </p>
                  <p>
                    <span className="font-medium">다.</span> 회사는 자신이 통신판매의 당사자가 아니며 전문가회원이 제공하는 서비스의 내용과 품질, 환불에 대한 책임은 전문가회원에게 있다는 사실을 본 약관 및 서비스 내 결제 화면 등 주요 페이지에 명확히 고지합니다.
                  </p>
                </div>
              </div>

              {/* Article 5 */}
              <div>
                <h3 className="text-lg font-bold text-stone-900 mb-3">
                  제5조 (서비스의 성격 및 의료 면책)
                </h3>
                <div className="space-y-3 text-stone-700">
                  <p>
                    <span className="font-medium">가.</span> 회사가 제공하는 발달체크 및 AI 발달리포트는 의료행위 또는 전문 진단이 아닙니다. 이는 부모가 아동의 발달 상태를 이해하고 조기 대응할 수 있도록 돕기 위한 정보 제공용 참고 자료입니다.
                  </p>
                  <p>
                    <span className="font-medium">나.</span> 회원은 AI 발달리포트의 결과만으로 의학적 판단을 내려서는 안 되며, 아동의 발달에 우려가 있는 경우 반드시 전문 의료기관(소아과, 발달센터 등)의 진단을 받아야 합니다.
                  </p>
                  <p>
                    <span className="font-medium">다.</span> 회사는 이용자가 발달체크 결과 또는 AI 발달리포트를 자의적으로 해석하거나 오용하여 발생하는 어떠한 결과에 대해서도 책임을 지지 않습니다.
                  </p>
                </div>
              </div>

              {/* Article 6 */}
              <div>
                <h3 className="text-lg font-bold text-stone-900 mb-3">
                  제6조 (회원의 의무)
                </h3>
                <div className="space-y-3 text-stone-700">
                  <p>
                    <span className="font-medium">가.</span> 회원은 회원가입 시 실명과 정확한 정보를 기재해야 하며, 허위정보 기재로 인한 불이익은 회원 본인에게 있습니다.
                  </p>
                  <p>
                    <span className="font-medium">나.</span> 부모회원은 자녀의 개인정보(이름, 생년월, 주소 등)를 제공할 때 법정대리인으로서 정당한 권한을 보유해야 합니다.
                  </p>
                  <p>
                    <span className="font-medium">다.</span> 회원은 서비스 내 전문가회원에게 플랫폼을 통하지 않는 직접 거래(직거래)를 제안하거나 유도해서는 안 됩니다. 직거래 적발 시 제13조에 따라 서비스 이용이 영구적으로 제한될 수 있습니다.
                  </p>
                </div>
              </div>

              {/* Article 7 */}
              <div>
                <h3 className="text-lg font-bold text-stone-900 mb-3">
                  제7조 (결제, 취소 및 환불)
                </h3>
                <p className="text-stone-700">
                  유료 서비스(전문가 매칭, 언어 컨설팅)의 이용료 결제, 취소, 위약금 및 환불에 관한 모든 사항은 회사가 별도로 정한 <Link href="/payment-policy" className="text-[#FF6A00] hover:underline font-medium">「결제 및 환불 정책」</Link>에 따릅니다.
                </p>
              </div>

              {/* Article 8 */}
              <div>
                <h3 className="text-lg font-bold text-stone-900 mb-3">
                  제8조 (저작권 및 콘텐츠 정책)
                </h3>
                <div className="space-y-3 text-stone-700">
                  <p>
                    <span className="font-medium">가.</span> 회사가 작성하거나 제작한 모든 콘텐츠(문항, AI 발달리포트, 영상, 디자인, 데이터 등)의 저작권은 무료 제공 여부와 관계없이 회사에 귀속됩니다.
                  </p>
                  <p>
                    <span className="font-medium">나.</span> 회원이 업로드한 '사용자 콘텐츠'(후기, 게시물 등)의 저작권은 해당 회원에게 귀속됩니다.
                  </p>
                  <p>
                    <span className="font-medium">다.</span> 단, 회원은 '사용자 콘텐츠'를 업로드함으로써, 회사가 서비스 운영, 홍보, 통계 분석, AI 학습(비식별화) 목적으로 해당 콘텐츠를 비독점적·무상으로 사용할 수 있도록 허락(License)한 것으로 봅니다.
                  </p>
                  <p>
                    <span className="font-medium">라.</span> 회원은 회사의 사전 동의 없이 서비스 내 콘텐츠를 무단 복제, 배포, 2차 가공할 수 없습니다.
                  </p>
                </div>
              </div>

              {/* Article 9 */}
              <div>
                <h3 className="text-lg font-bold text-stone-900 mb-3">
                  제9조 (면책조항)
                </h3>
                <div className="space-y-3 text-stone-700">
                  <p>
                    <span className="font-medium">가.</span> 회사는 전문가회원이 제출한 자격·학력·경력 증빙서류를 성실하게 확인하는 검증 절차를 이행합니다. 다만, 이는 회사가 해당 전문가의 전문성을 '인증'하거나 '보증'하는 것을 의미하지는 않습니다.
                  </p>
                  <p>
                    <span className="font-medium">나.</span> 회사는 검증 과정에서 전문가가 고의로 제출한 위조 또는 허위 자료로 인해 발생한 문제에 대해서는 직접적인 책임을 지지 않으며, 이에 대한 책임은 전문가 본인에게 있습니다.
                  </p>
                  <p>
                    <span className="font-medium">다.</span> 부모회원은 전문가의 프로필과 후기를 참고하여 스스로의 판단과 책임하에 전문가를 최종 선택해야 합니다.
                  </p>
                  <p>
                    <span className="font-medium">라.</span> 회사는 제4조에서 고지한 바와 같이 통신판매중개자로서, 전문가회원이 제공하는 서비스(컨설팅, 상담, 치료 등)의 내용, 품질, 효과, 안전성 및 이로 인한 결과에 대해 어떠한 책임도 지지 않습니다.
                  </p>
                  <p>
                    <span className="font-medium">마.</span> 전문가회원과의 세션 중 발생하는 모든 사고, 분쟁, 손해(안전사고, 기물파손 등)에 대한 법적 책임은 해당 전문가회원에게 있습니다.
                  </p>
                  <p>
                    <span className="font-medium">바.</span> 회사는 천재지변, 서버 장애 등 불가항력으로 서비스를 제공할 수 없는 경우 책임이 면제됩니다.
                  </p>
                </div>
              </div>

              {/* Article 10 */}
              <div>
                <h3 className="text-lg font-bold text-stone-900 mb-3">
                  제10조 (게시물의 관리)
                </h3>
                <div className="space-y-3 text-stone-700">
                  <p className="font-medium">가. 회사는 회원이 작성한 게시물이 다음 각 호에 해당하는 경우, 사전 통지 없이 해당 게시물을 삭제하거나 임시조치(블라인드)할 수 있습니다.</p>
                  <ul className="list-none ml-6 space-y-1">
                    <li>1. 타인(전문가 또는 회원)의 명예를 훼손하거나 비방하는 내용</li>
                    <li>2. 객관적 사실에 근거하지 않은 허위 내용으로 서비스 운영을 방해하는 경우</li>
                    <li>3. 공공질서 및 미풍양속에 위반되는 내용</li>
                    <li>4. 회사 또는 제3자의 저작권 등 기타 권리를 침해하는 내용</li>
                    <li>5. 관련 법령에 위배되거나 범죄적 행위에 결부된다고 인정되는 경우</li>
                  </ul>
                  <p>
                    <span className="font-medium">나.</span> 회원의 게시물로 인해 법률상 이익이 침해된 자는 관련 법령이 정한 절차에 따라 회사에 해당 게시물의 게시 중단 및 삭제 등을 요청할 수 있으며, 회사는 이에 따라 조치를 취합니다.
                  </p>
                </div>
              </div>

              {/* Article 11 */}
              <div>
                <h3 className="text-lg font-bold text-stone-900 mb-3">
                  제11조 (포인트 및 쿠폰)
                </h3>
                <div className="space-y-3 text-stone-700">
                  <p>
                    <span className="font-medium">가.</span> 회사는 서비스 운영 정책에 따라 회원에게 일정한 포인트 또는 쿠폰을 마케팅, 보상 등의 목적으로 무상 지급할 수 있습니다.
                  </p>
                  <p>
                    <span className="font-medium">나.</span> 회사가 무상으로 지급한 포인트 및 쿠폰은 현금으로 환불되거나 타인에게 양도될 수 없습니다.
                  </p>
                  <p>
                    <span className="font-medium">다.</span> 포인트 및 쿠폰의 사용 방법, 유효기간, 소멸 조건 등은 회사가 별도로 정하여 서비스 화면에 고지하며, 유효기간 경과 시 자동 소멸됩니다.
                  </p>
                  <p>
                    <span className="font-medium">라.</span> 회원이 이용계약을 해지(탈퇴)할 경우, 사용하지 않은 무상 포인트 및 쿠폰은 즉시 소멸되며 복구되지 않습니다.
                  </p>
                </div>
              </div>

              {/* Article 12 */}
              <div>
                <h3 className="text-lg font-bold text-stone-900 mb-3">
                  제12조 (이용 제한 및 계약 해지)
                </h3>
                <div className="space-y-3 text-stone-700">
                  <p>
                    <span className="font-medium">가.</span> 회원은 언제든지 서비스 내 '회원탈퇴' 기능을 통해 이용계약을 해지할 수 있습니다.
                  </p>
                  <p>
                    <span className="font-medium">나.</span> 회원이 본 약관 제6조(직거래) 또는 제10조(게시물)를 포함하여 중대한 의무를 위반한 경우, 회사는 경고, 일시정지, 영구 이용정지(계약 해지)를 할 수 있습니다.
                  </p>
                </div>
              </div>

              {/* Article 13 */}
              <div>
                <h3 className="text-lg font-bold text-stone-900 mb-3">
                  제13조 (준거법 및 재판관할)
                </h3>
                <p className="text-stone-700">
                  본 약관의 해석 및 분쟁은 대한민국 법령에 따르며, 분쟁 발생 시 민사소송법상의 관할법원에 소송을 제기합니다.
                </p>
              </div>
            </div>
          </section>
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
