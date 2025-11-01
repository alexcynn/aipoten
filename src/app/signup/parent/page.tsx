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
      <div className="min-h-screen bg-neutral-light flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="rounded-md bg-green-50 p-4">
            <div className="text-sm text-green-800">
              회원가입이 완료되었습니다! 로그인 페이지로 이동합니다...
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-light flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="text-2xl font-bold text-aipoten-navy">
            아이포텐
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            회원가입
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            이미 계정이 있으신가요?{' '}
            <Link
              href="/login"
              className="font-medium text-aipoten-green hover:text-aipoten-navy"
            >
              로그인하기
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                이름
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-aipoten-green focus:border-aipoten-green focus:z-10 sm:text-sm"
                placeholder="이름"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                이메일 (아이디로 사용됩니다)
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-aipoten-green focus:border-aipoten-green focus:z-10 sm:text-sm"
                placeholder="example@email.com"
                value={formData.email}
                onChange={handleChange}
              />
              <p className="mt-1 text-sm text-gray-500">
                로그인 시 아이디로 사용됩니다
              </p>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                전화번호
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-aipoten-green focus:border-aipoten-green focus:z-10 sm:text-sm"
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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-aipoten-green focus:border-aipoten-green focus:z-10 sm:text-sm"
                placeholder="비밀번호 (최소 6자)"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                비밀번호 확인
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-aipoten-green focus:border-aipoten-green focus:z-10 sm:text-sm"
                placeholder="비밀번호 확인"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            {/* 아이 정보 섹션 */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">아이 정보 <span className="text-red-500">*</span></h3>
                <button
                  type="button"
                  onClick={addChild}
                  className="px-3 py-1 text-sm rounded-md transition-colors"
                  style={{
                    backgroundColor: '#386646',
                    color: '#FFFFFF'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#193149'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#386646'}
                >
                  + 아이 추가
                </button>
              </div>

              {children.map((child, index) => (
                <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-700">아이 {index + 1}</h4>
                    {children.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeChild(index)}
                        className="text-red-600 text-sm hover:underline"
                      >
                        삭제
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        이름 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={child.name}
                        onChange={(e) => updateChild(index, 'name', e.target.value)}
                        placeholder="아이 이름"
                        required
                        className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-aipoten-green focus:border-aipoten-green sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        생년월일 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={child.birthDate}
                        onChange={(e) => updateChild(index, 'birthDate', e.target.value)}
                        required
                        className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-aipoten-green focus:border-aipoten-green sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        성별 <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name={`gender-${index}`}
                            value="MALE"
                            checked={child.gender === 'MALE'}
                            onChange={(e) => updateChild(index, 'gender', e.target.value)}
                            required
                            className="mr-2"
                          />
                          남자
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name={`gender-${index}`}
                            value="FEMALE"
                            checked={child.gender === 'FEMALE'}
                            onChange={(e) => updateChild(index, 'gender', e.target.value)}
                            required
                            className="mr-2"
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
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: isLoading ? '#386646' : '#386646',
                color: '#FFFFFF',
                opacity: isLoading ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!isLoading) e.currentTarget.style.backgroundColor = '#193149'
              }}
              onMouseLeave={(e) => {
                if (!isLoading) e.currentTarget.style.backgroundColor = '#386646'
              }}
            >
              {isLoading ? '가입 중...' : '회원가입'}
            </button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            회원가입 시{' '}
            <a href="#" className="text-aipoten-green hover:text-aipoten-navy">
              이용약관
            </a>
            {' '}및{' '}
            <a href="#" className="text-aipoten-green hover:text-aipoten-navy">
              개인정보처리방침
            </a>
            에 동의한 것으로 간주됩니다.
          </div>
        </form>
      </div>
    </div>
  )
}