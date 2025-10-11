'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'

interface TherapistProfile {
  id: string
  specialty: string
  licenseNumber?: string
  experience: number
  education?: string
  certifications?: string
  introduction?: string
  consultationFee: number
  status: string
  user: {
    name: string
    email: string
    phone?: string
  }
}

const specialtyOptions = [
  { value: 'SPEECH_THERAPY', label: '언어치료' },
  { value: 'OCCUPATIONAL_THERAPY', label: '작업치료' },
  { value: 'PHYSICAL_THERAPY', label: '물리치료' },
  { value: 'PSYCHOLOGICAL_THERAPY', label: '심리치료' },
  { value: 'BEHAVIORAL_THERAPY', label: '행동치료' },
  { value: 'PLAY_THERAPY', label: '놀이치료' }
]

export default function TherapistProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<TherapistProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    specialty: '',
    licenseNumber: '',
    experience: '',
    education: '',
    certifications: '',
    introduction: '',
    consultationFee: ''
  })

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    if (session.user?.role !== 'THERAPIST') {
      router.push('/dashboard')
      return
    }

    fetchProfile()
  }, [session, status, router])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/therapist/profile')

      if (response.ok) {
        const profileData = await response.json()
        setProfile(profileData)

        // Initialize form with existing data
        setFormData({
          specialty: profileData.specialty || '',
          licenseNumber: profileData.licenseNumber || '',
          experience: profileData.experience?.toString() || '',
          education: profileData.education || '',
          certifications: profileData.certifications || '',
          introduction: profileData.introduction || '',
          consultationFee: profileData.consultationFee?.toString() || ''
        })
      }
    } catch (error) {
      console.error('프로필 조회 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage('')

    try {
      const method = profile ? 'PUT' : 'POST'
      const response = await fetch('/api/therapist/profile', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (response.ok) {
        setMessage('프로필이 성공적으로 저장되었습니다.')
        fetchProfile() // Refresh profile data
      } else {
        setMessage(result.error || '저장 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('프로필 저장 오류:', error)
      setMessage('저장 중 오류가 발생했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'text-green-600 bg-green-100'
      case 'PENDING': return 'text-yellow-600 bg-yellow-100'
      case 'REJECTED': return 'text-red-600 bg-red-100'
      case 'SUSPENDED': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED': return '승인됨'
      case 'PENDING': return '승인 대기'
      case 'REJECTED': return '거절됨'
      case 'SUSPENDED': return '정지됨'
      default: return status
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
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Status Card */}
          {profile && (
            <div className="bg-white shadow rounded-lg mb-6 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">현재 상태</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">승인 상태</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(profile.status)}`}>
                    {getStatusText(profile.status)}
                  </span>
                </div>
                {profile.status === 'PENDING' && (
                  <div className="text-sm text-gray-600">
                    <p>프로필이 검토 중입니다.</p>
                    <p>승인까지 1-2일 소요될 수 있습니다.</p>
                  </div>
                )}
                {profile.status === 'APPROVED' && (
                  <div className="text-sm text-green-600">
                    <p>매칭 서비스를 이용할 수 있습니다.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Profile Form */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
                {profile ? '프로필 수정' : '프로필 등록'}
              </h3>

              {message && (
                <div className={`mb-4 p-4 rounded-md ${
                  message.includes('성공') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 기본 정보 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="specialty" className="block text-sm font-medium text-gray-700">
                      전문 분야 *
                    </label>
                    <select
                      id="specialty"
                      name="specialty"
                      required
                      value={formData.specialty}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-aipoten-green focus:border-aipoten-green"
                    >
                      <option value="">선택해주세요</option>
                      {specialtyOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
                      경력 (년) *
                    </label>
                    <input
                      type="number"
                      id="experience"
                      name="experience"
                      required
                      min="0"
                      max="50"
                      value={formData.experience}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-aipoten-green focus:border-aipoten-green"
                    />
                  </div>

                  <div>
                    <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
                      자격증 번호
                    </label>
                    <input
                      type="text"
                      id="licenseNumber"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-aipoten-green focus:border-aipoten-green"
                    />
                  </div>

                  <div>
                    <label htmlFor="consultationFee" className="block text-sm font-medium text-gray-700">
                      상담료 (원) *
                    </label>
                    <input
                      type="number"
                      id="consultationFee"
                      name="consultationFee"
                      required
                      min="0"
                      step="1000"
                      value={formData.consultationFee}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-aipoten-green focus:border-aipoten-green"
                    />
                  </div>
                </div>

                {/* 학력 */}
                <div>
                  <label htmlFor="education" className="block text-sm font-medium text-gray-700">
                    학력
                  </label>
                  <input
                    type="text"
                    id="education"
                    name="education"
                    value={formData.education}
                    onChange={handleInputChange}
                    placeholder="예: 특수교육학 석사"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-aipoten-green focus:border-aipoten-green"
                  />
                </div>

                {/* 자격증 */}
                <div>
                  <label htmlFor="certifications" className="block text-sm font-medium text-gray-700">
                    보유 자격증
                  </label>
                  <textarea
                    id="certifications"
                    name="certifications"
                    rows={3}
                    value={formData.certifications}
                    onChange={handleInputChange}
                    placeholder="예: 언어재활사 1급, 특수교육교사 2급"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-aipoten-green focus:border-aipoten-green"
                  />
                </div>

                {/* 자기소개 */}
                <div>
                  <label htmlFor="introduction" className="block text-sm font-medium text-gray-700">
                    자기소개
                  </label>
                  <textarea
                    id="introduction"
                    name="introduction"
                    rows={5}
                    value={formData.introduction}
                    onChange={handleInputChange}
                    placeholder="치료 경험, 전문 분야, 치료 철학 등을 자유롭게 작성해주세요."
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-aipoten-green focus:border-aipoten-green"
                  />
                </div>

                {/* 제출 버튼 */}
                <div className="flex justify-end space-x-3">
                  <Link
                    href="/dashboard/therapist"
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-aipoten-green"
                  >
                    취소
                  </Link>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="bg-aipoten-green border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-aipoten-navy focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-aipoten-green disabled:opacity-50"
                  >
                    {isSaving ? '저장 중...' : '저장하기'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Info Card */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-blue-400">💡</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  프로필 승인 안내
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>프로필 등록 후 관리자 승인이 필요합니다.</li>
                    <li>승인까지 1-2일 정도 소요될 수 있습니다.</li>
                    <li>정확한 정보 입력이 승인에 도움이 됩니다.</li>
                    <li>승인 후 매칭 서비스를 이용할 수 있습니다.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}