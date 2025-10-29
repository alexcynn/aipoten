'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'

interface Therapist {
  id: string
  userId: string
  gender: string | null
  birthYear: number | null
  address: string | null
  addressDetail: string | null
  specialties: string | null
  childAgeRanges: string | null
  serviceAreas: string | null
  sessionFee: number | null
  isPreTherapist: boolean
  canDoConsultation: boolean
  education: string | null
  introduction: string | null
  user: {
    name: string
    email: string
    phone: string | null
  }
  certifications?: Array<{
    id: string
    name: string
    issuingOrganization: string
    issueDate: string
  }>
  experiences?: Array<{
    id: string
    employmentType: string
    institutionName: string | null
    specialty: string
    startDate: string
    endDate: string | null
    description: string | null
  }>
  educations?: Array<{
    id: string
    degree: string
    school: string
    major: string
    graduationYear: string
  }>
}

interface TherapistInfoModalProps {
  therapist: Therapist | null
  isOpen: boolean
  onClose: () => void
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
  AGE_61_PLUS: '61개월 이상',
}

const degreeLabels: Record<string, string> = {
  HIGH_SCHOOL: '고등학교 졸업',
  ASSOCIATE: '전문학사',
  BACHELOR: '학사',
  MASTER: '석사',
  DOCTORATE: '박사',
}

const employmentTypeLabels: Record<string, string> = {
  INSTITUTION: '기관',
  FREELANCER: '프리랜서',
}

export default function TherapistInfoModal({ therapist, isOpen, onClose }: TherapistInfoModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen || !therapist) return null

  const parseJsonField = (field: string | null): string[] => {
    if (!field) return []
    try {
      return JSON.parse(field)
    } catch {
      return []
    }
  }

  const specialties = parseJsonField(therapist.specialties)
  const ageRanges = parseJsonField(therapist.childAgeRanges)
  const serviceAreas = parseJsonField(therapist.serviceAreas)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900">치료사 상세 정보</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-6">
          {/* 기본 정보 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">기본 정보</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">이름</p>
                <p className="text-base font-medium text-gray-900">{therapist.user.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">성별</p>
                <p className="text-base font-medium text-gray-900">
                  {therapist.gender === 'MALE' ? '남' : therapist.gender === 'FEMALE' ? '여' : '정보 없음'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">이메일</p>
                <p className="text-base font-medium text-gray-900">{therapist.user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">연락처</p>
                <p className="text-base font-medium text-gray-900">
                  {therapist.user.phone || '정보 없음'}
                </p>
              </div>
              {therapist.birthYear && (
                <div>
                  <p className="text-sm text-gray-500">출생연도</p>
                  <p className="text-base font-medium text-gray-900">{therapist.birthYear}년</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">구분</p>
                <p className="text-base font-medium text-gray-900">
                  {therapist.isPreTherapist ? '예비 치료사' : '정식 치료사'}
                </p>
              </div>
            </div>
          </div>

          {/* 주소 */}
          {therapist.address && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">주소</h3>
              <p className="text-base text-gray-900">
                {therapist.address}
                {therapist.addressDetail && ` ${therapist.addressDetail}`}
              </p>
            </div>
          )}

          {/* 전문 정보 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">전문 정보</h3>
            <div className="space-y-3">
              {specialties.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">전문 분야</p>
                  <div className="flex flex-wrap gap-2">
                    {specialties.map((spec) => (
                      <span
                        key={spec}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                      >
                        {specialtyLabels[spec] || spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {ageRanges.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">대상 아동 연령</p>
                  <div className="flex flex-wrap gap-2">
                    {ageRanges.map((range) => (
                      <span
                        key={range}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {ageRangeLabels[range] || range}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {serviceAreas.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">서비스 지역</p>
                  <div className="flex flex-wrap gap-2">
                    {serviceAreas.map((area) => (
                      <span
                        key={area}
                        className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {therapist.sessionFee && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">세션 비용 (50분 기준)</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ₩{therapist.sessionFee.toLocaleString()}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500 mb-1">언어 컨설팅 수행 가능</p>
                <p className="text-base text-gray-900">
                  {therapist.canDoConsultation ? '가능' : '불가능'}
                </p>
              </div>
            </div>
          </div>

          {/* 학력 */}
          {therapist.educations && therapist.educations.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">학력</h3>
              <div className="space-y-3">
                {therapist.educations.map((edu) => (
                  <div key={edu.id} className="border-l-4 border-aipoten-green pl-4">
                    <p className="font-medium text-gray-900">
                      {edu.school} - {edu.major}
                    </p>
                    <p className="text-sm text-gray-600">
                      {degreeLabels[edu.degree] || edu.degree} · {edu.graduationYear}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 자격증 */}
          {therapist.certifications && therapist.certifications.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">자격증</h3>
              <div className="space-y-3">
                {therapist.certifications.map((cert) => (
                  <div key={cert.id} className="border-l-4 border-blue-500 pl-4">
                    <p className="font-medium text-gray-900">{cert.name}</p>
                    <p className="text-sm text-gray-600">
                      {cert.issuingOrganization} · {new Date(cert.issueDate).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 경력 */}
          {therapist.experiences && therapist.experiences.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">경력</h3>
              <div className="space-y-3">
                {therapist.experiences.map((exp) => (
                  <div key={exp.id} className="border-l-4 border-purple-500 pl-4">
                    <p className="font-medium text-gray-900">
                      {exp.institutionName || employmentTypeLabels[exp.employmentType]}
                    </p>
                    <p className="text-sm text-gray-600">
                      {specialtyLabels[exp.specialty] || exp.specialty} ·{' '}
                      {new Date(exp.startDate).toLocaleDateString('ko-KR')} -{' '}
                      {exp.endDate ? new Date(exp.endDate).toLocaleDateString('ko-KR') : '현재'}
                    </p>
                    {exp.description && (
                      <p className="text-sm text-gray-600 mt-1">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 자기소개 */}
          {therapist.introduction && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">자기소개</h3>
              <p className="text-base text-gray-900 whitespace-pre-wrap">{therapist.introduction}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}
