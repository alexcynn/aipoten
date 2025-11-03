# 예약 및 정산 플로우 가이드

## 📌 개요

이 문서는 AI Poten 플랫폼의 예약 생성부터 정산 완료까지의 전체 프로세스를 정의합니다.
부모, 치료사, 관리자의 역할과 각 상태 전환 규칙을 명확히 하여 일관된 예약 관리를 보장합니다.

## 🔄 상태 플로우 다이어그램

```
┌─────────────────────────────────────────────────────────────────────┐
│                        예약 및 정산 전체 플로우                        │
└─────────────────────────────────────────────────────────────────────┘

1️⃣  부모 예약 신청
     ↓
┌────────────────┐
│  결제 대기      │ ← PENDING_PAYMENT
│  (입금 대기)    │   - Payment.status = PENDING_PAYMENT
└────────────────┘   - Booking.status = PENDING_CONFIRMATION
     ↓
     ├─ 환불 → [환불 처리] → REFUNDED
     ↓
2️⃣  관리자 입금 확인
     ↓
┌────────────────┐
│  예약 대기      │ ← PENDING_CONFIRMATION
│  (치료사 확인 대기) │   - Payment.status = PAID
└────────────────┘   - Booking.status = PENDING_CONFIRMATION
     ↓
     ├─ 환불 → [환불 처리] → REFUNDED
     ↓
3️⃣  치료사 예약 확인 버튼 클릭
     ↓
┌────────────────┐
│  예약 확정      │ ← CONFIRMED
│  (세션 진행 예정) │   - Booking.status = CONFIRMED
└────────────────┘
     ↓
     ├─ 환불 → [환불 처리] → REFUNDED
     ↓
4️⃣  치료사 상담일지 작성 (자동 전환)
     ↓
┌────────────────┐
│  정산대기       │ ← PENDING_SETTLEMENT
│  (정산 처리 대기) │   - Booking.status = PENDING_SETTLEMENT
└────────────────┘   - Booking.therapistNote 저장됨
     ↓
     ├─ 환불 → [환불 처리] → REFUNDED
     ↓
5️⃣  관리자 정산 처리
     ↓
┌────────────────┐
│  정산완료       │ ← SETTLEMENT_COMPLETED
│  (모든 절차 완료) │   - Payment.settlementAmount 설정
└────────────────┘   - Payment.settledAt 설정
     ↓
     └─ 환불 → [환불 처리] → REFUNDED

┌────────────────┐
│  환불          │ ← REFUNDED
│  (환불 완료)    │   - Payment.status = REFUNDED
└────────────────┘   - Payment.refundedAt 설정
```

## 📊 상태 정의

### BookingStatus (Prisma Schema)

| 상태 코드 | 한글 명칭 | 설명 | Payment.status |
|-----------|-----------|------|----------------|
| `PENDING_PAYMENT` | 결제 대기 | 부모가 예약을 신청하고 입금을 대기 중 | `PENDING_PAYMENT` |
| `PENDING_CONFIRMATION` | 예약 대기 | 관리자가 입금을 확인했고, 치료사의 예약 확인을 대기 중 | `PAID` |
| `CONFIRMED` | 예약 확정 | 치료사가 예약을 확인하여 세션 진행이 확정됨 | `PAID` |
| `PENDING_SETTLEMENT` | 정산대기 | 세션이 완료되고 상담일지가 작성되어 정산을 대기 중 | `PAID` |
| `SETTLEMENT_COMPLETED` | 정산완료 | 관리자가 정산 처리를 완료함 (모든 절차 완료) | `PAID` |
| `REFUNDED` | 환불 | 예약이 취소되고 환불 처리됨 | `REFUNDED` |
| `CANCELLED` | 취소 | 예약이 취소됨 (환불 없이 취소된 경우) | 다양 |
| `NO_SHOW` | 노쇼 | 예약 시간에 부모/아이가 나타나지 않음 | `PAID` |

### PaymentStatus (Prisma Schema)

| 상태 코드 | 한글 명칭 | 설명 |
|-----------|-----------|------|
| `PENDING_PAYMENT` | 결제 대기 | 예약 생성됨, 입금 대기 중 |
| `PAID` | 결제 완료 | 입금 확인됨 |
| `REFUNDED` | 환불 완료 | 전액 환불 처리됨 |
| `PARTIALLY_REFUNDED` | 부분 환불 | 일부 금액만 환불됨 |
| `FAILED` | 결제 실패 | 결제 처리 실패 |

## 🔀 상태 전환 규칙

### 1. 결제 대기 → 예약 대기
- **트리거**: 관리자가 입금 확인
- **API**: `POST /api/admin/bookings/[id]/confirm-payment`
- **변경사항**:
  - `Payment.status`: `PENDING_PAYMENT` → `PAID`
  - `Payment.paidAt`: 현재 시간 설정
  - `Booking.status`: 변경 없음 (이미 `PENDING_CONFIRMATION`)
- **권한**: 관리자만 가능
- **검증**:
  - Payment.status가 `PENDING_PAYMENT`인지 확인
  - Payment가 존재하는지 확인

### 2. 예약 대기 → 예약 확정
- **트리거**: 치료사가 "예약 확인" 버튼 클릭
- **API**: `POST /api/therapist/bookings/[id]/confirm`
- **변경사항**:
  - `Booking.status`: `PENDING_CONFIRMATION` → `CONFIRMED`
  - `Booking.confirmedAt`: 현재 시간 설정 (신규 필드)
- **권한**: 해당 예약의 치료사만 가능
- **검증**:
  - Booking.therapistId가 현재 로그인한 치료사와 일치하는지 확인
  - Booking.status가 `PENDING_CONFIRMATION`인지 확인
  - Payment.status가 `PAID`인지 확인

### 3. 예약 확정 → 정산대기 (자동 전환)
- **트리거**: 치료사가 상담일지 저장
- **API**: `PUT /api/bookings/[id]` 또는 `PUT /api/therapist/bookings/[id]/journal`
- **변경사항**:
  - `Booking.therapistNote`: 상담일지 내용 저장
  - `Booking.status`: `CONFIRMED` → `PENDING_SETTLEMENT` (자동)
  - `Booking.completedAt`: 현재 시간 설정
- **권한**: 해당 예약의 치료사만 가능
- **검증**:
  - Booking.therapistId가 현재 로그인한 치료사와 일치하는지 확인
  - Booking.status가 `CONFIRMED`인지 확인
  - therapistNote가 비어있지 않은지 확인

### 4. 정산대기 → 정산완료
- **트리거**: 관리자가 정산 처리
- **API**: `POST /api/admin/bookings/[id]/settlement`
- **변경사항**:
  - `Booking.status`: `PENDING_SETTLEMENT` → `SETTLEMENT_COMPLETED`
  - `Payment.settlementAmount`: 정산 금액 설정
  - `Payment.settledAt`: 현재 시간 설정
  - `Payment.settlementNote`: 정산 메모 (선택)
- **권한**: 관리자만 가능
- **검증**:
  - Booking.status가 `PENDING_SETTLEMENT`인지 확인
  - settlementAmount > 0인지 확인

### 5. 환불 처리 (모든 단계에서 가능)
- **트리거**: 관리자가 환불 처리
- **API**: `POST /api/admin/bookings/[id]/refund`
- **변경사항**:
  - `Booking.status`: 현재 상태 → `REFUNDED`
  - `Payment.status`: 현재 상태 → `REFUNDED`
  - `Payment.refundedAt`: 현재 시간 설정
  - `Payment.refundAmount`: 환불 금액 설정
  - `Payment.refundNote`: 환불 사유 (선택)
- **권한**: 관리자만 가능
- **검증**:
  - 이미 환불 처리된 예약은 재환불 불가
  - 환불 금액이 결제 금액을 초과하지 않는지 확인
- **특별 규칙**:
  - **결제 대기 단계**: 환불 없이 `CANCELLED` 처리 가능
  - **예약 대기/확정 단계**: 전액 환불
  - **정산대기/완료 단계**: 전액 또는 부분 환불 가능

### 6. 예약 취소 (결제 전)
- **트리거**: 부모 또는 관리자가 결제 전 취소
- **API**: `DELETE /api/bookings/[id]` 또는 `POST /api/admin/bookings/[id]/cancel`
- **변경사항**:
  - `Booking.status`: `PENDING_PAYMENT` → `CANCELLED`
  - TimeSlot 복원 (currentBookings 감소)
- **권한**: 부모(본인 예약) 또는 관리자
- **검증**:
  - Booking.status가 `PENDING_PAYMENT`인지 확인

## 👥 역할별 권한 및 UI 표시

### 부모 (Parent)

#### 가능한 작업
- 예약 생성
- 결제 대기 단계에서 취소
- 예약 조회
- 리뷰 작성 (세션 완료 후)

#### 상태 표시 규칙
| 실제 상태 | 부모 화면 표시 | 색상 |
|-----------|----------------|------|
| `PENDING_PAYMENT` | 결제대기 | 주황색 |
| `PENDING_CONFIRMATION` | 예약대기 | 노란색 |
| `CONFIRMED` | 예약확정 | 파란색 |
| `PENDING_SETTLEMENT` | **완료** | 초록색 |
| `SETTLEMENT_COMPLETED` | **완료** | 초록색 |
| `REFUNDED` | 환불 | 빨간색 |
| `CANCELLED` | 취소 | 회색 |
| `NO_SHOW` | 노쇼 | 빨간색 |

**중요**: `PENDING_SETTLEMENT`와 `SETTLEMENT_COMPLETED`는 부모에게 **모두 "완료"로 표시**

#### 부모 페이지 구현 예시
```typescript
const getStatusForParent = (status: BookingStatus): { label: string; color: string } => {
  if (status === 'PENDING_SETTLEMENT' || status === 'SETTLEMENT_COMPLETED') {
    return { label: '완료', color: 'bg-green-100 text-green-800' };
  }

  const statusMap: Record<BookingStatus, { label: string; color: string }> = {
    PENDING_PAYMENT: { label: '결제대기', color: 'bg-orange-100 text-orange-800' },
    PENDING_CONFIRMATION: { label: '예약대기', color: 'bg-yellow-100 text-yellow-800' },
    CONFIRMED: { label: '예약확정', color: 'bg-blue-100 text-blue-800' },
    REFUNDED: { label: '환불', color: 'bg-red-100 text-red-800' },
    CANCELLED: { label: '취소', color: 'bg-gray-100 text-gray-800' },
    NO_SHOW: { label: '노쇼', color: 'bg-red-100 text-red-800' },
  };

  return statusMap[status] || { label: '알 수 없음', color: 'bg-gray-100 text-gray-800' };
};
```

### 치료사 (Therapist)

#### 가능한 작업
- 예약 확인 (PENDING_CONFIRMATION → CONFIRMED)
- 상담일지 작성 (CONFIRMED → PENDING_SETTLEMENT 자동 전환)
- 본인 예약 조회
- 노쇼 처리 (선택)

#### 상태 표시 규칙

**본인 세션**:
| 실제 상태 | 치료사 화면 표시 | 액션 |
|-----------|------------------|------|
| `PENDING_CONFIRMATION` | 예약대기 (확인 필요) | "예약 확인" 버튼 표시 |
| `CONFIRMED` | 예약확정 | "상담일지 작성" 버튼 표시 |
| `PENDING_SETTLEMENT` | 정산대기 | 조회만 가능 |
| `SETTLEMENT_COMPLETED` | 정산완료 | 조회만 가능 |
| `REFUNDED` | 환불 | 조회만 가능 |

**다른 치료사 세션**:
- 모든 상태를 **"완료"로만 표시**
- 상세 정보 조회 불가 (목록에서만 보임)

#### 치료사 페이지 구현 예시
```typescript
const getStatusForTherapist = (
  booking: Booking,
  currentTherapistId: string
): { label: string; color: string; showActions: boolean } => {
  // 다른 치료사의 세션은 모두 "완료"로 표시
  if (booking.therapistId !== currentTherapistId) {
    return {
      label: '완료',
      color: 'bg-gray-100 text-gray-800',
      showActions: false
    };
  }

  // 본인 세션은 상세 상태 표시
  const statusMap: Record<BookingStatus, { label: string; color: string; showActions: boolean }> = {
    PENDING_CONFIRMATION: {
      label: '예약대기 (확인 필요)',
      color: 'bg-yellow-100 text-yellow-800',
      showActions: true
    },
    CONFIRMED: {
      label: '예약확정',
      color: 'bg-blue-100 text-blue-800',
      showActions: true
    },
    PENDING_SETTLEMENT: {
      label: '정산대기',
      color: 'bg-purple-100 text-purple-800',
      showActions: false
    },
    SETTLEMENT_COMPLETED: {
      label: '정산완료',
      color: 'bg-green-100 text-green-800',
      showActions: false
    },
    REFUNDED: {
      label: '환불',
      color: 'bg-red-100 text-red-800',
      showActions: false
    },
  };

  return statusMap[booking.status];
};
```

### 관리자 (Admin)

#### 가능한 작업
- 입금 확인 (PENDING_PAYMENT → PENDING_CONFIRMATION)
- 정산 처리 (PENDING_SETTLEMENT → SETTLEMENT_COMPLETED)
- 환불 처리 (모든 단계)
- 예약 상태 직접 변경 (예외 상황)
- 모든 예약 조회 및 관리

#### 상태 표시 규칙
- 모든 실제 상태를 그대로 표시
- 각 상태별 가능한 액션 버튼 표시

| 실제 상태 | 관리자 화면 표시 | 가능한 액션 |
|-----------|------------------|-------------|
| `PENDING_PAYMENT` | 결제대기 | 입금 확인, 취소 |
| `PENDING_CONFIRMATION` | 예약대기 | 환불, 상태 변경 |
| `CONFIRMED` | 예약확정 | 환불, 상태 변경 |
| `PENDING_SETTLEMENT` | 정산대기 | 정산 처리, 환불 |
| `SETTLEMENT_COMPLETED` | 정산완료 | 환불 (부분/전액) |
| `REFUNDED` | 환불 | 조회만 가능 |

#### 관리자 페이지 필터링
```typescript
const statusFilters = [
  { value: 'ALL', label: '전체' },
  { value: 'PENDING_PAYMENT', label: '결제대기' },
  { value: 'PENDING_CONFIRMATION', label: '예약대기' },
  { value: 'CONFIRMED', label: '예약확정' },
  { value: 'PENDING_SETTLEMENT', label: '정산대기' },
  { value: 'SETTLEMENT_COMPLETED', label: '정산완료' },
  { value: 'REFUNDED', label: '환불' },
];
```

## 🔧 API 설계

### 1. 치료사 예약 확인 API (신규)

```typescript
// POST /api/therapist/bookings/[id]/confirm

// 요청
{} // Body 없음

// 응답
{
  success: true,
  booking: {
    id: string,
    status: 'CONFIRMED',
    confirmedAt: string,
    ...
  }
}

// 에러
{
  error: string,
  code: 'UNAUTHORIZED' | 'INVALID_STATUS' | 'NOT_FOUND'
}
```

### 2. 상담일지 작성 API (수정)

```typescript
// PUT /api/therapist/bookings/[id]/journal

// 요청
{
  therapistNote: string  // 상담일지 내용 (필수)
}

// 응답
{
  success: true,
  booking: {
    id: string,
    status: 'PENDING_SETTLEMENT',  // 자동 전환
    therapistNote: string,
    completedAt: string,
    ...
  }
}

// 자동 처리
- Booking.status: CONFIRMED → PENDING_SETTLEMENT
- Booking.completedAt: 현재 시간 설정
```

### 3. 환불 처리 API (신규/수정)

```typescript
// POST /api/admin/bookings/[id]/refund

// 요청
{
  refundAmount: number,      // 환불 금액 (필수)
  refundNote?: string,       // 환불 사유 (선택)
  refundType: 'FULL' | 'PARTIAL'  // 전액/부분 환불
}

// 응답
{
  success: true,
  booking: {
    id: string,
    status: 'REFUNDED',
    ...
  },
  payment: {
    id: string,
    status: 'REFUNDED' | 'PARTIALLY_REFUNDED',
    refundAmount: number,
    refundedAt: string,
    ...
  }
}

// 검증 규칙
- refundAmount <= payment.amount (환불 금액이 결제 금액을 초과할 수 없음)
- refundType === 'FULL': refundAmount === payment.amount
- 이미 환불된 예약은 재환불 불가
```

### 4. 정산 처리 API (수정)

```typescript
// POST /api/admin/bookings/[id]/settlement

// 요청
{
  settlementAmount: number,  // 정산 금액 (필수, > 0)
  settlementNote?: string    // 정산 메모 (선택)
}

// 응답
{
  success: true,
  booking: {
    id: string,
    status: 'SETTLEMENT_COMPLETED',
    ...
  },
  payment: {
    id: string,
    settlementAmount: number,
    settledAt: string,
    ...
  }
}

// 검증 규칙
- Booking.status === 'PENDING_SETTLEMENT' (정산대기 상태만 가능)
- settlementAmount > 0
```

## 💾 데이터베이스 스키마 변경

### Prisma Schema 수정사항

```prisma
// BookingStatus enum에 추가
enum BookingStatus {
  PENDING_CONFIRMATION
  CONFIRMED
  PENDING_SETTLEMENT      // ✨ 신규 추가
  SETTLEMENT_COMPLETED    // ✨ 공식화 (기존 API에서 사용 중)
  COMPLETED               // 레거시 (deprecated)
  CANCELLED
  REJECTED
  NO_SHOW
}

// Booking 모델에 추가
model Booking {
  // ... 기존 필드들

  confirmedAt   DateTime?  // ✨ 신규: 치료사가 예약을 확인한 시간
  completedAt   DateTime?  // ✨ 신규: 상담일지 작성 완료 시간

  // ... 나머지 필드들
}

// Payment 모델 (기존 필드 확인)
model Payment {
  // ... 기존 필드들

  // 정산 정보 (이미 존재)
  settlementAmount  Int?
  settledAt         DateTime?
  settlementNote    String?

  // 환불 정보 (추가 필요 시)
  refundAmount      Int?          // ✨ 신규: 환불 금액
  refundedAt        DateTime?     // ✨ 신규: 환불 처리 시간
  refundNote        String?       // ✨ 신규: 환불 사유

  // ... 나머지 필드들
}
```

### 마이그레이션 명령어
```bash
# Schema 수정 후
npx prisma migrate dev --name add_settlement_flow

# 또는 프로덕션 환경
npx prisma migrate deploy
```

## 🧪 테스트 시나리오

### 시나리오 1: 정상 플로우
1. ✅ 부모가 예약 생성 → `PENDING_PAYMENT`
2. ✅ 관리자가 입금 확인 → `PENDING_CONFIRMATION`
3. ✅ 치료사가 예약 확인 → `CONFIRMED`
4. ✅ 치료사가 상담일지 작성 → `PENDING_SETTLEMENT` (자동)
5. ✅ 관리자가 정산 처리 → `SETTLEMENT_COMPLETED`

### 시나리오 2: 결제 전 취소
1. ✅ 부모가 예약 생성 → `PENDING_PAYMENT`
2. ✅ 부모가 예약 취소 → `CANCELLED`

### 시나리오 3: 환불 (예약 확정 후)
1. ✅ 부모가 예약 생성 → `PENDING_PAYMENT`
2. ✅ 관리자가 입금 확인 → `PENDING_CONFIRMATION`
3. ✅ 치료사가 예약 확인 → `CONFIRMED`
4. ✅ 관리자가 환불 처리 → `REFUNDED`

### 시나리오 4: 환불 (세션 완료 후)
1. ✅ ... (정상 플로우 1~4단계)
2. ✅ 관리자가 부분 환불 처리 → `REFUNDED` (Payment: `PARTIALLY_REFUNDED`)

### 시나리오 5: 노쇼
1. ✅ ... (정상 플로우 1~3단계)
2. ✅ 치료사/관리자가 노쇼 처리 → `NO_SHOW`

## 📋 체크리스트

### 백엔드 개발
- [ ] Prisma Schema 수정 (`PENDING_SETTLEMENT`, `SETTLEMENT_COMPLETED` 추가)
- [ ] 마이그레이션 생성 및 적용
- [ ] 치료사 예약 확인 API 개발
- [ ] 상담일지 자동 정산대기 전환 로직 추가
- [ ] 환불 API 개선 (모든 단계 지원)
- [ ] 정산 API 검증 로직 강화

### 프론트엔드 개발
- [ ] 부모 페이지: 정산대기/정산완료 → "완료" 표시
- [ ] 치료사 페이지: 예약 확인 버튼 추가
- [ ] 치료사 페이지: 다른 치료사 세션 → "완료" 표시
- [ ] 관리자 페이지: 정산대기 필터 추가
- [ ] 관리자 페이지: 정산 처리 UI 개선

### 테스트
- [ ] 각 상태 전환 테스트
- [ ] 역할별 권한 테스트
- [ ] 환불 케이스별 테스트
- [ ] UI 표시 규칙 테스트

## 📝 주의사항

1. **거절 기능 없음**: 치료사는 예약을 거절할 수 없으며, 확인만 가능합니다.
2. **자동 전환**: 상담일지 작성 시 자동으로 정산대기 상태로 전환됩니다.
3. **환불 제한 없음**: 모든 단계에서 환불이 가능하지만, 금액 검증은 필수입니다.
4. **부모 UI**: 정산 관련 상태는 부모에게 "완료"로만 표시하여 혼란을 방지합니다.
5. **치료사 UI**: 다른 치료사의 세션은 보안을 위해 상세 정보를 숨기고 "완료"로만 표시합니다.

## 🔗 관련 파일

- **Schema**: `prisma/schema.prisma`
- **API Routes**:
  - `src/app/api/therapist/bookings/[id]/confirm/route.ts`
  - `src/app/api/therapist/bookings/[id]/journal/route.ts`
  - `src/app/api/admin/bookings/[id]/confirm-payment/route.ts`
  - `src/app/api/admin/bookings/[id]/settlement/route.ts`
  - `src/app/api/admin/bookings/[id]/refund/route.ts`
- **UI Pages**:
  - `src/app/parent/bookings/page.tsx`
  - `src/app/therapist/bookings/page.tsx`
  - `src/app/admin/bookings/page.tsx`

---

**문서 버전**: 1.0.0
**최종 수정일**: 2025-11-04
**작성자**: AI Poten 개발팀
