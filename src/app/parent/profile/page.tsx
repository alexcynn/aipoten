'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Header from '@/components/layout/Header'
import AddressSearchInput from '@/components/common/AddressSearchInput'

export default function ParentProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    addressDetail: '',
  })

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    if (session.user?.role !== 'PARENT') {
      router.push('/dashboard')
      return
    }

    fetchUserProfile()
  }, [session, status, router])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/users/me')
      if (response.ok) {
        const data = await response.json()
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          addressDetail: data.addressDetail || '',
        })
      }
    } catch (error) {
      console.error('프로필 조회 오류:', error)
      setError('프로필을 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleAddressChange = (address: string) => {
    setFormData({
      ...formData,
      address,
    })
  }

  const handleAddressDetailChange = (addressDetail: string) => {
    setFormData({
      ...formData,
      addressDetail,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')
    setSuccess('')

    // 전화번호 형식 검증
    const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/-/g, ''))) {
      setError('올바른 전화번호 형식을 입력해주세요. (예: 010-1234-5678)')
      setIsSaving(false)
      return
    }

    try {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formData.phone,
          address: formData.address,
          addressDetail: formData.addressDetail,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '프로필 업데이트 중 오류가 발생했습니다.')
      }

      setSuccess('프로필이 성공적으로 업데이트되었습니다.')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-neutral-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aipoten-green mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-neutral-light">
      <Header />

      <main className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">프로필 관리</h1>
            <p className="mt-2 text-gray-600">
              회원님의 개인정보를 관리하세요.
            </p>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-md bg-green-50 p-4">
              <div className="text-sm text-green-800">{success}</div>
            </div>
          )}

          {/* Profile Form */}
          <div className="bg-white shadow rounded-lg">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* 이름 (읽기 전용) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이름
                </label>
                <input
                  type="text"
                  value={formData.name}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500">
                  이름은 변경할 수 없습니다.
                </p>
              </div>

              {/* 이메일 (읽기 전용) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이메일
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500">
                  이메일은 변경할 수 없습니다.
                </p>
              </div>

              {/* 전화번호 */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  전화번호 *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="010-1234-5678"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aipoten-green"
                />
              </div>

              {/* 주소 및 상세 주소 */}
              <div>
                <AddressSearchInput
                  address={formData.address}
                  addressDetail={formData.addressDetail}
                  onAddressChange={handleAddressChange}
                  onAddressDetailChange={handleAddressDetailChange}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '12px', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => router.back()}
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    color: '#374151',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'white',
                    backgroundColor: isSaving ? '#D1D5DB' : '#386646',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSaving) e.currentTarget.style.backgroundColor = '#2D5238'
                  }}
                  onMouseLeave={(e) => {
                    if (!isSaving) e.currentTarget.style.backgroundColor = '#386646'
                  }}
                >
                  {isSaving ? '저장 중...' : '저장'}
                </button>
              </div>
            </form>
          </div>

          {/* Info Section */}
          <div className="mt-6 bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">참고사항</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>이름과 이메일은 보안상 변경이 불가능합니다.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>전화번호와 주소는 치료사 매칭 및 홈티 서비스를 위해 사용됩니다.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>정확한 정보를 입력해야 원활한 서비스 이용이 가능합니다.</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
