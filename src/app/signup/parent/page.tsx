'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from 'next-auth/react'
import Link from 'next/link'
import AddressSearchInput from '@/components/common/AddressSearchInput'

interface Child {
  name: string
  birthDate: string
  gender: 'MALE' | 'FEMALE' | ''
}

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    addressDetail: '',
  })
  const [children, setChildren] = useState<Child[]>([
    { name: '', birthDate: '', gender: '' }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [agreePrivacy, setAgreePrivacy] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // 이미 로그인된 사용자라면 대시보드로 리다이렉트
    const checkSession = async () => {
      const session = await getSession()
      if (session) {
        router.push('/dashboard')
      }
    }
    checkSession()
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const addChild = () => {
    setChildren([...children, { name: '', birthDate: '', gender: '' }])
  }

  const removeChild = (index: number) => {
    if (children.length > 1) {
      setChildren(children.filter((_, i) => i !== index))
    }
  }

  const updateChild = (index: number, field: keyof Child, value: string) => {
    const updated = [...children]
    updated[index] = { ...updated[index], [field]: value }
    setChildren(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('올바른 이메일 형식을 입력해주세요. (예: example@email.com)')
      setIsLoading(false)
      return
    }

    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      setIsLoading(false)
      return
    }

    // 비밀번호 강도 체크
    if (formData.password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.')
      setIsLoading(false)
      return
    }

    // 아이 정보 검증
    if (children.length === 0 || !children[0].name) {
      setError('최소 1명의 아이 정보를 입력해주세요.')
      setIsLoading(false)
      return
    }

    for (let i = 0; i < children.length; i++) {
      const child = children[i]
      if (!child.name || !child.birthDate || !child.gender) {
        setError(`${i + 1}번째 아이의 정보를 모두 입력해주세요.`)
        setIsLoading(false)
        return
      }
    }

    // 약관 동의 확인
    if (!agreeTerms || !agreePrivacy) {
      setError('서비스 이용약관과 개인정보처리방침에 동의해주세요.')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          address: formData.address,
          addressDetail: formData.addressDetail,
          children: children,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '회원가입 중 오류가 발생했습니다.')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="rounded-[10px] bg-[#FFE5E5] border border-[#FF9999] p-4">
            <div className="text-sm text-[#FF6A00] font-pretendard">
              회원가입이 완료되었습니다! 로그인 페이지로 이동합니다...
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-block mb-6">
            <img
              src="/images/logo.png"
              alt="AIPOTEN 아이포텐"
              className="mx-auto"
              style={{ width: '200px', height: '28px' }}
            />
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-stone-900 font-pretendard">
            부모 회원가입
          </h2>
          <p className="mt-2 text-sm text-stone-600 font-pretendard">
            이미 계정이 있으신가요?{' '}
            <Link
              href="/login"
              className="font-medium text-[#FF6A00] hover:text-[#E55F00]"
            >
              로그인하기
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-2 font-pretendard">
                이름
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-stone-900 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:border-transparent sm:text-sm font-pretendard"
                placeholder="이름"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-2 font-pretendard">
                이메일 (아이디로 사용됩니다)
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-stone-900 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:border-transparent sm:text-sm font-pretendard"
                placeholder="example@email.com"
                value={formData.email}
                onChange={handleChange}
              />
              <p className="mt-1 text-sm text-stone-500 font-pretendard">
                로그인 시 아이디로 사용됩니다
              </p>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-stone-700 mb-2 font-pretendard">
                전화번호
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="appearance-none block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-stone-900 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:border-transparent sm:text-sm font-pretendard"
                placeholder="전화번호 (선택사항)"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <AddressSearchInput
              address={formData.address}
              addressDetail={formData.addressDetail}
              onAddressChange={(address) => setFormData({ ...formData, address })}
              onAddressDetailChange={(addressDetail) => setFormData({ ...formData, addressDetail })}
            />

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-2 font-pretendard">
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-stone-900 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:border-transparent sm:text-sm font-pretendard"
                placeholder="비밀번호 (최소 6자)"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-stone-700 mb-2 font-pretendard">
                비밀번호 확인
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-stone-900 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:border-transparent sm:text-sm font-pretendard"
                placeholder="비밀번호 확인"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            {/* 아이 정보 섹션 */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-stone-900 font-pretendard">아이 정보 <span className="text-red-500">*</span></h3>
                <button
                  type="button"
                  onClick={addChild}
                  className="px-3 py-1 text-sm rounded-[10px] bg-[#FF6A00] text-white hover:bg-[#E55F00] transition-colors font-pretendard"
                >
                  + 아이 추가
                </button>
              </div>

              {children.map((child, index) => (
                <div key={index} className="mb-4 p-4 border border-gray-200 rounded-xl bg-[#F9F9F9]">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-stone-700 font-pretendard">아이 {index + 1}</h4>
                    {children.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeChild(index)}
                        className="text-red-600 text-sm hover:underline font-pretendard"
                      >
                        삭제
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2 font-pretendard">
                        이름 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={child.name}
                        onChange={(e) => updateChild(index, 'name', e.target.value)}
                        placeholder="아이 이름"
                        required
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-stone-900 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:border-transparent sm:text-sm font-pretendard bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2 font-pretendard">
                        생년월일 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={child.birthDate}
                        onChange={(e) => updateChild(index, 'birthDate', e.target.value)}
                        required
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 text-stone-900 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:border-transparent sm:text-sm font-pretendard bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2 font-pretendard">
                        성별 <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center font-pretendard">
                          <input
                            type="radio"
                            name={`gender-${index}`}
                            value="MALE"
                            checked={child.gender === 'MALE'}
                            onChange={(e) => updateChild(index, 'gender', e.target.value)}
                            required
                            className="mr-2 text-[#FF6A00] focus:ring-[#FF6A00]"
                          />
                          남자
                        </label>
                        <label className="flex items-center font-pretendard">
                          <input
                            type="radio"
                            name={`gender-${index}`}
                            value="FEMALE"
                            checked={child.gender === 'FEMALE'}
                            onChange={(e) => updateChild(index, 'gender', e.target.value)}
                            required
                            className="mr-2 text-[#FF6A00] focus:ring-[#FF6A00]"
                          />
                          여자
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 약관 동의 */}
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <div className="flex items-start">
              <input
                id="agreeTerms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 h-4 w-4 text-[#FF6A00] focus:ring-[#FF6A00] border-gray-300 rounded"
              />
              <label htmlFor="agreeTerms" className="ml-2 text-sm text-stone-700 font-pretendard">
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-[#FF6A00] hover:text-[#E55F00] underline"
                >
                  서비스 이용약관
                </button>
                에 동의합니다. <span className="text-red-500">*</span>
              </label>
            </div>
            <div className="flex items-start">
              <input
                id="agreePrivacy"
                type="checkbox"
                checked={agreePrivacy}
                onChange={(e) => setAgreePrivacy(e.target.checked)}
                className="mt-1 h-4 w-4 text-[#FF6A00] focus:ring-[#FF6A00] border-gray-300 rounded"
              />
              <label htmlFor="agreePrivacy" className="ml-2 text-sm text-stone-700 font-pretendard">
                <button
                  type="button"
                  onClick={() => setShowPrivacyModal(true)}
                  className="text-[#FF6A00] hover:text-[#E55F00] underline"
                >
                  개인정보처리방침
                </button>
                에 동의합니다. <span className="text-red-500">*</span>
              </label>
            </div>
          </div>

          {error && (
            <div className="rounded-[10px] bg-red-50 border border-red-200 p-4">
              <div className="text-sm text-red-800 font-pretendard">{error}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading || !agreeTerms || !agreePrivacy}
              className={`w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-[10px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF6A00] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md font-pretendard ${
                isLoading || !agreeTerms || !agreePrivacy
                  ? 'bg-gray-400'
                  : 'bg-[#FF6A00] hover:bg-[#E55F00]'
              } text-white`}
            >
              {isLoading ? '가입 중...' : '회원가입'}
            </button>
          </div>
        </form>
      </div>

      {/* 이용약관 모달 */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-bold text-stone-900">서비스 이용약관</h2>
              <button
                onClick={() => setShowTermsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 text-sm text-stone-700">
              <p className="text-xs text-stone-500 mb-4">시행일: 2025년 11월 4일</p>

              <h3 className="font-bold text-stone-900 mb-2">제1조 (목적)</h3>
              <p className="mb-4">본 약관은 아이포텐(대표 김은홍, 사업자번호 262-08-03275, 이하 "회사")이 운영하는 AI 기반 아동발달 통합 플랫폼 "아이포텐"(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>

              <h3 className="font-bold text-stone-900 mb-2">제2조 (용어의 정의)</h3>
              <p className="mb-2">본 약관에서 사용하는 용어의 정의는 다음과 같습니다.</p>
              <ul className="list-disc ml-4 mb-4 space-y-1">
                <li>"서비스"란 회사가 제공하는 AI 자가 발달체크, 맞춤형 놀이영상, 언어 컨설팅 중개 서비스 등을 포함하는 플랫폼을 말합니다.</li>
                <li>"부모회원(보호자)"이란 본 약관에 동의하고 자녀의 발달 체크 및 전문가 매칭 서비스를 이용하는 회원을 말합니다.</li>
                <li>"AI 발달리포트"란 발달체크 결과를 기반으로 생성되는 참고용 분석 정보이며, 의료행위 또는 전문 진단을 대체하지 않습니다.</li>
              </ul>

              <h3 className="font-bold text-stone-900 mb-2">제3조 (약관의 명시 및 개정)</h3>
              <p className="mb-4">회사는 본 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 초기화면에 게시합니다. 약관 개정 시, 적용일자 7일 전에 공지합니다.</p>

              <h3 className="font-bold text-stone-900 mb-2">제4조 (회사의 법적 지위)</h3>
              <p className="mb-4">회사는 통신판매중개자로서, 부모회원과 전문가회원 간의 자유로운 서비스 계약을 위한 시스템을 운영 및 관리, 제공합니다.</p>

              <h3 className="font-bold text-stone-900 mb-2">제5조 (서비스의 성격 및 의료 면책)</h3>
              <p className="mb-4">회사가 제공하는 발달체크 및 AI 발달리포트는 의료행위 또는 전문 진단이 아닙니다. 아동의 발달에 우려가 있는 경우 반드시 전문 의료기관의 진단을 받아야 합니다.</p>

              <h3 className="font-bold text-stone-900 mb-2">제6조 (회원의 의무)</h3>
              <p className="mb-4">회원은 회원가입 시 실명과 정확한 정보를 기재해야 하며, 허위정보 기재로 인한 불이익은 회원 본인에게 있습니다.</p>

              <h3 className="font-bold text-stone-900 mb-2">제7조 (결제, 취소 및 환불)</h3>
              <p className="mb-4">유료 서비스의 이용료 결제, 취소, 위약금 및 환불에 관한 모든 사항은 회사가 별도로 정한 「결제 및 환불 정책」에 따릅니다.</p>

              <h3 className="font-bold text-stone-900 mb-2">제8조 (저작권 및 콘텐츠 정책)</h3>
              <p className="mb-4">회사가 작성하거나 제작한 모든 콘텐츠의 저작권은 회사에 귀속됩니다. 회원이 업로드한 사용자 콘텐츠의 저작권은 해당 회원에게 귀속됩니다.</p>

              <h3 className="font-bold text-stone-900 mb-2">제9조 (면책조항)</h3>
              <p className="mb-4">회사는 전문가회원이 제공하는 서비스의 내용, 품질, 효과, 안전성에 대해 책임을 지지 않습니다. 천재지변, 서버 장애 등 불가항력으로 서비스를 제공할 수 없는 경우 책임이 면제됩니다.</p>

              <h3 className="font-bold text-stone-900 mb-2">제10조 (이용 제한 및 계약 해지)</h3>
              <p className="mb-4">회원은 언제든지 서비스 내 '회원탈퇴' 기능을 통해 이용계약을 해지할 수 있습니다.</p>

              <h3 className="font-bold text-stone-900 mb-2">제11조 (준거법 및 재판관할)</h3>
              <p>본 약관의 해석 및 분쟁은 대한민국 법령에 따르며, 분쟁 발생 시 민사소송법상의 관할법원에 소송을 제기합니다.</p>
            </div>
            <div className="p-4 border-t">
              <button
                onClick={() => setShowTermsModal(false)}
                className="w-full py-2 bg-[#FF6A00] text-white rounded-[10px] font-medium hover:bg-[#E55F00] transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 개인정보처리방침 모달 */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-bold text-stone-900">개인정보처리방침</h2>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 text-sm text-stone-700">
              <p className="text-xs text-stone-500 mb-4">시행일자: 2025년 11월 4일</p>
              <p className="mb-4">아이포텐(이하 "회사")은 「개인정보 보호법」 및 관련 법령에 따라 이용자의 개인정보와 아동 관련 민감정보를 보호하고, 정보주체의 권익을 보장하기 위하여 다음과 같이 개인정보 처리방침을 수립·공개합니다.</p>

              <h3 className="font-bold text-stone-900 mb-2">제1조 (개인정보의 수집 항목 및 이용 목적)</h3>
              <p className="mb-2">회사는 서비스 제공을 위해 다음의 개인정보를 수집 및 이용합니다.</p>
              <ul className="list-disc ml-4 mb-4 space-y-1">
                <li>공통: 이름, 휴대폰번호, 이메일, 비밀번호 - 회원 식별, 본인확인, 고지사항 전달</li>
                <li>부모회원: 자녀 이름, 생년월, 성별, 발달체크 응답 등 - AI 발달리포트 생성, 맞춤형 콘텐츠 추천</li>
                <li>결제 시: 신용카드 정보 등 - 유료서비스 결제 및 환불</li>
                <li>자동수집: 서비스 이용기록, IP주소 등 - 부정이용 방지, 서비스 품질 개선</li>
              </ul>

              <h3 className="font-bold text-stone-900 mb-2">제2조 (민감정보의 처리 및 제3자 제공)</h3>
              <p className="mb-4">회사는 아동의 건강 및 발달 관련 정보를 수집할 시, 반드시 부모회원의 명시적인 별도 동의를 받습니다. 수집된 민감정보는 AI 발달리포트 생성 및 매칭 서비스 제공 목적으로만 이용됩니다.</p>

              <h3 className="font-bold text-stone-900 mb-2">제3조 (개인정보의 보유 및 파기)</h3>
              <p className="mb-2">회사는 원칙적으로 회원 탈퇴 시 해당 개인정보를 지체 없이 파기합니다. 단, 관계 법령에 따라 일정 기간 보존합니다.</p>
              <ul className="list-disc ml-4 mb-4 space-y-1">
                <li>계약 또는 청약철회 등에 관한 기록: 5년</li>
                <li>대금결제 및 재화 등의 공급에 관한 기록: 5년</li>
                <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년</li>
              </ul>

              <h3 className="font-bold text-stone-900 mb-2">제4조 (개인정보의 처리 위탁)</h3>
              <p className="mb-4">회사는 원활한 서비스 제공을 위해 결제대행(PG사), 시스템 개발(데브블록), 클라우드 인프라(Google/Supabase) 등에 개인정보 처리업무를 위탁합니다.</p>

              <h3 className="font-bold text-stone-900 mb-2">제5조 (이용자 및 법정대리인의 권리)</h3>
              <p className="mb-4">이용자 및 만 14세 미만 아동의 법정대리인은 언제든지 등록되어 있는 자신 또는 해당 아동의 개인정보를 조회, 수정, 삭제(탈퇴) 요청할 수 있습니다.</p>

              <h3 className="font-bold text-stone-900 mb-2">제6조 (개인정보 보호책임자)</h3>
              <div className="mb-4 bg-stone-50 p-3 rounded">
                <p>사업자명: 아이포텐 (AIPOTEN)</p>
                <p>대표자/개인정보 보호책임자: 김은홍</p>
                <p>이메일: privacy@aipoten.co.kr</p>
              </div>

              <h3 className="font-bold text-stone-900 mb-2">제7조 (개인정보의 안전성 확보 조치)</h3>
              <p className="mb-4">회사는 개인정보보호법 제29조에 따라 암호화, 접근통제, 보안프로그램 설치, 정기 교육 등 기술적/관리적 조치를 하고 있습니다.</p>

              <h3 className="font-bold text-stone-900 mb-2">제8조 (개인정보 처리방침의 변경)</h3>
              <p>본 방침이 변경되는 경우, 시행일 7일 전에 공지사항을 통해 고지합니다.</p>
            </div>
            <div className="p-4 border-t">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="w-full py-2 bg-[#FF6A00] text-white rounded-[10px] font-medium hover:bg-[#E55F00] transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}