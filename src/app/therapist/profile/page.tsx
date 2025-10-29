'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
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

interface TherapistProfile {
  id: string
  user: {
    name: string
    email: string
    phone?: string
  }
  gender?: string
  birthYear?: number
  address?: string
  addressDetail?: string
  specialties: string[]
  childAgeRanges: string[]
  serviceAreas: string[]
  sessionFee?: number
  isPreTherapist: boolean
  education?: string
  educations?: Education[]
  certifications: Certification[]
  experiences: Experience[]
  approvalStatus: string
  profileUpdateRequested: boolean
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

// 서비스 가능 지역 코드 변환 함수
const getServiceAreaLabel = (area: string) => {
  const labels: { [key: string]: string } = {
    GANGNAM: '강남구',
    SEOCHO: '서초구',
    SONGPA: '송파구',
    GANGDONG: '강동구',
    GWANGJIN: '광진구',
    SEONGDONG: '성동구',
    JUNG: '중구',
    YONGSAN: '용산구',
    SEONGBUK: '성북구',
    GANGBUK: '강북구',
    DOBONG: '도봉구',
    NOWON: '노원구',
    EUNPYEONG: '은평구',
    SEODAEMUN: '서대문구',
    MAPO: '마포구',
    YANGCHEON: '양천구',
    GANGSEO: '강서구',
    GURO: '구로구',
    GEUMCHEON: '금천구',
    YEONGDEUNGPO: '영등포구',
    DONGJAK: '동작구',
    GWANAK: '관악구',
    DONGDAEMUN: '동대문구',
    JUNGNANG: '중랑구',
    JONGNO: '종로구',
  }
  return labels[area] || area
}

export default function TherapistProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isEditMode, setIsEditMode] = useState(false)
  const [activeTab, setActiveTab] = useState<'info' | 'education' | 'certifications' | 'experience'>('info')
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profile, setProfile] = useState<TherapistProfile | null>(null)
  const [hasPendingUpdate, setHasPendingUpdate] = useState(false)

  // Step 1: Basic Info
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
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
  const [experiences, setExperiences] = useState<Experience[]>([
    { employmentType: 'INSTITUTION', specialty: 'SPEECH_THERAPY', startDate: '' }
  ])

  // Memo field
  const [memo, setMemo] = useState('')

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
        console.log('프로필 데이터:', profileData)
        setProfile(profileData)

        // Load existing data
        setName(profileData.user.name || '')
        setEmail(profileData.user.email || '')
        setGender(profileData.gender || '')
        setBirthYear(profileData.birthYear?.toString() || '')
        setPhone(profileData.user.phone || '')
        setAddress(profileData.address || '')
        setAddressDetail(profileData.addressDetail || '')
        setSpecialties(profileData.specialties || [])
        setChildAgeRanges(profileData.childAgeRanges || [])
        setServiceAreas(profileData.serviceAreas || [])
        setSessionFee(profileData.sessionFee?.toString() || '')
        setBank(profileData.bank || '')
        setAccountNumber(profileData.accountNumber || '')
        setAccountHolder(profileData.accountHolder || '')
        setIsPreTherapist(profileData.isPreTherapist || false)

        if (profileData.educations && profileData.educations.length > 0) {
          setEducations(profileData.educations.map((edu: any) => ({
            degree: edu.degree || 'BACHELOR',
            school: edu.school || '',
            major: edu.major || '',
            graduationYear: edu.graduationYear || ''
          })))
        }

        if (profileData.certifications && profileData.certifications.length > 0) {
          setCertifications(profileData.certifications.map((cert: any) => ({
            name: cert.name || '',
            issuingOrganization: cert.issuingOrganization || '',
            issueDate: cert.issueDate ? cert.issueDate.split('T')[0] : '',
            filePath: cert.filePath || ''
          })))
        }

        if (profileData.experiences && profileData.experiences.length > 0) {
          setExperiences(profileData.experiences.map((exp: any) => ({
            employmentType: exp.employmentType || 'INSTITUTION',
            institutionName: exp.institutionName || '',
            specialty: exp.specialty || 'SPEECH_THERAPY',
            startDate: exp.startDate ? exp.startDate.split('T')[0] : '',
            endDate: exp.endDate ? exp.endDate.split('T')[0] : '',
            description: exp.description || ''
          })))
        }

        setHasPendingUpdate(profileData.profileUpdateRequested || false)
      }
    } catch (error) {
      console.error('프로필 조회 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

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
    if (!name || !phone) {
      alert('필수 정보를 모두 입력해주세요.')
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
    if (!isPreTherapist) {
      if (certifications.some(c => !c.name || !c.issuingOrganization || !c.issueDate)) {
        alert('모든 자격증 정보를 입력해주세요.')
        return false
      }
      if (experiences.some(e => !e.specialty || !e.startDate)) {
        alert('모든 경력 정보를 입력해주세요.')
        return false
      }
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
      const response = await fetch('/api/therapist/profile/request-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
          memo,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '저장에 실패했습니다.')
      }

      alert('프로필 수정 요청이 완료되었습니다. 관리자 승인 후 프로필이 변경됩니다.')
      setIsEditMode(false)
      setCurrentStep(1)
      await fetchProfile() // 프로필 새로고침
    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-neutral-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
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

      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Pending Update Warning */}
        {hasPendingUpdate && (
          <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-orange-400">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-orange-800">
                  프로필 수정 요청 승인 대기 중
                </h3>
                <div className="mt-2 text-sm text-orange-700">
                  <p>관리자 승인 후 프로필 변경사항이 반영됩니다.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Mode - Profile Display */}
        {!isEditMode && !profile && (
          <div className="bg-white shadow-lg rounded-lg p-6">
            <p className="text-gray-600">프로필 정보를 불러오는 중입니다...</p>
          </div>
        )}

        {!isEditMode && profile && (
          <div className="space-y-6">
            {console.log('보기 모드 렌더링, profile:', profile)}
            {/* Header with Edit Button */}
            <div className="bg-white shadow-lg rounded-lg p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">내 프로필</h1>
                  {profile.isPreTherapist && (
                    <span className="inline-block mt-2 px-4 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      예비 치료사
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    if (hasPendingUpdate) {
                      alert('프로필 수정 요청이 승인 대기 중입니다. 승인 후 다시 수정할 수 있습니다.')
                      return
                    }
                    setIsEditMode(true)
                    setCurrentStep(1)
                  }}
                  disabled={hasPendingUpdate}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  프로필 수정
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex">
                  <button
                    onClick={() => setActiveTab('info')}
                    className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'info'
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    기본 정보
                  </button>
                  <button
                    onClick={() => setActiveTab('education')}
                    className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'education'
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    학력
                  </button>
                  {!profile.isPreTherapist && (
                    <>
                      <button
                        onClick={() => setActiveTab('certifications')}
                        className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                          activeTab === 'certifications'
                            ? 'border-green-500 text-green-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        자격증
                      </button>
                      <button
                        onClick={() => setActiveTab('experience')}
                        className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
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

              <div className="p-6">
                {/* 기본 정보 탭 */}
                {activeTab === 'info' && (
                  <div className="space-y-6">
                    {/* Basic Info Section */}
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">기본 정보</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">이름</label>
                          <p className="text-lg text-gray-900">{profile.user.name}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">이메일</label>
                          <p className="text-lg text-gray-900">{profile.user.email}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">성별</label>
                          <p className="text-lg text-gray-900">{profile.gender === 'MALE' ? '남성' : profile.gender === 'FEMALE' ? '여성' : '미입력'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">생년</label>
                          <p className="text-lg text-gray-900">{profile.birthYear ? `${profile.birthYear}년생` : '미입력'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">전화번호</label>
                          <p className="text-lg text-gray-900">{profile.user.phone || '미입력'}</p>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-500 mb-1">주소</label>
                          <p className="text-lg text-gray-900">{profile.address || '미입력'}</p>
                          {profile.addressDetail && <p className="text-sm text-gray-600 mt-1">{profile.addressDetail}</p>}
                        </div>
                      </div>
                    </div>

                    {/* Professional Info Section */}
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">전문 정보</h2>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-2">치료 전문 분야</label>
                          <div className="flex flex-wrap gap-2">
                            {profile.specialties && profile.specialties.length > 0 ? (
                              profile.specialties.map((specialty) => (
                                <span key={specialty} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                  {THERAPY_TYPES.find(t => t.value === specialty)?.label || specialty}
                                </span>
                              ))
                            ) : (
                              <p className="text-gray-400 text-sm">미등록</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-2">아이 나이 범위</label>
                          <div className="flex flex-wrap gap-2">
                            {profile.childAgeRanges && profile.childAgeRanges.length > 0 ? (
                              profile.childAgeRanges.map((range) => (
                                <span key={range} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                  {CHILD_AGE_RANGES.find(r => r.value === range)?.label || range}
                                </span>
                              ))
                            ) : (
                              <p className="text-gray-400 text-sm">미등록</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-2">서비스 가능 지역</label>
                          <div className="flex flex-wrap gap-2">
                            {profile.serviceAreas && profile.serviceAreas.length > 0 ? (
                              profile.serviceAreas.map((area) => (
                                <span key={area} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                                  {getServiceAreaLabel(area)}
                                </span>
                              ))
                            ) : (
                              <p className="text-gray-400 text-sm">미등록</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">세션 비용 (50분 기준)</label>
                          <p className="text-lg text-gray-900">{profile.sessionFee?.toLocaleString()}원</p>
                        </div>
                      </div>
                    </div>

                    {/* 계좌 정보 */}
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">계좌 정보</h2>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">은행</label>
                          <p className="text-lg text-gray-900">{profile.bank || '미등록'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">계좌번호</label>
                          <p className="text-lg text-gray-900">{profile.accountNumber || '미등록'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">예금주</label>
                          <p className="text-lg text-gray-900">{profile.accountHolder || '미등록'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 학력 탭 */}
                {activeTab === 'education' && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">학력</h2>
                    {profile.educations && profile.educations.length > 0 ? (
                      <div className="space-y-4">
                        {profile.educations.map((edu, index) => (
                          <div key={index} className="border-l-4 border-green-500 pl-4 py-3 bg-gray-50 rounded-r">
                            <h3 className="font-bold text-lg text-gray-900">
                              {DEGREE_TYPES.find(d => d.value === edu.degree)?.label || edu.degree}
                            </h3>
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
                {activeTab === 'certifications' && !profile.isPreTherapist && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">자격증</h2>
                    {profile.certifications && profile.certifications.length > 0 ? (
                      <div className="space-y-4">
                        {profile.certifications.map((cert, index) => (
                          <div key={index} className="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 rounded-r">
                            <h3 className="font-bold text-lg text-gray-900">{cert.name}</h3>
                            <p className="text-gray-700 mt-1">{cert.issuingOrganization}</p>
                            <p className="text-sm text-gray-500 mt-1">{new Date(cert.issueDate).toLocaleDateString('ko-KR')}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">등록된 자격증 정보가 없습니다.</p>
                    )}
                  </div>
                )}

                {/* 경력 탭 */}
                {activeTab === 'experience' && !profile.isPreTherapist && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">경력</h2>
                    {profile.experiences && profile.experiences.length > 0 ? (
                      <div className="space-y-4">
                        {profile.experiences.map((exp, index) => (
                          <div key={index} className="border-l-4 border-purple-500 pl-4 py-3 bg-gray-50 rounded-r">
                            <h3 className="font-bold text-lg text-gray-900">
                              {exp.employmentType === 'INSTITUTION' ? '기관' : '프리랜서'} - {THERAPY_TYPES.find(t => t.value === exp.specialty)?.label}
                            </h3>
                            {exp.institutionName && <p className="text-gray-700 mt-1">{exp.institutionName}</p>}
                            <p className="text-sm text-gray-500 mt-1">
                              {new Date(exp.startDate).toLocaleDateString('ko-KR')} - {exp.endDate ? new Date(exp.endDate).toLocaleDateString('ko-KR') : '현재'}
                            </p>
                            {exp.description && <p className="text-gray-600 mt-2">{exp.description}</p>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">등록된 경력 정보가 없습니다.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Edit Mode - Form */}
        {isEditMode && (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Progress Bar */}
          <div className="bg-slate-800 p-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-white">프로필 수정</h1>
              <button
                onClick={() => {
                  if (confirm('수정을 취소하시겠습니까? 변경사항이 저장되지 않습니다.')) {
                    setIsEditMode(false)
                    setCurrentStep(1)
                  }
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                취소
              </button>
            </div>
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
                    이메일 (변경 불가)
                  </label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent mb-2"
                  />
                  <input
                    type="text"
                    value={addressDetail}
                    onChange={(e) => setAddressDetail(e.target.value)}
                    placeholder="상세주소"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                            ? 'border-green-500 bg-green-50'
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
                            ? 'border-green-500 bg-green-50'
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
                            ? 'border-green-500 bg-green-50'
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                      className="w-4 h-4 text-green-500 border-gray-300 rounded focus:ring-green-500 mr-3"
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
                          등록된 경력이 없습니다. 필요한 경우 "+ 경력 추가" 버튼을 클릭해주세요.
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
                      예비 치료사로 등록되었습니다. 졸업 후 자격증 및 경력 정보를 추가하실 수 있습니다.
                    </p>
                  </div>
                )}

                {/* Memo field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    수정 요청 메모 (선택 사항)
                  </label>
                  <textarea
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder="프로필 수정 사유나 특이사항을 작성해주세요."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
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
                  {isSubmitting ? '요청 중...' : '저장 및 승인 요청'}
                </button>
              )}
            </div>
          </div>
        </div>
        )}
      </main>
    </div>
  )
}
