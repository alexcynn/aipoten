# 부모 페이지 개발 가이드

## 📁 폴더 구조
```
src/app/parent/
├── dashboard/          # 부모 대시보드
│   └── page.tsx
├── children/           # 아이 관리
│   ├── new/           # 아이 등록
│   │   └── page.tsx
│   ├── [id]/          # 아이 상세/수정
│   │   └── page.tsx
│   └── selector/      # 다자녀 선택 컴포넌트 (화살표 네비게이션)
│       └── ChildSelector.tsx
├── assessments/        # 발달체크 관리 ✅
│   ├── page.tsx       # 발달체크 목록
│   ├── new/           # 새 발달체크
│   │   └── page.tsx
│   └── [id]/          # 발달체크 결과
│       └── page.tsx
├── videos/             # 추천영상 관리
│   ├── page.tsx       # 발달체크 기반 추천영상 목록
│   └── [id]/          # 영상 상세/플레이어
│       └── page.tsx
├── therapists/         # 치료사 매칭
│   ├── page.tsx       # 치료사 검색/목록
│   └── [id]/          # 치료사 프로필 및 예약
│       └── page.tsx
└── sessions/           # 세션 관리
    ├── schedule/      # 세션 스케쥴 보기 및 조정 신청
    │   └── page.tsx
    └── logs/          # 과거 세션 일지 보기
        └── page.tsx
```

## 🎯 개발 우선순위 (Phase 1 - MVP)

### Week 1-2: 기본 구조 ✅
- [x] 부모 대시보드 페이지 구조
- [x] 아이 등록/수정 페이지
- [x] 발달체크 목록 페이지

### Week 3-6: 발달체크 시스템 ✅
- [x] **발달체크 질문 시스템**
  - [x] 27-29개월 질문지 구현 (survey.txt 기반)
  - [x] Q1→Q2→Q3 조건부 흐름 로직
  - [x] 5개 카테고리 질문 UI
    - 대근육 운동 (8문항)
    - 소근육 운동 (8문항)
    - 언어 (7문항)
    - 인지 (8문항)
    - 사회성 (4문항)
  - [x] 경고 질문 처리 (5문항)
  - [x] Seed 데이터 생성 (120개 질문)

- [x] **발달체크 진행 화면**
  - [x] 진행률 표시 (Progress Bar)
  - [x] 카테고리별 섹션 구분
  - [x] 이전/다음 버튼
  - [x] 응답 검증
  - [ ] 중간 저장 기능 (Phase 2)

- [ ] **결과 화면**
  - [x] 종합 점수 계산 및 표시
  - [x] 카테고리별 점수 계산
  - [ ] 카테고리별 점수 레이더 차트
  - [x] 발달 수준 판정 (우수/양호/주의/관찰필요)
  - [ ] 경고 플래그 표시
  - [ ] PDF 리포트 다운로드

### Week 7-8: 아이 관리 및 선택 UI
- [ ] **다자녀 관리 (기본 가정: 1명)**
  - [ ] ChildSelector 컴포넌트 (좌우 화살표로 기본 아이 선택)
  - [ ] 추가 자녀 등록 모달 (별도 페이지 아님)
  - [ ] 대시보드 헤더에 자녀 선택기 통합

- [ ] **대시보드 강화**
  - [ ] 선택된 아이 기준 최근 발달체크 결과 요약
  - [ ] 다음 체크 시기 알림
  - [ ] Quick Actions 확장 (추천영상, 치료사 찾기 추가)

- [ ] **아이 프로필 강화 (Phase 2)**
  - [ ] 성장 기록 (키/몸무게 차트)
  - [ ] 발달 마일스톤 타임라인
  - [ ] 의료 정보 상세 관리
  - [ ] 사진 갤러리

### Week 9-12: 추천영상 시스템 (Phase 2)
- [ ] **영상 추천 엔진**
  - [ ] 발달체크 완료 후 자동 영상 추천 생성
  - [ ] 카테고리별 우선순위 로직
    - 주의/관찰필요 영역: 10개 영상
    - 양호 영역: 5개 영상
    - 우수 영역: 심화 영상 5개
  - [ ] 아이 연령 기반 필터링 (±3개월)

- [ ] **영상 목록 페이지 (`/parent/videos`)**
  - [ ] 발달체크 기반 추천영상 표시
  - [ ] 카테고리별 필터
  - [ ] 영상 썸네일 및 메타정보 표시
  - [ ] 북마크 기능

- [ ] **영상 상세/플레이어 (`/parent/videos/[id]`)**
  - [ ] YouTube/Naver TV 임베디드 플레이어
  - [ ] 영상 정보 (놀이 방법, 기대 효과, 주의사항)
  - [ ] 시청 완료 체크
  - [ ] 북마크 토글

### Week 13-16: 치료사 매칭 (Phase 2)
- [ ] **치료사 검색 페이지 (`/parent/therapists`)**
  - [ ] 치료 분야 선택 (언어치료, 작업치료, 물리치료, 심리치료 등)
  - [ ] 필터: 지역, 경력, 전문분야, 비용
  - [ ] AI 추천 치료사 (발달체크 결과 기반)
  - [ ] 리뷰 평점/거리 정렬

- [ ] **치료사 프로필 및 예약 (`/parent/therapists/[id]`)**
  - [ ] 치료사 상세 정보 (경력, 자격증, 전문분야, 평점)
  - [ ] 실시간 예약 가능 시간 캘린더 (2주 범위)
  - [ ] 세션 회수 선택 (1/4/8/12회, 할인율 적용)
  - [ ] 방문 주소 입력 및 아이 정보 공유 동의
  - [ ] 예약 신청 (10분 타임아웃)

- [ ] **결제 프로세스 (준비)**
  - [ ] 결제 정보 화면
  - [ ] 할인 금액 계산
  - [ ] 플랫폼 수수료 표시
  - [ ] 결제 API 연동 준비 (PG사 선정)

### Week 17-20: 세션 관리 (Phase 3)
- [ ] **세션 스케쥴 페이지 (`/parent/sessions/schedule`)**
  - [ ] 예약된 세션 캘린더 뷰
  - [ ] 다가오는 세션 목록
  - [ ] 세션 시간/날짜 변경 요청 기능
  - [ ] 치료사 승인 대기 상태 표시

- [ ] **세션 일지 페이지 (`/parent/sessions/logs`)**
  - [ ] 완료된 세션 목록
  - [ ] 치료사 피드백 및 세션 노트 보기
  - [ ] 세션별 발달 진전도 확인
  - [ ] 세션 간 비교 분석

## 🔧 주요 기능 명세

### 0. 아이 관리 전략 (기본 가정: 1명)

#### 단일 아이 (기본)
```typescript
// 기본 동작
- 첫 아이 등록 시: 자동으로 "기본 아이"로 설정
- 대시보드에서 해당 아이 정보 기준으로 모든 데이터 표시
- 아이 선택기 컴포넌트 미노출 (1명일 때)
```

#### 다자녀 (추가 시)
```typescript
// 추가 등록
- 대시보드에 [+아이 추가] 버튼 (모달 트리거)
- 모달 내에서 간편 등록 폼 표시 (별도 페이지 아님)
- 등록 완료 후 아이 선택기 컴포넌트 활성화

// ChildSelector 컴포넌트 (좌우 화살표 네비게이션)
interface ChildSelectorProps {
  children: Child[]
  selectedChildId: string
  onSelectChild: (childId: string) => void
}

// 표시 위치: 대시보드 헤더 (환영 메시지 하단)
┌──────────────────────────────────────────┐
│ 안녕하세요, 홍길동님!                     │
│                                          │
│ ← [지민이] → (24개월, 여아)              │
│                                          │
│ Quick Actions: [발달체크] [추천영상] ... │
└──────────────────────────────────────────┘

// 동작
- 좌우 화살표 클릭 시 다음/이전 아이로 전환
- 선택된 아이 기준으로 전체 페이지 데이터 리렌더링
- localStorage에 "기본 아이" 선택 저장
```

#### API 연동
```typescript
// GET /api/children - 모든 자녀 목록
// PATCH /api/users/me - 기본 아이 설정 저장
```

### 1. 부모 대시보드 (`/parent/dashboard`)

#### 구성 요소
```typescript
// 상단 섹션
- 환영 메시지 + 프로필 사진
- ChildSelector (다자녀인 경우만 표시)
- Quick Actions (아이 등록, 발달체크, 추천영상, 치료사 찾기, 세션 일정, 육아소통)

// 선택된 아이 기준 정보
- 아이 기본 정보 (이름, 성별, 나이, 등록일)
- 최근 발달체크 결과 요약 (있는 경우)
- 다음 체크 권장 시기

// 등록된 아이 목록 (전체)
- 아이별 카드 (이름, 성별, 나이, 등록일)
- 클릭 시 상세 페이지 이동
- 빈 상태: "첫 번째 아이 등록하기" CTA

// 최근 활동 (Phase 2)
- 최근 발달체크 결과
- 추천 영상 시청 기록
- 예정된 세션
- 커뮤니티 활동
```

#### API 연동
```typescript
// GET /api/children - 아이 목록
// GET /api/users/me - 사용자 정보 및 기본 아이 설정
// GET /api/assessments?childId={id}&limit=1 - 선택된 아이 최근 발달체크
```

### 2. 아이 등록 (`/parent/children/new`)

#### 입력 필드
```typescript
interface ChildFormData {
  // 필수
  name: string
  birthDate: Date
  gender: 'MALE' | 'FEMALE'

  // 선택
  gestationalWeeks?: number       // 출산 주수
  birthWeight?: number            // 출생 시 몸무게 (kg)
  currentHeight?: number          // 현재 키 (cm)
  currentWeight?: number          // 현재 몸무게 (kg)
  medicalHistory?: string         // 병력/수술력
  familyHistory?: string          // 가족력
  treatmentHistory?: string       // 치료력
  notes?: string                  // 특이사항
}
```

#### 검증 규칙
```typescript
// 필수 검증
- name: 2-20자
- birthDate: 과거 날짜, 7년 이내
- gender: MALE 또는 FEMALE

// 선택 검증
- gestationalWeeks: 20-44주
- birthWeight: 0.5-6.0 kg
- currentHeight: 30-150 cm
- currentWeight: 2-50 kg
```

#### API 연동
```typescript
// POST /api/children
// Body: ChildFormData
// Response: { message, child }
```

### 3. 아이 상세/수정 (`/parent/children/[id]`)

#### 표시 정보
```typescript
// 기본 정보 섹션
- 이름, 생년월일, 성별, 현재 월령

// 신체 정보 섹션
- 출생: 주수, 출생 시 몸무게
- 현재: 키, 몸무게
- 성장 차트 (Phase 2)

// 의료 정보 섹션
- 병력/수술력
- 가족력
- 치료력
- 특이사항

// 발달 기록 섹션
- 발달체크 이력 (최근 5개)
- 발달 추이 그래프 (Phase 2)

// 액션 버튼
- [정보 수정]
- [발달체크 하기]
- [삭제] (확인 모달)
```

#### API 연동
```typescript
// GET /api/children/[id] - 아이 정보 + 발달체크 이력
// PATCH /api/children/[id] - 아이 정보 수정
// DELETE /api/children/[id] - 아이 삭제
```

### 4. 발달체크 목록 (`/parent/assessments`)

#### 필터/정렬
```typescript
// 필터
- 아이별 필터 (드롭다운)
- 날짜 범위 필터 (Phase 2)

// 정렬
- 최신순 (기본)
- 오래된순
- 점수 높은순
- 점수 낮은순
```

#### 목록 아이템
```typescript
interface AssessmentListItem {
  id: string
  child: { id: string, name: string }
  ageInMonths: number
  totalScore: number
  createdAt: Date
  results: {
    category: DevelopmentCategory
    score: number
    level: DevelopmentLevel
  }[]
}

// 표시 정보
- 아이 이름 + 월령 배지
- 평가일 + 총점
- 카테고리별 점수 미니 차트
- [자세히 보기] 버튼
```

#### 통계 위젯
```typescript
// Quick Stats (상단)
- 총 평가 횟수
- 최근 평가 점수
- 평균 점수

// 빈 상태
- 아이 등록 유도
- 발달체크 시작 CTA
```

### 5. 발달체크 시작 (`/parent/assessments/new`)

#### Step 1: 아이 선택
```typescript
// 아이 목록 표시
- 카드 형태 (이름, 성별, 나이)
- 선택 시 하이라이트
- 등록된 아이 없으면 등록 유도

// 선택 후
- [다음] 버튼 활성화
- 선택한 아이 정보 확인
```

#### Step 2: 질문 응답 (Q1→Q2→Q3 흐름)
```typescript
interface QuestionFlow {
  questionNumber: number
  category: DevelopmentCategory
  currentLevel: 'Q1' | 'Q2' | 'Q3'
  questionText: string
  answerType: 'FOUR_POINT' | 'TWO_POINT'
  options: string[]
}

// Q1 응답 로직
if (answer === '잘함' || answer === '대체로 잘함') {
  // 다음 문항으로
  goToNextQuestion()
} else {
  // Q2로 이동
  goToLevel('Q2')
}

// Q2 응답 로직
if (answer === '잘함') {
  // 다음 문항으로
  goToNextQuestion()
} else {
  // Q3로 이동
  goToLevel('Q3')
}

// Q3 응답 후 무조건 다음 문항
```

#### UI 컴포넌트
```typescript
// Progress Bar
- 전체 진행률 (0-100%)
- 현재 카테고리 표시
- 응답 완료 문항 수 / 전체 문항 수

// Question Card
- 카테고리 배지
- 문항 번호
- 질문 텍스트
- 응답 옵션 (라디오 버튼)
- [이전] [다음] 버튼

// Navigation
- [이전] 버튼: 이전 문항으로 (레벨 관계없이)
- [다음] 버튼: 다음 문항 또는 하위 레벨로
- [중간 저장] 버튼: 현재까지 응답 저장
```

#### 중간 저장
```typescript
// 자동 저장
- 5문항마다 자동 저장
- localStorage 백업

// 수동 저장
- [나중에 계속하기] 버튼
- 저장 후 대시보드로 이동
- 재진입 시 이어하기 옵션
```

### 6. 발달체크 결과 (`/parent/assessments/[id]`)

#### 결과 표시
```typescript
// 헤더
- 아이 이름 + 평가일
- 평가 시 월령
- 총점 (크게 표시)

// 종합 평가
- 발달 수준 배지 (우수/양호/주의/관찰필요)
- 간단한 종합 코멘트

// 카테고리별 점수
- 레이더 차트 (5개 카테고리)
- 카테고리별 점수 + 레벨
- 카테고리별 피드백

// 경고 플래그
- 경고 질문에서 플래그된 항목 표시
- 전문가 상담 권장 메시지

// 권장 사항
- 집에서 할 수 있는 활동
- 추천 놀이영상 링크
- 전문가 상담 권장 (필요 시)

// 액션
- [PDF 다운로드]
- [놀이영상 보러 가기]
- [치료사 찾기] (경고 있을 경우)
```

## 📊 데이터 흐름

### 발달체크 → 영상 추천 통합 흐름 (Phase 2)
```
1. 사용자 질문 응답
   ↓
2. 조건부 레벨 결정 (Q1→Q2→Q3)
   ↓
3. 응답 데이터 수집
   {
     assessmentId,
     responses: [
       { questionId, level: 'Q1', answer: '잘함', score: 3 },
       { questionId, level: 'Q2', answer: '못함', score: 1 },
       ...
     ]
   }
   ↓
4. 제출 시 점수 계산
   - 카테고리별 총점
   - 전체 총점
   - 레벨 판정 (excellent/good/caution/needs_observation)
   ↓
5. 결과 저장
   - DevelopmentAssessment (총점, 상태)
   - AssessmentResponse (개별 응답)
   - AssessmentResult (카테고리별 점수)
   ↓
6. [백엔드 자동 처리] 영상 추천 생성 (Phase 2)
   - 카테고리별 점수 분석
   - 우선순위 결정:
     * 주의/관찰필요 (< 60점): 해당 영역 10개
     * 양호 (60-79점): 해당 영역 5개
     * 우수 (80-100점): 심화 영상 5개
   - 아이 연령 필터링 (±3개월)
   - recommended_videos 테이블 저장
   ↓
7. 결과 페이지 표시
   - 발달 점수 및 레벨
   - "OO이를 위한 맞춤 추천 영상이 준비되었습니다" 안내
   - 상위 3개 영상 미리보기
   - [모든 추천 영상 보기] 버튼 → /parent/videos로 이동
```

### 치료사 매칭 데이터 흐름 (Phase 2)
```
1. 치료사 검색
   - 필터 적용 (분야, 지역, 경력, 비용)
   - AI 추천 (발달체크 결과 기반)
   ↓
2. 치료사 프로필 확인
   - 치료사 상세 정보 조회
   - 실시간 스케줄 조회 (therapist_schedules + exceptions)
   ↓
3. 예약 가능 시간 확인
   - 2주 범위 캘린더 표시
   - 이미 예약된 시간 제외
   - 세션 시간 (50분) + 휴식 (10분) = 1시간 블록
   ↓
4. 세션 회수 및 일시 선택
   - 1/4/8/12회 선택 (할인율 적용)
   - 첫 세션 일시 선택
   - 해당 시간 10분간 임시 예약
   ↓
5. 예약 정보 입력
   - 방문 주소
   - 아이 정보 공유 동의
   - 특이사항
   ↓
6. 결제 (10분 타임아웃)
   - 세션 비용 계산 (할인 적용)
   - 플랫폼 수수료 15%
   - 결제 완료 시 예약 확정
   - 미결제 시 임시 예약 자동 취소
   ↓
7. 예약 확정
   - sessions 테이블 저장
   - 치료사에게 알림 발송
   - 부모 캘린더에 표시
```

### 세션 관리 데이터 흐름 (Phase 3)
```
1. 세션 스케줄 조회
   - GET /api/sessions?childId={id}&status=upcoming
   - 다가오는 세션 목록 표시
   ↓
2. 세션 시간 변경 요청
   - PUT /api/sessions/{id}/reschedule
   - 변경 희망 일시 입력
   - 치료사 승인 대기
   ↓
3. 세션 일지 조회
   - GET /api/sessions?childId={id}&status=completed
   - 완료된 세션 목록
   - 각 세션별 치료사 피드백 및 노트
   ↓
4. 발달 진전도 분석
   - 세션 간 비교
   - 발달 영역별 개선 추이
   - 그래프 시각화
```

## 🎨 UI/UX 가이드

### 색상 사용
```typescript
// 발달 레벨별 색상
EXCELLENT: 'bg-aipoten-green'      // 우수
GOOD: 'bg-aipoten-blue'            // 양호
CAUTION: 'bg-aipoten-orange'       // 주의
NEEDS_OBSERVATION: 'bg-aipoten-red' // 관찰 필요

// 카테고리별 색상
GROSS_MOTOR: 'bg-blue-500'    // 대근육
FINE_MOTOR: 'bg-purple-500'   // 소근육
LANGUAGE: 'bg-green-500'      // 언어
COGNITIVE: 'bg-yellow-500'    // 인지
SOCIAL: 'bg-pink-500'         // 사회성
```

### 반응형 디자인
```css
/* 모바일 (< 768px) */
- 단일 컬럼 레이아웃
- 큰 터치 영역
- 간소화된 네비게이션

/* 태블릿 (768px - 1024px) */
- 2컬럼 레이아웃
- 사이드바 토글

/* 데스크톱 (> 1024px) */
- 3-4컬럼 레이아웃
- 고정 사이드바
- 대시보드 위젯
```

## 🔒 보안 고려사항

### 인증/인가
```typescript
// 모든 /parent/* 경로는 로그인 필수
// Middleware에서 체크
- session.user.role === 'PARENT'

// 아이 정보 접근 권한
- child.userId === session.user.id

// 발달체크 접근 권한
- assessment.child.userId === session.user.id
```

### 데이터 보호
```typescript
// 민감 정보
- 아이 실명은 서버에만 저장
- 프론트엔드에서는 닉네임 사용 가능
- 의료 정보는 암호화 저장 (Phase 2)

// API 응답 필터링
- 다른 사용자의 데이터 노출 방지
- WHERE userId = session.user.id
```

## 📱 새로 추가된 핵심 기능 (WORKFLOW.md 기반)

### 7. 추천영상 페이지 (`/parent/videos`) - Phase 2
```typescript
// 발달체크 완료 후 자동 생성된 추천영상 목록

interface RecommendedVideo {
  id: string
  videoId: string  // Video 테이블 참조
  childId: string
  assessmentId: string  // 어떤 발달체크 기반인지
  category: DevelopmentCategory
  priority: number  // 높을수록 우선 노출
  reason: string  // 추천 이유
}

// 페이지 구성
- 상단: "OO이를 위한 맞춤 추천 영상 (발달체크 기준일: YYYY-MM-DD)"
- 카테고리별 섹션
  * 🟠 주의 영역: 언어 발달 (10개)
  * 🟡 양호 영역: 인지 발달 (5개)
  * 🟢 우수 영역: 대근육 등 (5개)
- 필터: 카테고리, 난이도, 재생시간
- 각 영상 카드: 썸네일, 제목, 연령, 카테고리, 난이도, [▶ 보기] 버튼
- 북마크 기능
```

### 8. 영상 상세/플레이어 (`/parent/videos/[id]`) - Phase 2
```typescript
// 영상 재생 및 상세 정보

// 구성
- YouTube/Naver TV 임베디드 플레이어
- 영상 제목 및 메타정보 (연령, 카테고리, 난이도, 재생시간)
- 놀이 방법 (상세 설명)
- 기대 효과
- 주의사항
- 북마크 버튼
- [시청 완료] 체크박스
- 관련 영상 추천 (같은 카테고리)

// API 연동
GET /api/videos/{id} - 영상 상세 정보
POST /api/videos/{id}/bookmark - 북마크 추가/제거
POST /api/videos/{id}/complete - 시청 완료 체크
```

### 9. 치료사 검색 (`/parent/therapists`) - Phase 2
```typescript
// 치료사 검색 및 필터링

// 필터 옵션
interface TherapistFilter {
  specialty: TherapyType[]  // 언어치료, 작업치료, 물리치료 등
  location: { city: string, district: string }
  minExperience: number  // 최소 경력 (년)
  maxSessionCost: number  // 최대 비용
  rating: number  // 최소 평점
}

// 정렬 옵션
- AI 추천순 (발달체크 결과 기반)
- 평점 높은순
- 거리 가까운순
- 비용 낮은순

// 목록 아이템
- 치료사 이름 및 사진
- 전문 분야 배지
- 경력 (예: 5년)
- 평점 및 리뷰 수 (예: 4.8/5.0, 리뷰 32개)
- 세션 비용 (예: 80,000원/회)
- [프로필 보기] 버튼
```

### 10. 치료사 프로필 및 예약 (`/parent/therapists/[id]`) - Phase 2
```typescript
// 치료사 상세 정보 및 예약

// 프로필 정보
- 이름, 사진
- 전문 분야 및 자격증
- 경력 및 약력
- 방문 가능 지역
- 세션 시간 (50분)
- 세션 비용 (1회 기준)
- 평점 및 리뷰

// 예약 가능 시간 캘린더 (2주 범위)
- 실시간 조회 (therapist_schedules)
- ✅ 예약 가능 시간
- ❌ 이미 예약된 시간
- 세션 시작 시간부터 1시간 블록 (50분 세션 + 10분 휴식)

// 세션 회수 선택
- 1회 (할인 없음)
- 4회 (10% 할인)
- 8회 (15% 할인)
- 12회 (20% 할인)

// 예약 정보 입력
- 아이 선택
- 방문 주소
- 발달체크 결과 공유 동의
- 의료 정보 공유 동의
- 특이사항 및 요청사항

// 예약 프로세스
1. 시간 선택 → 10분간 임시 예약
2. 세션 회수 및 정보 입력
3. 결제 화면으로 이동
4. 10분 내 결제 완료 시 예약 확정
5. 미결제 시 자동 취소
```

### 11. 세션 스케줄 (`/parent/sessions/schedule`) - Phase 3
```typescript
// 예약된 세션 일정 관리

// 캘린더 뷰
- 월간/주간 뷰 전환
- 예약된 세션 표시
  * 날짜, 시간
  * 치료사 이름
  * 세션 회차 (예: 3/8회)
  * 상태 (예정/완료/취소)

// 다가오는 세션 목록
- 가장 가까운 세션부터 표시
- 각 세션 정보
  * 치료사 이름 및 전문 분야
  * 일시 및 장소
  * 회차 정보
  * [시간 변경 요청] 버튼
  * [취소 요청] 버튼 (24시간 전까지)

// 시간 변경 요청
- 변경 희망 일시 입력
- 변경 사유 (선택)
- 치료사 승인 대기
- 승인/거부 알림
```

### 12. 세션 일지 (`/parent/sessions/logs`) - Phase 3
```typescript
// 완료된 세션 기록 및 피드백

// 세션 목록 (완료된 것만)
- 날짜순 정렬 (최신순/오래된순)
- 아이별 필터 (다자녀인 경우)

// 각 세션 상세
interface SessionLog {
  id: string
  sessionDate: Date
  therapist: { name: string, specialty: string }
  sessionNumber: number  // 회차 (예: 3회차)

  // 치료사 작성 내용
  sessionNote: string  // 세션 진행 내용
  feedback: string  // 부모님께 드리는 피드백
  homework: string  // 가정에서 할 과제
  nextGoals: string  // 다음 세션 목표

  // 발달 평가
  developmentProgress: {
    category: DevelopmentCategory
    beforeScore: number
    afterScore: number
    improvement: string
  }[]
}

// 세션 간 비교 분석
- 발달 영역별 점수 추이 그래프
- 세션 회차에 따른 개선도
- 전체 진전도 요약
```

## 📱 향후 고도화 기능 (Phase 4+)

### Phase 4: 고급 분석 및 협업
- [ ] 다자녀 발달 비교 분석
- [ ] AI 기반 발달 예측 모델
- [ ] 성장 앨범 (사진/동영상 타임라인)
- [ ] 가족 구성원 초대 (조부모, 배우자 등)
- [ ] 치료사-부모 실시간 채팅
- [ ] 화상 상담 (WebRTC)

### Phase 5: 커뮤니티 및 소셜
- [ ] 비슷한 발달 단계 아이 부모 매칭
- [ ] 지역 기반 오프라인 모임
- [ ] 전문가 Q&A 게시판
- [ ] 성공 사례 공유

## 🧪 테스트 체크리스트

### 단위 테스트
- [ ] 폼 검증 로직
- [ ] 점수 계산 로직
- [ ] 조건부 흐름 로직

### 통합 테스트
- [ ] 아이 등록 플로우
- [ ] 발달체크 전체 플로우
- [ ] 결과 조회 및 공유

### E2E 테스트
- [ ] 신규 사용자 온보딩
- [ ] 첫 발달체크 완료
- [ ] 결과 확인 및 PDF 다운로드

## 📝 다음 단계

### ✅ 완료된 작업 (Week 3-6)
1. **발달체크 시스템** ✅
   - [x] survey.txt 기반 질문 데이터 seed (120개 질문)
   - [x] 발달체크 new 페이지 Q1→Q2→Q3 로직 구현
   - [x] 카테고리별 점수 계산 및 레벨 판정
   - [x] 진행률 표시 및 응답 검증

### 🔜 다음 우선순위 (Week 7-8)
1. **아이 관리 개선**
   - [ ] ChildSelector 컴포넌트 구현 (좌우 화살표)
   - [ ] 추가 자녀 등록 모달 구현
   - [ ] 대시보드에 선택기 통합

2. **대시보드 강화**
   - [ ] 선택된 아이 기준 최근 발달체크 요약
   - [ ] Quick Actions에 추천영상, 치료사 찾기 추가
   - [ ] 다음 체크 시기 알림

3. **발달체크 결과 개선**
   - [ ] 레이더 차트 구현 (5개 카테고리)
   - [ ] 경고 플래그 표시
   - [ ] PDF 리포트 다운로드

### 📋 Phase 2 준비 (Week 9-12)
1. **영상 추천 시스템**
   - [ ] 발달체크 완료 후 자동 추천 로직 구현
   - [ ] recommended_videos 테이블 스키마 설계
   - [ ] /parent/videos 페이지 구현
   - [ ] 영상 플레이어 및 북마크 기능

2. **치료사 매칭 기반**
   - [ ] 치료사 검색 필터 및 정렬 UI
   - [ ] 실시간 스케줄 조회 로직
   - [ ] 예약 시스템 기본 구조
   - [ ] 결제 프로세스 설계

### 🚀 Phase 3 준비 (Week 13-20)
1. **세션 관리 시스템**
   - [ ] 세션 스케줄 캘린더 뷰
   - [ ] 시간 변경 요청 워크플로우
   - [ ] 세션 일지 페이지
   - [ ] 발달 진전도 분석 및 시각화
