# 부모 페이지 개발 가이드

## 📁 폴더 구조
```
src/app/parent/
├── dashboard/          # 부모 대시보드
│   └── page.tsx
├── children/           # 아이 관리
│   ├── new/           # 아이 등록
│   │   └── page.tsx
│   └── [id]/          # 아이 상세/수정
│       └── page.tsx
└── assessments/        # 발달체크 관리
    ├── page.tsx       # 발달체크 목록
    ├── new/           # 새 발달체크
    │   └── page.tsx
    └── [id]/          # 발달체크 결과
        └── page.tsx
```

## 🎯 개발 우선순위 (Phase 1 - MVP)

### Week 1-2: 기본 구조 ✅
- [x] 부모 대시보드 페이지 구조
- [x] 아이 등록/수정 페이지
- [x] 발달체크 목록 페이지

### Week 3-6: 발달체크 시스템 🔄
- [ ] **발달체크 질문 시스템**
  - [ ] 27-29개월 질문지 구현 (survey.txt 기반)
  - [ ] Q1→Q2→Q3 조건부 흐름 로직
  - [ ] 5개 카테고리 질문 UI
    - 대근육 운동 (8문항)
    - 소근육 운동 (8문항)
    - 언어 (7문항)
    - 인지 (8문항)
    - 사회성 (4문항)
  - [ ] 경고 질문 처리 (5문항)

- [ ] **발달체크 진행 화면**
  - [ ] 진행률 표시 (Progress Bar)
  - [ ] 카테고리별 섹션 구분
  - [ ] 이전/다음 버튼
  - [ ] 중간 저장 기능
  - [ ] 응답 검증

- [ ] **결과 화면**
  - [ ] 종합 점수 계산 및 표시
  - [ ] 카테고리별 점수 레이더 차트
  - [ ] 발달 수준 판정 (우수/양호/주의/관찰필요)
  - [ ] 경고 플래그 표시
  - [ ] PDF 리포트 다운로드

### Week 7-8: 사용자 경험 개선
- [ ] **대시보드 강화**
  - [ ] 최근 발달체크 결과 요약
  - [ ] 다음 체크 시기 알림
  - [ ] 발달 추이 그래프
  - [ ] Quick Actions 최적화

- [ ] **아이 프로필 강화**
  - [ ] 성장 기록 (키/몸무게 차트)
  - [ ] 발달 마일스톤 타임라인
  - [ ] 의료 정보 상세 관리
  - [ ] 사진 갤러리

## 🔧 주요 기능 명세

### 1. 부모 대시보드 (`/parent/dashboard`)

#### 구성 요소
```typescript
// 상단 섹션
- 환영 메시지 + 프로필 사진
- Quick Actions (아이 등록, 발달체크, 추천영상, 육아소통)

// 등록된 아이 목록
- 아이별 카드 (이름, 성별, 나이, 등록일)
- 클릭 시 상세 페이지 이동
- 빈 상태: "첫 번째 아이 등록하기" CTA

// 최근 활동 (Phase 2)
- 최근 발달체크 결과
- 저장한 영상
- 커뮤니티 활동
```

#### API 연동
```typescript
// GET /api/children - 아이 목록
// GET /api/users/me - 사용자 정보
// GET /api/assessments?limit=3 - 최근 발달체크 3개
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

### 발달체크 데이터 흐름
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
6. 결과 페이지 표시
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

## 📱 향후 기능 (Phase 2+)

### Phase 2: 콘텐츠 연동
- [ ] 발달체크 결과 기반 영상 자동 추천
- [ ] 놀이영상 북마크/재생 기록
- [ ] 커뮤니티 글쓰기/댓글

### Phase 3: 치료사 매칭
- [ ] 발달체크 결과 공유
- [ ] 치료사 검색/필터
- [ ] 매칭 요청/예약
- [ ] 화상 상담

### Phase 4: 고도화
- [ ] 다자녀 비교 분석
- [ ] AI 발달 예측
- [ ] 성장 앨범
- [ ] 가족 구성원 초대

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

1. **즉시 작업 필요** (Week 3-6)
   - [ ] survey.txt 기반 질문 데이터 seed
   - [ ] 발달체크 new 페이지 Q1→Q2→Q3 로직 구현
   - [ ] 결과 페이지 레이더 차트 구현

2. **Week 7-8**
   - [ ] 대시보드 통계 위젯 추가
   - [ ] 중간 저장 기능 구현
   - [ ] PDF 리포트 생성

3. **Phase 2 준비**
   - [ ] 영상 추천 API 연동 준비
   - [ ] 북마크 기능 설계
