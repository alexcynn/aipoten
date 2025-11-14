import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function PrivacyPolicyPage() {
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
            아이포텐 개인정보 처리방침
          </h1>
          <p className="text-sm text-stone-600 mb-8">
            시행일자: 2025년 11월 4일
          </p>

          {/* Introduction */}
          <div className="prose max-w-none mb-8">
            <p className="text-stone-700 leading-relaxed">
              아이포텐(이하 "회사")은 「개인정보 보호법」 및 관련 법령에 따라 이용자의 개인정보와 아동 관련 민감정보를 보호하고, 정보주체의 권익을 보장하기 위하여 다음과 같이 개인정보 처리방침을 수립·공개합니다.
            </p>
          </div>

          {/* Article 1 */}
          <section className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-stone-900 mb-4">
              제1조 (개인정보의 수집 항목 및 이용 목적)
            </h2>
            <p className="text-stone-700 mb-4">
              회사는 서비스 제공을 위해 다음의 개인정보를 수집 및 이용합니다.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-stone-300 text-sm">
                <thead className="bg-stone-50">
                  <tr>
                    <th className="border border-stone-300 px-4 py-3 text-left font-semibold">구분</th>
                    <th className="border border-stone-300 px-4 py-3 text-left font-semibold">수집 항목</th>
                    <th className="border border-stone-300 px-4 py-3 text-left font-semibold">이용 목적</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-stone-300 px-4 py-3 font-medium">공통</td>
                    <td className="border border-stone-300 px-4 py-3">이름, 휴대폰번호, 이메일, 비밀번호</td>
                    <td className="border border-stone-300 px-4 py-3">회원 식별, 본인확인, 고지사항 전달, 민원 처리</td>
                  </tr>
                  <tr className="bg-stone-50">
                    <td className="border border-stone-300 px-4 py-3 font-medium">부모회원</td>
                    <td className="border border-stone-300 px-4 py-3">
                      <strong className="text-red-600">[민감정보]</strong> 자녀 이름, 생년월, 성별, 발달체크 응답, AI 발달리포트 결과, 부모 작성 서술형 내용 (건강, 발달 우려 사항 등)<br />
                      <span className="mt-1 block">주소 (방문 서비스 이용 시)</span>
                    </td>
                    <td className="border border-stone-300 px-4 py-3">(무료) AI 발달리포트 생성, (무료) 맞춤형 콘텐츠 추천, 전문가 매칭 중개, 방문 세션 진행</td>
                  </tr>
                  <tr>
                    <td className="border border-stone-300 px-4 py-3 font-medium">전문가회원</td>
                    <td className="border border-stone-300 px-4 py-3">자격/학력/경력 증명서, 프로필사진, 활동지역, 정산용 계좌정보</td>
                    <td className="border border-stone-300 px-4 py-3">전문가 자격 검증, 프로필 등록, 매칭, 서비스 수수료 정산</td>
                  </tr>
                  <tr className="bg-stone-50">
                    <td className="border border-stone-300 px-4 py-3 font-medium">결제 시</td>
                    <td className="border border-stone-300 px-4 py-3">신용카드 정보 등 결제수단 정보, 거래기록</td>
                    <td className="border border-stone-300 px-4 py-3">유료서비스 결제 및 환불</td>
                  </tr>
                  <tr>
                    <td className="border border-stone-300 px-4 py-3 font-medium">자동수집</td>
                    <td className="border border-stone-300 px-4 py-3">서비스 이용기록, IP주소, 쿠키, 기기정보</td>
                    <td className="border border-stone-300 px-4 py-3">부정이용 방지, 서비스 품질 개선</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Article 2 */}
          <section className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-stone-900 mb-4">
              제2조 (민감정보의 처리 및 제3자 제공)
            </h2>
            <div className="space-y-3 text-stone-700">
              <p>
                <span className="font-medium">가.</span> 회사는 「개인정보 보호법」 제23조에 따라, 아동의 건강 및 발달 관련 정보(이하 "민감정보")를 수집할 시, 반드시 부모회원(법정대리인)의 명시적인 별도 동의를 받습니다.
              </p>
              <p>
                <span className="font-medium">나.</span> 수집된 민감정보는 AI 발달리포트 생성 및 매칭 서비스 제공 목적으로만 이용됩니다.
              </p>
              <p>
                <span className="font-medium">다.</span> 회사는 부모회원이 직접 선택하여 매칭을 신청한 전문가회원에 한해서만, 세션 준비에 필요한 최소한의 민감정보(발달 우려 사항 등)와 부모회원의 주소(방문 서비스 시)를 제공합니다.
              </p>
              <p>
                <span className="font-medium">라.</span> 정보를 제공받는 전문가회원은 비밀유지 의무를 부담하며, 해당 정보를 상담 목적 외에 사용, 저장, 재배포할 수 없습니다.
              </p>
            </div>
          </section>

          {/* Article 3 */}
          <section className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-stone-900 mb-4">
              제3조 (개인정보의 보유 및 파기)
            </h2>
            <div className="space-y-4 text-stone-700">
              <p>
                <span className="font-medium">가.</span> 회사는 원칙적으로 회원 탈퇴 또는 정보주체의 개인정보 파기 요청 시 해당 개인정보를 지체 없이 파기합니다.
              </p>
              <div>
                <p className="mb-2">
                  <span className="font-medium">나.</span> 단, 다음의 정보는 「전자상거래 등에서의 소비자보호에 관한 법률」 등 관계 법령의 규정에 따라 일정 기간 보존합니다.
                </p>
                <ul className="list-none ml-6 space-y-1">
                  <li>1. 계약 또는 청약철회 등에 관한 기록: 5년</li>
                  <li>2. 대금결제 및 재화 등의 공급에 관한 기록: 5년</li>
                  <li>3. 소비자의 불만 또는 분쟁처리에 관한 기록: 3년</li>
                  <li>4. 접속 로그기록 (통신비밀보호법): 3개월</li>
                </ul>
              </div>
              <p>
                <span className="font-medium">다.</span> 가항 및 나항에도 불구하고, 회사는 통계작성, 과학적 연구, AI 알고리즘 개발(예: 발달 경향성 분석)을 목적으로 개인정보(이름, 연락처, 주소 등 식별정보)를 완전히 삭제하거나 비식별화(Anonymize) 처리하여 복원할 수 없는 형태로 보유할 수 있습니다.
              </p>
            </div>
          </section>

          {/* Article 4 */}
          <section className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-stone-900 mb-4">
              제4조 (개인정보의 처리 위탁)
            </h2>
            <p className="text-stone-700 mb-4">
              회사는 원활한 서비스 제공을 위해 다음과 같이 개인정보 처리업무를 위탁합니다.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-stone-300 text-sm">
                <thead className="bg-stone-50">
                  <tr>
                    <th className="border border-stone-300 px-4 py-3 text-left font-semibold">수탁자</th>
                    <th className="border border-stone-300 px-4 py-3 text-left font-semibold">위탁 업무</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-stone-300 px-4 py-3">(주)토스페이먼츠 등 PG사</td>
                    <td className="border border-stone-300 px-4 py-3">결제대행 및 정산</td>
                  </tr>
                  <tr className="bg-stone-50">
                    <td className="border border-stone-300 px-4 py-3">(주)데브블록</td>
                    <td className="border border-stone-300 px-4 py-3">시스템 개발 및 유지보수</td>
                  </tr>
                  <tr>
                    <td className="border border-stone-300 px-4 py-3">Google / Supabase 등</td>
                    <td className="border border-stone-300 px-4 py-3">클라우드 인프라 및 DB 운영</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Article 5 */}
          <section className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-stone-900 mb-4">
              제5조 (이용자 및 법정대리인의 권리)
            </h2>
            <p className="text-stone-700">
              이용자 및 만 14세 미만 아동의 법정대리인은 언제든지 등록되어 있는 자신 또는 해당 아동의 개인정보를 조회, 수정, 삭제(탈퇴) 요청할 수 있습니다.
            </p>
          </section>

          {/* Article 6 */}
          <section className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-stone-900 mb-4">
              제6조 (개인정보 보호책임자)
            </h2>
            <p className="text-stone-700 mb-4">
              회사는 이용자의 개인정보를 보호하고 관련 민원을 처리하기 위해 아래와 같이 개인정보 보호책임자를 지정합니다.
            </p>
            <div className="bg-stone-50 rounded-lg p-6 space-y-2 text-stone-700">
              <p><span className="font-medium">사업자명:</span> 아이포텐 (AIPOTEN)</p>
              <p><span className="font-medium">대표자:</span> 김은홍</p>
              <p><span className="font-medium">개인정보 보호책임자:</span> 김은홍</p>
              <p><span className="font-medium">주소:</span> 경기도 성남시 수정구 창업로 43, 1층 196호</p>
              <p><span className="font-medium">이메일:</span> <a href="mailto:privacy@aipoten.co.kr" className="text-[#FF6A00] hover:underline">privacy@aipoten.co.kr</a></p>
              <p><span className="font-medium">전화번호:</span> [고객센터 번호 기재]</p>
            </div>
          </section>

          {/* Article 7 */}
          <section className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-stone-900 mb-4">
              제7조 (개인정보의 안전성 확보 조치)
            </h2>
            <p className="text-stone-700">
              회사는 개인정보보호법 제29조에 따라 암호화, 접근통제, 보안프로그램 설치, 정기 교육 등 기술적/관리적 조치를 하고 있습니다.
            </p>
          </section>

          {/* Article 8 */}
          <section className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-stone-900 mb-4">
              제8조 (개인정보 처리방침의 변경)
            </h2>
            <p className="text-stone-700">
              본 방침이 변경되는 경우, 시행일 7일 전에 공지사항을 통해 고지합니다.
            </p>
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
