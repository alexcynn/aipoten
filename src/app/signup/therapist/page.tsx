'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'

type TherapyType = 'SPEECH_THERAPY' | 'SENSORY_INTEGRATION' | 'PLAY_THERAPY' | 'ART_THERAPY' | 'MUSIC_THERAPY' | 'OCCUPATIONAL_THERAPY' | 'COGNITIVE_THERAPY' | 'BEHAVIORAL_THERAPY'
type EmploymentType = 'INSTITUTION' | 'FREELANCER'

interface Certification {
  name: string
  issuingOrganization: string
  issueDate: string
  filePath?: string
}

interface Experience {
  employmentType: EmploymentType
  institutionName?: string
  specialty: TherapyType
  startDate: string
  endDate?: string
  description?: string
}

const THERAPY_TYPES = [
  { value: 'SPEECH_THERAPY', label: '언어치료' },
  { value: 'SENSORY_INTEGRATION', label: '감각통합' },
  { value: 'PLAY_THERAPY', label: '놀이치료' },
  { value: 'ART_THERAPY', label: '미술치료' },
  { value: 'MUSIC_THERAPY', label: '음악치료' },
  { value: 'OCCUPATIONAL_THERAPY', label: '작업치료' },
  { value: 'COGNITIVE_THERAPY', label: '인지치료' },
  { value: 'BEHAVIORAL_THERAPY', label: '행동치료' },
]

const CHILD_AGE_RANGES = [
  { value: 'AGE_0_12', label: '0-12개월' },
  { value: 'AGE_13_24', label: '13-24개월' },
  { value: 'AGE_25_36', label: '25-36개월' },
  { value: 'AGE_37_48', label: '37-48개월' },
  { value: 'AGE_49_60', label: '49-60개월' },
  { value: 'AGE_5_7', label: '5-7세' },
  { value: 'AGE_8_PLUS', label: '8세 이상' },
]

const SEOUL_DISTRICTS = [
  '강남구', '서초구', '송파구', '강동구', '광진구', '성동구',
  '중구', '용산구', '성북구', '강북구', '도봉구', '노원구',
  '은평구', '서대문구', '마포구', '양천구', '강서구', '구로구',
  '금천구', '영등포구', '동작구', '관악구', '동대문구', '중랑구', '종로구'
]

export default function TherapistRegisterPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Step 1: Basic Info
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [name, setName] = useState('')
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | ''>('')
  const [birthYear, setBirthYear] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [addressDetail, setAddressDetail] = useState('')

  // Step 2: Professional Info
  const [specialties, setSpecialties] = useState<string[]>([])
  const [childAgeRanges, setChildAgeRanges] = useState<string[]>([])
  const [serviceAreas, setServiceAreas] = useState<string[]>([])
  const [sessionFee, setSessionFee] = useState('')

  // Step 3: Certifications & Experience
  const [certifications, setCertifications] = useState<Certification[]>([
    { name: '', issuingOrganization: '', issueDate: '' }
  ])
  const [experiences, setExperiences] = useState<Experience[]>([
    { employmentType: 'INSTITUTION', specialty: 'SPEECH_THERAPY', startDate: '' }
  ])

  const handleSpecialtyToggle = (value: string) => {
    setSpecialties(prev =>
      prev.includes(value) ? prev.filter(s => s !== value) : [...prev, value]
    )
  }

  const handleAgeRangeToggle = (value: string) => {
    setChildAgeRanges(prev =>
      prev.includes(value) ? prev.filter(a => a !== value) : [...prev, value]
    )
  }

  const handleServiceAreaToggle = (value: string) => {
    setServiceAreas(prev =>
      prev.includes(value) ? prev.filter(a => a !== value) : [...prev, value]
    )
  }

  const addCertification = () => {
    setCertifications([...certifications, { name: '', issuingOrganization: '', issueDate: '' }])
  }

  const removeCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index))
  }

  const updateCertification = (index: number, field: keyof Certification, value: string) => {
    const updated = [...certifications]
    updated[index] = { ...updated[index], [field]: value }
    setCertifications(updated)
  }

  const addExperience = () => {
    setExperiences([...experiences, { employmentType: 'INSTITUTION', specialty: 'SPEECH_THERAPY', startDate: '' }])
  }

  const removeExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index))
  }

  const updateExperience = (index: number, field: keyof Experience, value: any) => {
    const updated = [...experiences]
    updated[index] = { ...updated[index], [field]: value }
    setExperiences(updated)
  }

  const validateStep1 = () => {
    if (!email || !password || !passwordConfirm || !name || !phone) {
      alert('필수 정보를 모두 입력해주세요.')
      return false
    }
    if (password !== passwordConfirm) {
      alert('비밀번호가 일치하지 않습니다.')
      return false
    }
    if (password.length < 8) {
      alert('비밀번호는 8자 이상이어야 합니다.')
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (specialties.length === 0) {
      alert('최소 1개 이상의 치료 분야를 선택해주세요.')
      return false
    }
    if (childAgeRanges.length === 0) {
      alert('최소 1개 이상의 아이 나이 범위를 선택해주세요.')
      return false
    }
    if (serviceAreas.length === 0) {
      alert('최소 1개 이상의 서비스 지역을 선택해주세요.')
      return false
    }
    if (!sessionFee || parseInt(sessionFee) <= 0) {
      alert('세션 비용을 입력해주세요.')
      return false
    }
    return true
  }

  const validateStep3 = () => {
    if (certifications.some(c => !c.name || !c.issuingOrganization || !c.issueDate)) {
      alert('모든 자격증 정보를 입력해주세요.')
      return false
    }
    if (experiences.some(e => !e.specialty || !e.startDate)) {
      alert('모든 경력 정보를 입력해주세요.')
      return false
    }
    return true
  }

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return
    if (currentStep === 2 && !validateStep2()) return
    setCurrentStep(currentStep + 1)
  }

  const handleSubmit = async () => {
    if (!validateStep3()) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/auth/register/therapist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name,
          gender,
          birthYear: birthYear ? parseInt(birthYear) : null,
          phone,
          address,
          addressDetail,
          specialties,
          childAgeRanges,
          serviceAreas,
          sessionFee: parseInt(sessionFee),
          certifications,
          experiences,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '등록에 실패했습니다.')
      }

      alert('치료사 등록 신청이 완료되었습니다. 관리자 승인 후 로그인이 가능합니다.')
      router.push('/login')
    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-light">
      <Header />

      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Progress Bar */}
          <div className="bg-gradient-to-r from-brand-navy to-brand-green p-6">
            <h1 className="text-2xl font-bold text-white mb-4">치료사 회원가입</h1>
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex-1 flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      currentStep >= step ? 'bg-white text-brand-navy' : 'bg-brand-navy/50 text-white'
                    }`}
                  >
                    {step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        currentStep > step ? 'bg-white' : 'bg-brand-navy/50'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-sm text-white">기본 정보</span>
              <span className="text-sm text-white">전문 정보</span>
              <span className="text-sm text-white">자격증 · 경력</span>
            </div>
          </div>

          <div className="p-8">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">기본 정보</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이메일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-accent focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    비밀번호 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-accent focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    비밀번호 확인 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-accent focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-accent focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">성별</label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="MALE"
                        checked={gender === 'MALE'}
                        onChange={(e) => setGender('MALE')}
                        className="mr-2"
                      />
                      남성
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="FEMALE"
                        checked={gender === 'FEMALE'}
                        onChange={(e) => setGender('FEMALE')}
                        className="mr-2"
                      />
                      여성
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">생년</label>
                  <input
                    type="number"
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value)}
                    placeholder="1990"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-accent focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    전화번호 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="010-0000-0000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-accent focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">주소</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="서울시 강남구..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-accent focus:border-transparent mb-2"
                  />
                  <input
                    type="text"
                    value={addressDetail}
                    onChange={(e) => setAddressDetail(e.target.value)}
                    placeholder="상세주소"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-accent focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Professional Info */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">전문 정보</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    치료 분야 (중복 선택 가능) <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {THERAPY_TYPES.map(type => (
                      <label
                        key={type.value}
                        className={`flex items-center p-3 border-2 rounded-md cursor-pointer transition-colors ${
                          specialties.includes(type.value)
                            ? 'border-brand-accent bg-brand-accent/10'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={specialties.includes(type.value)}
                          onChange={() => handleSpecialtyToggle(type.value)}
                          className="mr-2"
                        />
                        {type.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    치료 가능 아이 나이 (중복 가능) <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {CHILD_AGE_RANGES.map(range => (
                      <label
                        key={range.value}
                        className={`flex items-center p-3 border-2 rounded-md cursor-pointer transition-colors ${
                          childAgeRanges.includes(range.value)
                            ? 'border-brand-accent bg-brand-accent/10'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={childAgeRanges.includes(range.value)}
                          onChange={() => handleAgeRangeToggle(range.value)}
                          className="mr-2"
                        />
                        {range.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    치료 가능 지역 - 서울특별시 (중복 가능) <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-2 max-h-64 overflow-y-auto p-4 border border-gray-300 rounded-md">
                    {SEOUL_DISTRICTS.map(district => (
                      <label
                        key={district}
                        className={`flex items-center p-2 border-2 rounded-md cursor-pointer transition-colors text-sm ${
                          serviceAreas.includes(district)
                            ? 'border-brand-accent bg-brand-accent/10'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={serviceAreas.includes(district)}
                          onChange={() => handleServiceAreaToggle(district)}
                          className="mr-2"
                        />
                        {district}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    세션 비용 (50분 기준) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={sessionFee}
                      onChange={(e) => setSessionFee(e.target.value)}
                      placeholder="80000"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-accent focus:border-transparent"
                      required
                    />
                    <span className="ml-2 text-gray-600">원</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Certifications & Experience */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">자격증 및 경력</h2>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">자격증</h3>
                    <button
                      type="button"
                      onClick={addCertification}
                      className="px-4 py-2 text-sm bg-brand-accent text-white rounded-md hover:opacity-90"
                    >
                      + 자격증 추가
                    </button>
                  </div>

                  {certifications.map((cert, index) => (
                    <div key={index} className="mb-6 p-4 border border-gray-300 rounded-md bg-gray-50">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-gray-900">자격증 {index + 1}</h4>
                        {certifications.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeCertification(index)}
                            className="text-red-600 text-sm hover:underline"
                          >
                            삭제
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            자격증명 <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={cert.name}
                            onChange={(e) => updateCertification(index, 'name', e.target.value)}
                            placeholder="언어치료사 1급"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            발급기관 <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={cert.issuingOrganization}
                            onChange={(e) => updateCertification(index, 'issuingOrganization', e.target.value)}
                            placeholder="한국언어치료사협회"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            취득일 <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            value={cert.issueDate}
                            onChange={(e) => updateCertification(index, 'issueDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            자격증 사본 (향후 업로드 기능 추가 예정)
                          </label>
                          <input
                            type="text"
                            placeholder="파일 경로"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                            disabled
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">경력</h3>
                    <button
                      type="button"
                      onClick={addExperience}
                      className="px-4 py-2 text-sm bg-brand-accent text-white rounded-md hover:opacity-90"
                    >
                      + 경력 추가
                    </button>
                  </div>

                  {experiences.map((exp, index) => (
                    <div key={index} className="mb-6 p-4 border border-gray-300 rounded-md bg-gray-50">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-gray-900">경력 {index + 1}</h4>
                        {experiences.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeExperience(index)}
                            className="text-red-600 text-sm hover:underline"
                          >
                            삭제
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            근무형태 <span className="text-red-500">*</span>
                          </label>
                          <div className="flex gap-4">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name={`employmentType-${index}`}
                                value="INSTITUTION"
                                checked={exp.employmentType === 'INSTITUTION'}
                                onChange={(e) => updateExperience(index, 'employmentType', 'INSTITUTION')}
                                className="mr-2"
                              />
                              기관
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name={`employmentType-${index}`}
                                value="FREELANCER"
                                checked={exp.employmentType === 'FREELANCER'}
                                onChange={(e) => updateExperience(index, 'employmentType', 'FREELANCER')}
                                className="mr-2"
                              />
                              프리랜서
                            </label>
                          </div>
                        </div>

                        {exp.employmentType === 'INSTITUTION' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              기관명
                            </label>
                            <input
                              type="text"
                              value={exp.institutionName || ''}
                              onChange={(e) => updateExperience(index, 'institutionName', e.target.value)}
                              placeholder="OO발달센터"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            치료분야 <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={exp.specialty}
                            onChange={(e) => updateExperience(index, 'specialty', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            required
                          >
                            {THERAPY_TYPES.map(type => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              시작일 <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="date"
                              value={exp.startDate}
                              onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              종료일 (재직 중이면 비워두세요)
                            </label>
                            <input
                              type="date"
                              value={exp.endDate || ''}
                              onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            설명
                          </label>
                          <textarea
                            value={exp.description || ''}
                            onChange={(e) => updateExperience(index, 'description', e.target.value)}
                            placeholder="영유아 언어발달 전담..."
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                disabled={currentStep === 1}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                이전
              </button>

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2 bg-brand-accent text-white rounded-md hover:opacity-90"
                >
                  다음
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-brand-green text-white rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '등록 중...' : '등록 신청'}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
