import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createTestTherapists() {
  console.log('테스트 치료사 데이터 생성 시작...')

  const therapists = [
    {
      name: '김수진',
      email: 'therapist1@test.com',
      password: 'test1234',
      gender: 'FEMALE',
      birthYear: 1985,
      specialties: ['SPEECH_THERAPY', 'LANGUAGE'],
      childAgeRanges: ['AGE_0_12', 'AGE_13_24', 'AGE_25_36'],
      serviceAreas: ['서울 강남구', '서울 서초구'],
      sessionFee: 80000,
      consultationFee: 150000,
      consultationSettlementAmount: 120000,
      canDoConsultation: true,
      education: '이화여자대학교 언어병리학과 석사',
      introduction: '안녕하세요, 10년 이상의 경력을 가진 언어치료 전문가 김수진입니다.\n\n아이들의 언어 발달을 돕는 것이 저의 가장 큰 보람입니다. 각 아이의 개별적인 특성과 필요에 맞춘 맞춤형 치료를 제공합니다.\n\n부모님과의 소통을 중요시하며, 가정에서도 실천할 수 있는 구체적인 방법을 안내해 드립니다.',
      certifications: [
        {
          name: '언어재활사 1급',
          issuingOrganization: '보건복지부',
          issueDate: new Date('2015-03-15'),
        },
        {
          name: 'PROMPT 인증 치료사',
          issuingOrganization: 'PROMPT Institute',
          issueDate: new Date('2018-06-20'),
        },
      ],
      experiences: [
        {
          employmentType: 'INSTITUTION',
          institutionName: '서울아동발달센터',
          specialty: 'SPEECH_THERAPY',
          startDate: new Date('2015-03-01'),
          endDate: new Date('2020-02-28'),
        },
        {
          employmentType: 'FREELANCER',
          institutionName: '프리랜서',
          specialty: 'SPEECH_THERAPY',
          startDate: new Date('2020-03-01'),
          endDate: null,
        },
      ],
    },
    {
      name: '이민호',
      email: 'therapist2@test.com',
      password: 'test1234',
      gender: 'MALE',
      birthYear: 1988,
      specialties: ['SENSORY_INTEGRATION', 'OCCUPATIONAL_THERAPY'],
      childAgeRanges: ['AGE_13_24', 'AGE_25_36', 'AGE_37_48'],
      serviceAreas: ['서울 송파구', '서울 강동구'],
      sessionFee: 75000,
      consultationFee: 150000,
      consultationSettlementAmount: 120000,
      canDoConsultation: true,
      education: '연세대학교 작업치료학과 학사',
      introduction: '감각통합과 작업치료 전문가 이민호입니다.\n\n아이들의 감각 처리 능력과 일상생활 기술 향상을 위해 노력합니다. 놀이를 통한 자연스러운 치료 접근을 선호합니다.\n\n감각 조절 어려움, 소근육 발달 지연 등의 문제를 가진 아이들을 많이 치료해 왔습니다.',
      certifications: [
        {
          name: '작업치료사 면허',
          issuingOrganization: '보건복지부',
          issueDate: new Date('2012-02-20'),
        },
        {
          name: '감각통합치료 전문가',
          issuingOrganization: '대한감각통합치료학회',
          issueDate: new Date('2016-09-10'),
        },
      ],
      experiences: [
        {
          employmentType: 'INSTITUTION',
          institutionName: '강남소아발달클리닉',
          specialty: 'SENSORY_INTEGRATION',
          startDate: new Date('2012-03-01'),
          endDate: new Date('2019-12-31'),
        },
        {
          employmentType: 'FREELANCER',
          institutionName: '프리랜서',
          specialty: 'OCCUPATIONAL_THERAPY',
          startDate: new Date('2020-01-01'),
          endDate: null,
        },
      ],
    },
    {
      name: '박지영',
      email: 'therapist3@test.com',
      password: 'test1234',
      gender: 'FEMALE',
      birthYear: 1990,
      specialties: ['PLAY_THERAPY', 'COGNITIVE_THERAPY'],
      childAgeRanges: ['AGE_25_36', 'AGE_37_48', 'AGE_49_60'],
      serviceAreas: ['서울 강남구', '서울 송파구', '경기 성남시'],
      sessionFee: 70000,
      consultationFee: 150000,
      consultationSettlementAmount: 120000,
      canDoConsultation: true,
      education: '서울대학교 아동가족학과 석사',
      introduction: '놀이치료와 인지치료 전문가 박지영입니다.\n\n아이의 마음을 이해하고 놀이를 통해 치유하는 것을 목표로 합니다. 정서적 어려움, 사회성 발달 지연, 학습 준비 등 다양한 영역을 다룹니다.\n\n아이와 부모님 모두가 편안하게 느낄 수 있는 따뜻한 치료 환경을 제공합니다.',
      certifications: [
        {
          name: '놀이치료사 1급',
          issuingOrganization: '한국놀이치료학회',
          issueDate: new Date('2017-05-15'),
        },
        {
          name: '인지학습치료사',
          issuingOrganization: '한국인지학습치료학회',
          issueDate: new Date('2019-08-20'),
        },
      ],
      experiences: [
        {
          employmentType: 'INSTITUTION',
          institutionName: '행복한아이발달센터',
          specialty: 'PLAY_THERAPY',
          startDate: new Date('2017-06-01'),
          endDate: new Date('2021-05-31'),
        },
        {
          employmentType: 'FREELANCER',
          institutionName: '프리랜서',
          specialty: 'COGNITIVE_THERAPY',
          startDate: new Date('2021-06-01'),
          endDate: null,
        },
      ],
    },
    {
      name: '최현우',
      email: 'therapist4@test.com',
      password: 'test1234',
      gender: 'MALE',
      birthYear: 1983,
      specialties: ['SPEECH_THERAPY', 'BEHAVIORAL_THERAPY'],
      childAgeRanges: ['AGE_0_12', 'AGE_13_24', 'AGE_25_36', 'AGE_37_48'],
      serviceAreas: ['서울 서초구', '서울 강남구', '경기 과천시'],
      sessionFee: 85000,
      consultationFee: 150000,
      consultationSettlementAmount: 120000,
      canDoConsultation: true,
      education: '고려대학교 언어병리학과 박사',
      introduction: '15년 경력의 언어치료 전문가 최현우입니다.\n\n조음장애, 언어발달지연, 유창성 장애 등 다양한 언어 문제를 전문적으로 치료합니다. 행동치료와 결합한 통합적 접근을 통해 더 효과적인 치료를 제공합니다.\n\n대학병원과 사설 센터에서 쌓은 풍부한 임상 경험을 바탕으로 아이들을 돕고 있습니다.',
      certifications: [
        {
          name: '언어재활사 1급',
          issuingOrganization: '보건복지부',
          issueDate: new Date('2010-03-10'),
        },
        {
          name: '행동분석전문가(BCBA)',
          issuingOrganization: 'BACB',
          issueDate: new Date('2015-11-20'),
        },
      ],
      experiences: [
        {
          employmentType: 'INSTITUTION',
          institutionName: '삼성서울병원 재활의학과',
          specialty: 'SPEECH_THERAPY',
          startDate: new Date('2010-03-01'),
          endDate: new Date('2018-02-28'),
        },
        {
          employmentType: 'FREELANCER',
          institutionName: '프리랜서',
          specialty: 'BEHAVIORAL_THERAPY',
          startDate: new Date('2018-03-01'),
          endDate: null,
        },
      ],
    },
  ]

  for (const therapistData of therapists) {
    try {
      // 이미 존재하는지 확인
      const existingUser = await prisma.user.findUnique({
        where: { email: therapistData.email },
      })

      if (existingUser) {
        console.log(`이미 존재하는 사용자: ${therapistData.email}`)
        continue
      }

      // 비밀번호 해시
      const hashedPassword = await bcrypt.hash(therapistData.password, 10)

      // 사용자 및 치료사 프로필 생성
      const user = await prisma.user.create({
        data: {
          email: therapistData.email,
          password: hashedPassword,
          name: therapistData.name,
          role: 'THERAPIST',
          therapistProfile: {
            create: {
              gender: therapistData.gender,
              birthYear: therapistData.birthYear,
              specialties: JSON.stringify(therapistData.specialties),
              childAgeRanges: JSON.stringify(therapistData.childAgeRanges),
              serviceAreas: JSON.stringify(therapistData.serviceAreas),
              sessionFee: therapistData.sessionFee,
              consultationFee: therapistData.consultationFee,
              consultationSettlementAmount: therapistData.consultationSettlementAmount,
              canDoConsultation: therapistData.canDoConsultation,
              education: therapistData.education,
              introduction: therapistData.introduction,
              approvedAt: new Date(),
              certifications: {
                create: therapistData.certifications,
              },
              experiences: {
                create: therapistData.experiences,
              },
            },
          },
        },
        include: {
          therapistProfile: true,
        },
      })

      console.log(`치료사 생성 완료: ${therapistData.name} (${therapistData.email})`)
    } catch (error) {
      console.error(`치료사 생성 오류 (${therapistData.name}):`, error)
    }
  }

  console.log('\n테스트 치료사 데이터 생성 완료!')
  console.log('---')
  console.log('테스트 계정 정보:')
  therapists.forEach(t => {
    console.log(`- ${t.name}: ${t.email} / ${t.password}`)
  })
}

createTestTherapists()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
