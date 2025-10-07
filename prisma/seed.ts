import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { seedAssessmentQuestions } from './assessment-questions-seed'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 시드 데이터 생성 시작...')

  // 테스트 사용자 계정 생성
  const hashedPassword = await bcrypt.hash('test123!', 10)

  const testUsers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'parent@test.com' },
      update: {},
      create: {
        email: 'parent@test.com',
        name: '김부모',
        password: hashedPassword,
        role: 'PARENT',
        phone: '010-1234-5678'
      },
    }),
    prisma.user.upsert({
      where: { email: 'therapist@test.com' },
      update: {},
      create: {
        email: 'therapist@test.com',
        name: '이치료사',
        password: hashedPassword,
        role: 'THERAPIST',
        phone: '010-2345-6789'
      },
    }),
    prisma.user.upsert({
      where: { email: 'admin@test.com' },
      update: {},
      create: {
        email: 'admin@test.com',
        name: '관리자',
        password: hashedPassword,
        role: 'ADMIN',
        phone: '010-3456-7890'
      },
    })
  ])

  console.log('✅ 테스트 사용자 계정 생성 완료')
  console.log('📧 테스트 계정 정보:')
  console.log('   부모: parent@test.com / test123!')
  console.log('   치료사: therapist@test.com / test123!')
  console.log('   관리자: admin@test.com / test123!')
  console.log('')

  // 테스트 아이 정보 생성 (부모 계정용)
  const testChild = await prisma.child.create({
    data: {
      userId: testUsers[0].id, // 부모 계정
      name: '김아이',
      birthDate: new Date('2022-06-15'),
      gender: 'MALE',
      gestationalWeeks: 40,
      birthWeight: 3.2,
      currentHeight: 85.5,
      currentWeight: 12.8,
      notes: '활발하고 호기심이 많은 아이입니다.'
    }
  })

  console.log('✅ 테스트 아이 정보 생성 완료')
  // 게시판 생성
  const boards = await Promise.all([
    prisma.board.upsert({
      where: { id: 'notification' },
      update: {},
      create: {
        id: 'notification',
        name: '알림장',
        description: '아이포텐의 주요 소식과 알림을 확인하세요',
        order: 0,
      },
    }),
    prisma.board.upsert({
      where: { id: 'parenting' },
      update: {},
      create: {
        id: 'parenting',
        name: '육아소통',
        description: '육아 경험과 팁을 나누며 소통하는 공간입니다',
        order: 1,
      },
    }),
  ])

  // 샘플 뉴스 생성
  const sampleNews = await Promise.all([
    prisma.news.upsert({
      where: { id: 'news-1' },
      update: {},
      create: {
        id: 'news-1',
        title: '0-6개월 아기의 발달 단계별 놀이 가이드',
        summary: '신생아부터 6개월까지, 월령별 추천 놀이 활동을 소개합니다.',
        content: `
# 0-6개월 아기의 발달 단계별 놀이 가이드

신생아부터 6개월까지의 아기들은 급격한 성장을 겪는 시기입니다. 이 시기의 적절한 놀이 활동은 아기의 건강한 발달에 매우 중요합니다.

## 0-2개월: 감각 발달 시기

### 주요 발달 특징
- 시각: 20-30cm 거리의 물체를 보기 시작
- 청각: 소리에 반응하며 음성을 선호
- 운동: 반사적 움직임이 주를 이룸

### 추천 놀이 활동
1. **흑백 대비 카드 보여주기**
   - 간단한 패턴의 흑백 카드 활용
   - 아기 얼굴에서 20-30cm 거리 유지

2. **부드러운 음악 들려주기**
   - 클래식 음악이나 자장가
   - 부모의 목소리로 부르는 노래

3. **스킨십 놀이**
   - 부드러운 마사지
   - 따뜻한 손으로 쓰다듬기

## 3-4개월: 상호작용 시작

### 주요 발달 특징
- 미소와 웃음으로 반응
- 목을 가누기 시작
- 손을 입으로 가져가기

### 추천 놀이 활동
1. **까꿍 놀이**
   - 얼굴을 가렸다 나타내기
   - 아기의 반응 관찰하기

2. **소리 나는 장난감**
   - 딸랑이나 방울 소리
   - 다양한 음색의 장난감

3. **거울 놀이**
   - 안전한 아기용 거울 활용
   - 자신의 모습 인식하기

## 5-6개월: 능동적 탐색

### 주요 발달 특징
- 뒤집기 시도
- 손으로 물건 잡기
- 입으로 탐색하기

### 추천 놀이 활동
1. **다양한 질감의 장난감**
   - 부드럽고 안전한 재질
   - 크기가 적당한 장난감

2. **소리와 움직임 놀이**
   - 음악에 맞춰 몸 흔들기
   - 손뼉치기 놀이

3. **색깔 인식 놀이**
   - 원색의 밝은 장난감
   - 색깔별 구분하여 보여주기

## 주의사항

- 모든 놀이는 아기의 컨디션을 고려해서 진행
- 무리하지 않고 아기의 반응을 살펴보며 조절
- 안전을 최우선으로 고려
- 개인차가 있으므로 아기만의 속도 인정

각 월령에 맞는 적절한 놀이를 통해 아기의 건강한 발달을 도와주세요!
        `,
        category: 'DEVELOPMENT_GUIDE',
        isPublished: true,
        isFeatured: true,
        publishedAt: new Date(),
      },
    }),
    prisma.news.upsert({
      where: { id: 'news-2' },
      update: {},
      create: {
        id: 'news-2',
        title: '아이포텐 서비스 정식 오픈 안내',
        summary: '영유아 발달 지원 플랫폼 아이포텐이 정식으로 서비스를 시작합니다.',
        content: `
# 아이포텐 서비스 정식 오픈 안내

안녕하세요, 아이포텐입니다.

영유아의 건강한 발달을 지원하는 종합 플랫폼 **아이포텐**이 정식으로 서비스를 시작합니다!

## 🎯 주요 서비스

### 1. 발달 체크
- 연령별 맞춤 체크리스트
- 6개 영역별 종합 평가
- 시각적 결과 리포트

### 2. 맞춤 놀이영상
- 발달 단계별 추천 영상
- 집에서 쉽게 따라할 수 있는 활동
- 전문가 검증 콘텐츠

### 3. 전문가 연결
- 검증된 치료사 매칭
- 온라인/오프라인 상담 가능
- 체계적인 상담 이력 관리

## 🎉 오픈 기념 이벤트

### 무료 발달체크 체험
- 기간: 2024년 1월 ~ 2월
- 대상: 전체 회원
- 혜택: 발달체크 + 맞춤 놀이영상 추천

### 커뮤니티 활동 포인트
- 게시글 작성 시 포인트 적립
- 댓글 참여 시 추가 포인트
- 포인트로 다양한 혜택 이용

## 📞 문의사항

궁금한 점이 있으시면 언제든 문의해주세요.

- 이메일: support@aipoten.com
- 고객센터: 1588-1234
- 운영시간: 평일 09:00~18:00

감사합니다.
        `,
        category: 'NOTIFICATION',
        isPublished: true,
        isFeatured: true,
        publishedAt: new Date(),
      },
    }),
  ])

  // 샘플 놀이영상 생성
  const sampleVideos = await Promise.all([
    prisma.video.upsert({
      where: { id: 'video-1' },
      update: {},
      create: {
        id: 'video-1',
        title: '6개월 아기를 위한 소근육 발달 놀이',
        description: '손가락 움직임을 도와주는 간단한 놀이들을 소개합니다.',
        videoUrl: 'https://www.youtube.com/watch?v=example1',
        videoPlatform: 'YOUTUBE',
        targetAgeMin: 4,
        targetAgeMax: 8,
        difficulty: 'EASY',
        isPublished: true,
        priority: 9,
      },
    }),
    prisma.video.upsert({
      where: { id: 'video-2' },
      update: {},
      create: {
        id: 'video-2',
        title: '12개월 아기 대근육 발달 운동',
        description: '걷기 전 아기의 다리 근육을 튼튼하게 만드는 운동법',
        videoUrl: 'https://www.youtube.com/watch?v=example2',
        videoPlatform: 'YOUTUBE',
        targetAgeMin: 10,
        targetAgeMax: 15,
        difficulty: 'MEDIUM',
        isPublished: true,
        priority: 8,
      },
    }),
  ])

  // 치료사 프로필 생성
  const therapistProfile = await prisma.therapistProfile.upsert({
    where: { userId: testUsers[1].id },
    update: {},
    create: {
      userId: testUsers[1].id, // 치료사 계정
      specialty: 'SPEECH_THERAPY',
      licenseNumber: 'ST-2024-001',
      experience: 5,
      education: '특수교육학 석사',
      certifications: JSON.stringify(['언어재활사 1급', '특수교육교사 2급']),
      introduction: '안녕하세요. 5년 경력의 언어치료사 이치료사입니다. 영유아부터 학령기 아동까지 다양한 언어발달 지원 경험이 있습니다.',
      consultationFee: 120000,
      status: 'APPROVED',
      approvedAt: new Date()
    }
  })

  // 치료사 스케줄 설정 (월-금, 9시-18시)
  const scheduleData = []
  for (let day = 1; day <= 5; day++) { // 월요일(1)부터 금요일(5)까지
    for (let hour = 9; hour < 18; hour++) {
      scheduleData.push({
        therapistId: therapistProfile.id,
        dayOfWeek: day,
        startTime: `${hour.toString().padStart(2, '0')}:00`,
        endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
        isActive: true
      })
    }
  }

  await prisma.therapistAvailability.createMany({
    data: scheduleData
  })

  console.log('✅ 치료사 프로필과 스케줄이 생성되었습니다')

  // 알림장 게시글 생성
  const notificationPosts = await Promise.all([
    prisma.post.create({
      data: {
        title: '2024년 1월 프로그램 일정 안내',
        content: `
# 2024년 1월 프로그램 일정 안내

안녕하세요, 아이포텐입니다.

## 📅 1월 주요 일정

### 발달체크 무료 체험
- 기간: 2024. 1. 1 ~ 1. 31
- 대상: 전체 회원
- 내용: 6개 영역별 발달 체크리스트 무료 제공

### 육아 온라인 세미나
- 일시: 2024. 1. 15 (월) 오후 2시
- 주제: "영유아 언어발달의 이해"
- 강사: 이치료사 (언어재활사 1급)
- 참가비: 무료

### 신규 놀이영상 업데이트
- 매주 수요일 오전 10시
- 월령별 맞춤 놀이 영상 5개씩 추가 예정

## 📢 공지사항

- 1월 1일(월)은 신정으로 고객센터가 휴무입니다.
- 1월 중 가입하시는 분들께 특별 혜택을 드립니다.

문의사항이 있으시면 언제든 연락주세요.
감사합니다.
        `,
        boardId: 'notification',
        authorId: testUsers[2].id, // 관리자
        isPublished: true
      }
    }),
    prisma.post.create({
      data: {
        title: '시스템 점검 안내 (1월 10일)',
        content: `
# 시스템 점검 안내

안녕하세요, 아이포텐입니다.

서비스 품질 향상을 위해 아래와 같이 시스템 점검을 실시합니다.

## 점검 일시
- 날짜: 2024년 1월 10일 (수)
- 시간: 오전 2시 ~ 오전 4시 (약 2시간)

## 점검 내용
- 서버 안정화 작업
- 데이터베이스 최적화
- 보안 업데이트

점검 시간 동안 서비스 이용이 일시적으로 중단될 수 있습니다.
양해 부탁드립니다.

감사합니다.
        `,
        boardId: 'notification',
        authorId: testUsers[2].id,
        isPublished: true
      }
    })
  ])

  // 육아소통 게시글 생성
  const parentingPosts = await Promise.all([
    prisma.post.create({
      data: {
        title: '12개월 아기 수면교육 성공 후기',
        content: `
안녕하세요! 12개월 된 아기 엄마입니다.

드디어 수면교육에 성공해서 후기 남깁니다 😊

## 시작 전 상황
- 밤에 2-3시간마다 깸
- 안아서 재워야만 잠
- 낮잠도 30분 이상 못 잠

## 시도한 방법
1. 일정한 취침 루틴 만들기
   - 목욕 → 책 읽기 → 자장가
2. 졸릴 때 눕혀서 토닥이기
3. 울어도 5분은 기다리기
4. 밤중 수유 줄이기

## 결과
- 2주 만에 통잠 성공!
- 이제 밤 8시에 자서 아침 7시에 일어나요
- 낮잠도 2시간씩 잘 자요

힘들었지만 포기하지 않길 잘한 것 같아요.
다들 화이팅하세요! 💪
        `,
        boardId: 'parenting',
        authorId: testUsers[0].id, // 부모
        isPublished: true
      }
    }),
    prisma.post.create({
      data: {
        title: '이유식 거부하는 아기, 어떻게 하셨나요?',
        content: `
안녕하세요.
6개월 된 아기 엄마인데요, 이유식을 너무 안 먹어서 고민입니다.

## 현재 상황
- 쌀미음부터 시작했는데 한 숟가락도 안 먹어요
- 혀로 밀어내기만 해요
- 모유는 잘 먹는데 이유식만 거부해요

여러 맛을 시도해봤지만 반응이 똑같아요.
혹시 비슷한 경험 있으신 분 계신가요?
어떻게 하셨는지 조언 부탁드려요 🙏
        `,
        boardId: 'parenting',
        authorId: testUsers[0].id,
        isPublished: true
      }
    }),
    prisma.post.create({
      data: {
        title: '돌잔치 준비 팁 공유합니다',
        content: `
지난주에 아기 돌잔치를 했는데요, 준비하면서 알게 된 팁들을 공유합니다!

## 장소 선정
- 최소 2-3개월 전에 예약하세요
- 주말은 금방 차니까 빨리빨리!
- 주차 공간 꼭 확인하세요

## 사진/영상
- 전문가 섭외가 제일 좋지만
- 비용이 부담되면 지인 중에 사진 잘 찍는 분께 부탁
- 스마트폰으로도 충분히 예쁘게 나와요

## 아기 컨디션
- 당일 낮잠 시간 고려해서 시간 정하기
- 여벌 옷 3벌 이상 준비
- 좋아하는 간식 챙기기

## 비용 절감 팁
- 돌상은 직접 만들어도 예뻐요
- 풍선 장식은 온라인 구매가 저렴
- 답례품은 실용적인 것으로

다들 행복한 돌잔치 되세요! 🎉
        `,
        boardId: 'parenting',
        authorId: testUsers[0].id,
        isPublished: true
      }
    })
  ])

  console.log('✅ 게시판 데이터 생성 완료')
  console.log('   알림장:', notificationPosts.length, '개')
  console.log('   육아소통:', parentingPosts.length, '개')

  // 발달체크 질문 생성
  await seedAssessmentQuestions()

  console.log('✅ 시드 데이터 생성 완료!')
  console.log('   게시판:', boards.length)
  console.log('   뉴스:', sampleNews.length)
  console.log('   영상:', sampleVideos.length)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })