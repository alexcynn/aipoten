# 관리자 페이지 개발 가이드

## 📁 폴더 구조
```
src/app/admin/
├── dashboard/          # 관리자 대시보드
│   └── page.tsx
├── users/              # 사용자 관리
│   ├── page.tsx       # 사용자 목록
│   └── [id]/          # 사용자 상세
│       └── page.tsx
├── therapists/         # 치료사 관리
│   ├── page.tsx       # 치료사 목록
│   └── [id]/          # 치료사 승인/관리
│       └── page.tsx
├── boards/             # 게시판 관리
│   └── page.tsx
├── news/               # 육아정보 관리
│   ├── page.tsx       # 뉴스 목록
│   └── new/           # 새 글 작성
│       └── page.tsx
├── videos/             # 놀이영상 관리
│   ├── page.tsx       # 영상 목록
│   └── new/           # 새 영상 추가
│       └── page.tsx
└── analytics/          # 통계 및 분석
    └── page.tsx
```

## 🎯 개발 우선순위

### Phase 1: 기본 관리 기능 (현재)
- [x] 관리자 대시보드 기본 구조
- [x] 사용자/치료사/게시판/뉴스/영상 페이지 생성
- [ ] 각 페이지 CRUD 기능 구현

### Phase 2: 콘텐츠 관리 시스템 (Week 13-20)
- [ ] **육아정보(뉴스) 관리**
  - [ ] 글 작성/수정/삭제
  - [ ] 카테고리 관리
  - [ ] 이미지 업로드
  - [ ] 미리보기
  - [ ] 발행/비발행 관리

- [ ] **놀이영상 관리**
  - [ ] 영상 업로드 (직접 업로드 또는 YouTube 링크)
  - [ ] 메타데이터 입력
    - 제목, 설명
    - 대상 연령 (최소/최대)
    - 카테고리, 난이도
    - 태그
  - [ ] 썸네일 설정
  - [ ] 발행 관리

- [ ] **게시판 관리**
  - [ ] 게시글 모니터링
  - [ ] 부적절한 글 숨김/삭제
  - [ ] 공지사항 작성
  - [ ] 고정 글 설정

### Phase 3: 치료사 승인 시스템 (Week 21-32)
- [ ] **치료사 신청 심사**
  - [ ] 신청자 목록
  - [ ] 자격증 파일 확인
  - [ ] 경력 검증
  - [ ] 승인/거절 처리
  - [ ] 거절 사유 작성

- [ ] **치료사 관리**
  - [ ] 치료사 목록 (활성/정지/탈퇴)
  - [ ] 활동 통계
  - [ ] 리뷰 모니터링
  - [ ] 정지/해제 기능

### Phase 4: 분석 및 모니터링 (Week 33-40)
- [ ] **대시보드 고도화**
  - [ ] 핵심 지표 KPI
  - [ ] 실시간 통계
  - [ ] 트렌드 분석

- [ ] **사용자 분석**
  - [ ] 가입자 통계
  - [ ] 활성 사용자 (DAU/MAU)
  - [ ] 리텐션 분석
  - [ ] 코호트 분석

- [ ] **콘텐츠 분석**
  - [ ] 인기 영상
  - [ ] 조회수 통계
  - [ ] 완료율 분석

## 🔧 주요 기능 명세

### 1. 관리자 대시보드 (`/admin/dashboard`)

#### 구성 요소
```typescript
// 핵심 지표 (KPI Cards)
- 전체 사용자 수 (전일 대비)
- 활성 사용자 (DAU/MAU)
- 등록 치료사 수
- 이번 달 매칭 건수
- 이번 달 수익

// Quick Actions
- [새 육아정보 작성]
- [새 놀이영상 추가]
- [알림장 작성]
- [대기 중인 치료사 승인]

// 최근 활동
- 새 사용자 가입 (최근 10명)
- 새 발달체크 완료
- 새 매칭 요청
- 새 게시글

// 승인 대기 항목
- 치료사 신청 (개수 배지)
- 신고된 게시글 (개수 배지)

// 시스템 상태
- 서버 상태 (정상/경고/오류)
- 데이터베이스 상태
- 스토리지 사용량
- 에러 로그 (최근 24시간)
```

#### API 연동
```typescript
// GET /api/admin/stats - 전체 통계
// GET /api/admin/recent-activities - 최근 활동
// GET /api/admin/pending-approvals - 승인 대기 항목
// GET /api/admin/system-health - 시스템 상태
```

### 2. 사용자 관리 (`/admin/users`)

#### 사용자 목록
```typescript
interface UserListItem {
  id: string
  email: string
  name: string
  role: Role
  createdAt: Date
  lastLoginAt?: Date
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED'

  // 통계
  childrenCount: number
  assessmentsCount: number
  postsCount: number
}

// 필터
- 역할별 (부모/치료사/관리자)
- 상태별 (활성/정지/삭제)
- 가입일 범위
- 검색 (이메일, 이름)

// 정렬
- 최신 가입순
- 이름순
- 마지막 로그인순

// 액션
- [사용자 상세]
- [정지]
- [삭제]
```

#### 사용자 상세 (`/admin/users/[id]`)
```typescript
// 기본 정보
- 이메일, 이름, 역할
- 가입일, 마지막 로그인
- 프로필 사진

// 활동 통계
- 등록한 아이 수
- 발달체크 완료 횟수
- 작성한 게시글/댓글 수
- 북마크한 영상 수

// 아이 정보 (부모인 경우)
- 등록된 아이 목록
- 각 아이의 발달체크 이력

// 게시 활동
- 작성한 글 목록
- 작성한 댓글 목록
- 신고 이력

// 관리 액션
- [정보 수정]
- [비밀번호 초기화]
- [계정 정지]
- [계정 삭제]
- [정지 해제]
```

#### API 연동
```typescript
// GET /api/admin/users - 사용자 목록
// GET /api/admin/users/[id] - 사용자 상세
// PATCH /api/admin/users/[id] - 사용자 정보 수정
// PATCH /api/admin/users/[id]/suspend - 계정 정지
// DELETE /api/admin/users/[id] - 계정 삭제
```

### 3. 치료사 관리 (`/admin/therapists`)

#### 치료사 목록
```typescript
interface TherapistListItem {
  id: string
  user: { name: string, email: string }
  specialty: TherapyType
  licenseNumber: string
  experience: number
  consultationFee: number
  status: TherapistStatus
  approvedAt?: Date
  createdAt: Date

  // 통계
  matchingCount: number
  consultationCount: number
  averageRating: number
}

// 탭 구분
- 승인 대기 (PENDING) - 배지 표시
- 활성 (APPROVED)
- 거절됨 (REJECTED)
- 정지됨 (SUSPENDED)

// 필터
- 전문 분야별
- 경력별
- 평점별

// 정렬
- 신청일순
- 평점순
- 상담 건수순
```

#### 치료사 상세/승인 (`/admin/therapists/[id]`)
```typescript
// 기본 정보
- 이름, 이메일
- 전문 분야
- 자격증 번호
- 경력
- 학력
- 자기소개

// 자격증 파일
- 업로드된 파일 목록
- [파일 다운로드] [파일 보기]

// 상담 정보
- 상담료
- 상담 방식
- 가능 시간

// 활동 통계
- 총 매칭 건수
- 완료된 상담 건수
- 평균 평점
- 리뷰 목록

// 승인 프로세스 (PENDING 상태)
- 정보 검토 체크리스트
  - [ ] 자격증 유효성 확인
  - [ ] 경력 사항 확인
  - [ ] 학력 사항 확인
  - [ ] 상담료 적정성 확인
- [승인하기] 버튼
  → status = APPROVED
  → approvedAt = now()
  → 치료사에게 승인 이메일 발송
- [거절하기] 버튼
  → 거절 사유 입력 모달
  → status = REJECTED
  → rejectedAt = now()
  → 치료사에게 거절 이메일 발송

// 관리 액션 (APPROVED 상태)
- [정지]
  → 정지 사유 입력
  → status = SUSPENDED
- [삭제]
```

#### API 연동
```typescript
// GET /api/admin/therapists - 치료사 목록
// GET /api/admin/therapists/[id] - 치료사 상세
// PATCH /api/admin/therapists/[id]/approve - 승인
// PATCH /api/admin/therapists/[id]/reject - 거절
// PATCH /api/admin/therapists/[id]/suspend - 정지
// DELETE /api/admin/therapists/[id] - 삭제
```

### 4. 게시판 관리 (`/admin/boards`)

#### 게시판 개요
```typescript
// 게시판 목록
- 알림장 (notification)
- 육아소통 (parenting)

// 각 게시판 통계
- 전체 게시글 수
- 오늘 작성된 글 수
- 신고된 글 수
- 숨김 처리된 글 수
```

#### 게시글 관리
```typescript
interface PostManagement {
  id: string
  title: string
  author: { name: string, email: string }
  boardId: string
  views: number
  commentsCount: number
  isSticky: boolean      // 공지 고정
  isPublished: boolean   // 발행 상태
  isReported: boolean    // 신고됨
  createdAt: Date
}

// 필터
- 게시판별
- 발행 상태 (발행됨/비발행)
- 신고 여부
- 고정 여부

// 액션
- [상세보기]
- [수정]
- [삭제]
- [숨김/복원]
- [고정/고정 해제]

// 일괄 작업
- 선택한 글 일괄 삭제
- 선택한 글 일괄 숨김
```

#### API 연동
```typescript
// GET /api/admin/posts - 게시글 목록
// GET /api/admin/posts/[id] - 게시글 상세
// PATCH /api/admin/posts/[id] - 게시글 수정
// DELETE /api/admin/posts/[id] - 게시글 삭제
// PATCH /api/admin/posts/[id]/hide - 숨김 처리
// PATCH /api/admin/posts/[id]/pin - 고정/고정 해제
```

### 5. 육아정보 관리 (`/admin/news`)

#### 뉴스 목록
```typescript
interface NewsListItem {
  id: string
  title: string
  category: NewsCategory
  views: number
  isPublished: boolean
  isFeatured: boolean    // 메인 노출
  publishedAt?: Date
  createdAt: Date
}

enum NewsCategory {
  PARENTING_INFO       // 육아정보
  DEVELOPMENT_GUIDE    // 발달가이드
  ANNOUNCEMENT         // 공지사항
  RESEARCH             // 연구소식
  EVENT                // 이벤트
}

// 필터
- 카테고리별
- 발행 상태
- 메인 노출 여부

// 액션
- [새 글 작성]
- [수정]
- [삭제]
- [발행/비발행]
- [메인 노출/해제]
```

#### 새 글 작성 (`/admin/news/new`)
```typescript
// 입력 필드
- 제목 (필수, 100자)
- 요약 (필수, 200자)
- 카테고리 (드롭다운)
- 태그 (콤마 구분, 최대 5개)
- 대표 이미지 (업로드)
- 본문 (마크다운 에디터)
  - 이미지 삽입
  - 코드 블록
  - 테이블
  - 링크
- 발행 상태
  - [ ] 즉시 발행
  - [ ] 예약 발행 (날짜/시간 선택)
  - [ ] 임시저장
- 메인 노출 여부

// 미리보기
- 작성 중 실시간 미리보기
- [전체 화면 미리보기] 버튼

// 액션
- [임시저장]
- [미리보기]
- [발행]
```

#### API 연동
```typescript
// GET /api/admin/news - 뉴스 목록
// POST /api/admin/news - 새 글 작성
// GET /api/admin/news/[id] - 뉴스 상세
// PATCH /api/admin/news/[id] - 수정
// DELETE /api/admin/news/[id] - 삭제
// POST /api/admin/news/upload - 이미지 업로드
```

### 6. 놀이영상 관리 (`/admin/videos`)

#### 영상 목록
```typescript
interface VideoListItem {
  id: string
  title: string
  category: string
  targetAgeMin: number
  targetAgeMax: number
  difficulty: Difficulty
  viewCount: number
  bookmarkCount: number
  isPublished: boolean
  priority: number       // 추천 우선순위 1-10
  createdAt: Date
}

// 필터
- 카테고리별
- 대상 연령
- 난이도
- 발행 상태

// 정렬
- 최신순
- 조회수순
- 북마크순
- 우선순위순
```

#### 새 영상 추가 (`/admin/videos/new`)
```typescript
// 입력 필드
- 제목 (필수, 100자)
- 설명 (필수, 500자)

// 영상 소스
- 플랫폼 선택
  - YouTube
  - 네이버 TV
  - 카카오 TV
  - Vimeo
  - 직접 업로드
- 영상 URL 또는 파일 업로드
- 썸네일 이미지 (자동 생성 또는 직접 업로드)

// 메타데이터
- 카테고리 (드롭다운)
  - 대근육 발달
  - 소근육 발달
  - 언어 발달
  - 인지 발달
  - 사회성 발달
  - 창의성
  - 음악/리듬
  - 미술/그리기
  - 책 읽기
  - 수학/숫자
  - 과학/탐구
- 대상 연령 (최소-최대 개월)
- 난이도 (쉬움/보통/어려움)
- 재생 시간 (자동 계산 또는 수동 입력)
- 태그 (콤마 구분)

// 추천 설정
- 우선순위 (1-10)
- 추천 여부
- 메인 노출

// 발행 설정
- [ ] 즉시 발행
- [ ] 예약 발행
- [ ] 임시저장

// 미리보기
- 영상 플레이어
- 메타데이터 확인
```

#### API 연동
```typescript
// GET /api/admin/videos - 영상 목록
// POST /api/admin/videos - 새 영상 추가
// GET /api/admin/videos/[id] - 영상 상세
// PATCH /api/admin/videos/[id] - 수정
// DELETE /api/admin/videos/[id] - 삭제
// POST /api/admin/videos/upload - 영상 파일 업로드
```

### 7. 통계 및 분석 (`/admin/analytics`)

#### 대시보드 차트
```typescript
// 사용자 통계
- 가입자 추이 (일별/주별/월별)
- DAU/MAU 트렌드
- 신규/재방문 비율
- 이탈률

// 콘텐츠 통계
- 발달체크 완료 추이
- 영상 조회수 TOP 10
- 게시글 조회수 TOP 10
- 카테고리별 인기도

// 매칭 통계 (Phase 3)
- 매칭 요청 추이
- 매칭 성공률
- 치료사별 매칭 건수
- 평균 상담료

// 수익 통계 (Phase 3)
- 월별 수익 추이
- 매칭 수수료
- B2B 라이선스 수익
- 플랫폼 수수료율

// 시스템 통계
- API 응답 시간
- 에러율
- 서버 리소스 사용량
```

#### 보고서 내보내기
```typescript
// 기간별 리포트
- 일간 리포트
- 주간 리포트
- 월간 리포트

// 포맷
- PDF
- Excel
- CSV

// 자동 발송
- 매일 아침 관리자 이메일로 일간 리포트
- 매주 월요일 주간 리포트
- 매월 1일 월간 리포트
```

## 📊 데이터 흐름

### 치료사 승인 플로우
```
1. 치료사 회원가입 완료
   ↓
2. 프로필 정보 입력
   - 전문 정보
   - 자격증 업로드
   ↓
3. 승인 요청
   - status = PENDING
   ↓
4. 관리자에게 알림
   ↓
5. 관리자 심사
   - 자격증 확인
   - 경력 검증
   ↓
6. 승인/거절 결정

   [승인 시]
   - status = APPROVED
   - approvedAt = now()
   - 치료사에게 승인 이메일
   - 치료사 플랫폼 접근 가능

   [거절 시]
   - status = REJECTED
   - rejectionReason 입력
   - 치료사에게 거절 이메일
   - 재신청 가능 안내
```

### 콘텐츠 발행 플로우
```
1. 관리자 글 작성
   ↓
2. 미리보기 확인
   ↓
3. 발행 옵션 선택
   - 즉시 발행
   - 예약 발행
   - 임시저장
   ↓
4. 발행 실행
   - isPublished = true
   - publishedAt = now() 또는 예약 시간
   ↓
5. 사용자에게 노출
   - 메인 페이지 (isFeatured = true)
   - 목록 페이지
   - 검색 결과
```

## 🎨 UI/UX 가이드

### 레이아웃
```typescript
// 사이드바 (고정)
- 대시보드
- 사용자 관리
- 치료사 관리
- 게시판 관리
- 육아정보 관리
- 놀이영상 관리
- 통계 분석
- 로그아웃

// 헤더
- 사이트 로고
- 알림 아이콘 (승인 대기 등)
- 관리자 프로필

// 메인 컨텐츠
- 페이지 제목
- 액션 버튼
- 필터/검색
- 테이블 또는 카드 뷰
```

### 데이터 테이블
```typescript
// 공통 기능
- 페이지네이션
- 검색
- 필터
- 정렬
- 일괄 선택
- 일괄 작업

// 액션 버튼 배치
- 행별 액션: 오른쪽 정렬
- 일괄 액션: 테이블 상단
```

## 🔒 보안 및 권한

### 접근 제한
```typescript
// /admin/* 접근 제한
- session.user.role === 'ADMIN'

// 민감한 작업 추가 인증
- 사용자 삭제
- 치료사 정지
- 시스템 설정 변경
→ 비밀번호 재확인
```

### 감사 로그 (Phase 4)
```typescript
// 모든 관리 작업 로깅
- 작업 유형 (생성/수정/삭제)
- 대상 (사용자/게시글/영상 등)
- 작업자 (관리자)
- 작업 시간
- 변경 내용 (Before/After)
```

## 📱 향후 기능

### Phase 4: 고도화
- [ ] 실시간 대시보드 (자동 갱신)
- [ ] 고급 필터 및 검색
- [ ] 일괄 작업 기능 강화
- [ ] 역할 기반 권한 관리 (Admin, Editor, Viewer)

### Phase 5: 자동화
- [ ] 부적절한 콘텐츠 자동 감지
- [ ] 자동 카테고리 분류
- [ ] 자동 태그 추천
- [ ] 정기 보고서 자동 발송

## 🧪 테스트 체크리스트

- [ ] 사용자 목록 조회 및 필터
- [ ] 치료사 승인/거절 프로세스
- [ ] 게시글 관리 (숨김/삭제)
- [ ] 뉴스 작성 및 발행
- [ ] 영상 추가 및 메타데이터 입력
- [ ] 통계 대시보드 데이터 정확성

## 📝 다음 단계

1. **Phase 2: CMS 구축**
   - [ ] 뉴스 작성 마크다운 에디터
   - [ ] 이미지 업로드 시스템
   - [ ] 영상 업로드/인코딩 파이프라인
   - [ ] 미리보기 기능

2. **Phase 3: 치료사 승인**
   - [ ] 자격증 파일 뷰어
   - [ ] 승인/거절 워크플로우
   - [ ] 이메일 알림 템플릿

3. **Phase 4: 분석 대시보드**
   - [ ] Chart.js/Recharts 연동
   - [ ] 실시간 데이터 갱신
   - [ ] 보고서 PDF 생성
