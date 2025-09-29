# aipoten 시스템 아키텍처

## 목차
1. [기술 스택](#기술-스택)
2. [시스템 아키텍처](#시스템-아키텍처)
3. [데이터베이스 설계](#데이터베이스-설계)
4. [API 설계](#api-설계)
5. [보안 및 인증](#보안-및-인증)
6. [인프라 구조](#인프라-구조)
7. [성능 최적화](#성능-최적화)

---

## 기술 스택

### 프론트엔드

#### 웹 애플리케이션
- **프레임워크**: Next.js 14 (React 18)
  - SSR/SSG를 통한 SEO 최적화
  - App Router를 통한 효율적인 라우팅
  - 이미지 최적화 자동화
- **언어**: TypeScript
- **상태 관리**: Zustand + React Query
  - Zustand: 전역 상태 (사용자 인증, 테마 등)
  - React Query: 서버 상태 (데이터 페칭, 캐싱)
- **스타일링**: TailwindCSS + shadcn/ui
  - 빠른 UI 개발
  - 커스터마이징 가능한 컴포넌트
- **폼 관리**: React Hook Form + Zod
  - 타입 안전한 폼 검증
- **차트**: Recharts / Chart.js
  - 발달 그래프 시각화
- **영상 플레이어**: Video.js / React Player
  - HLS 스트리밍 지원

#### 모바일 애플리케이션 (선택)
- **프레임워크**: React Native / Flutter
  - React Native: 웹 코드 재사용성 높음
  - Flutter: 네이티브 성능 우수
- **상태 관리**: Redux Toolkit / Provider
- **영상 플레이어**: react-native-video / video_player

### 백엔드

#### API 서버
- **프레임워크**: NestJS (Node.js + TypeScript)
  - 모듈화된 아키텍처
  - TypeScript 완벽 지원
  - 의존성 주입 패턴
- **대안**: Django REST Framework / Spring Boot
  - Django: 빠른 개발, 강력한 ORM
  - Spring Boot: 엔터프라이즈급 확장성

#### 실시간 통신
- **WebSocket**: Socket.io
  - 실시간 알림
  - 화상 상담 시그널링
- **화상 통화**: WebRTC + Agora / Zoom SDK
  - P2P 또는 서버 중계 방식

#### 비동기 처리
- **메시지 큐**: BullMQ (Redis 기반)
  - 이메일 발송
  - 알림 푸시
  - 영상 인코딩
  - 데이터 분석 작업

### 데이터베이스

#### 주 데이터베이스
- **PostgreSQL 14+**
  - JSONB를 통한 유연한 스키마
  - 복잡한 쿼리 지원
  - 트랜잭션 보장

#### 캐시
- **Redis 7+**
  - 세션 저장
  - API 응답 캐싱
  - 실시간 데이터 (온라인 사용자)
  - 메시지 큐

#### 검색 엔진
- **Elasticsearch** (선택)
  - 치료사 검색
  - 콘텐츠 전문 검색
  - 자동완성 기능

### 파일 저장소

- **클라우드 스토리지**: AWS S3 / Google Cloud Storage
  - 영상 파일 저장
  - 이미지 저장
  - 문서 저장
- **CDN**: CloudFront / Cloudflare
  - 영상 스트리밍 최적화
  - 정적 자산 전송 가속화

### 인증 및 보안

- **인증**: JWT (Access Token + Refresh Token)
- **OAuth 2.0**: 소셜 로그인 (Google, Kakao, Naver, Apple)
- **암호화**: bcrypt (비밀번호), AES-256 (민감 데이터)

### DevOps & 인프라

#### 컨테이너화
- **Docker**: 애플리케이션 컨테이너화
- **Docker Compose**: 로컬 개발 환경

#### 오케스트레이션
- **Kubernetes (K8s)**: 프로덕션 배포
  - 자동 스케일링
  - 무중단 배포
  - 헬스 체크

#### CI/CD
- **GitHub Actions**: 자동화된 테스트 및 배포
  - PR 시 자동 테스트
  - 메인 브랜치 머지 시 자동 배포

#### 모니터링
- **애플리케이션 모니터링**: Sentry (에러 추적)
- **로그 관리**: ELK Stack (Elasticsearch + Logstash + Kibana)
- **인프라 모니터링**: Prometheus + Grafana
- **APM**: New Relic / Datadog

#### 클라우드 인프라
- **AWS** (권장)
  - EC2: 애플리케이션 서버
  - RDS: PostgreSQL 매니지드 서비스
  - ElastiCache: Redis 매니지드 서비스
  - S3: 파일 저장소
  - CloudFront: CDN
  - Lambda: 서버리스 함수
  - SES: 이메일 발송
  - SNS/SQS: 알림 및 메시지 큐
- **대안**: Google Cloud Platform / Azure

### 분석 및 추적

- **웹 분석**: Google Analytics 4 / Mixpanel
- **모바일 분석**: Firebase Analytics
- **사용자 행동 분석**: Amplitude / Heap
- **A/B 테스트**: Optimizely / Google Optimize

---

## 시스템 아키텍처

### 전체 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────────┐
│                         클라이언트                            │
├─────────────────────────────────────────────────────────────┤
│  Web (Next.js)  │  Mobile (React Native)  │  Admin (Next.js) │
└────────┬────────┴─────────────┬────────────┴────────┬────────┘
         │                      │                     │
         └──────────────────────┼─────────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │   API Gateway (NGINX) │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │   Load Balancer (ALB) │
                    └───────────┬───────────┘
                                │
         ┌──────────────────────┼──────────────────────┐
         │                      │                      │
    ┌────▼─────┐         ┌─────▼──────┐        ┌─────▼──────┐
    │ API      │         │ WebSocket  │        │ Streaming  │
    │ Server 1 │         │ Server     │        │ Server     │
    └────┬─────┘         └─────┬──────┘        └─────┬──────┘
         │                     │                      │
         └─────────────────────┼──────────────────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
    ┌────▼────┐         ┌──────▼──────┐      ┌─────▼──────┐
    │ PostgreSQL│        │   Redis     │      │    S3      │
    │  (RDS)   │         │(ElastiCache)│      │  Storage   │
    └──────────┘         └─────────────┘      └────────────┘
         │
    ┌────▼────┐
    │  Backup │
    │ Storage │
    └─────────┘

┌──────────────────────────────────────────────────────────────┐
│                      백그라운드 워커                           │
├──────────────────────────────────────────────────────────────┤
│  Email Worker │ Notification Worker │ Analytics Worker │ ... │
└──────────────────────────────────────────────────────────────┘
```

### 마이크로서비스 아키텍처 (확장 시)

```
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│ User Service   │  │ Content Service│  │ Matching Service│
│ - 사용자 관리   │  │ - 발달 체크    │  │ - 치료사 매칭  │
│ - 인증/인가    │  │ - 놀이영상     │  │ - 예약 관리    │
└────────┬───────┘  └────────┬───────┘  └────────┬───────┘
         │                   │                    │
         └───────────────────┼────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  API Gateway    │
                    └─────────────────┘
```

---

## 데이터베이스 설계

### ERD (Entity Relationship Diagram)

#### 핵심 테이블

```sql
-- 사용자 관리
users
  - id (PK)
  - email (UNIQUE)
  - password_hash
  - name
  - phone
  - role (enum: parent, therapist, admin)
  - created_at
  - updated_at

children
  - id (PK)
  - user_id (FK -> users)
  - name
  - birth_date
  - gender
  - gestational_weeks (출산 주수, INT)
  - birth_weight (출생 시 몸무게, DECIMAL)
  - current_height (현재 키, DECIMAL)
  - current_weight (현재 몸무게, DECIMAL)
  - medical_history (병력/수술력, TEXT)
  - family_history (가족력, TEXT)
  - treatment_history (치료력, TEXT)
  - notes (특이사항, TEXT)
  - created_at
  - updated_at

-- 발달 체크
development_assessments
  - id (PK)
  - child_id (FK -> children)
  - assessment_date
  - age_in_months
  - status (enum: in_progress, completed)
  - created_at
  - completed_at

assessment_responses
  - id (PK)
  - assessment_id (FK -> development_assessments)
  - question_id (FK -> assessment_questions)
  - response (JSONB)
  - created_at

assessment_questions
  - id (PK)
  - category (enum: gross_motor, fine_motor, cognitive, language, social, emotional)
  - age_range_start
  - age_range_end
  - question_text
  - answer_type (enum: yes_no, scale, multiple_choice)
  - weight (FLOAT)
  - order_index

assessment_results
  - id (PK)
  - assessment_id (FK -> development_assessments)
  - category
  - score (FLOAT)
  - level (enum: excellent, good, caution, needs_observation)
    - excellent: 80-100점 (우수)
    - good: 60-79점 (양호)
    - caution: 40-59점 (주의)
    - needs_observation: 0-39점 (관찰 필요)
  - feedback (TEXT)
  - recommendations (TEXT)
  - created_at

-- 놀이영상
videos
  - id (PK)
  - title
  - description
  - video_url (외부 링크: YouTube, 네이버TV 등)
  - video_platform (enum: youtube, naver_tv, kakao_tv, vimeo, other)
  - embed_code (TEXT: 임베디드 코드)
  - thumbnail_url (썸네일 이미지 URL)
  - duration (seconds)
  - target_age_min (대상 연령 최소, 개월)
  - target_age_max (대상 연령 최대, 개월)
  - difficulty (enum: easy, medium, hard)
  - play_method (TEXT: 놀이 방법 상세)
  - expected_effects (TEXT: 기대 효과)
  - materials_needed (TEXT: 준비물)
  - precautions (TEXT: 주의사항)
  - is_published (BOOLEAN)
  - priority (INT: 추천 우선순위 1-10)
  - view_count (INT)
  - bookmark_count (INT)
  - completion_count (INT)
  - created_at
  - published_at
  - url_last_checked_at (링크 유효성 마지막 체크 시간)

video_categories
  - id (PK)
  - name
  - slug

video_category_mapping
  - video_id (FK -> videos)
  - category_id (FK -> video_categories)

video_development_areas
  - id (PK)
  - video_id (FK -> videos)
  - area (enum: gross_motor, fine_motor, cognitive, language, social, emotional)

video_tags
  - id (PK)
  - video_id (FK -> videos)
  - tag_name

user_video_interactions
  - id (PK)
  - user_id (FK -> users)
  - video_id (FK -> videos)
  - is_bookmarked (BOOLEAN)
  - is_completed (BOOLEAN)
  - watch_time (seconds)
  - last_watched_at

recommended_videos
  - id (PK)
  - assessment_id (FK -> development_assessments)
  - child_id (FK -> children)
  - video_id (FK -> videos)
  - development_area (enum: gross_motor, fine_motor, cognitive, language, social, emotional)
  - area_level (enum: excellent, good, caution, needs_observation)
  - recommendation_reason (TEXT: 추천 이유)
  - priority_score (INT: 추천 우선순위 점수)
  - is_viewed (BOOLEAN: 시청 여부)
  - created_at (추천 생성 시간)

-- 치료사 관리
therapist_profiles
  - id (PK)
  - user_id (FK -> users)
  - specialty (enum: speech, occupational, physical, psychological, play, sensory)
  - years_of_experience
  - certifications (JSONB)
  - bio (TEXT)
  - consultation_fee
  - consultation_types (JSONB: [online, in_person, home_visit])
  - available_regions (JSONB)
  - approval_status (enum: pending, approved, rejected)
  - approval_date
  - rating (FLOAT)
  - total_consultations (INT)
  - created_at

therapist_availability
  - id (PK)
  - therapist_id (FK -> therapist_profiles)
  - day_of_week (0-6)
  - start_time
  - end_time
  - is_active (BOOLEAN)

therapist_blocked_dates
  - id (PK)
  - therapist_id (FK -> therapist_profiles)
  - blocked_date
  - reason

-- 매칭 및 상담
matching_requests
  - id (PK)
  - parent_user_id (FK -> users)
  - child_id (FK -> children)
  - therapist_id (FK -> therapist_profiles)
  - preferred_dates (JSONB)
  - notes (TEXT)
  - status (enum: pending, approved, rejected, cancelled)
  - created_at
  - responded_at

consultation_packages
  - id (PK)
  - parent_user_id (FK -> users)
  - child_id (FK -> children)
  - therapist_id (FK -> therapist_profiles)
  - total_sessions (총 세션 회수: 1, 4, 8, 12)
  - completed_sessions (완료된 세션 수)
  - remaining_sessions (남은 세션 수)
  - package_discount_rate (할인율: 0%, 10%, 15%, 20%)
  - original_price (할인 전 금액)
  - discounted_price (할인 후 금액)
  - status (enum: active, completed, cancelled)
  - created_at
  - updated_at

consultations
  - id (PK)
  - package_id (FK -> consultation_packages)
  - session_number (회차: 1, 2, 3...)
  - scheduled_at
  - visit_address (TEXT: 방문 주소)
  - session_fee (세션 비용, 할인 적용된 금액)
  - platform_fee (플랫폼 수수료, 예: 15%)
  - status (enum: pending_payment, scheduled, completed, cancelled)
  - cancellation_reason (TEXT)
  - cancelled_at
  - notes (TEXT)
  - session_report_submitted (BOOLEAN: 상담일지 작성 여부)
  - session_report_submitted_at
  - created_at

consultation_reports
  - id (PK)
  - consultation_id (FK -> consultations)
  - therapist_id (FK -> therapist_profiles)
  - child_assessment (TEXT: 아이 상태 평가, 필수)
  - session_content (TEXT: 세션 내용, 필수)
  - home_activities (TEXT: 가정 과제, 필수)
  - next_session_goal (TEXT: 다음 세션 목표, 선택)
  - recommended_videos (JSONB: 추천 놀이영상 ID 배열)
  - next_session_suggestions (JSONB: 다음 세션 일정 제안)
  - created_at
  - updated_at

schedule_change_requests
  - id (PK)
  - consultation_id (FK -> consultations)
  - requester_user_id (FK -> users)
  - original_scheduled_at
  - change_reason (TEXT)
  - preferred_dates (JSONB: 희망 일정 배열, 1-3순위)
  - status (enum: pending, approved, rejected)
  - therapist_response (TEXT: 승인/거절 사유)
  - new_scheduled_at (승인된 새 일정)
  - responded_at
  - created_at

consultation_feedbacks
  - id (PK)
  - consultation_id (FK -> consultations)
  - feedback_by (enum: therapist, parent)
  - content (TEXT)
  - recommendations (TEXT)
  - created_at

consultation_reviews
  - id (PK)
  - consultation_id (FK -> consultations)
  - reviewer_user_id (FK -> users)
  - rating (1-5)
  - review_text (TEXT)
  - created_at

-- 결제 관리 (세션 결제)
payments
  - id (PK)
  - user_id (FK -> users)
  - package_id (FK -> consultation_packages)
  - payment_type (enum: package, single_session)
  - total_sessions (결제한 총 세션 수)
  - total_amount (총 결제 금액: 세션비 + 수수료)
  - session_fee_total (세션 비용 합계, 할인 적용)
  - original_session_fee_total (할인 전 세션 비용 합계)
  - discount_amount (할인 금액)
  - platform_fee (플랫폼 수수료)
  - currency (default: KRW)
  - payment_method (enum: card, bank_transfer, simple_pay, mobile)
  - payment_status (enum: pending, completed, failed, refunded, partially_refunded)
  - pg_provider (PG사: tosspayments, iamport 등)
  - transaction_id (PG사 거래 ID)
  - paid_at
  - created_at

refunds
  - id (PK)
  - payment_id (FK -> payments)
  - consultation_id (FK -> consultations)
  - refund_amount
  - refund_reason (enum: customer_request, therapist_cancel, no_show, dispute)
  - refund_policy (enum: full, partial_50, none)
  - refund_status (enum: pending, completed, failed)
  - requested_at
  - processed_at
  - created_at

-- 정산 관리 (치료사 정산)
settlements
  - id (PK)
  - therapist_id (FK -> therapist_profiles)
  - settlement_period_start (정산 기간 시작)
  - settlement_period_end (정산 기간 종료)
  - total_sessions (총 세션 수)
  - settled_sessions (정산된 세션 수: 상담일지 작성 완료)
  - pending_sessions (보류된 세션 수: 상담일지 미작성)
  - total_session_fee (총 세션 비용)
  - total_platform_fee (총 플랫폼 수수료)
  - settlement_amount (정산 금액)
  - withholding_tax (원천징수 3.3%)
  - final_amount (실지급액)
  - bank_account (지급 계좌)
  - status (enum: pending, confirmed, paid)
  - confirmed_at (정산 확정일)
  - paid_at (지급 완료일)
  - created_at

settlement_details
  - id (PK)
  - settlement_id (FK -> settlements)
  - consultation_id (FK -> consultations)
  - session_number (회차)
  - session_fee (세션 비용)
  - platform_fee (플랫폼 수수료)
  - net_amount (정산 금액: session_fee - platform_fee)
  - report_submitted (상담일지 작성 여부)
  - report_submitted_at
  - settlement_status (enum: settled, pending_report)
  - created_at

-- 알림
notifications
  - id (PK)
  - user_id (FK -> users)
  - type (enum: assessment_reminder, new_video, matching_update, consultation_reminder)
  - title
  - message
  - link_url
  - is_read (BOOLEAN)
  - created_at
  - read_at
```

### 인덱스 전략

```sql
-- 빈번한 조회를 위한 인덱스
CREATE INDEX idx_children_user_id ON children(user_id);
CREATE INDEX idx_assessments_child_id ON development_assessments(child_id);
CREATE INDEX idx_videos_published_at ON videos(published_at DESC);
CREATE INDEX idx_therapist_profiles_specialty ON therapist_profiles(specialty);
CREATE INDEX idx_matching_requests_status ON matching_requests(status, created_at DESC);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);

-- 복합 인덱스
CREATE INDEX idx_videos_age_published ON videos(target_age_min, target_age_max, is_published);
CREATE INDEX idx_consultations_therapist_status ON consultations(therapist_id, status, scheduled_at);
CREATE INDEX idx_recommended_videos_child ON recommended_videos(child_id, assessment_id, created_at DESC);
```

---

## API 설계

### RESTful API 엔드포인트

#### 인증 (Authentication)
```
POST   /api/v1/auth/register          # 회원가입
POST   /api/v1/auth/login             # 로그인
POST   /api/v1/auth/logout            # 로그아웃
POST   /api/v1/auth/refresh           # 토큰 갱신
POST   /api/v1/auth/password/reset    # 비밀번호 재설정
POST   /api/v1/auth/oauth/:provider   # 소셜 로그인
```

#### 사용자 (Users)
```
GET    /api/v1/users/me               # 내 정보 조회
PATCH  /api/v1/users/me               # 내 정보 수정
DELETE /api/v1/users/me               # 회원 탈퇴
```

#### 아이 프로필 (Children)
```
GET    /api/v1/children               # 아이 목록 조회
POST   /api/v1/children               # 아이 등록
GET    /api/v1/children/:id           # 아이 상세 조회
PATCH  /api/v1/children/:id           # 아이 정보 수정
DELETE /api/v1/children/:id           # 아이 삭제
```

#### 발달 체크 (Assessments)
```
GET    /api/v1/assessments                           # 발달 체크 이력
POST   /api/v1/assessments                           # 발달 체크 시작
GET    /api/v1/assessments/:id                       # 발달 체크 조회
PATCH  /api/v1/assessments/:id                       # 발달 체크 업데이트
POST   /api/v1/assessments/:id/responses            # 응답 저장
POST   /api/v1/assessments/:id/complete             # 발달 체크 완료
GET    /api/v1/assessments/:id/results              # 결과 조회
GET    /api/v1/assessments/questions?age=24         # 질문 목록 조회
```

#### 놀이영상 (Videos)
```
GET    /api/v1/videos                    # 영상 목록 (필터링, 페이지네이션)
GET    /api/v1/videos/recommended        # 추천 영상
GET    /api/v1/videos/categories         # 카테고리 목록
GET    /api/v1/videos/categories/:slug   # 카테고리별 영상
GET    /api/v1/videos/:id                # 영상 상세
POST   /api/v1/videos/:id/bookmark       # 북마크 추가
DELETE /api/v1/videos/:id/bookmark       # 북마크 제거
POST   /api/v1/videos/:id/view           # 조회수 증가
POST   /api/v1/videos/:id/complete       # 완료 체크
GET    /api/v1/videos/bookmarks          # 내 북마크
```

#### 치료사 (Therapists)
```
GET    /api/v1/therapists                # 치료사 검색 (필터링)
GET    /api/v1/therapists/:id            # 치료사 프로필 조회
GET    /api/v1/therapists/:id/reviews    # 치료사 리뷰 조회

# 치료사 전용
GET    /api/v1/therapists/me             # 내 치료사 프로필 조회
PUT    /api/v1/therapists/me             # 내 프로필 수정
GET    /api/v1/therapists/me/availability  # 내 일정 조회
PUT    /api/v1/therapists/me/availability  # 내 일정 수정
```

#### 매칭 (Matching)
```
POST   /api/v1/matching/requests         # 매칭 신청
GET    /api/v1/matching/requests         # 매칭 요청 목록
GET    /api/v1/matching/requests/:id     # 매칭 요청 상세
PATCH  /api/v1/matching/requests/:id     # 매칭 승인/거절
DELETE /api/v1/matching/requests/:id     # 매칭 취소
```

#### 상담 (Consultations)
```
GET    /api/v1/consultations             # 상담 목록
GET    /api/v1/consultations/:id         # 상담 상세
PATCH  /api/v1/consultations/:id         # 상담 정보 수정
POST   /api/v1/consultations/:id/start   # 상담 시작
POST   /api/v1/consultations/:id/complete # 상담 완료
POST   /api/v1/consultations/:id/cancel  # 상담 취소
POST   /api/v1/consultations/:id/feedback # 피드백 작성
POST   /api/v1/consultations/:id/review  # 리뷰 작성
```

#### 결제 (Payments)
```
POST   /api/v1/payments                  # 결제 생성 (상담 비용)
GET    /api/v1/payments                  # 결제 이력 조회
GET    /api/v1/payments/:id              # 결제 상세 조회
POST   /api/v1/payments/:id/refund       # 환불 요청
```

#### 알림 (Notifications)
```
GET    /api/v1/notifications             # 알림 목록
PATCH  /api/v1/notifications/:id/read    # 알림 읽음 처리
PATCH  /api/v1/notifications/read-all    # 모든 알림 읽음 처리
DELETE /api/v1/notifications/:id         # 알림 삭제
```

#### 관리자 (Admin)
```
# 사용자 관리
GET    /api/v1/admin/users
PATCH  /api/v1/admin/users/:id
DELETE /api/v1/admin/users/:id

# 콘텐츠 관리
POST   /api/v1/admin/videos
PATCH  /api/v1/admin/videos/:id
DELETE /api/v1/admin/videos/:id
POST   /api/v1/admin/assessments/questions

# 치료사 승인
GET    /api/v1/admin/therapists/pending
PATCH  /api/v1/admin/therapists/:id/approve
PATCH  /api/v1/admin/therapists/:id/reject

# 통계
GET    /api/v1/admin/analytics/overview
GET    /api/v1/admin/analytics/users
GET    /api/v1/admin/analytics/videos
GET    /api/v1/admin/analytics/matching
```

### API 응답 형식

#### 성공 응답
```json
{
  "success": true,
  "data": {
    ...
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

#### 에러 응답
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### WebSocket 이벤트

```javascript
// 클라이언트 → 서버
socket.emit('join_notification_room', { userId: '...' })
socket.emit('therapist_online', { therapistId: '...' })

// 서버 → 클라이언트
socket.on('new_notification', (data) => { ... })
socket.on('matching_update', (data) => { ... })
socket.on('consultation_reminder', (data) => { ... })
```

---

## 보안 및 인증

### 인증 플로우

```
사용자 로그인
  ↓
credentials 검증
  ↓
JWT 생성
  - Access Token (15분 유효)
  - Refresh Token (7일 유효)
  ↓
Access Token을 Authorization 헤더에 포함
  ↓
[Access Token 만료 시]
  ↓
Refresh Token으로 새 Access Token 발급
  ↓
[Refresh Token도 만료 시]
  ↓
재로그인 요구
```

### 보안 조치

#### 1. 데이터 암호화
- 비밀번호: bcrypt (salt rounds: 10)
- 민감한 개인정보: AES-256-GCM
- 통신: HTTPS (TLS 1.3)

#### 2. SQL Injection 방지
- ORM 사용 (Prisma / TypeORM)
- Prepared Statements
- 입력 값 검증 및 Sanitization

#### 3. XSS (Cross-Site Scripting) 방지
- 출력 시 HTML 이스케이프
- Content Security Policy (CSP) 헤더
- HTTPOnly 쿠키 사용

#### 4. CSRF (Cross-Site Request Forgery) 방지
- CSRF 토큰 사용
- SameSite 쿠키 속성

#### 5. Rate Limiting
```
일반 API: 100 요청/분/IP
로그인 API: 5 요청/분/IP
파일 업로드: 10 요청/시간/사용자
```

#### 6. 아동 정보 보호
- 법적 요구사항 준수 (개인정보보호법, 아동보호법)
- 부모 동의 필수
- 최소한의 정보만 수집
- 데이터 접근 로그 기록
- 정기적인 보안 감사

#### 7. GDPR / 개인정보 보호
- 데이터 다운로드 기능
- 데이터 삭제 요청 처리 (Right to be Forgotten)
- 데이터 보관 기간 정책

---

## 인프라 구조

### 환경 분리

```
Development (개발)
  - 로컬 Docker 환경
  - PostgreSQL, Redis 로컬 인스턴스

Staging (스테이징)
  - AWS ECS / Kubernetes
  - RDS (소규모 인스턴스)
  - ElastiCache
  - S3

Production (프로덕션)
  - AWS ECS / Kubernetes (Multi-AZ)
  - RDS (고가용성 설정)
  - ElastiCache (클러스터 모드)
  - S3 + CloudFront
  - Auto Scaling
```

### 배포 전략

#### Blue-Green 배포
```
현재 운영 중인 환경 (Blue)
  ↓
새 버전을 별도 환경에 배포 (Green)
  ↓
Green 환경 검증
  ↓
트래픽을 Green으로 전환
  ↓
Blue 환경 대기 (롤백용)
```

#### 무중단 배포 (Rolling Update)
```
서버 1, 2, 3 운영 중
  ↓
서버 1 트래픽 차단 → 업데이트 → 재시작
  ↓
서버 2 트래픽 차단 → 업데이트 → 재시작
  ↓
서버 3 트래픽 차단 → 업데이트 → 재시작
  ↓
모든 서버 업데이트 완료
```

### 백업 전략

- **데이터베이스**: 매일 자동 백업 (30일 보관)
- **증분 백업**: 6시간마다
- **재해 복구 계획 (DR)**: 다른 리전에 백업 복제
- **백업 테스트**: 월 1회

---

## 성능 최적화

### 1. 캐싱 전략

```javascript
// 계층적 캐싱
Browser Cache (1시간)
  ↓
CDN Cache (1일)
  ↓
Redis Cache (10분)
  ↓
Database
```

#### 캐싱 대상
- API 응답 (자주 조회되는 데이터)
- 영상 메타데이터
- 치료사 목록
- 발달 체크 질문

### 2. 데이터베이스 최적화

- **Connection Pooling**: 최대 100 커넥션
- **Slow Query 모니터링**: 1초 이상 쿼리 추적
- **N+1 문제 해결**: JOIN 또는 DataLoader 사용
- **읽기 전용 복제본**: 조회 쿼리 분산

### 3. 영상 스트리밍 최적화

- **HLS (HTTP Live Streaming)**: 다양한 화질 제공
  - 720p, 480p, 360p
- **Adaptive Bitrate**: 네트워크 상황에 따라 화질 자동 조절
- **CDN 사용**: CloudFront를 통한 전송
- **썸네일 최적화**: WebP 포맷, 여러 크기 생성

### 4. 이미지 최적화

- **자동 압축**: 업로드 시 자동 최적화
- **포맷 변환**: WebP로 자동 변환
- **Lazy Loading**: 뷰포트에 들어올 때 로드
- **반응형 이미지**: 디바이스 크기에 맞는 이미지 제공

### 5. 프론트엔드 최적화

- **코드 스플리팅**: 페이지별로 번들 분리
- **Tree Shaking**: 사용하지 않는 코드 제거
- **SSR/SSG**: 초기 로딩 속도 개선
- **Prefetching**: 다음 페이지 미리 로드

### 6. 모니터링 지표

```
응답 시간 목표
- API 응답: p95 < 200ms
- 페이지 로드: p95 < 2s
- 영상 재생 시작: p95 < 3s

가용성 목표
- Uptime: 99.9% (월 43분 다운타임 허용)

처리량 목표
- API 요청: 1000 RPS
- 동시 접속자: 10,000명
```

---

## 확장 전략

### 수평 확장 (Horizontal Scaling)

```
트래픽 증가 감지
  ↓
Auto Scaling Group에서 새 인스턴스 시작
  ↓
로드 밸런서에 인스턴스 추가
  ↓
트래픽 분산
```

### 데이터베이스 확장

- **읽기 복제본**: 조회 성능 향상
- **샤딩**: 데이터를 여러 DB로 분산
  - 사용자 ID 기반 샤딩
  - 지역 기반 샤딩
- **파티셔닝**: 큰 테이블을 작은 단위로 분할

### 마이크로서비스 전환 (필요 시)

```
모노리스 (현재)
  ↓
기능별 서비스 분리
  - User Service
  - Content Service
  - Matching Service
  - Notification Service
  - Analytics Service
  ↓
API Gateway를 통한 통합
```

---

## 개발 환경 설정

### Docker Compose 예시

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: aipoten
      POSTGRES_USER: aipoten
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://aipoten:password@postgres:5432/aipoten
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis

  frontend:
    build: ./frontend
    ports:
      - "3001:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3000
    depends_on:
      - backend

volumes:
  postgres_data:
```

### 환경 변수 예시 (.env)

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/aipoten
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key

# AWS
AWS_REGION=ap-northeast-2
AWS_S3_BUCKET=aipoten-media
AWS_CLOUDFRONT_DOMAIN=https://cdn.aipoten.com

# OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
KAKAO_CLIENT_ID=...
KAKAO_CLIENT_SECRET=...

# Email
SMTP_HOST=email-smtp.ap-northeast-2.amazonaws.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASSWORD=...

# Payment
PAYMENT_API_KEY=...

# Monitoring
SENTRY_DSN=...
```

---

## 다음 단계

이 아키텍처 문서를 바탕으로:
1. 프로토타입 개발 시작
2. MVP 기능 우선 구현
3. 사용자 피드백 수집
4. 점진적 확장 및 최적화

상세한 개발 단계는 `ROADMAP.md`를 참조하세요.