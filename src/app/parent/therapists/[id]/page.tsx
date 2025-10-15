'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface Therapist {
  id: string
  user: {
    id: string
    name: string
    email: string
  }
  gender: string | null
  birthYear: number | null
  address: string | null
  specialties: string[]
  childAgeRanges: string[]
  serviceAreas: string[]
  sessionFee: number | null
  education: string | null
  introduction: string | null
  approvedAt: string
  certifications: Array<{
    id: string
    certificationName: string
    issuingOrganization: string
    issueDate: string
  }>
  experiences: Array<{
    id: string
    employmentType: string
    organization: string
    therapyType: string
    startDate: string
    endDate: string | null
  }>
}

const specialtyLabels: Record<string, string> = {
  SPEECH_THERAPY: '언어치료',
  SENSORY_INTEGRATION: '감각통합',
  PLAY_THERAPY: '놀이치료',
  ART_THERAPY: '미술치료',
  MUSIC_THERAPY: '음악치료',
  OCCUPATIONAL_THERAPY: '작업치료',
  COGNITIVE_THERAPY: '인지치료',
  BEHAVIORAL_THERAPY: '행동치료',
}

const ageRangeLabels: Record<string, string> = {
  AGE_0_12: '0-12개월',
  AGE_13_24: '13-24개월',
  AGE_25_36: '25-36개월',
  AGE_37_48: '37-48개월',
  AGE_49_60: '49-60개월',
}

const areaLabels: Record<string, string> = {
  GANGNAM: '강남구',
  SEOCHO: '서초구',
  SONGPA: '송파구',
  GANGDONG: '강동구',
}

export default function TherapistDetailPage() {
  const params = useParams()
  const router = useRouter()
  const therapistId = params?.id as string

  const [therapist, setTherapist] = useState<Therapist | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchTherapist = async () => {
      try {
        const response = await fetch(`/api/therapists/${therapistId}`)
        const data = await response.json()

        if (response.ok) {
          setTherapist(data)
        } else {
          setError(data.error || '치료사 정보를 불러올 수 없습니다.')
        }
      } catch (err) {
        setError('서버 오류가 발생했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    if (therapistId) {
      fetchTherapist()
    }
  }, [therapistId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (error || !therapist) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800">{error || '치료사 정보를 찾을 수 없습니다.'}</p>
            <Link
              href="/parent/therapists"
              className="mt-4 inline-block text-red-600 hover:text-red-800"
            >
              ← 목록으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 뒤로 가기 버튼 */}
        <Link
          href="/parent/therapists"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          ← 목록으로 돌아가기
        </Link>

        {/* 치료사 기본 정보 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {therapist.user.name} 치료사
              </h1>
              {therapist.education && (
                <p className="text-lg text-gray-600">{therapist.education}</p>
              )}
            </div>
            {therapist.sessionFee && (
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  ₩{therapist.sessionFee.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">50분 기준</div>
              </div>
            )}
          </div>

          {/* 전문 분야 및 서비스 정보 */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">전문 분야</h3>
              <div className="flex flex-wrap gap-2">
                {therapist.specialties.map((spec, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {specialtyLabels[spec] || spec}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">대상 연령</h3>
              <div className="flex flex-wrap gap-2">
                {therapist.childAgeRanges.map((range, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                  >
                    {ageRangeLabels[range] || range}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">서비스 지역</h3>
              <div className="flex flex-wrap gap-2">
                {therapist.serviceAreas.map((area, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full"
                  >
                    {areaLabels[area] || area}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 자기소개 */}
          {therapist.introduction && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">자기소개</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{therapist.introduction}</p>
            </div>
          )}
        </div>

        {/* 자격증 */}
        {therapist.certifications && therapist.certifications.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">자격증</h2>
            <div className="space-y-4">
              {therapist.certifications.map((cert) => (
                <div key={cert.id} className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold text-gray-900">{cert.certificationName}</h3>
                  <p className="text-sm text-gray-600">{cert.issuingOrganization}</p>
                  <p className="text-xs text-gray-500">
                    취득일: {new Date(cert.issueDate).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 경력 */}
        {therapist.experiences && therapist.experiences.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">경력</h2>
            <div className="space-y-4">
              {therapist.experiences.map((exp) => (
                <div key={exp.id} className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-semibold text-gray-900">{exp.organization}</h3>
                  <p className="text-sm text-gray-600">{exp.therapyType}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(exp.startDate).toLocaleDateString('ko-KR')} ~{' '}
                    {exp.endDate ? new Date(exp.endDate).toLocaleDateString('ko-KR') : '현재'}
                  </p>
                  <span className="inline-block mt-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    {exp.employmentType === 'INSTITUTION' ? '기관' : '프리랜서'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 예약하기 버튼 */}
        <div className="bg-white rounded-lg shadow p-6">
          <Link
            href={`/parent/therapists/${therapistId}/booking`}
            className="block w-full text-center px-6 py-4 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            예약하기
          </Link>
        </div>
      </div>
    </div>
  )
}
