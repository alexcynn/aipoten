# 치료사 페이지 개발 가이드

## 📁 폴더 구조
```
src/app/therapist/
├── dashboard/          # 치료사 대시보드
│   └── page.tsx
├── profile/            # 프로필 관리
│   └── page.tsx
├── matching/           # 매칭 요청 관리
│   ├── page.tsx       # 매칭 요청 목록
│   └── [id]/          # 매칭 요청 상세
│       └── page.tsx
├── consultations/      # 상담 관리
│   ├── page.tsx       # 상담 목록
│   └── [id]/          # 상담 상세
│       └── page.tsx
└── schedule/           # 일정 관리
    └── page.tsx
```

## 🎯 개발 우선순위

### Phase 1: 기본 구조 (현재)
- [x] 치료사 대시보드 기본 구조
- [x] 프로필, 매칭, 상담, 스케줄 페이지 생성

### Phase 2: 콘텐츠 플랫폼 (Week 13-20)
- [ ] **프로필 페이지 강화**
  - [ ] 전문 정보 상세 입력
  - [ ] 자격증 파일 업로드
  - [ ] 경력 사항 관리
  - [ ] 상담 방식 설정
  - [ ] 상담 비용 설정

- [ ] **일정 관리 시스템**
  - [ ] 캘린더 뷰
  - [ ] 상담 가능 시간 설정
  - [ ] 휴무일 등록
  - [ ] 시간대별 토글

### Phase 3: 매칭 시스템 (Week 21-32)
- [ ] **매칭 요청 관리**
  - [ ] 새 매칭 요청 알림
  - [ ] 매칭 요청 목록 (대기/승인/거절)
  - [ ] 아이 발달 정보 미리보기
  - [ ] 승인/거절 프로세스
  - [ ] 희망 일시 협의

- [ ] **상담 관리**
  - [ ] 예정된 상담 목록
  - [ ] 상담 히스토리
  - [ ] 화상 상담 링크 생성
  - [ ] 상담 노트 작성
  - [ ] 피드백 작성

- [ ] **수익 관리**
  - [ ] 월별 상담 수익 통계
  - [ ] 정산 내역
  - [ ] 세금계산서 발행 요청

### Phase 4: 전문가 도구 (Week 33+)
- [ ] **평가 도구**
  - [ ] 발달 평가 템플릿
  - [ ] 관찰 기록 작성
  - [ ] 치료 계획 수립

- [ ] **보고서 생성**
  - [ ] 상담 보고서 자동 생성
  - [ ] PDF 다운로드
  - [ ] 부모에게 공유

## 🔧 주요 기능 명세

### 1. 치료사 대시보드 (`/therapist/dashboard`)

#### 구성 요소
```typescript
// 상단 섹션
- 환영 메시지 + 프로필 사진
- 승인 상태 배지 (PENDING/APPROVED/REJECTED)
- Quick Stats
  - 이번 달 상담 수
  - 대기 중인 매칭 요청
  - 이번 주 예정된 상담
  - 이번 달 수익

// 오늘의 일정
- 예정된 상담 목록 (시간순)
- 빈 슬롯 표시
- [일정 관리하기] 링크

// 최근 매칭 요청 (최대 5개)
- 새 요청 배지
- 아이 정보 (나이, 성별, 관심 영역)
- [승인] [거절] 버튼

// 수익 현황 (Phase 3)
- 이번 달 수익 그래프
- 정산 예정 금액
```

#### API 연동
```typescript
// GET /api/therapist/profile - 치료사 정보
// GET /api/therapist/stats - 통계 데이터
// GET /api/therapist/matching-requests?status=PENDING - 대기 중인 요청
// GET /api/therapist/consultations?date=today - 오늘 상담
```

### 2. 프로필 관리 (`/therapist/profile`)

#### 입력 필드
```typescript
interface TherapistProfile {
  // 기본 정보
  userId: string
  specialty: TherapyType   // 전문 분야
  licenseNumber?: string   // 자격증 번호
  experience: number       // 경력 (년)
  education?: string       // 학력
  certifications?: string  // 자격증 목록 (JSON)
  introduction?: string    // 자기소개

  // 상담 정보
  consultationFee: number  // 상담료 (원)
  consultationTypes: ('ONLINE' | 'OFFLINE' | 'HOME_VISIT')[]

  // 승인 정보
  status: TherapistStatus
  approvedAt?: Date
  rejectedAt?: Date
  rejectionReason?: string
}

enum TherapyType {
  SPEECH_THERAPY         // 언어치료
  OCCUPATIONAL_THERAPY   // 작업치료
  PHYSICAL_THERAPY       // 물리치료
  PSYCHOLOGICAL_THERAPY  // 심리치료
  BEHAVIORAL_THERAPY     // 행동치료
  PLAY_THERAPY          // 놀이치료
}

enum TherapistStatus {
  PENDING    // 승인 대기
  APPROVED   // 승인됨
  REJECTED   // 거절됨
  SUSPENDED  // 정지됨
}
```

#### 프로필 섹션
```typescript
// 전문 정보
- 전문 분야 (드롭다운)
- 자격증 번호
- 경력 (년)
- 학력
- 자격증 파일 업로드 (최대 5개)
  - 지원 형식: PDF, JPG, PNG
  - 최대 크기: 5MB
- 자기소개 (500자)

// 상담 설정
- 상담료 (원)
- 상담 방식 (체크박스)
  - [ ] 온라인 화상 상담
  - [ ] 오프라인 방문 상담
  - [ ] 가정 방문 상담
- 상담 시간 (30분/50분/60분)

// 승인 상태
- 현재 상태 배지
- 승인 대기 중: 안내 메시지
- 거절됨: 사유 표시, 재신청 버튼
```

#### API 연동
```typescript
// GET /api/therapist/profile - 프로필 조회
// PATCH /api/therapist/profile - 프로필 수정
// POST /api/therapist/certifications - 자격증 파일 업로드
```

### 3. 일정 관리 (`/therapist/schedule`)

#### 캘린더 뷰
```typescript
interface TherapistAvailability {
  id: string
  therapistId: string
  dayOfWeek: number      // 0=일, 1=월, ..., 6=토
  startTime: string      // "09:00"
  endTime: string        // "18:00"
  isActive: boolean
}

// 주간 뷰
- 월~일 7일 표시
- 시간대별 그리드 (9:00-21:00)
- 가능 시간: 녹색
- 예약된 시간: 파란색
- 불가능 시간: 회색

// 시간 설정
- 요일별 토글 (ON/OFF)
- 시작/종료 시간 선택
- 점심시간 설정
- 휴무일 추가

// 휴무일 관리
- 날짜 선택 캘린더
- 휴무 사유 입력
- 휴무일 목록 표시
```

#### API 연동
```typescript
// GET /api/therapist/availability - 가능 시간 조회
// POST /api/therapist/availability - 가능 시간 추가
// PATCH /api/therapist/availability/[id] - 수정
// DELETE /api/therapist/availability/[id] - 삭제

// POST /api/therapist/holidays - 휴무일 등록
// GET /api/therapist/holidays - 휴무일 목록
```

### 4. 매칭 요청 관리 (`/therapist/matching`)

#### 요청 목록
```typescript
interface MatchingRequest {
  id: string
  parentUser: { name: string }
  child: {
    name: string
    birthDate: Date
    gender: Gender
  }
  preferredDates: string[]   // ["2024-01-15", "2024-01-16"]
  notes?: string              // 부모 요청사항
  status: MatchingStatus
  createdAt: Date
}

// 탭 구분
- 대기 중 (PENDING)
- 승인됨 (APPROVED)
- 거절됨 (REJECTED)
- 취소됨 (CANCELLED)

// 목록 아이템
- 아이 정보 (이름, 나이, 성별)
- 부모 정보 (이름, 연락처)
- 희망 일시 (최대 3개)
- 요청사항
- 발달 정보 미리보기 링크
- [상세보기] [승인] [거절] 버튼
```

#### 요청 상세 (`/therapist/matching/[id]`)
```typescript
// 아이 정보
- 기본 정보 (이름, 나이, 성별)
- 발달체크 결과 요약
  - 전체 점수
  - 카테고리별 점수
  - 주의 필요 영역
- 의료 정보 (병력, 가족력, 치료력)

// 매칭 요청 정보
- 희망 일시 (3개)
- 부모 요청사항
- 예상 상담 방식
- 예상 상담료

// 승인 프로세스
- 가능한 일시 선택
- 상담 방식 선택
- 상담료 확인
- 추가 안내사항 입력
- [승인하기] 버튼
  → 부모에게 알림 발송
  → 상담 예약 생성

// 거절 프로세스
- 거절 사유 선택
  - 일정 불가
  - 전문 분야 불일치
  - 기타 (직접 입력)
- [거절하기] 버튼
  → 부모에게 알림 발송
```

#### API 연동
```typescript
// GET /api/therapist/matching-requests - 매칭 요청 목록
// GET /api/therapist/matching-requests/[id] - 상세 조회
// PATCH /api/therapist/matching-requests/[id]/approve - 승인
// PATCH /api/therapist/matching-requests/[id]/reject - 거절
```

### 5. 상담 관리 (`/therapist/consultations`)

#### 상담 목록
```typescript
interface Consultation {
  id: string
  matchingRequest: MatchingRequest
  parentUser: { name: string, phone: string }
  child: { name: string, birthDate: Date }
  scheduledAt: Date
  duration: number         // 분
  type: ConsultationType
  status: ConsultationStatus
  fee: number
  paymentStatus: PaymentStatus
  notes?: string           // 상담 노트 (치료사 작성)
  feedback?: string        // 피드백 (부모 작성)
}

// 탭 구분
- 예정된 상담 (SCHEDULED)
- 완료된 상담 (COMPLETED)
- 취소된 상담 (CANCELLED)

// 목록 아이템
- 상담 일시
- 아이 정보
- 부모 정보
- 상담 방식 (온라인/오프라인/방문)
- 상담 시간 (분)
- 상담료
- 결제 상태
- 상태 배지
- [상세보기] 버튼
```

#### 상담 상세 (`/therapist/consultations/[id]`)
```typescript
// 상담 정보
- 일시, 시간, 방식
- 아이 정보 + 발달체크 결과
- 부모 연락처

// 예정된 상담 (SCHEDULED)
- 화상 상담 링크 (온라인일 경우)
  - [화상 상담 시작] 버튼
  - WebRTC 연결
- 준비 사항 체크리스트
- [일정 변경 요청]
- [상담 취소]

// 진행 중 상담
- 실시간 타이머
- 상담 노트 작성 (실시간 저장)
- 관찰 사항 기록

// 완료된 상담 (COMPLETED)
- 상담 노트 보기/수정
- 피드백 작성
  - 아이 상태 평가
  - 권장 사항
  - 가정 활동 제안
  - 재방문 필요 여부
- 부모 리뷰 확인
- [재예약 제안]
```

#### API 연동
```typescript
// GET /api/therapist/consultations - 상담 목록
// GET /api/therapist/consultations/[id] - 상세 조회
// PATCH /api/therapist/consultations/[id] - 상담 노트 저장
// POST /api/therapist/consultations/[id]/feedback - 피드백 작성
// PATCH /api/therapist/consultations/[id]/reschedule - 일정 변경
// DELETE /api/therapist/consultations/[id] - 취소
```

### 6. 수익 관리 (Phase 3)

#### 수익 대시보드
```typescript
// 월별 수익 통계
- 총 상담 수
- 총 수익
- 플랫폼 수수료
- 실수령액
- 월별 트렌드 그래프

// 정산 내역
- 정산 예정 금액
- 정산 완료 내역
- 세금계산서 발행 요청

// 상담 통계
- 상담 방식별 통계
- 재방문율
- 평균 평점
- 리뷰 모음
```

## 📊 데이터 흐름

### 매칭 승인 플로우
```
1. 부모가 매칭 요청
   ↓
2. 치료사에게 알림 (이메일 + 앱 푸시)
   ↓
3. 치료사 매칭 요청 확인
   - 아이 발달 정보 조회
   - 희망 일시 확인
   ↓
4. 승인/거절 결정

   [승인 시]
   ↓
5. 상담 일시 선택
   ↓
6. 상담(Consultation) 레코드 생성
   - status: SCHEDULED
   - paymentStatus: PENDING
   ↓
7. 부모에게 승인 알림
   - 확정된 일시
   - 결제 링크
   ↓
8. 부모 결제 완료
   ↓
9. 치료사 대시보드에 표시
   - 예정된 상담 목록
```

### 상담 완료 플로우
```
1. 상담 진행
   ↓
2. 상담 노트 작성
   ↓
3. 상담 완료 처리
   ↓
4. 피드백 작성
   - 아이 상태 평가
   - 권장 사항
   - 가정 활동 제안
   ↓
5. 부모에게 피드백 전송
   ↓
6. 부모 리뷰 작성
   ↓
7. 수익 정산 대기열 추가
```

## 🎨 UI/UX 가이드

### 색상 사용
```typescript
// 상태별 색상
PENDING: 'bg-yellow-100 text-yellow-800'
APPROVED: 'bg-green-100 text-green-800'
REJECTED: 'bg-red-100 text-red-800'
SCHEDULED: 'bg-blue-100 text-blue-800'
COMPLETED: 'bg-gray-100 text-gray-800'
CANCELLED: 'bg-red-100 text-red-800'
```

### 알림 우선순위
```typescript
// 긴급 (빨간색)
- 1시간 내 상담 예정
- 결제 실패

// 중요 (노란색)
- 새 매칭 요청
- 일정 변경 요청
- D-1 상담 알림

// 일반 (파란색)
- 리뷰 등록
- 정산 완료
```

## 🔒 보안 및 권한

### 인증/인가
```typescript
// /therapist/* 접근 제한
- session.user.role === 'THERAPIST'
- therapistProfile.status === 'APPROVED' (일부 기능)

// 데이터 접근 제한
- 본인 프로필만 수정
- 본인에게 요청된 매칭만 조회
- 본인 상담 건만 조회
```

### 개인정보 보호
```typescript
// 아이 정보
- 발달체크 결과: 부모 동의 시에만 공유
- 의료 정보: 요약만 표시, 상세는 승인 후

// 부모 정보
- 연락처: 매칭 승인 후 공개
- 주소: 가정 방문 상담 승인 후 공개
```

## 📱 향후 기능

### Phase 3: 매칭 시스템 고도화
- [ ] AI 기반 매칭 추천
- [ ] 실시간 화상 상담 (WebRTC)
- [ ] 상담 녹화/녹음 (동의 하에)
- [ ] 그룹 상담 기능

### Phase 4: 전문가 도구
- [ ] 발달 평가 템플릿
- [ ] 치료 계획 수립 도구
- [ ] 보고서 자동 생성
- [ ] 치료 진행 상황 추적

### Phase 5: 커뮤니티
- [ ] 치료사 간 사례 공유
- [ ] 전문가 칼럼 작성
- [ ] 온라인 세미나 개최

## 🧪 테스트 체크리스트

- [ ] 프로필 등록 및 승인 대기 플로우
- [ ] 매칭 요청 승인/거절
- [ ] 일정 설정 및 상담 예약
- [ ] 상담 노트 작성
- [ ] 피드백 작성 및 공유
- [ ] 수익 계산 및 정산

## 📝 다음 단계

1. **Phase 2 준비**
   - [ ] 프로필 페이지 상세 구현
   - [ ] 파일 업로드 기능
   - [ ] 일정 관리 캘린더 UI

2. **Phase 3: 매칭 시스템**
   - [ ] 매칭 요청 알림 시스템
   - [ ] 승인/거절 프로세스
   - [ ] 상담 예약 생성
   - [ ] WebRTC 화상 상담 연동

3. **Phase 4: 수익 관리**
   - [ ] 정산 시스템
   - [ ] 통계 대시보드
   - [ ] 세금계산서 발행
