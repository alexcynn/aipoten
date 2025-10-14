# API 엔드포인트 명세

## 1. 인증 API

### POST /api/auth/register/therapist
**치료사 회원가입**

Request:
```json
{
  "email": "therapist@example.com",
  "password": "password123",
  "name": "김치료",
  "gender": "FEMALE",
  "birthYear": 1990,
  "phone": "010-1234-5678",
  "address": "서울시 강남구...",
  "specialties": ["SPEECH_THERAPY", "SENSORY_INTEGRATION"],
  "childAgeRanges": ["AGE_0_12", "AGE_13_24"],
  "serviceAreas": ["GANGNAM", "SEOCHO"],
  "sessionFee": 80000,
  "certifications": [
    {
      "name": "언어치료사 1급",
      "issuingOrganization": "한국언어치료사협회",
      "issueDate": "2018-03-15"
    }
  ],
  "experiences": [
    {
      "employmentType": "INSTITUTION",
      "institutionName": "OO발달센터",
      "specialty": "SPEECH_THERAPY",
      "startDate": "2018-04-01",
      "endDate": "2022-12-31"
    }
  ]
}
```

Response (201):
```json
{
  "message": "치료사 등록 신청이 완료되었습니다",
  "userId": "user_xxx",
  "profileId": "profile_xxx"
}
```

## 2. 치료사 API

### GET /api/therapist/profile
**내 프로필 조회**

Response:
```json
{
  "id": "profile_xxx",
  "user": {
    "name": "김치료",
    "email": "therapist@example.com"
  },
  "specialties": ["SPEECH_THERAPY"],
  "sessionFee": 80000,
  "approvalStatus": "APPROVED"
}
```

### POST /api/therapist/schedule/bulk-create
**스케줄 일괄 생성**

Request:
```json
{
  "startDate": "2025-10-15",
  "endDate": "2025-12-31",
  "weeklyPattern": {
    "monday": ["09:00-12:00", "14:00-18:00"],
    "tuesday": ["09:00-12:00", "14:00-18:00"],
    "wednesday": null,
    "thursday": ["09:00-12:00", "14:00-18:00"],
    "friday": ["09:00-12:00", "14:00-18:00"],
    "saturday": ["10:00-14:00"],
    "sunday": null
  },
  "sessionDuration": 50,
  "maxCapacity": 1,
  "excludeHolidays": true
}
```

Response:
```json
{
  "message": "240개 슬롯이 생성되었습니다",
  "created": 240,
  "skipped": 12
}
```

### DELETE /api/therapist/schedule/bulk-delete
**스케줄 일괄 삭제**

Request:
```json
{
  "startDate": "2025-11-01",
  "endDate": "2025-11-30",
  "onlyEmpty": true
}
```

### POST /api/therapist/holidays
**휴일 추가**

Request:
```json
{
  "date": "2025-12-31",
  "reason": "연말 휴무",
  "isRange": false
}
```

### POST /api/therapist/consultations/{id}/confirm
**예약 확인**

Response:
```json
{
  "message": "예약이 확정되었습니다",
  "consultation": {
    "id": "xxx",
    "status": "CONFIRMED"
  }
}
```

### POST /api/therapist/consultations/{id}/reject
**예약 거절**

Request:
```json
{
  "reason": "개인 사정으로 불가능합니다"
}
```

### GET /api/therapist/consultations/pending
**미확인 예약 목록**

Response:
```json
{
  "consultations": [
    {
      "id": "xxx",
      "scheduledAt": "2025-10-15T14:00:00",
      "confirmationDeadline": "2025-10-14T14:00:00",
      "child": {
        "name": "김OO",
        "age": 24
      }
    }
  ]
}
```

### POST /api/therapist/session-logs
**상담일지 작성**

Request:
```json
{
  "consultationId": "xxx",
  "actualStart": "2025-10-15T14:05:00",
  "actualEnd": "2025-10-15T14:55:00",
  "activities": "언어 자극 활동...",
  "childResponse": "적극적으로 참여...",
  "parentGuide": "일상에서 반복 연습...",
  "nextPlan": "어휘 확장 중점"
}
```

### GET /api/therapist/settlements
**정산 내역 조회**

Query: `?year=2025&month=10`

Response:
```json
{
  "settlements": [
    {
      "id": "xxx",
      "period": "2025-10-02 ~ 2025-10-08",
      "sessionCount": 5,
      "totalAmount": 400000,
      "platformFee": 60000,
      "tax": 11220,
      "netAmount": 328780,
      "status": "PAID",
      "paidAt": "2025-10-11"
    }
  ]
}
```

## 3. 부모 API

### GET /api/therapists/search
**치료사 검색**

Query:
```
?specialty=SPEECH_THERAPY
&area=GANGNAM
&minExperience=5
&maxFee=100000
&sort=rating
```

Response:
```json
{
  "therapists": [
    {
      "id": "xxx",
      "name": "김치료",
      "specialty": "언어치료",
      "experience": 12,
      "sessionFee": 80000,
      "rating": 4.9,
      "reviewCount": 127,
      "distance": 2.3
    }
  ],
  "totalCount": 15
}
```

### GET /api/therapists/{id}/available-slots
**예약 가능 시간 조회**

Query: `?startDate=2025-10-15&endDate=2025-11-30`

Response:
```json
{
  "slots": [
    {
      "id": "slot_xxx",
      "date": "2025-10-15",
      "time": "14:00",
      "available": true
    }
  ]
}
```

### POST /api/bookings
**예약 신청**

Request:
```json
{
  "therapistId": "xxx",
  "childId": "xxx",
  "slotId": "slot_xxx",
  "sessionType": "THERAPY",
  "sessionCount": 8,
  "visitAddress": "서울시 강남구...",
  "notes": "아이가 낯을 가려요",
  "paymentMethod": "CARD"
}
```

Response:
```json
{
  "booking": {
    "id": "booking_xxx",
    "status": "PENDING_PAYMENT",
    "amount": 576000,
    "paymentUrl": "https://pay.toss.im/..."
  }
}
```

### POST /api/bookings/{id}/payment-complete
**결제 완료 처리**

Request:
```json
{
  "paymentId": "toss_xxx",
  "amount": 576000
}
```

Response:
```json
{
  "message": "예약이 확정되었습니다",
  "booking": {
    "id": "booking_xxx",
    "status": "PENDING_CONFIRMATION"
  }
}
```

### POST /api/bookings/{id}/reschedule
**예약 일정 변경**

Request:
```json
{
  "newSlotId": "slot_yyy",
  "reason": "가족 일정"
}
```

### POST /api/bookings/{id}/cancel
**예약 취소**

Request:
```json
{
  "reason": "개인 사정"
}
```

Response:
```json
{
  "message": "예약이 취소되었습니다",
  "refundAmount": 576000,
  "refundStatus": "PENDING"
}
```

### POST /api/claims
**클레임 신청**

Request:
```json
{
  "consultationId": "xxx",
  "claimType": "SERVICE_QUALITY",
  "title": "세션 시간 미준수",
  "description": "50분 약속인데 30분만 진행",
  "requestedAction": "부분 환불 요청"
}
```

### GET /api/my/bookings
**내 예약 목록**

Response:
```json
{
  "bookings": [
    {
      "id": "xxx",
      "therapist": {
        "name": "김치료",
        "specialty": "언어치료"
      },
      "scheduledAt": "2025-10-15T14:00:00",
      "status": "CONFIRMED",
      "sessionType": "THERAPY",
      "sessionNumber": "3/8"
    }
  ]
}
```

## 4. 관리자 API

### GET /api/admin/therapists/pending
**승인 대기 치료사 목록**

Response:
```json
{
  "therapists": [
    {
      "id": "xxx",
      "name": "김치료",
      "appliedAt": "2025-10-12T14:30:00",
      "specialties": ["SPEECH_THERAPY"],
      "documents": {
        "certificates": 2,
        "experiences": 2
      }
    }
  ]
}
```

### POST /api/admin/therapists/{id}/approve
**치료사 승인**

Response:
```json
{
  "message": "치료사가 승인되었습니다"
}
```

### POST /api/admin/therapists/{id}/reject
**치료사 반려**

Request:
```json
{
  "reason": "자격증 확인 불가"
}
```

### POST /api/admin/therapists/{id}/request-info
**추가 자료 요청**

Request:
```json
{
  "requestMessage": "최근 3개월 재직증명서를 제출해주세요"
}
```

### GET /api/admin/consultations/unconfirmed
**미확인 예약 목록 (24시간 경과)**

Response:
```json
{
  "consultations": [
    {
      "id": "xxx",
      "therapist": {
        "name": "김치료",
        "phone": "010-1234-5678"
      },
      "requestedAt": "2025-10-13T14:00:00",
      "hoursOverdue": 3
    }
  ]
}
```

### GET /api/admin/claims
**클레임 목록**

Query: `?status=PENDING&type=NO_SHOW`

### POST /api/admin/claims/{id}/resolve
**클레임 처리**

Request:
```json
{
  "decision": "PARTIAL_REFUND",
  "refundAmount": 40000,
  "decisionReason": "부분적 책임 인정",
  "compensation": "10% 할인 쿠폰"
}
```

### GET /api/admin/settlements/pending
**정산 대기 목록**

### POST /api/admin/settlements/process
**정산 실행**

Request:
```json
{
  "startDate": "2025-10-02",
  "endDate": "2025-10-08"
}
```

## 5. 시스템 API (자동 호출)

### POST /api/system/confirm-timeout-check
**예약 확인 타임아웃 체크**

매 시간 실행, 24시간 경과한 미확인 예약 추출

### POST /api/system/send-reminders
**리마인더 발송**

D-1, 2시간 전 자동 실행

### POST /api/system/calculate-settlements
**정산 계산**

매주 월요일 00:00 실행

### POST /api/system/process-refunds
**환불 처리**

취소 승인 시 자동 실행

## 6. 공통 응답 형식

### 성공 응답
```json
{
  "success": true,
  "data": { ... },
  "message": "작업이 완료되었습니다"
}
```

### 에러 응답
```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "잘못된 요청입니다",
    "details": { ... }
  }
}
```

### 에러 코드

| 코드 | 설명 | HTTP Status |
|-----|------|-------------|
| UNAUTHORIZED | 인증 필요 | 401 |
| FORBIDDEN | 권한 없음 | 403 |
| NOT_FOUND | 리소스 없음 | 404 |
| INVALID_REQUEST | 잘못된 요청 | 400 |
| CONFLICT | 충돌 (중복 등) | 409 |
| SERVER_ERROR | 서버 오류 | 500 |
| PAYMENT_REQUIRED | 결제 필요 | 402 |
| TIMEOUT | 타임아웃 | 408 |

## 7. 인증 및 권한

### 인증 헤더
```
Authorization: Bearer {jwt_token}
```

### 역할별 접근 권한

| 엔드포인트 | PARENT | THERAPIST | ADMIN |
|-----------|--------|-----------|-------|
| /api/therapists/* | ✅ | ❌ | ✅ |
| /api/therapist/* | ❌ | ✅ | ✅ |
| /api/bookings/* | ✅ | ❌ | ✅ |
| /api/admin/* | ❌ | ❌ | ✅ |
| /api/my/* | ✅ | ✅ | ✅ |

## 8. Rate Limiting

- 일반 API: 100 requests/minute
- 검색 API: 30 requests/minute
- 결제 API: 10 requests/minute
- 파일 업로드: 5 requests/minute