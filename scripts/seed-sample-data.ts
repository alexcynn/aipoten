import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 샘플 데이터 생성 시작...')

  // 기존 관리자 계정의 비밀번호 해시 가져오기
  const adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  })

  if (!adminUser) {
    console.error('❌ 관리자 계정이 없습니다. 먼저 관리자 계정을 생성해주세요.')
    return
  }

  // 관리자와 동일한 비밀번호 해시 사용 (테스트용)
  const password = adminUser.password
  console.log('✅ 기존 관리자 비밀번호 해시 사용 (password123)')

  // 1. 부모 유저 생성

  const parent1 = await prisma.user.upsert({
    where: { email: 'parent1@test.com' },
    update: {},
    create: {
      email: 'parent1@test.com',
      password,
      name: '김민수',
      phone: '010-1234-5678',
      role: 'PARENT',
    },
  })
  console.log('✅ 부모1 생성:', parent1.email)

  const parent2 = await prisma.user.upsert({
    where: { email: 'parent2@test.com' },
    update: {},
    create: {
      email: 'parent2@test.com',
      password,
      name: '이영희',
      phone: '010-2345-6789',
      role: 'PARENT',
    },
  })
  console.log('✅ 부모2 생성:', parent2.email)

  // 2. 치료사 유저 생성
  const therapistUser1 = await prisma.user.upsert({
    where: { email: 'therapist1@test.com' },
    update: {},
    create: {
      email: 'therapist1@test.com',
      password,
      name: '박지현',
      phone: '010-3456-7890',
      role: 'THERAPIST',
    },
  })
  console.log('✅ 치료사1 생성:', therapistUser1.email)

  const therapistUser2 = await prisma.user.upsert({
    where: { email: 'therapist2@test.com' },
    update: {},
    create: {
      email: 'therapist2@test.com',
      password,
      name: '최수진',
      phone: '010-4567-8901',
      role: 'THERAPIST',
    },
  })
  console.log('✅ 치료사2 생성:', therapistUser2.email)

  // 3. 치료사 프로필 생성
  const therapist1 = await prisma.therapistProfile.upsert({
    where: { userId: therapistUser1.id },
    update: {},
    create: {
      userId: therapistUser1.id,
      gender: 'FEMALE',
      birthYear: 1985,
      address: '서울특별시 강남구 테헤란로 123',
      addressDetail: '아이포텐빌딩 5층',
      specialties: JSON.stringify(['SPEECH_THERAPY', 'SENSORY_INTEGRATION']),
      childAgeRanges: JSON.stringify(['AGE_0_12', 'AGE_13_24', 'AGE_25_36']),
      serviceAreas: JSON.stringify(['서울 강남구', '서울 서초구']),
      sessionFee: 80000,
      isPreTherapist: false,
      canDoConsultation: true,
      education: '언어치료학 석사',
      introduction: '10년 경력의 언어치료 전문가입니다. 아동의 언어 발달을 돕는 것이 저의 사명입니다.',
      approvalStatus: 'APPROVED',
    },
  })
  console.log('✅ 치료사1 프로필 생성')

  const therapist2 = await prisma.therapistProfile.upsert({
    where: { userId: therapistUser2.id },
    update: {},
    create: {
      userId: therapistUser2.id,
      gender: 'FEMALE',
      birthYear: 1990,
      address: '서울특별시 송파구 올림픽로 456',
      addressDetail: '케어센터 3층',
      specialties: JSON.stringify(['PLAY_THERAPY', 'ART_THERAPY', 'COGNITIVE_THERAPY']),
      childAgeRanges: JSON.stringify(['AGE_25_36', 'AGE_37_48', 'AGE_49_60']),
      serviceAreas: JSON.stringify(['서울 송파구', '서울 강동구']),
      sessionFee: 90000,
      isPreTherapist: false,
      canDoConsultation: true,
      education: '놀이치료학 박사',
      introduction: '놀이를 통한 아동 발달 촉진 전문가입니다.',
      approvalStatus: 'APPROVED',
    },
  })
  console.log('✅ 치료사2 프로필 생성')

  // 치료사 학력 추가
  await prisma.education.create({
    data: {
      therapistProfileId: therapist1.id,
      degree: 'MASTER',
      school: '서울대학교',
      major: '언어치료학',
      graduationYear: '2010',
    },
  })

  await prisma.education.create({
    data: {
      therapistProfileId: therapist2.id,
      degree: 'DOCTORATE',
      school: '연세대학교',
      major: '놀이치료학',
      graduationYear: '2018',
    },
  })

  // 치료사 자격증 추가
  await prisma.certification.create({
    data: {
      therapistProfileId: therapist1.id,
      name: '언어재활사 1급',
      issuingOrganization: '보건복지부',
      issueDate: new Date('2010-03-01'),
    },
  })

  await prisma.certification.create({
    data: {
      therapistProfileId: therapist2.id,
      name: '놀이치료사 자격증',
      issuingOrganization: '한국놀이치료학회',
      issueDate: new Date('2015-05-01'),
    },
  })

  // 치료사 경력 추가
  await prisma.experience.create({
    data: {
      therapistProfileId: therapist1.id,
      employmentType: 'INSTITUTION',
      institutionName: '서울아동발달센터',
      specialty: 'SPEECH_THERAPY',
      startDate: new Date('2010-04-01'),
      endDate: new Date('2020-12-31'),
      description: '언어치료 전문가로 근무',
    },
  })

  await prisma.experience.create({
    data: {
      therapistProfileId: therapist2.id,
      employmentType: 'INSTITUTION',
      institutionName: '강남 놀이치료센터',
      specialty: 'PLAY_THERAPY',
      startDate: new Date('2018-06-01'),
      endDate: null,
      description: '놀이치료 전문가로 재직 중',
    },
  })

  console.log('✅ 치료사 학력/자격증/경력 추가 완료')

  // 4. 아이들 생성
  const child1 = await prisma.child.create({
    data: {
      userId: parent1.id,
      name: '김서준',
      birthDate: new Date('2022-03-15'),
      gender: 'MALE',
      gestationalWeeks: 38,
      birthWeight: 3.2,
      currentHeight: 85,
      currentWeight: 12.5,
      medicalHistory: '특이사항 없음',
      familyHistory: '언어 발달 지연 가족력 있음',
      treatmentHistory: '6개월간 언어치료 받음',
      notes: '매우 활동적이며 호기심이 많음',
    },
  })
  console.log('✅ 아이1 생성:', child1.name)

  const child2 = await prisma.child.create({
    data: {
      userId: parent1.id,
      name: '김하은',
      birthDate: new Date('2021-07-20'),
      gender: 'FEMALE',
      gestationalWeeks: 40,
      birthWeight: 3.5,
      currentHeight: 95,
      currentWeight: 15.0,
      medicalHistory: '조산으로 인한 발달 지연',
      familyHistory: '없음',
      treatmentHistory: '1년간 발달치료 진행 중',
      notes: '조용하고 내성적임',
    },
  })
  console.log('✅ 아이2 생성:', child2.name)

  const child3 = await prisma.child.create({
    data: {
      userId: parent2.id,
      name: '이준호',
      birthDate: new Date('2023-01-10'),
      gender: 'MALE',
      gestationalWeeks: 39,
      birthWeight: 3.4,
      currentHeight: 75,
      currentWeight: 10.0,
      medicalHistory: '없음',
      familyHistory: '없음',
      treatmentHistory: '없음',
      notes: '건강하게 잘 자라고 있음',
    },
  })
  console.log('✅ 아이3 생성:', child3.name)

  // 5. TimeSlot 생성
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)

  const timeSlot1 = await prisma.timeSlot.create({
    data: {
      therapistId: therapist1.id,
      date: today,
      startTime: '10:00',
      endTime: '11:00',
      isAvailable: false,
    },
  })

  const timeSlot2 = await prisma.timeSlot.create({
    data: {
      therapistId: therapist1.id,
      date: tomorrow,
      startTime: '14:00',
      endTime: '15:00',
      isAvailable: false,
    },
  })

  const timeSlot3 = await prisma.timeSlot.create({
    data: {
      therapistId: therapist2.id,
      date: today,
      startTime: '11:00',
      endTime: '12:00',
      isAvailable: false,
    },
  })

  const timeSlot4 = await prisma.timeSlot.create({
    data: {
      therapistId: therapist2.id,
      date: nextWeek,
      startTime: '15:00',
      endTime: '16:00',
      isAvailable: false,
    },
  })

  console.log('✅ TimeSlot 생성 완료')

  // 6. 예약 생성
  const groupId1 = `group-${Date.now()}-1`
  const groupId2 = `group-${Date.now()}-2`
  const groupId3 = `group-${Date.now()}-3`

  // 6-1. 결제 대기 중인 언어 컨설팅 (단일)
  await prisma.booking.create({
    data: {
      parentUserId: parent1.id,
      childId: child1.id,
      therapistId: therapist1.id,
      timeSlotId: timeSlot1.id,
      sessionType: 'CONSULTATION',
      scheduledAt: today,
      duration: 60,
      sessionCount: 1,
      completedSessions: 0,
      originalFee: 100000,
      discountRate: 0,
      finalFee: 100000,
      status: 'PENDING_PAYMENT',
    },
  })
  console.log('✅ 언어 컨설팅 (결제대기) 생성')

  // 6-2. 결제 완료된 홈티 (그룹, 진행 중)
  await prisma.booking.create({
    data: {
      bookingGroupId: groupId1,
      parentUserId: parent1.id,
      childId: child1.id,
      therapistId: therapist1.id,
      timeSlotId: timeSlot2.id,
      sessionType: 'THERAPY',
      scheduledAt: tomorrow,
      duration: 50,
      sessionCount: 10,
      completedSessions: 3,
      originalFee: 80000,
      discountRate: 6,
      finalFee: 75000,
      status: 'CONFIRMED',
      paidAt: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), // 7일 전
    },
  })

  await prisma.booking.create({
    data: {
      bookingGroupId: groupId1,
      parentUserId: parent1.id,
      childId: child1.id,
      therapistId: therapist1.id,
      timeSlotId: timeSlot2.id,
      sessionType: 'THERAPY',
      scheduledAt: new Date(tomorrow.getTime() + 7 * 24 * 60 * 60 * 1000),
      duration: 50,
      sessionCount: 10,
      completedSessions: 3,
      originalFee: 80000,
      discountRate: 6,
      finalFee: 75000,
      status: 'CONFIRMED',
      paidAt: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
    },
  })
  console.log('✅ 홈티 그룹1 (결제완료, 진행중) 생성')

  // 6-3. 완료된 언어 컨설팅
  await prisma.booking.create({
    data: {
      parentUserId: parent2.id,
      childId: child3.id,
      therapistId: therapist2.id,
      timeSlotId: timeSlot3.id,
      sessionType: 'CONSULTATION',
      scheduledAt: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000), // 14일 전
      duration: 60,
      sessionCount: 1,
      completedSessions: 1,
      originalFee: 100000,
      discountRate: 0,
      finalFee: 100000,
      status: 'SESSION_COMPLETED',
      paidAt: new Date(today.getTime() - 21 * 24 * 60 * 60 * 1000), // 21일 전
    },
  })
  console.log('✅ 언어 컨설팅 (완료) 생성')

  // 6-4. 환불 요청된 홈티 (그룹)
  await prisma.booking.create({
    data: {
      bookingGroupId: groupId2,
      parentUserId: parent2.id,
      childId: child3.id,
      therapistId: therapist2.id,
      timeSlotId: timeSlot4.id,
      sessionType: 'THERAPY',
      scheduledAt: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000),
      duration: 50,
      sessionCount: 10,
      completedSessions: 2,
      originalFee: 90000,
      discountRate: 0,
      finalFee: 90000,
      status: 'REFUNDED',
      paidAt: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000),
      refundAmount: 72000, // 8회치 환불 (90000 * 8 / 10)
    },
  })

  await prisma.booking.create({
    data: {
      bookingGroupId: groupId2,
      parentUserId: parent2.id,
      childId: child3.id,
      therapistId: therapist2.id,
      timeSlotId: timeSlot4.id,
      sessionType: 'THERAPY',
      scheduledAt: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000),
      duration: 50,
      sessionCount: 10,
      completedSessions: 2,
      originalFee: 90000,
      discountRate: 0,
      finalFee: 90000,
      status: 'REFUNDED',
      paidAt: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000),
      refundAmount: 72000,
    },
  })
  console.log('✅ 홈티 그룹2 (환불) 생성')

  // 6-5. 결제 대기 중인 홈티 그룹 (부모2)
  await prisma.booking.create({
    data: {
      bookingGroupId: groupId3,
      parentUserId: parent1.id,
      childId: child2.id,
      therapistId: therapist2.id,
      timeSlotId: timeSlot3.id,
      sessionType: 'THERAPY',
      scheduledAt: nextWeek,
      duration: 50,
      sessionCount: 5,
      completedSessions: 0,
      originalFee: 90000,
      discountRate: 11,
      finalFee: 80000,
      status: 'PENDING_PAYMENT',
    },
  })

  await prisma.booking.create({
    data: {
      bookingGroupId: groupId3,
      parentUserId: parent1.id,
      childId: child2.id,
      therapistId: therapist2.id,
      timeSlotId: timeSlot3.id,
      sessionType: 'THERAPY',
      scheduledAt: new Date(nextWeek.getTime() + 7 * 24 * 60 * 60 * 1000),
      duration: 50,
      sessionCount: 5,
      completedSessions: 0,
      originalFee: 90000,
      discountRate: 11,
      finalFee: 80000,
      status: 'PENDING_PAYMENT',
    },
  })

  await prisma.booking.create({
    data: {
      bookingGroupId: groupId3,
      parentUserId: parent1.id,
      childId: child2.id,
      therapistId: therapist2.id,
      timeSlotId: timeSlot3.id,
      sessionType: 'THERAPY',
      scheduledAt: new Date(nextWeek.getTime() + 14 * 24 * 60 * 60 * 1000),
      duration: 50,
      sessionCount: 5,
      completedSessions: 0,
      originalFee: 90000,
      discountRate: 11,
      finalFee: 80000,
      status: 'PENDING_PAYMENT',
    },
  })
  console.log('✅ 홈티 그룹3 (결제대기) 생성')

  // 7. 시스템 설정 확인/생성
  await prisma.systemSettings.upsert({
    where: { id: 'system' },
    update: {},
    create: {
      id: 'system',
      bankName: '카카오뱅크',
      accountNumber: '3333-12-3456789',
      accountHolder: '(주)아이포텐',
      consultationBaseFee: 100000,
    },
  })
  console.log('✅ 시스템 설정 생성')

  console.log('\n🎉 샘플 데이터 생성 완료!')
  console.log('\n📋 테스트 계정:')
  console.log('부모1: parent1@test.com / password123')
  console.log('부모2: parent2@test.com / password123')
  console.log('치료사1: therapist1@test.com / password123')
  console.log('치료사2: therapist2@test.com / password123')
}

main()
  .catch((e) => {
    console.error('❌ 에러 발생:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
