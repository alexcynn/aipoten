'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'

export default function NewChildPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    birthDate: '',
    notes: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
    }
  }, [session, status, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!formData.name || !formData.gender || !formData.birthDate) {
      setError('이름, 성별, 생년월일은 필수 항목입니다.')
      setIsLoading(false)
      return
    }

    // 생년월일이 미래 날짜인지 확인
    const today = new Date()
    const birthDate = new Date(formData.birthDate)
    if (birthDate > today) {
      setError('생년월일이 미래 날짜일 수 없습니다.')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/children', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '아이 등록 중 오류가 발생했습니다.')
      }

      const child = await response.json()
      router.push(`/children/${child.id}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#F5EFE7] flex items-center justify-center font-pretendard">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6A00] mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#F5EFE7] font-pretendard">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow-sm rounded-[20px]">
            <div className="px-6 py-8 sm:p-8">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-[#1E1307]">아이 등록</h1>
                <p className="mt-1 text-sm text-[#666666]">
                  새로운 아이의 정보를 입력해주세요. 등록된 정보는 발달 체크와 맞춤형 서비스 제공에 활용됩니다.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-[#1E1307]">
                    이름 *
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-[10px] shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:border-[#FF6A00] text-sm"
                    placeholder="아이의 이름을 입력하세요"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-[#1E1307]">
                    성별 *
                  </label>
                  <select
                    name="gender"
                    id="gender"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-[10px] shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:border-[#FF6A00] text-sm"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="">성별을 선택하세요</option>
                    <option value="MALE">남아</option>
                    <option value="FEMALE">여아</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="birthDate" className="block text-sm font-medium text-[#1E1307]">
                    생년월일 *
                  </label>
                  <input
                    type="date"
                    name="birthDate"
                    id="birthDate"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-[10px] shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:border-[#FF6A00] text-sm"
                    value={formData.birthDate}
                    onChange={handleChange}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-[#1E1307]">
                    특이사항
                  </label>
                  <textarea
                    name="notes"
                    id="notes"
                    rows={4}
                    className="mt-1 block w-full border border-gray-300 rounded-[10px] shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:border-[#FF6A00] text-sm"
                    placeholder="아이에 대한 특이사항이나 참고할 내용이 있다면 적어주세요 (선택사항)"
                    value={formData.notes}
                    onChange={handleChange}
                  />
                </div>

                {error && (
                  <div className="rounded-md bg-red-50 p-4">
                    <div className="text-sm text-red-800">{error}</div>
                  </div>
                )}

                <div className="flex justify-end space-x-4">
                  <Link
                    href="/parent/dashboard"
                    className="inline-flex items-center px-6 py-3 border border-[#FF6A00] text-sm font-semibold rounded-[10px] text-[#FF6A00] bg-white hover:bg-[#FFF5EB] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF6A00] transition-colors"
                  >
                    취소
                  </Link>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-[10px] shadow-sm text-white bg-[#FF6A00] hover:bg-[#E55F00] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF6A00] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? '등록 중...' : '아이 등록하기'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}