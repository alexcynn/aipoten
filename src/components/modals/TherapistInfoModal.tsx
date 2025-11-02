'use client'

import { useEffect, useState } from 'react'
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
  const [activeTab, setActiveTab] = useState<'info' | 'education' | 'certifications' | 'experience'>('info')

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setActiveTab('info')
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
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">치료사 상세 정보</h2>
              {therapist.isPreTherapist && (
                <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  예비 치료사
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 -mb-px">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('info')}
                className={`py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'info'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                기본 정보
              </button>
              <button
                onClick={() => setActiveTab('education')}
                className={`py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'education'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                학력
              </button>
              {!therapist.isPreTherapist && (
                <>
                  <button
                    onClick={() => setActiveTab('certifications')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'certifications'
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    자격증
                  </button>
                  <button
                    onClick={() => setActiveTab('experience')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'experience'
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    경력
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* 기본 정보 탭 */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">기본 정보</h3>
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
                  {therapist.address && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">주소</p>
                      <p className="text-base font-medium text-gray-900">
                        {therapist.address}
                        {therapist.addressDetail && ` ${therapist.addressDetail}`}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 전문 정보 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">전문 정보</h3>
                <div className="space-y-4">
                  {specialties.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">전문 분야</p>
                      <div className="flex flex-wrap gap-2">
                        {specialties.map((spec) => (
                          <span
                            key={spec}
                            className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                          >
                            {specialtyLabels[spec] || spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {ageRanges.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">대상 아동 연령</p>
                      <div className="flex flex-wrap gap-2">
                        {ageRanges.map((range) => (
                          <span
                            key={range}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                          >
                            {ageRangeLabels[range] || range}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {serviceAreas.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">서비스 지역</p>
                      <div className="flex flex-wrap gap-2">
                        {serviceAreas.map((area) => (
                          <span
                            key={area}
                            className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
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
                      <p className="text-xl font-semibold text-gray-900">
                        ₩{therapist.sessionFee.toLocaleString()}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500 mb-1">언어 컨설팅 수행 가능</p>
                    <p className="text-base font-medium text-gray-900">
                      {therapist.canDoConsultation ? '가능' : '불가능'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 자기소개 */}
              {therapist.introduction && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">자기소개</h3>
                  <p className="text-base text-gray-900 whitespace-pre-wrap leading-relaxed">{therapist.introduction}</p>
                </div>
              )}
            </div>
          )}

          {/* 학력 탭 */}
          {activeTab === 'education' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">학력</h3>
              {therapist.educations && therapist.educations.length > 0 ? (
                <div className="space-y-4">
                  {therapist.educations.map((edu) => (
                    <div key={edu.id} className="border-l-4 border-green-500 pl-4 py-2 bg-gray-50 rounded-r">
                      <h4 className="font-bold text-gray-900">{degreeLabels[edu.degree] || edu.degree}</h4>
                      <p className="text-gray-700 mt-1">{edu.school} - {edu.major}</p>
                      <p className="text-sm text-gray-500 mt-1">{edu.graduationYear} 졸업</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">등록된 학력 정보가 없습니다.</p>
              )}
            </div>
          )}

          {/* 자격증 탭 */}
          {activeTab === 'certifications' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">자격증</h3>
              {therapist.certifications && therapist.certifications.length > 0 ? (
                <div className="space-y-4">
                  {therapist.certifications.map((cert) => (
                    <div key={cert.id} className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded-r">
                      <h4 className="font-bold text-gray-900">{cert.name}</h4>
                      <p className="text-gray-700 mt-1">발급기관: {cert.issuingOrganization}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        취득일: {new Date(cert.issueDate).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">등록된 자격증 정보가 없습니다.</p>
              )}
            </div>
          )}

          {/* 경력 탭 */}
          {activeTab === 'experience' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">경력</h3>
              {therapist.experiences && therapist.experiences.length > 0 ? (
                <div className="space-y-4">
                  {therapist.experiences.map((exp) => (
                    <div key={exp.id} className="border-l-4 border-purple-500 pl-4 py-2 bg-gray-50 rounded-r">
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-200 text-gray-700 rounded">
                          {employmentTypeLabels[exp.employmentType] || exp.employmentType}
                        </span>
                        <h4 className="font-bold text-gray-900">
                          {exp.institutionName || '프리랜서'}
                        </h4>
                      </div>
                      <p className="text-gray-700 mt-1">분야: {specialtyLabels[exp.specialty] || exp.specialty}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        기간: {new Date(exp.startDate).toLocaleDateString('ko-KR')} ~ {exp.endDate ? new Date(exp.endDate).toLocaleDateString('ko-KR') : '현재'}
                      </p>
                      {exp.description && (
                        <p className="text-gray-600 mt-2">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">등록된 경력 정보가 없습니다.</p>
              )}
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
