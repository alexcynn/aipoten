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

          {error && (
            <div className="rounded-[10px] bg-red-50 border border-red-200 p-4">
              <div className="text-sm text-red-800 font-pretendard">{error}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-[10px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF6A00] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md font-pretendard ${
                isLoading
                  ? 'bg-gray-400'
                  : 'bg-[#FF6A00] hover:bg-[#E55F00]'
              } text-white`}
            >
              {isLoading ? '가입 중...' : '회원가입'}
            </button>
          </div>

          <div className="text-xs text-stone-500 text-center font-pretendard">
            회원가입 시{' '}
            <a href="#" className="text-[#FF6A00] hover:text-[#E55F00]">
              이용약관
            </a>
            {' '}및{' '}
            <a href="#" className="text-[#FF6A00] hover:text-[#E55F00]">
              개인정보처리방침
            </a>
            에 동의한 것으로 간주됩니다.
          </div>
        </form>
      </div>
    </div>
  )
}