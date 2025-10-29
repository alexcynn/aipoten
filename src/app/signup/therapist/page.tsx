'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'

type TherapyType = 'SPEECH_THERAPY' | 'SENSORY_INTEGRATION' | 'PLAY_THERAPY' | 'ART_THERAPY' | 'MUSIC_THERAPY' | 'OCCUPATIONAL_THERAPY' | 'COGNITIVE_THERAPY' | 'BEHAVIORAL_THERAPY'
type EmploymentType = 'INSTITUTION' | 'FREELANCER'
type DegreeType = 'HIGH_SCHOOL' | 'ASSOCIATE' | 'BACHELOR' | 'MASTER' | 'DOCTORATE'

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

interface Education {
  degree: DegreeType
  school: string
  major: string
  graduationYear: string
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

const DEGREE_TYPES = [
  { value: 'HIGH_SCHOOL', label: '고등학교 졸업' },
  { value: 'ASSOCIATE', label: '전문학사' },
  { value: 'BACHELOR', label: '학사' },
  { value: 'MASTER', label: '석사' },
  { value: 'DOCTORATE', label: '박사' },
]

const BANKS = [
  'KB국민은행', '신한은행', '우리은행', '하나은행', 'NH농협은행',
  'IBK기업은행', 'SC제일은행', '씨티은행', '케이뱅크', '카카오뱅크',
  '토스뱅크', '대구은행', '부산은행', '경남은행', '광주은행',
  '전북은행', '제주은행', '새마을금고', '신협', '우체국'
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
  const [educations, setEducations] = useState<Education[]>([
    { degree: 'BACHELOR', school: '', major: '', graduationYear: '' }
  ])
  const [bank, setBank] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountHolder, setAccountHolder] = useState('')

  // Step 3: Certifications & Experience
  const [isPreTherapist, setIsPreTherapist] = useState(false)
  const [certifications, setCertifications] = useState<Certification[]>([
    { name: '', issuingOrganization: '', issueDate: '' }
  ])
  const [experiences, setExperiences] = useState<Experience[]>([])

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

  const addEducation = () => {
    setEducations([...educations, { degree: 'BACHELOR', school: '', major: '', graduationYear: '' }])
  }

  const removeEducation = (index: number) => {
    setEducations(educations.filter((_, i) => i !== index))
  }

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const updated = [...educations]
    updated[index] = { ...updated[index], [field]: value }
    setEducations(updated)
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

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      alert('올바른 이메일 형식을 입력해주세요. (예: example@email.com)')
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
    if (!bank) {
      alert('은행을 선택해주세요.')
      return false
    }
    if (!accountNumber) {
      alert('계좌번호를 입력해주세요.')
      return false
    }
    if (!accountHolder) {
      alert('예금주를 입력해주세요.')
      return false
    }
    return true
  }

  const validateStep3 = () => {
    // 예비 치료사가 아닌 경우에만 자격증 검증
    if (!isPreTherapist) {
      if (certifications.some(c => !c.name || !c.issuingOrganization || !c.issueDate)) {
        alert('모든 자격증 정보를 입력해주세요.')
        return false
      }
    }

    // 경력이 입력되어 있는 경우에만 검증 (선택 사항)
    if (experiences.length > 0 && experiences.some(e => !e.specialty || !e.startDate)) {
      alert('입력하신 경력 정보를 완성해주세요. (근무형태, 치료분야, 시작일은 필수입니다)')
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
          educations,
          bank,
          accountNumber,
          accountHolder,
          isPreTherapist,
          certifications: isPreTherapist ? [] : certifications,
          experiences: isPreTherapist ? [] : experiences,
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
          <div className="bg-slate-800 p-6">
            <h1 className="text-2xl font-bold text-white mb-4">치료사 회원가입</h1>
            <div className="relative flex justify-between items-center px-8 mb-4">
              {/* 연결선 */}
              <div className="absolute left-0 right-0 top-1/2 h-1 bg-white/30 -translate-y-1/2" style={{ left: 'calc(2rem + 28px)', right: 'calc(2rem + 28px)' }}></div>

              {/* 진행된 연결선 */}
              {currentStep > 1 && (
                <div className="absolute top-1/2 h-1 bg-green-500 -translate-y-1/2 transition-all" style={{
                  left: 'calc(2rem + 28px)',
                  width: currentStep === 2 ? 'calc(50% - 2rem - 28px)' : 'calc(100% - 4rem - 56px)'
                }}></div>
              )}

              {/* 숫자 원들 */}
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`relative w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg border-2 transition-all leading-none z-10 ${
                    currentStep >= step
                      ? 'bg-green-500 text-white border-green-500 shadow-lg'
                      : 'bg-slate-800 text-white border-white/40'
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
            <div className="flex justify-between px-4">
              <span className={`text-sm text-left flex-1 ${currentStep >= 1 ? 'text-green-400 font-medium' : 'text-white/70'}`}>기본 정보</span>
              <span className={`text-sm text-center flex-1 ${currentStep >= 2 ? 'text-green-400 font-medium' : 'text-white/70'}`}>전문 정보</span>
              <span className={`text-sm text-right flex-1 ${currentStep >= 3 ? 'text-green-400 font-medium' : 'text-white/70'}`}>자격증 · 경력</span>
            </div>
          </div>

          <div className="p-8">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">기본 정보</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이메일 (아이디로 사용됩니다) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    로그인 시 아이디로 사용됩니다
                  </p>
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

                {/* 은행 정보 */}
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">계좌 정보</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        은행 <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={bank}
                        onChange={(e) => setBank(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-accent focus:border-transparent"
                        required
                      >
                        <option value="">은행을 선택하세요</option>
                        {BANKS.map((bankName) => (
                          <option key={bankName} value={bankName}>
                            {bankName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        계좌번호 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value.replace(/[^0-9-]/g, ''))}
                        placeholder="123-456-789012"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-accent focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        예금주 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={accountHolder}
                        onChange={(e) => setAccountHolder(e.target.value)}
                        placeholder="홍길동"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-accent focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">학력</h3>
                    <button
                      type="button"
                      onClick={addEducation}
                      className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      + 학력 추가
                    </button>
                  </div>

                  {educations.map((edu, index) => (
                    <div key={index} className="mb-6 p-4 border border-gray-300 rounded-md bg-gray-50">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-gray-900">학력 {index + 1}</h4>
                        {educations.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeEducation(index)}
                            className="text-red-600 text-sm hover:underline"
                          >
                            삭제
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            학위 <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={edu.degree}
                            onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            required
                          >
                            {DEGREE_TYPES.map(type => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            학교명 <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={edu.school}
                            onChange={(e) => updateEducation(index, 'school', e.target.value)}
                            placeholder="서울대학교"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            전공 <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={edu.major}
                            onChange={(e) => updateEducation(index, 'major', e.target.value)}
                            placeholder="특수교육학"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            졸업년도 <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={edu.graduationYear}
                            onChange={(e) => updateEducation(index, 'graduationYear', e.target.value)}
                            placeholder="2020"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Certifications & Experience */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">자격증 및 경력</h2>

                {/* 예비 치료사 체크박스 */}
                <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPreTherapist}
                      onChange={(e) => setIsPreTherapist(e.target.checked)}
                      className="w-4 h-4 text-brand-accent border-gray-300 rounded focus:ring-brand-accent mr-3"
                    />
                    <div>
                      <span className="font-medium text-gray-900">
                        저는 예비 치료사입니다 (졸업 전)
                      </span>
                      <p className="text-sm text-gray-600 mt-1">
                        예비 치료사의 경우 자격증 및 경력 입력 없이도 신청이 가능합니다.
                      </p>
                    </div>
                  </label>
                </div>

                {/* 예비 치료사가 아닌 경우에만 자격증/경력 입력 */}
                {!isPreTherapist && (
                  <>
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">자격증</h3>
                        <button
                          type="button"
                          onClick={addCertification}
                          className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
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
                      className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      + 경력 추가
                    </button>
                  </div>

                  {experiences.length === 0 && (
                    <p className="text-sm text-gray-500 mb-4">
                      경력은 선택 사항입니다. 필요한 경우 "+ 경력 추가" 버튼을 클릭해주세요.
                    </p>
                  )}

                  {experiences.map((exp, index) => (
                    <div key={index} className="mb-6 p-4 border border-gray-300 rounded-md bg-gray-50">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-gray-900">경력 {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeExperience(index)}
                          className="text-red-600 text-sm hover:underline"
                        >
                          삭제
                        </button>
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
                  </>
                )}

                {/* 예비 치료사인 경우 안내 메시지 */}
                {isPreTherapist && (
                  <div className="bg-green-50 p-4 rounded-md border border-green-200">
                    <p className="text-sm text-gray-700">
                      예비 치료사로 신청하셨습니다. 졸업 후 자격증 및 경력 정보를 추가하실 수 있습니다.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                disabled={currentStep === 1}
                className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                이전
              </button>

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-md"
                >
                  다음
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
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
