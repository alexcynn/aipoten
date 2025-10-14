import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 치료사 샘플 데이터 생성 시작...\n')

  // 1. 언어치료 전문가 - 김지은 (승인됨)
  const therapist1 = await createTherapist({
    email: 'jieun.kim@therapist.com',
    password: 'password123',
    name: '김지은',
    phone: '010-1234-5678',
    gender: 'FEMALE',
    birthYear: 1988,
    address: '서울시 강남구 역삼동',
    addressDetail: '123-45',
    specialties: ['SPEECH_THERAPY'],
    childAgeRanges: ['AGE_0_12', 'AGE_13_24', 'AGE_25_36'],
    serviceAreas: ['강남구', '서초구', '송파구'],
    sessionFee: 80000,
    approvalStatus: 'APPROVED',
    certifications: [
      {
        name: '언어치료사 1급',
        issuingOrganization: '한국언어치료사협회',
        issueDate: '2015-03-15',
      },
      {
        name: '언어재활사 2급',
        issuingOrganization: '보건복지부',
        issueDate: '2014-08-20',
      }
    ],
    experiences: [
      {
        employmentType: 'INSTITUTION',
        institutionName: '서울아동발달센터',
        specialty: 'SPEECH_THERAPY',
        startDate: '2015-04-01',
        endDate: '2020-12-31',
        description: '0-5세 영유아 언어 발달 지연 아동 치료'
      },
      {
        employmentType: 'FREELANCER',
        institutionName: null,
        specialty: 'SPEECH_THERAPY',
        startDate: '2021-01-01',
        endDate: null,
        description: '가정 방문 언어치료 전문'
      }
    ]
  })

  // 2. 감각통합 전문가 - 박민수 (승인됨)
  const therapist2 = await createTherapist({
    email: 'minsu.park@therapist.com',
    password: 'password123',
    name: '박민수',
    phone: '010-2345-6789',
    gender: 'MALE',
    birthYear: 1985,
    address: '서울시 서초구 반포동',
    addressDetail: '567-89',
    specialties: ['SENSORY_INTEGRATION'],
    childAgeRanges: ['AGE_13_24', 'AGE_25_36', 'AGE_37_48'],
    serviceAreas: ['서초구', '강남구', '동작구'],
    sessionFee: 90000,
    approvalStatus: 'APPROVED',
    certifications: [
      {
        name: '감각통합치료사 자격증',
        issuingOrganization: '대한감각통합치료학회',
        issueDate: '2012-06-10',
      },
      {
        name: '작업치료사 면허',
        issuingOrganization: '보건복지부',
        issueDate: '2010-09-15',
      }
    ],
    experiences: [
      {
        employmentType: 'INSTITUTION',
        institutionName: '강남세브란스병원 재활센터',
        specialty: 'SENSORY_INTEGRATION',
        startDate: '2010-10-01',
        endDate: '2018-03-31',
        description: '발달장애 아동 감각통합치료'
      },
      {
        employmentType: 'INSTITUTION',
        institutionName: '서초아동발달연구소',
        specialty: 'SENSORY_INTEGRATION',
        startDate: '2018-04-01',
        endDate: null,
        description: '수석 감각통합 치료사'
      }
    ]
  })

  // 3. 놀이치료 전문가 - 이수진 (승인 대기)
  const therapist3 = await createTherapist({
    email: 'sujin.lee@therapist.com',
    password: 'password123',
    name: '이수진',
    phone: '010-3456-7890',
    gender: 'FEMALE',
    birthYear: 1992,
    address: '서울시 송파구 잠실동',
    addressDetail: '234-56',
    specialties: ['PLAY_THERAPY'],
    childAgeRanges: ['AGE_25_36', 'AGE_37_48', 'AGE_49_60'],
    serviceAreas: ['송파구', '강동구', '광진구'],
    sessionFee: 75000,
    approvalStatus: 'PENDING',
    certifications: [
      {
        name: '놀이치료사 1급',
        issuingOrganization: '한국놀이치료학회',
        issueDate: '2020-05-20',
      }
    ],
    experiences: [
      {
        employmentType: 'INSTITUTION',
        institutionName: '햇살아동심리센터',
        specialty: 'PLAY_THERAPY',
        startDate: '2020-06-01',
        endDate: '2024-12-31',
        description: '유아 정서 및 사회성 발달 놀이치료'
      }
    ]
  })

  // 4. 미술치료 전문가 - 최영희 (승인됨)
  const therapist4 = await createTherapist({
    email: 'younghee.choi@therapist.com',
    password: 'password123',
    name: '최영희',
    phone: '010-4567-8901',
    gender: 'FEMALE',
    birthYear: 1990,
    address: '서울시 광진구 구의동',
    addressDetail: '789-12',
    specialties: ['ART_THERAPY'],
    childAgeRanges: ['AGE_25_36', 'AGE_37_48', 'AGE_49_60', 'AGE_5_7'],
    serviceAreas: ['광진구', '성동구', '강남구'],
    sessionFee: 70000,
    approvalStatus: 'APPROVED',
    certifications: [
      {
        name: '미술치료사 1급',
        issuingOrganization: '한국미술치료학회',
        issueDate: '2018-11-10',
      },
      {
        name: '임상미술치료사',
        issuingOrganization: '한국임상미술치료학회',
        issueDate: '2019-03-25',
      }
    ],
    experiences: [
      {
        employmentType: 'INSTITUTION',
        institutionName: '서울시립아동병원',
        specialty: 'ART_THERAPY',
        startDate: '2019-01-01',
        endDate: '2022-06-30',
        description: '아동 정서 장애 미술치료'
      },
      {
        employmentType: 'FREELANCER',
        institutionName: null,
        specialty: 'ART_THERAPY',
        startDate: '2022-07-01',
        endDate: null,
        description: '가정 및 센터 방문 미술치료'
      }
    ]
  })

  // 5. 언어+감각통합 복합 전문가 - 정민호 (승인됨)
  const therapist5 = await createTherapist({
    email: 'minho.jung@therapist.com',
    password: 'password123',
    name: '정민호',
    phone: '010-5678-9012',
    gender: 'MALE',
    birthYear: 1987,
    address: '서울시 강남구 삼성동',
    addressDetail: '345-67',
    specialties: ['SPEECH_THERAPY', 'SENSORY_INTEGRATION'],
    childAgeRanges: ['AGE_0_12', 'AGE_13_24', 'AGE_25_36', 'AGE_37_48'],
    serviceAreas: ['강남구', '서초구'],
    sessionFee: 100000,
    approvalStatus: 'APPROVED',
    certifications: [
      {
        name: '언어치료사 1급',
        issuingOrganization: '한국언어치료사협회',
        issueDate: '2013-05-15',
      },
      {
        name: '감각통합치료사 자격증',
        issuingOrganization: '대한감각통합치료학회',
        issueDate: '2014-09-20',
      },
      {
        name: '작업치료사 면허',
        issuingOrganization: '보건복지부',
        issueDate: '2012-03-10',
      }
    ],
    experiences: [
      {
        employmentType: 'INSTITUTION',
        institutionName: '삼성서울병원 발달센터',
        specialty: 'SPEECH_THERAPY',
        startDate: '2013-06-01',
        endDate: '2017-12-31',
        description: '언어 발달 지연 및 자폐 스펙트럼 아동 치료'
      },
      {
        employmentType: 'INSTITUTION',
        institutionName: '강남아이존발달센터',
        specialty: 'SENSORY_INTEGRATION',
        startDate: '2018-01-01',
        endDate: null,
        description: '센터장 / 언어 및 감각통합 복합치료 프로그램 운영'
      }
    ]
  })

  // 6. 음악치료 전문가 - 한소희 (승인됨)
  const therapist6 = await createTherapist({
    email: 'sohee.han@therapist.com',
    password: 'password123',
    name: '한소희',
    phone: '010-6789-0123',
    gender: 'FEMALE',
    birthYear: 1993,
    address: '서울시 마포구 상암동',
    addressDetail: '456-78',
    specialties: ['MUSIC_THERAPY'],
    childAgeRanges: ['AGE_13_24', 'AGE_25_36', 'AGE_37_48'],
    serviceAreas: ['마포구', '서대문구', '은평구'],
    sessionFee: 85000,
    approvalStatus: 'APPROVED',
    certifications: [
      {
        name: '음악치료사 1급',
        issuingOrganization: '한국음악치료학회',
        issueDate: '2019-07-15',
      },
      {
        name: '예술심리치료사',
        issuingOrganization: '한국예술치료학회',
        issueDate: '2020-02-10',
      }
    ],
    experiences: [
      {
        employmentType: 'INSTITUTION',
        institutionName: '서울시립장애인복지관',
        specialty: 'MUSIC_THERAPY',
        startDate: '2019-08-01',
        endDate: '2022-07-31',
        description: '발달장애 아동 음악치료 프로그램 운영'
      },
      {
        employmentType: 'FREELANCER',
        institutionName: null,
        specialty: 'MUSIC_THERAPY',
        startDate: '2022-08-01',
        endDate: null,
        description: '가정 방문 음악치료'
      }
    ]
  })

  console.log('\n✅ 치료사 샘플 데이터 생성 완료!')
  console.log(`\n생성된 치료사 목록:`)
  console.log(`1. ${therapist1.name} (${therapist1.email}) - 언어치료 전문 [승인됨]`)
  console.log(`2. ${therapist2.name} (${therapist2.email}) - 감각통합 전문 [승인됨]`)
  console.log(`3. ${therapist3.name} (${therapist3.email}) - 놀이치료 전문 [승인 대기]`)
  console.log(`4. ${therapist4.name} (${therapist4.email}) - 미술치료 전문 [승인됨]`)
  console.log(`5. ${therapist5.name} (${therapist5.email}) - 언어+감각통합 복합 [승인됨]`)
  console.log(`6. ${therapist6.name} (${therapist6.email}) - 음악치료 전문 [승인됨]`)
  console.log(`\n모든 계정의 비밀번호: password123`)
}

async function createTherapist(data: {
  email: string
  password: string
  name: string
  phone: string
  gender: 'MALE' | 'FEMALE'
  birthYear: number
  address: string
  addressDetail: string
  specialties: string[]
  childAgeRanges: string[]
  serviceAreas: string[]
  sessionFee: number
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED'
  certifications: Array<{
    name: string
    issuingOrganization: string
    issueDate: string
  }>
  experiences: Array<{
    employmentType: 'INSTITUTION' | 'FREELANCER'
    institutionName: string | null
    specialty: string
    startDate: string
    endDate: string | null
    description: string
  }>
}) {
  // Check if user already exists
  const existing = await prisma.user.findUnique({
    where: { email: data.email }
  })

  if (existing) {
    console.log(`⚠️  ${data.email} 이미 존재하는 사용자입니다. 건너뜁니다.`)
    return existing
  }

  const hashedPassword = await bcrypt.hash(data.password, 10)

  const result = await prisma.$transaction(async (tx) => {
    // 1. Create User
    const user = await tx.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        phone: data.phone,
        role: 'THERAPIST',
      }
    })

    // 2. Create TherapistProfile
    const therapistProfile = await tx.therapistProfile.create({
      data: {
        userId: user.id,
        gender: data.gender,
        birthYear: data.birthYear,
        address: data.address,
        addressDetail: data.addressDetail,
        specialties: JSON.stringify(data.specialties),
        childAgeRanges: JSON.stringify(data.childAgeRanges),
        serviceAreas: JSON.stringify(data.serviceAreas),
        sessionFee: data.sessionFee,
        approvalStatus: data.approvalStatus,
        status: data.approvalStatus === 'APPROVED' ? 'APPROVED' : 'PENDING',
        approvedAt: data.approvalStatus === 'APPROVED' ? new Date() : null,
      }
    })

    // 3. Create Certifications
    if (data.certifications.length > 0) {
      await tx.certification.createMany({
        data: data.certifications.map(cert => ({
          therapistProfileId: therapistProfile.id,
          name: cert.name,
          issuingOrganization: cert.issuingOrganization,
          issueDate: new Date(cert.issueDate),
        }))
      })
    }

    // 4. Create Experiences
    if (data.experiences.length > 0) {
      await tx.experience.createMany({
        data: data.experiences.map(exp => ({
          therapistProfileId: therapistProfile.id,
          employmentType: exp.employmentType,
          institutionName: exp.institutionName,
          specialty: exp.specialty as any,
          startDate: new Date(exp.startDate),
          endDate: exp.endDate ? new Date(exp.endDate) : null,
          description: exp.description,
        }))
      })
    }

    return user
  })

  console.log(`✅ ${data.name} (${data.email}) 생성 완료`)
  return result
}

main()
  .catch((e) => {
    console.error('❌ 에러 발생:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
