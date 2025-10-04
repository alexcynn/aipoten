'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Child {
  id: string
  name: string
  gender: string
  birthDate: string
  notes: string | null
  createdAt: string
  assessments: Array<{
    id: string
    ageInMonths: number
    totalScore: number
    createdAt: string
  }>
}

interface PageParams {
  id: string
}

export default function ChildDetailPage({ params }: { params: Promise<PageParams> }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [child, setChild] = useState<Child | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    birthDate: '',
    notes: '',
  })

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }

    const fetchChild = async () => {
      try {
        const resolvedParams = await params
        const response = await fetch(`/api/children/${resolvedParams.id}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError('아이를 찾을 수 없습니다.')
          } else {
            setError('아이 정보를 불러오는 중 오류가 발생했습니다.')
          }
          return
        }
        const childData = await response.json()
        setChild(childData)
        setFormData({
          name: childData.name,
          gender: childData.gender,
          birthDate: childData.birthDate.split('T')[0],
          notes: childData.notes || '',
        })
      } catch (error) {
        setError('아이 정보를 불러오는 중 오류가 발생했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchChild()
  }, [session, status, router, params])

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate)
    const today = new Date()
    const ageInMonths = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth())

    if (ageInMonths < 12) {
      return `${ageInMonths}개월`
    } else {
      const years = Math.floor(ageInMonths / 12)
      const months = ageInMonths % 12
      return months > 0 ? `${years}세 ${months}개월` : `${years}세`
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    if (child) {
      setFormData({
        name: child.name,
        gender: child.gender,
        birthDate: child.birthDate.split('T')[0],
        notes: child.notes || '',
      })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!child) return

    try {
      const response = await fetch(`/api/children/${child.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '아이 정보 수정 중 오류가 발생했습니다.')
      }

      const updatedChild = await response.json()
      setChild(updatedChild)
      setIsEditing(false)
    } catch (err: any) {
      setError(err.message)
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

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-light flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-aipoten-green hover:bg-aipoten-navy"
          >
            대시보드로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  if (!child) {
    return null
  }

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="text-xl font-bold text-aipoten-navy">
              아이포텐
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-aipoten-green">
                대시보드
              </Link>
              <span className="text-gray-700">{session.user?.name}님</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Child Profile Card */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-aipoten-accent rounded-full flex items-center justify-center mr-4">
                    <span className="text-2xl text-white font-bold">
                      {child.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{child.name}</h1>
                    <p className="text-gray-600">
                      {child.gender === 'MALE' ? '남아' : '여아'} • {calculateAge(child.birthDate)}
                    </p>
                  </div>
                </div>
                {!isEditing && (
                  <button
                    onClick={handleEdit}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    정보 수정
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        이름
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-aipoten-green focus:border-aipoten-green sm:text-sm"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                        성별
                      </label>
                      <select
                        name="gender"
                        id="gender"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-aipoten-green focus:border-aipoten-green sm:text-sm"
                        value={formData.gender}
                        onChange={handleChange}
                      >
                        <option value="MALE">남아</option>
                        <option value="FEMALE">여아</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">
                      생년월일
                    </label>
                    <input
                      type="date"
                      name="birthDate"
                      id="birthDate"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-aipoten-green focus:border-aipoten-green sm:text-sm"
                      value={formData.birthDate}
                      onChange={handleChange}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                      특이사항
                    </label>
                    <textarea
                      name="notes"
                      id="notes"
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-aipoten-green focus:border-aipoten-green sm:text-sm"
                      value={formData.notes}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-aipoten-green hover:bg-aipoten-navy"
                    >
                      저장
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">생년월일</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(child.birthDate).toLocaleDateString('ko-KR')}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">등록일</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(child.createdAt).toLocaleDateString('ko-KR')}
                      </dd>
                    </div>
                  </div>
                  {child.notes && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">특이사항</dt>
                      <dd className="mt-1 text-sm text-gray-900">{child.notes}</dd>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Link
              href={`/assessments/new?childId=${child.id}`}
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-aipoten-blue rounded-full flex items-center justify-center mr-4">
                  <span className="text-white">📊</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">발달체크</h3>
                  <p className="text-sm text-gray-500">새로운 발달 평가 시작</p>
                </div>
              </div>
            </Link>

            <Link
              href={`/videos?childId=${child.id}`}
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-aipoten-red rounded-full flex items-center justify-center mr-4">
                  <span className="text-white">📹</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">추천영상</h3>
                  <p className="text-sm text-gray-500">맞춤 콘텐츠 보기</p>
                </div>
              </div>
            </Link>

            <Link
              href={`/spirituality?childId=${child.id}`}
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-aipoten-orange rounded-full flex items-center justify-center mr-4">
                  <span className="text-white">🎮</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">놀이영성</h3>
                  <p className="text-sm text-gray-500">놀이 활동 추천</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Assessment History */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">발달체크 이력</h3>
              {child.assessments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">아직 발달체크 기록이 없습니다.</p>
                  <Link
                    href={`/assessments/new?childId=${child.id}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-aipoten-green hover:bg-aipoten-navy"
                  >
                    첫 번째 발달체크 시작하기
                  </Link>
                </div>
              ) : (
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          평가일
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          당시 월령
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          총점
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          상세보기
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {child.assessments.map((assessment) => (
                        <tr key={assessment.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(assessment.createdAt).toLocaleDateString('ko-KR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {assessment.ageInMonths}개월
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {assessment.totalScore}점
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-aipoten-green">
                            <Link href={`/assessments/${assessment.id}`}>
                              자세히 보기
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}