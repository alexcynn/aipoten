/**
 * 테스트 데이터 생성 스크립트 - Payment 중심 구조
 *
 * Payment → Booking 1:다 관계로 변경됨
 * 한 번의 결제로 여러 세션(Booking) 생성
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // 1. 기존 테스트 데이터 삭제 (순서 중요: 외래 키 관계)
  console.log('🗑️  Cleaning existing test data...')
  await prisma.refundRequest.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.timeSlot.deleteMany()
  await prisma.developmentAssessment.deleteMany()
  await prisma.therapistProfile.deleteMany()
  await prisma.child.deleteMany()
  await prisma.inquiry.deleteMany()
  await prisma.user.deleteMany({
    where: {
      email: {
        in: [
          'parent1@test.com',
          'parent2@test.com',
          'therapist1@test.com',
          'therapist2@test.com',
          'therapist3@test.com',
          'admin@test.com'
        ]
      }
    }
  })

  // 2. 사용자 생성
  console.log('👥 Creating users...')
  const password = await bcrypt.hash('password123', 10)

  const admin = await prisma.user.create({
    data: {
      email: 'admin@test.com',
      name: '관리자',
      password,
      role: 'ADMIN',
      phone: '010-0000-0000',
    }
  })

  const parent1 = await prisma.user.create({
    data: {
      email: 'parent1@test.com',
      name: '김부모',
      password,
      role: 'PARENT',
      phone: '010-1111-1111',
      address: '서울시 강남구 테헤란로 123',
      addressDetail: '101호',
    }
  })

  const parent2 = await prisma.user.create({
    data: {
      email: 'parent2@test.com',
      name: '이부모',
      password,
      role: 'PARENT',
      phone: '010-2222-2222',
      address: '서울시 서초구 반포대로 456',
      addressDetail: '202호',
    }
  })

  const therapist1User = await prisma.user.create({
    data: {
      email: 'therapist1@test.com',
      name: '박치료사',
      password,
      role: 'THERAPIST',
      phone: '010-3333-3333',
    }
  })

  const therapist2User = await prisma.user.create({
    data: {
      email: 'therapist2@test.com',
      name: '최치료사',
      password,
      role: 'THERAPIST',
      phone: '010-4444-4444',
    }
  })

  const therapist3User = await prisma.user.create({
    data: {
      email: 'therapist3@test.com',
      name: '정치료사',
      password,
      role: 'THERAPIST',
      phone: '010-5555-5555',
    }
  })

  // 3. 아이 생성
  console.log('👶 Creating children...')
  const child1 = await prisma.child.create({
    data: {
      userId: parent1.id,
      name: '김민준',
      birthDate: new Date('2021-03-15'),
      gender: 'MALE',
    }
  })

  const child2 = await prisma.child.create({
    data: {
      userId: parent1.id,
      name: '김서윤',
      birthDate: new Date('2022-07-20'),
      gender: 'FEMALE',
    }
  })

  const child3 = await prisma.child.create({
    data: {
      userId: parent2.id,
      name: '이준호',
      birthDate: new Date('2020-11-05'),
      gender: 'MALE',
    }
  })

  // 4. 치료사 프로필 생성
  console.log('👩‍⚕️ Creating therapist profiles...')
  const therapist1 = await prisma.therapistProfile.create({
    data: {
      userId: therapist1User.id,
      specialty: 'SPEECH_THERAPY',
      specialties: JSON.stringify(['SPEECH_THERAPY']),
      childAgeRanges: JSON.stringify(['AGE_13_24', 'AGE_25_36', 'AGE_37_48']),
      serviceAreas: JSON.stringify(['서울시 강남구', '서울시 서초구']),
      licenseNumber: 'LIC-001',
      experience: 5,
      education: '언어치료학 석사',
      introduction: '언어발달지연 아동 전문 5년 경력. 언어재활사 1급, 언어발달 전문가.',
      consultationFee: 80000,
      sessionFee: 60000,
      canDoConsultation: true,
      status: 'APPROVED',
      approvalStatus: 'APPROVED',
      approvedAt: new Date(),
      approvedBy: admin.id,
      gender: 'FEMALE',
      birthYear: 1988,
      bank: '국민은행',
      accountNumber: '123-456-789012',
      accountHolder: '박치료사',
    }
  })

  const therapist2 = await prisma.therapistProfile.create({
    data: {
      userId: therapist2User.id,
      specialty: 'PLAY_THERAPY',
      specialties: JSON.stringify(['PLAY_THERAPY', 'ART_THERAPY']),
      childAgeRanges: JSON.stringify(['AGE_25_36', 'AGE_37_48', 'AGE_49_60']),
      serviceAreas: JSON.stringify(['서울시 강남구', '서울시 송파구']),
      licenseNumber: 'LIC-002',
      experience: 7,
      education: '놀이치료학 박사',
      introduction: '정서행동 발달 전문 7년 경력. 놀이치료사 1급.',
      consultationFee: 90000,
      sessionFee: 70000,
      canDoConsultation: true,
      status: 'APPROVED',
      approvalStatus: 'APPROVED',
      approvedAt: new Date(),
      approvedBy: admin.id,
      gender: 'FEMALE',
      birthYear: 1985,
      bank: '신한은행',
      accountNumber: '987-654-321098',
      accountHolder: '최치료사',
    }
  })

  const therapist3 = await prisma.therapistProfile.create({
    data: {
      userId: therapist3User.id,
      specialty: 'COGNITIVE_THERAPY',
      specialties: JSON.stringify(['COGNITIVE_THERAPY']),
      childAgeRanges: JSON.stringify(['AGE_37_48', 'AGE_49_60']),
      serviceAreas: JSON.stringify(['서울시 강남구']),
      licenseNumber: 'LIC-003',
      experience: 3,
      education: '인지치료학 석사',
      introduction: '인지발달 전문 3년 경력.',
      consultationFee: 75000,
      sessionFee: 55000,
      canDoConsultation: false,
      status: 'PENDING',
      approvalStatus: 'PENDING',
      gender: 'MALE',
      birthYear: 1992,
    }
  })

  // 5. 타임슬롯 생성 (다음 2주)
  console.log('⏰ Creating time slots...')
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const timeSlots = []
  for (let day = 0; day < 14; day++) {
    const date = new Date(today)
    date.setDate(date.getDate() + day)

    // 평일만
    if (date.getDay() !== 0) {
      for (const therapist of [therapist1, therapist2]) {
        for (let hour = 9; hour < 18; hour++) {
          const slot = await prisma.timeSlot.create({
            data: {
              therapistId: therapist.id,
              date: date,
              startTime: `${hour.toString().padStart(2, '0')}:00`,
              endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
              isAvailable: true,
            }
          })
          timeSlots.push(slot)
        }
      }
    }
  }

  // 6. Payment → Booking 생성 (Payment 중심)
  console.log('💰 Creating payments and bookings...')

  // 6-1. 완료된 언어컨설팅 (1회, 결제 완료, 상담일지 작성됨)
  const payment1 = await prisma.payment.create({
    data: {
      parentUserId: parent1.id,
      childId: child1.id,
      therapistId: therapist1.id,
      sessionType: 'CONSULTATION',
      totalSessions: 1,
      originalFee: 80000,
      discountRate: 0,
      finalFee: 80000,
      status: 'PAID',
      paymentMethod: '신용카드',
      paymentId: 'PAY-' + Date.now(),
      paidAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      settlementAmount: 72000,
      settledAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    }
  })

  const slot1 = timeSlots[0]
  await prisma.booking.create({
    data: {
      paymentId: payment1.id,
      sessionNumber: 1,
      timeSlotId: slot1.id,
      parentUserId: parent1.id,
      childId: child1.id,
      therapistId: therapist1.id,
      scheduledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      duration: 50,
      status: 'COMPLETED',
      completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      parentNote: '아이가 말이 늦어서 걱정입니다.',
      therapistNote: `[상담 일지 - 1회차]

아동: 김민준 (만 3세 8개월)
일시: ${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString('ko-KR')}

1. 주 호소
- 또래에 비해 표현 언어가 부족함
- 단어 조합이 어려움 (2어문 수준)
- 발음이 부정확함

2. 평가 결과
- 수용 언어: 36개월 수준 (정상 범위)
- 표현 언어: 24개월 수준 (지연)
- 조음 능력: 초성 일부 생략, 종성 대부분 생략

3. 상담 내용
- 가정에서 언어 자극 방법 안내
- 그림책 활용한 언어 발달 촉진 방법
- 반복과 확장 기법 교육

4. 권장 사항
- 주 2회 언어치료 권장 (12회 과정)
- 가정에서 일일 15분 언어 놀이 실천
- 다음 평가: 3개월 후

부모님께서 적극적으로 협조해주셔서 좋은 결과가 기대됩니다.`,
    }
  })

  // 6-2. 진행 중인 홈티 (4회 패키지, 2회 완료, 2회 예정)
  const payment2 = await prisma.payment.create({
    data: {
      parentUserId: parent1.id,
      childId: child1.id,
      therapistId: therapist1.id,
      sessionType: 'THERAPY',
      totalSessions: 4,
      originalFee: 240000,
      discountRate: 5,
      finalFee: 228000,
      status: 'PAID',
      paymentMethod: '계좌이체',
      paymentId: 'PAY-' + (Date.now() + 1),
      paidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    }
  })

  // 1회차 완료
  await prisma.booking.create({
    data: {
      paymentId: payment2.id,
      sessionNumber: 1,
      timeSlotId: timeSlots[10].id,
      parentUserId: parent1.id,
      childId: child1.id,
      therapistId: therapist1.id,
      scheduledAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      duration: 50,
      status: 'COMPLETED',
      completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      parentNote: '주 2회 방문 부탁드립니다.',
      therapistNote: `[치료 일지 - 1회차]

오늘의 목표:
- 단어 모방 훈련
- 기본 조음 연습

활동 내용:
1. 동물 이름 카드 활용 (10분)
2. 입모양 따라하기 게임 (15분)
3. 동요 부르기 (10분)
4. 그림책 읽기 (15분)

관찰 사항:
- 집중력 양호 (40분 이상 유지)
- 엄마 카드에 반응 좋음
- "빠빠", "마마" 모방 시도

다음 회기 계획:
- 입술 조음 강화
- 2어문 조합 연습`,
    }
  })

  // 2회차 완료
  await prisma.booking.create({
    data: {
      paymentId: payment2.id,
      sessionNumber: 2,
      timeSlotId: timeSlots[12].id,
      parentUserId: parent1.id,
      childId: child1.id,
      therapistId: therapist1.id,
      scheduledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      duration: 50,
      status: 'COMPLETED',
      completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      therapistNote: `[치료 일지 - 2회차]

오늘의 목표:
- 2어문 조합 연습
- 입술 조음 강화

진전 사항:
- "엄마 좋아", "아빠 가" 표현 성공
- 입술 조음 ("빠", "마") 정확도 향상

활동 내용:
1. 낱말 카드 조합 놀이 (15분)
2. 비누방울 불기 (10분) - 입술 근육 강화
3. 역할 놀이 (15분)
4. 자유 대화 (10분)

숙제:
- 하루 3번 거울 보며 "빠빠" 연습
- 가족과 2어문으로 대화하기`,
    }
  })

  // 3회차 예정
  await prisma.booking.create({
    data: {
      paymentId: payment2.id,
      sessionNumber: 3,
      timeSlotId: timeSlots[20].id,
      parentUserId: parent1.id,
      childId: child1.id,
      therapistId: therapist1.id,
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      duration: 50,
      status: 'SCHEDULED',
    }
  })

  // 4회차 예정
  await prisma.booking.create({
    data: {
      paymentId: payment2.id,
      sessionNumber: 4,
      timeSlotId: timeSlots[23].id,
      parentUserId: parent1.id,
      childId: child1.id,
      therapistId: therapist1.id,
      scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      duration: 50,
      status: 'SCHEDULED',
    }
  })

  // 6-3. 결제 대기 중인 언어컨설팅 (입금 확인 대기)
  const payment3 = await prisma.payment.create({
    data: {
      parentUserId: parent2.id,
      childId: child3.id,
      therapistId: therapist2.id,
      sessionType: 'CONSULTATION',
      totalSessions: 1,
      originalFee: 90000,
      discountRate: 0,
      finalFee: 90000,
      status: 'PENDING_PAYMENT',
      depositName: '이준호',
      depositDate: new Date(),
    }
  })

  await prisma.booking.create({
    data: {
      paymentId: payment3.id,
      sessionNumber: 1,
      timeSlotId: timeSlots[30].id,
      parentUserId: parent2.id,
      childId: child3.id,
      therapistId: therapist2.id,
      scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      duration: 50,
      status: 'SCHEDULED',
      parentNote: '정서적으로 예민한 편이에요.',
    }
  })

  // 6-4. 결제 대기 중인 홈티 (8회 패키지)
  const payment4 = await prisma.payment.create({
    data: {
      parentUserId: parent2.id,
      childId: child3.id,
      therapistId: therapist2.id,
      sessionType: 'THERAPY',
      totalSessions: 8,
      originalFee: 560000,
      discountRate: 10,
      finalFee: 504000,
      status: 'PENDING_PAYMENT',
    }
  })

  // 8개 세션 생성
  for (let i = 1; i <= 8; i++) {
    await prisma.booking.create({
      data: {
        paymentId: payment4.id,
        sessionNumber: i,
        timeSlotId: timeSlots[40 + i].id,
        parentUserId: parent2.id,
        childId: child3.id,
        therapistId: therapist2.id,
        scheduledAt: new Date(Date.now() + (i * 3 + 1) * 24 * 60 * 60 * 1000),
        duration: 50,
        status: 'SCHEDULED',
        parentNote: i === 1 ? '가능하면 오전 시간으로 부탁드립니다.' : undefined,
      }
    })
  }

  // 6-5. 환불 완료된 예약 (언어컨설팅)
  const payment5 = await prisma.payment.create({
    data: {
      parentUserId: parent1.id,
      childId: child2.id,
      therapistId: therapist1.id,
      sessionType: 'CONSULTATION',
      totalSessions: 1,
      originalFee: 80000,
      discountRate: 0,
      finalFee: 80000,
      status: 'REFUNDED',
      paymentMethod: '신용카드',
      paymentId: 'PAY-' + (Date.now() + 5),
      paidAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      refundedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      refundAmount: 80000,
      refundReason: '고객 요청',
    }
  })

  await prisma.booking.create({
    data: {
      paymentId: payment5.id,
      sessionNumber: 1,
      timeSlotId: timeSlots[5].id,
      parentUserId: parent1.id,
      childId: child2.id,
      therapistId: therapist1.id,
      scheduledAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      duration: 50,
      status: 'CANCELLED',
      cancelledAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      cancelledBy: parent1.id,
      cancellationReason: '개인 사정으로 인한 취소',
    }
  })

  await prisma.refundRequest.create({
    data: {
      paymentId: payment5.id,
      requestedBy: parent1.id,
      reason: '개인 사정으로 인한 취소 요청',
      requestedAmount: 80000,
      status: 'APPROVED',
      processedBy: admin.id,
      processedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      approvedAmount: 80000,
      adminNote: '정책에 따라 전액 환불 처리',
    }
  })

  // 6-6. 환불 대기 중인 홈티 (4회 중 1회 완료 후 취소)
  const payment6 = await prisma.payment.create({
    data: {
      parentUserId: parent2.id,
      childId: child3.id,
      therapistId: therapist1.id,
      sessionType: 'THERAPY',
      totalSessions: 4,
      originalFee: 240000,
      discountRate: 5,
      finalFee: 228000,
      status: 'PAID',
      paymentMethod: '신용카드',
      paymentId: 'PAY-' + (Date.now() + 6),
      paidAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    }
  })

  // 1회차만 완료
  await prisma.booking.create({
    data: {
      paymentId: payment6.id,
      sessionNumber: 1,
      timeSlotId: timeSlots[15].id,
      parentUserId: parent2.id,
      childId: child3.id,
      therapistId: therapist1.id,
      scheduledAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      duration: 50,
      status: 'COMPLETED',
      completedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      therapistNote: '첫 회기 진행 완료',
    }
  })

  // 나머지 3회차는 취소됨
  for (let i = 2; i <= 4; i++) {
    await prisma.booking.create({
      data: {
        paymentId: payment6.id,
        sessionNumber: i,
        timeSlotId: timeSlots[15 + i].id,
        parentUserId: parent2.id,
        childId: child3.id,
        therapistId: therapist1.id,
        scheduledAt: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000),
        duration: 50,
        status: 'CANCELLED',
        cancelledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        cancelledBy: parent2.id,
        cancellationReason: '치료사와 맞지 않음',
      }
    })
  }

  await prisma.refundRequest.create({
    data: {
      paymentId: payment6.id,
      requestedBy: parent2.id,
      reason: '치료사와의 상성이 맞지 않아 중도 취소합니다. 1회 완료했으므로 3회분 환불 요청드립니다.',
      requestedAmount: 171000, // 3회분 (228000 * 3/4)
      status: 'PENDING',
    }
  })

  // 6-7. 환불 거절된 케이스 (모든 세션 완료 후 환불 요청)
  const payment7 = await prisma.payment.create({
    data: {
      parentUserId: parent1.id,
      childId: child1.id,
      therapistId: therapist2.id,
      sessionType: 'THERAPY',
      totalSessions: 4,
      originalFee: 280000,
      discountRate: 5,
      finalFee: 266000,
      status: 'PAID',
      paymentMethod: '계좌이체',
      paymentId: 'PAY-' + (Date.now() + 7),
      paidAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      settlementAmount: 239400,
      settledAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    }
  })

  // 4회 모두 완료
  for (let i = 1; i <= 4; i++) {
    await prisma.booking.create({
      data: {
        paymentId: payment7.id,
        sessionNumber: i,
        timeSlotId: timeSlots[25 + i].id,
        parentUserId: parent1.id,
        childId: child1.id,
        therapistId: therapist2.id,
        scheduledAt: new Date(Date.now() - (15 - i * 3) * 24 * 60 * 60 * 1000),
        duration: 50,
        status: 'COMPLETED',
        completedAt: new Date(Date.now() - (15 - i * 3) * 24 * 60 * 60 * 1000),
        therapistNote: `${i}회차 치료 완료`,
      }
    })
  }

  await prisma.refundRequest.create({
    data: {
      paymentId: payment7.id,
      requestedBy: parent1.id,
      reason: '효과가 없는 것 같아서 환불 요청합니다.',
      requestedAmount: 266000,
      status: 'REJECTED',
      processedBy: admin.id,
      processedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      adminNote: '모든 세션이 완료된 후 환불 요청은 정책상 불가능합니다.',
    }
  })

  // 7. 1:1 문의 생성
  console.log('💬 Creating inquiries...')
  await prisma.inquiry.create({
    data: {
      userId: parent1.id,
      category: 'SERVICE',
      title: '치료 예약 변경 가능한가요?',
      content: '다음주 예정된 치료 일정을 변경하고 싶은데 가능할까요?',
      status: 'RESOLVED',
      respondedBy: admin.id,
      respondedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    }
  })

  await prisma.inquiry.create({
    data: {
      userId: parent2.id,
      category: 'PAYMENT',
      title: '환불은 얼마나 걸리나요?',
      content: '환불 신청했는데 처리 기간이 궁금합니다.',
      status: 'IN_PROGRESS',
    }
  })

  console.log('✅ Seed data created successfully!')
  console.log(`
📊 Summary (Payment-Centric Structure):
- Users: 6 (1 admin, 2 parents, 3 therapists)
- Children: 3
- Therapist Profiles: 3 (2 approved, 1 pending)
- Time Slots: ${timeSlots.length}
- Payments: 7
  • Paid consultation (completed): 1
  • Paid therapy (in progress, 4 sessions): 1
  • Pending payment consultation: 1
  • Pending payment therapy (8 sessions): 1
  • Refunded consultation: 1
  • Pending refund therapy (4 sessions): 1
  • Rejected refund therapy (4 sessions): 1
- Bookings: 27 (1 per session)
- Refund Requests: 3 (1 approved, 1 pending, 1 rejected)
- Inquiries: 2

🔑 Test Accounts:
Admin: admin@test.com / password123
Parent 1: parent1@test.com / password123
Parent 2: parent2@test.com / password123
Therapist 1: therapist1@test.com / password123
Therapist 2: therapist2@test.com / password123
Therapist 3: therapist3@test.com / password123
  `)
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
