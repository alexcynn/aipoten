# 치료사 예약 시스템 개발 로드맵

## 📋 프로젝트 개요

**목표**: 발달 체크 후 치료사와 부모를 연결하는 예약 및 정산 시스템 구축
**기술 스택**: Next.js 15, TypeScript, Prisma, SQLite/PostgreSQL, Tailwind CSS
**예상 개발 기간**: 12-16주

---

## Phase 1: 기초 인프라 및 인증 (1-2주) ✅ **완료**

### 1.1 프로젝트 초기 설정 ✅
- [x] Next.js 15 프로젝트 구조 확인
- [x] TypeScript 설정 검증
- [x] ESLint, Prettier 설정
- [x] Git 브랜치 전략 수립

### 1.2 데이터베이스 설계 ✅
- [x] Prisma Schema 기본 구조 작성
  - User 모델 (기존 확장)
  - Role enum (PARENT, THERAPIST, ADMIN)
- [x] 개발 환경: SQLite 설정
- [x] 운영 환경: PostgreSQL 준비
- [x] Migration 전략 수립

### 1.3 인증 시스템 ✅
- [x] 기존 인증 시스템 확인 (NextAuth.js)
- [x] NextAuth.js 설정 완료 (Account, Session, VerificationToken 모델)
- [x] 역할 기반 접근 제어 (RBAC) 미들웨어 구현 ✅ **완료**
  - `/api/therapist/*` → THERAPIST, ADMIN만
  - `/api/admin/*` → ADMIN만
  - `/api/my/*` → 인증된 모든 사용자
  - 미들웨어 (`src/middleware.ts`)
  - Helper 함수 (`src/lib/auth-helpers.ts`)
- [x] 관리자 계정 생성 스크립트 (`npm run db:create-admin`)
  - Email: admin@aipoten.com
  - Password: admin123

**산출물**:
- ✅ Prisma schema 기본 구조
- ✅ User 모델 및 Role enum
- ✅ NextAuth.js 인증 시스템
- ✅ 역할별 라우팅 가드 (완료)
- ✅ RBAC 미들웨어 및 Helper 함수

**파일 위치**:
- Middleware: `src/middleware.ts`
- Helpers: `src/lib/auth-helpers.ts`
- Test APIs: `src/app/api/test-auth/route.ts`, `test-admin/route.ts`, `test-therapist/route.ts`
- Script: `scripts/create-admin.ts`

---

## Phase 2: 치료사 온보딩 및 프로필 (2-3주) ✅ **백엔드 완료** / ⚠️ **프론트엔드 추가 개발 필요**

### 2.1 데이터 모델 구현 ✅
- [x] **TherapistProfile 모델**
  ```prisma
  - userId (User 1:1 관계)
  - specialties (JSON: 치료 분야)
  - childAgeRanges (JSON: 대상 연령)
  - serviceAreas (JSON: 서비스 지역)
  - sessionFee (세션 비용)
  - approvalStatus (승인 상태)
  ```
- [x] **Certification 모델** (자격증)
- [x] **Experience 모델** (경력)
- [x] ApprovalStatus enum (PENDING, APPROVED, REJECTED, PENDING_ADDITIONAL_INFO)
- [x] TherapyType enum (SPEECH_THERAPY, SENSORY_INTEGRATION, 등)
- [x] EmploymentType enum (INSTITUTION, FREELANCER)

### 2.2 치료사 회원가입 API ✅
- [x] `POST /api/auth/register/therapist` - **완료**
  - ✅ 기본 정보 (이름, 연락처, 주소)
  - ✅ 전문 정보 (분야, 대상 연령, 지역, 비용)
  - ✅ 자격증 및 경력 정보
  - ✅ 트랜잭션으로 User + TherapistProfile + Certifications + Experiences 생성
  - ✅ 비밀번호 해싱 (bcrypt)
  - ✅ 이메일 중복 체크
- [ ] 파일 업로드 (자격증 사본) ⚠️ **추가 개발 필요** (AWS S3 또는 Cloudinary 연동)
- [x] 유효성 검증

### 2.3 관리자 승인 시스템 ✅
- [x] `GET /api/admin/therapists` (목록 조회, 필터링 가능)
- [x] `GET /api/admin/therapists/[id]` (상세 조회)
- [x] `POST /api/admin/therapists/[id]/approve` (승인)
- [x] `POST /api/admin/therapists/[id]/reject` (반려)
- [x] `POST /api/admin/therapists/[id]/request-info` (추가 자료 요청)

### 2.4 치료사 프로필 UI ⚠️ **추가 개발 필요**
- [ ] 회원가입 3단계 폼
  - [ ] Step 1: 기본 정보
  - [ ] Step 2: 전문 정보
  - [ ] Step 3: 자격증/경력
- [ ] 관리자 승인 대시보드
- [ ] 치료사 프로필 조회 페이지

### 2.5 알림 시스템 ⚠️ **추가 개발 필요**
- [ ] 치료사 가입 시 관리자에게 알림
- [ ] 승인/반려 시 치료사에게 이메일 발송

### 2.6 샘플 데이터 ✅
- [x] 샘플 치료사 6명 생성 (5명 승인됨, 1명 대기중)
- [x] 각 치료사마다 자격증 및 경력 정보
- [x] Seed 스크립트: `npm run db:seed:therapists`

**산출물**:
- ✅ 치료사 온보딩 백엔드 API 완료
- ✅ 관리자 승인 시스템 API 완료
- ✅ 샘플 데이터 6명
- ⚠️ UI 컴포넌트 (추후 구현)
- ⚠️ 파일 업로드 시스템 (추후 구현)
- ⚠️ 알림 시스템 (추후 구현)

**파일 위치**:
- API: `src/app/api/auth/register/therapist/route.ts`
- API: `src/app/api/admin/therapists/*`
- Seed: `scripts/seed-therapists.ts`

---

## Phase 3: 스케줄 관리 시스템 (2주) ✅ **백엔드 완료** / ⚠️ **프론트엔드 추가 개발 필요**

### 3.1 데이터 모델 ✅
- [x] **TimeSlot 모델**
  ```prisma
  - therapistId
  - date, startTime, endTime
  - isAvailable
  - isHoliday, isBufferBlocked
  - maxCapacity, currentBookings
  - blockedBy (버퍼 차단 시 참조)
  - Unique: (therapistId, date, startTime)
  - Index: (therapistId, date, isAvailable)
  ```
- [x] **HolidayDate 모델** (휴일 관리)
  ```prisma
  - therapistId (null이면 공휴일)
  - date, reason
  - isRecurring
  - Unique: (therapistId, date)
  ```

### 3.2 스케줄 생성 API ✅
- [x] `POST /api/therapist/schedule/bulk-create` - **완료**
  - ✅ 시작일~종료일 지정 (최대 3개월)
  - ✅ 요일별 시간 패턴 설정 (weeklyPattern)
  - ✅ 세션 길이 (50분/80분)
  - ✅ 동시 예약 가능 인원 (maxCapacity)
  - ✅ 공휴일 자동 제외 (excludeHolidays)
  - ✅ 중복 체크 및 일괄 생성
- [x] `DELETE /api/therapist/schedule/bulk-delete` - **완료**
  - ✅ 특정 기간 슬롯 삭제
  - ✅ 예약된 슬롯 보호 (onlyEmpty 옵션)

### 3.3 휴일 관리 API ✅
- [x] `POST /api/therapist/holidays` (개인 휴일 추가)
- [x] `GET /api/therapist/holidays` (휴일 목록 조회)
- [x] `DELETE /api/therapist/holidays/[id]` (휴일 삭제)
- [x] 공휴일 추가 (therapistId = null)
- [ ] 국가 공휴일 API 연동 (선택) ⚠️ **추가 개발 필요**

### 3.4 스케줄 조회 API ✅
- [x] `GET /api/therapist/time-slots` - **완료**
  - ✅ 날짜 범위 조회 (startDate, endDate)
  - ✅ 특정 날짜 조회 (date)
  - ✅ 가용성 필터 (isAvailable)
  - ✅ 날짜별 그룹화 (groupedByDate)
  - ✅ 통계 계산 (총 슬롯, 예약 가능, 예약됨, 휴일 등)

### 3.5 스케줄 관리 UI ⚠️ **추가 개발 필요**
- [ ] 일괄 생성 폼
- [ ] 캘린더 뷰 (월간/주간)
- [ ] 슬롯 상태 표시 (예약됨/비어있음/차단됨)
- [ ] 휴일 관리 UI

### 3.6 샘플 데이터 ✅
- [x] 3명의 치료사에게 3개월치 스케줄 생성
- [x] 주중 (월-금) 09:00-18:00 (점심시간 제외)
- [x] 50분 세션, 7슬롯/일
- [x] 총 1,407개 타임슬롯 생성
- [x] 공휴일 8개 추가 (신정, 삼일절, 어린이날 등)
- [x] Seed 스크립트: `npm run db:seed:schedules`

**산출물**:
- ✅ 스케줄 일괄 생성 시스템
- ✅ 휴일 관리 기능
- ✅ 스케줄 조회 API
- ✅ 샘플 데이터 (1,407개 슬롯)
- ⚠️ 캘린더 UI (추후 구현)

**파일 위치**:
- API: `src/app/api/therapist/schedule/bulk-create/route.ts`
- API: `src/app/api/therapist/schedule/bulk-delete/route.ts`
- API: `src/app/api/therapist/holidays/route.ts`
- API: `src/app/api/therapist/holidays/[id]/route.ts`
- API: `src/app/api/therapist/time-slots/route.ts`
- Seed: `scripts/seed-schedules.ts`

---

## Phase 4: 예약 시스템 (핵심, 3-4주)

### 4.1 데이터 모델
- [ ] **Consultation 모델**
  ```prisma
  - timeSlotId, parentUserId, childId, therapistId
  - scheduledAt, duration
  - sessionType (CONSULTATION/THERAPY)
  - sessionCount (1, 4, 8, 12)
  - status (PENDING_CONFIRMATION, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW)
  - confirmationDeadline, confirmedAt, confirmedBy
  - fee, paymentId
  ```
- [ ] SessionType enum (CONSULTATION, THERAPY)
- [ ] ConsultationStatus enum

### 4.2 부모: 치료사 검색 및 예약
- [ ] `GET /api/therapists/search`
  - 필터: specialty, area, experience, maxFee, rating
  - 정렬: rating, distance, fee
  - 페이지네이션
- [ ] `GET /api/therapists/[id]` (프로필 상세)
- [ ] `GET /api/therapists/[id]/available-slots`
  - 예약 가능 기간: 오늘 ~ 다음 달 말
  - currentBookings < maxCapacity
  - !isBufferBlocked
  - !isHoliday

### 4.3 예약 신청 및 결제
- [ ] `POST /api/bookings`
  - 세션 타입 선택 (CONSULTATION/THERAPY)
  - 회차 선택 (1/4/8/12회)
    - CONSULTATION: 1회만 가능
    - THERAPY: 1/4/8/12회 가능
  - 할인율 적용 (4회: 5%, 8회: 10%, 12회: 15%)
  - 방문 주소 입력
- [ ] 결제 연동 (토스페이먼츠/아임포트)
  - `POST /api/bookings/[id]/payment-complete`
- [ ] 결제 실패 재시도 로직 (5분 유예)
- [ ] 동시 예약 경합 처리 (트랜잭션)

### 4.4 치료사 예약 확인 시스템
- [ ] `GET /api/therapist/consultations/pending` (미확인 예약)
- [ ] `POST /api/therapist/consultations/[id]/confirm` (확인)
- [ ] `POST /api/therapist/consultations/[id]/reject` (거절)
- [ ] 자동 알림 시스템
  - 예약 신청 시: 치료사에게 즉시 알림
  - 12시간 경과: 리마인더 알림
  - 24시간 미확인: 관리자 대시보드 표시

### 4.5 버퍼 타임 자동 차단
- [ ] 예약 확정 시: 다음 1시간 슬롯 차단
  - isBufferBlocked = true
  - blockedBy = consultationId
- [ ] 취소 시: 버퍼 슬롯 해제

### 4.6 예약 조정
- [ ] `POST /api/bookings/[id]/reschedule`
  - 비어있는 슬롯 선택
  - 즉시 확정 (치료사 승인 불필요)
  - 원자적 트랜잭션 (기존 취소 + 새 예약)
  - 취소 정책 자동 적용
- [ ] `POST /api/bookings/[id]/cancel`
  - D-3 이전: 전액 환불
  - D-2~D-1: 50% 환불
  - 당일: 환불 불가

### 4.7 관리자 미확인 예약 관리
- [ ] `GET /api/admin/consultations/unconfirmed`
- [ ] `POST /api/admin/consultations/[id]/manual-confirm` (수동 확정)
- [ ] `POST /api/admin/consultations/[id]/force-cancel` (강제 취소)
- [ ] `GET /api/admin/therapists/[id]/confirmation-stats` (확인율 통계)

### 4.8 예약 시스템 UI
- [ ] 치료사 검색 페이지
- [ ] 프로필 상세 및 예약 가능 시간 선택
- [ ] 예약 신청 폼
- [ ] 결제 페이지
- [ ] 내 예약 목록
- [ ] 치료사: 예약 확인 대시보드
- [ ] 관리자: 미확인 예약 대시보드

**산출물**:
- ✅ 완전한 예약 시스템
- ✅ 결제 연동
- ✅ 버퍼 타임 자동 차단
- ✅ 치료사 확인 프로세스

---

## Phase 5: 세션 관리 및 상담일지 (2주)

### 5.1 데이터 모델
- [ ] **SessionLog 모델**
  ```prisma
  - consultationId (1:1)
  - actualStart, actualEnd
  - activities (활동 내용)
  - childResponse (아이 반응)
  - parentGuide (부모 안내)
  - nextPlan (다음 계획)
  - attachments (JSON: 파일 경로)
  ```

### 5.2 세션 진행 API
- [ ] `POST /api/therapist/session-logs`
  - 세션 후 48시간 이내 작성 필수
  - 정산 조건 (상담일지 작성 완료)
- [ ] `GET /api/parent/session-logs/[consultationId]`
  - 부모에게 공유

### 5.3 세션 상태 관리
- [ ] 세션 시작: status → IN_PROGRESS
- [ ] 세션 완료: status → COMPLETED
- [ ] 상담일지 작성 완료: 정산 대상 등록

### 5.4 세션 관리 UI
- [ ] 치료사: 상담일지 작성 폼
- [ ] 부모: 상담일지 조회
- [ ] 세션 히스토리

**산출물**:
- ✅ 상담일지 시스템
- ✅ 세션 상태 관리

---

## Phase 6: 정산 시스템 (2주)

### 6.1 데이터 모델
- [ ] **Settlement 모델**
  ```prisma
  - therapistId
  - startDate, endDate (정산 기간)
  - sessionCount, totalAmount
  - platformFee (15%), tax (3.3%), deductions
  - netAmount (실지급액)
  - status (PENDING, APPROVED, PAID, HELD, CANCELLED)
  - paidAt
  ```

### 6.2 자동 정산 시스템
- [ ] 주간 정산 배치 작업
  - 매주 월요일 00:00 실행
  - 지난주 COMPLETED 세션 집계
  - 상담일지 작성 여부 확인
  - Settlement 레코드 생성
- [ ] 정산 계산 로직
  ```typescript
  totalAmount = 세션 비용 합계
  platformFee = totalAmount * 0.15
  tax = totalAmount * 0.033
  netAmount = totalAmount - platformFee - tax - deductions
  ```
- [ ] 수요일 자동 이체 (은행 API 연동)

### 6.3 정산 조회 API
- [ ] `GET /api/therapist/settlements`
  - Query: ?year=2025&month=10
  - 월별/주별 정산 내역
- [ ] `GET /api/admin/settlements`
- [ ] `POST /api/admin/settlements/[id]/manual-adjust` (수동 조정)

### 6.4 정산 UI
- [ ] 치료사: 정산 내역 페이지
- [ ] 관리자: 정산 관리 대시보드

**산출물**:
- ✅ 자동 정산 시스템
- ✅ 정산 내역 조회

---

## Phase 7: 알림 시스템 (1-2주)

### 7.1 인프라 구축
- [ ] Firebase FCM 설정 (푸시 알림)
- [ ] SendGrid/Mailgun 설정 (이메일)
- [ ] SMS 연동 (선택, 긴급 알림만)

### 7.2 알림 발송 로직
- [ ] **즉시 알림**
  - 예약 신청 (부모, 치료사)
  - 예약 확정/거절
  - 결제 실패
  - 일정 변경/취소
- [ ] **스케줄 알림**
  - D-1: 전날 14:00
  - 2시간 전
- [ ] **정산 알림**
  - 정산 확정 (월요일)
  - 입금 완료 (수요일)
  - 상담일지 미작성 경고

### 7.3 알림 우선순위
- [ ] 우선순위 1 (긴급): 푸시 + SMS + 이메일
- [ ] 우선순위 2 (중요): 푸시 + 이메일
- [ ] 우선순위 3 (일반): 푸시 + 앱 내
- [ ] 우선순위 4 (정보): 앱 내만

### 7.4 알림 설정 UI
- [ ] 사용자별 알림 설정
- [ ] 방해 금지 시간 설정

**산출물**:
- ✅ 완전한 알림 시스템
- ✅ 우선순위별 발송

---

## Phase 8: 예외 처리 및 클레임 시스템 (2-3주)

### 8.1 데이터 모델
- [ ] **Claim 모델**
  ```prisma
  - consultationId
  - claimantId, claimantType (PARENT/THERAPIST)
  - respondentId
  - claimType (NO_SHOW, SERVICE_QUALITY, TIME_ISSUE, PAYMENT_ISSUE)
  - title, description, evidence
  - gpsData, sessionStarted, contactAttempts (시스템 수집 증거)
  - respondentReply, respondentEvidence
  - adminId, decision (FULL_REFUND, PARTIAL_REFUND, NO_REFUND, etc)
  - status (PENDING, IN_REVIEW, RESOLVED, REJECTED)
  ```

### 8.2 클레임 신청
- [ ] `POST /api/claims` (부모/치료사)
  - 문제 유형 선택
  - 상세 설명
  - 증거 첨부
  - 시스템 자동 증거 수집 (GPS, 세션 기록)
- [ ] `POST /api/claims/[id]/respond` (피신청자 응답)

### 8.3 관리자 클레임 조정
- [ ] `GET /api/admin/claims` (목록 조회)
- [ ] `GET /api/admin/claims/[id]` (상세 조회)
- [ ] `POST /api/admin/claims/[id]/assign` (담당자 배정)
- [ ] `POST /api/admin/claims/[id]/resolve`
  - 결정 (신청자 승/피신청자 승/절충)
  - 보상 처리 (환불, 쿠폰 발급)
  - 패널티 적용 (경고, 평점 차감, 정지)
- [ ] `GET /api/admin/claims/stats` (통계)

### 8.4 취소 및 환불
- [ ] 시점별 환불 정책 자동 적용
- [ ] 긴급 상황 예외 처리 (관리자 승인)
- [ ] 자동 환불 트랜잭션 생성

### 8.5 시스템 오류 처리
- [ ] 결제 실패 재시도
- [ ] 알림 전송 실패 대체 경로
- [ ] 동시 예약 경합 처리

### 8.6 클레임 UI
- [ ] 부모/치료사: 클레임 신청 폼
- [ ] 관리자: 클레임 조정 대시보드
- [ ] 클레임 타임라인 표시

**산출물**:
- ✅ 클레임 시스템
- ✅ 예외 처리 완비

---

## Phase 9: 리뷰 및 평가 (1주)

### 9.1 데이터 모델
- [ ] **Review 모델**
  ```prisma
  - consultationId
  - parentUserId, therapistId
  - rating (1-5)
  - content
  - professionalism, kindness, punctuality, improvement (항목별 평점)
  ```

### 9.2 리뷰 API
- [ ] `POST /api/consultations/[id]/review`
- [ ] `GET /api/therapists/[id]/reviews`
- [ ] `PUT /api/reviews/[id]` (수정)
- [ ] `DELETE /api/reviews/[id]` (삭제)

### 9.3 리뷰 UI
- [ ] 세션 후 평가 요청 (24시간 내)
- [ ] 치료사 프로필에 리뷰 표시
- [ ] 평균 평점 및 통계

**산출물**:
- ✅ 리뷰 시스템

---

## Phase 10: 테스트 및 QA (2-3주)

### 10.1 단위 테스트
- [ ] 세션 타입 유효성 검증
- [ ] 버퍼 타임 로직
- [ ] 환불 금액 계산
- [ ] 정산 금액 계산

### 10.2 통합 테스트
- [ ] 전체 예약 프로세스
- [ ] 치료사 확인 프로세스
- [ ] 버퍼 타임 차단/해제
- [ ] 일정 변경 프로세스
- [ ] 클레임 처리 플로우

### 10.3 부하 테스트
- [ ] 동시 예약 경합 (Race Condition)
- [ ] 결제 동시 다발 처리
- [ ] 정산 배치 대량 데이터

### 10.4 E2E 테스트
- [ ] 부모 사용자 시나리오
- [ ] 치료사 사용자 시나리오
- [ ] 관리자 시나리오

**산출물**:
- ✅ 테스트 커버리지 80% 이상
- ✅ 부하 테스트 리포트

---

## Phase 11: 배포 및 모니터링 (1주)

### 11.1 배포 준비
- [ ] 환경 변수 설정 (운영)
- [ ] PostgreSQL 마이그레이션
- [ ] 도메인 및 SSL 설정

### 11.2 모니터링
- [ ] 에러 로깅 (Sentry)
- [ ] 성능 모니터링 (Vercel Analytics)
- [ ] 알림 발송 성공률 모니터링

### 11.3 배포
- [ ] 스테이징 배포
- [ ] 운영 배포
- [ ] 롤백 계획 수립

**산출물**:
- ✅ 운영 환경 배포
- ✅ 모니터링 대시보드

---

## 📊 전체 일정 요약

| Phase | 주요 작업 | 예상 기간 | 의존성 |
|-------|----------|----------|--------|
| **Phase 1** | 기초 인프라 및 인증 | 1-2주 | - |
| **Phase 2** | 치료사 온보딩 | 2-3주 | Phase 1 |
| **Phase 3** | 스케줄 관리 | 2주 | Phase 2 |
| **Phase 4** | 예약 시스템 (핵심) | 3-4주 | Phase 3 |
| **Phase 5** | 세션 관리 | 2주 | Phase 4 |
| **Phase 6** | 정산 시스템 | 2주 | Phase 5 |
| **Phase 7** | 알림 시스템 | 1-2주 | Phase 4 |
| **Phase 8** | 클레임 시스템 | 2-3주 | Phase 5 |
| **Phase 9** | 리뷰 시스템 | 1주 | Phase 5 |
| **Phase 10** | 테스트 및 QA | 2-3주 | All |
| **Phase 11** | 배포 | 1주 | Phase 10 |
| **합계** | | **12-16주** | |

---

## 🔑 핵심 마일스톤

### M1: 치료사 온보딩 완료 (3주차)
- ✅ 치료사 회원가입 가능
- ✅ 관리자 승인 시스템 작동

### M2: 스케줄 관리 완료 (5주차) ✅ **백엔드 완료**
- ✅ 치료사가 3개월치 스케줄 생성 가능
- ✅ 스케줄 일괄 생성/삭제 API
- ✅ 휴일 관리 API
- ⚠️ 캘린더 뷰 (프론트엔드 추후 구현)

### M3: 예약 시스템 MVP (9주차)
- ✅ 부모가 치료사 검색 및 예약 가능
- ✅ 결제 연동 완료
- ✅ 버퍼 타임 자동 차단
- ✅ 치료사 확인 프로세스 작동

### M4: 정산 시스템 작동 (11주차)
- ✅ 주간 자동 정산 배치 작동
- ✅ 치료사에게 정산 내역 표시

### M5: 클레임 시스템 완성 (14주차)
- ✅ 클레임 신청 및 조정 가능
- ✅ 자동 보상/패널티 처리

### M6: 운영 배포 (16주차)
- ✅ 테스트 완료
- ✅ 운영 환경 배포

---

## 🎯 우선순위

### P0 (필수, MVP)
- Phase 1-4: 인증, 온보딩, 스케줄, 예약
- 결제 연동
- 기본 알림 (예약 확정)

### P1 (중요)
- Phase 5-6: 세션 관리, 정산
- Phase 7: 알림 시스템 (전체)
- 치료사 확인 프로세스

### P2 (필요)
- Phase 8: 클레임 시스템
- Phase 9: 리뷰 시스템
- 관리자 대시보드

### P3 (선택)
- 고급 필터링
- SMS 알림
- 분석 대시보드

---

## 📌 주의사항

1. **동시 예약 경합 처리**는 반드시 Phase 4에서 트랜잭션으로 구현
2. **버퍼 타임 자동 차단**은 예약 시스템의 핵심 - 철저히 테스트
3. **정산 시스템**은 금전이 관련되므로 정확성 최우선
4. **클레임 시스템**은 분쟁 해결의 핵심 - 증거 자동 수집 필수
5. **알림 발송 실패**는 대체 경로 반드시 구현

---

## 📊 Phase 1-2 완료 상태 (2025-01-14 업데이트)

### ✅ 완료된 기능

**Phase 1: 기초 인프라**
- ✅ Next.js 15 + TypeScript + Prisma 설정
- ✅ User 모델 및 Role enum (PARENT, THERAPIST, ADMIN)
- ✅ NextAuth.js 인증 시스템 (Account, Session, VerificationToken)

**Phase 2: 치료사 온보딩**
- ✅ TherapistProfile, Certification, Experience 모델
- ✅ `POST /api/auth/register/therapist` - 회원가입 API
- ✅ 관리자 승인 시스템 API (approve, reject, request-info)
- ✅ 샘플 치료사 데이터 6명 (`npm run db:seed:therapists`)

**샘플 데이터**:
| 이름 | 이메일 | 전문분야 | 지역 | 상태 |
|------|--------|----------|------|------|
| 김지은 | jieun.kim@therapist.com | 언어치료 | 강남구, 서초구 | ✅ 승인됨 |
| 박민수 | minsu.park@therapist.com | 감각통합 | 서초구, 강남구 | ✅ 승인됨 |
| 이수진 | sujin.lee@therapist.com | 놀이치료 | 송파구, 강동구 | ⏳ 승인 대기 |
| 최영희 | younghee.choi@therapist.com | 미술치료 | 광진구, 성동구 | ✅ 승인됨 |
| 정민호 | minho.jung@therapist.com | 언어+감각통합 | 강남구, 서초구 | ✅ 승인됨 |
| 한소희 | sohee.han@therapist.com | 음악치료 | 마포구, 서대문구 | ✅ 승인됨 |

**비밀번호**: `password123`

### ⚠️ 추가 개발 필요 항목

**Phase 1:**
- [x] ~~역할 기반 접근 제어 (RBAC) 미들웨어~~ ✅ **완료**

**Phase 2:**
- [ ] **파일 업로드 시스템** (자격증 사본)
  - AWS S3, Cloudinary 등 연동 필요
- [ ] **UI 컴포넌트**
  - 치료사 회원가입 3단계 폼
  - 관리자 승인 대시보드
  - 치료사 프로필 조회 페이지
- [ ] **알림 시스템**
  - 치료사 가입 시 관리자 알림
  - 승인/반려 시 치료사 이메일 발송

**Phase 3:**
- [ ] **UI 컴포넌트**
  - 스케줄 일괄 생성 폼
  - 캘린더 뷰 (월간/주간)
  - 슬롯 상태 표시 (예약됨/비어있음/차단됨)
  - 휴일 관리 UI
- [ ] **국가 공휴일 API 연동** (선택)

---

## 📊 Phase 3 완료 상태 (2025-01-14 업데이트)

### ✅ 완료된 기능

**데이터 모델:**
- ✅ TimeSlot 모델 (치료사별 실제 예약 가능 시간 슬롯)
- ✅ HolidayDate 모델 (개인 휴일 + 공휴일)

**스케줄 생성 API:**
- ✅ `POST /api/therapist/schedule/bulk-create` - 일괄 생성
  - 요일별 시간 패턴 설정 (예: 월-금 09:00-18:00)
  - 세션 길이 설정 (50분/80분)
  - 최대 3개월치 생성 제한
  - 공휴일 자동 제외
  - 중복 방지
- ✅ `DELETE /api/therapist/schedule/bulk-delete` - 일괄 삭제
  - 예약 없는 슬롯만 삭제 옵션 (onlyEmpty)

**휴일 관리 API:**
- ✅ `POST /api/therapist/holidays` - 개인 휴일 추가
- ✅ `GET /api/therapist/holidays` - 휴일 목록 조회 (개인 + 공휴일)
- ✅ `DELETE /api/therapist/holidays/[id]` - 휴일 삭제

**스케줄 조회 API:**
- ✅ `GET /api/therapist/time-slots` - TimeSlot 조회
  - 날짜 범위 필터 (startDate, endDate)
  - 특정 날짜 조회 (date)
  - 가용성 필터 (isAvailable)
  - 날짜별 그룹화
  - 통계 (총 슬롯, 예약 가능, 예약됨, 차단됨 등)

**샘플 데이터:**
- ✅ 3명의 치료사 × 67일 (주중만) × 7슬롯/일 = 1,407개 슬롯
- ✅ 공휴일 8개 (2025년 한국 공휴일)
- ✅ Seed 스크립트: `npm run db:seed:schedules`

**통계:**
| 항목 | 수량 |
|------|------|
| TimeSlot | 1,407개 |
| HolidayDate | 14개 (공휴일 8개 + 개인 6개) |
| 치료사당 평균 슬롯 | 469개 (3개월) |
| 하루 평균 슬롯 | 7개 (09:00-18:00, 점심 제외) |

---

## 📖 참고 문서

- [01_PROCESS_FLOW.md](./01_PROCESS_FLOW.md) - 역할별 상세 플로우
- [02_USE_CASES.md](./02_USE_CASES.md) - 세부 시나리오
- [03_DATA_MODELS.md](./03_DATA_MODELS.md) - Prisma Schema
- [04_API_REFERENCE.md](./04_API_REFERENCE.md) - API 명세
- [05_ERROR_HANDLING.md](./05_ERROR_HANDLING.md) - 예외 처리
- [06_DIAGRAMS.md](./06_DIAGRAMS.md) - 다이어그램 및 체크리스트