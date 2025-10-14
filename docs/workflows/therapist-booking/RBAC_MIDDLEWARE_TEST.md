# RBAC 미들웨어 테스트 가이드

## 🔒 구현 완료된 기능

### 1. RBAC 미들웨어
**파일**: `src/middleware.ts`

**역할별 접근 제어:**
- `/api/admin/*` → ADMIN만 접근 가능
- `/api/therapist/*` → THERAPIST, ADMIN 접근 가능
- `/api/my/*` → 인증된 모든 사용자 접근 가능
- `/api/auth/*` → 공개 (인증 불필요)

### 2. Auth Helpers
**파일**: `src/lib/auth-helpers.ts`

**제공 함수:**
```typescript
// 현재 사용자 가져오기
getCurrentUser()

// 인증 확인
requireAuth()

// 역할 확인
requireRole(['THERAPIST', 'ADMIN'])
requireAdmin()
requireTherapist()
requireParent()
```

### 3. 타입 정의
**파일**: `src/types/next-auth.d.ts`

NextAuth Session과 JWT에 role 추가

---

## 🧪 테스트 방법

### 준비: 테스트용 사용자 계정

**샘플 치료사 계정 (이미 생성됨):**
```
이메일: jieun.kim@therapist.com
비밀번호: password123
역할: THERAPIST
```

**ADMIN 계정 생성 필요:**
```sql
-- Prisma Studio에서 또는 SQL로 실행
UPDATE users SET role = 'ADMIN' WHERE email = '[기존 계정 이메일]'
```

---

## 테스트 시나리오

### 1. 인증되지 않은 사용자 테스트

```bash
# 테스트용 API 호출 (로그인 없이)
curl http://localhost:3000/api/test-auth
```

**예상 결과**: `401 Unauthorized`
```json
{
  "error": "Unauthorized",
  "message": "로그인이 필요합니다."
}
```

---

### 2. 일반 인증 테스트 (모든 역할)

**단계:**
1. 웹 브라우저에서 `http://localhost:3000/login` 접속
2. 아무 계정으로 로그인 (PARENT, THERAPIST, ADMIN 모두 가능)
3. 다음 API 호출:

```bash
# 브라우저 콘솔 또는 Postman에서
fetch('/api/test-auth')
  .then(res => res.json())
  .then(console.log)
```

**예상 결과**: `200 OK`
```json
{
  "message": "인증 성공!",
  "user": {
    "id": "...",
    "email": "...",
    "name": "...",
    "role": "THERAPIST"
  }
}
```

---

### 3. THERAPIST 전용 API 테스트

**3-1. THERAPIST로 로그인 후 접근**
```bash
fetch('/api/test-therapist')
  .then(res => res.json())
  .then(console.log)
```

**예상 결과**: `200 OK`
```json
{
  "message": "THERAPIST 권한 확인 완료!",
  "user": { ... }
}
```

**3-2. PARENT로 로그인 후 접근**
```bash
fetch('/api/test-therapist')
  .then(res => res.json())
  .then(console.log)
```

**예상 결과**: `403 Forbidden`
```json
{
  "error": "Forbidden",
  "message": "치료사만 접근할 수 있습니다."
}
```

---

### 4. ADMIN 전용 API 테스트

**4-1. ADMIN으로 로그인 후 접근**
```bash
fetch('/api/test-admin')
  .then(res => res.json())
  .then(console.log)
```

**예상 결과**: `200 OK`

**4-2. THERAPIST 또는 PARENT로 로그인 후 접근**

**예상 결과**: `403 Forbidden`

---

### 5. 실제 API 경로 테스트

#### 5-1. 관리자 승인 API

```bash
# THERAPIST로 로그인 후
fetch('/api/admin/therapists')
  .then(res => res.json())
  .then(console.log)
```

**예상 결과**: `403 Forbidden`

```bash
# ADMIN으로 로그인 후
fetch('/api/admin/therapists')
  .then(res => res.json())
  .then(console.log)
```

**예상 결과**: `200 OK` (치료사 목록 반환)

---

## 🛠️ 테스트 API 엔드포인트

구현된 테스트용 API:

| 엔드포인트 | 필요 역할 | 설명 |
|-----------|----------|------|
| `GET /api/test-auth` | 인증된 모든 사용자 | 기본 인증 테스트 |
| `GET /api/test-therapist` | THERAPIST, ADMIN | 치료사 권한 테스트 |
| `GET /api/test-admin` | ADMIN | 관리자 권한 테스트 |

---

## ✅ 테스트 체크리스트

### 미들웨어 레벨 (자동)
- [ ] `/api/admin/*` - ADMIN 이외 접근 시 403
- [ ] `/api/therapist/*` - PARENT 접근 시 403
- [ ] `/api/my/*` - 비로그인 접근 시 401
- [ ] `/api/auth/*` - 공개 접근 가능

### API 라우트 레벨 (헬퍼 함수 사용)
- [ ] `requireAuth()` - 비로그인 시 401
- [ ] `requireAdmin()` - ADMIN 이외 접근 시 403
- [ ] `requireTherapist()` - PARENT 접근 시 403
- [ ] `requireParent()` - THERAPIST 접근 시 403

---

## 📊 기존 API에 적용 예시

### Before (보안 없음)
```typescript
export async function GET(request: NextRequest) {
  // 누구나 접근 가능 (보안 취약)
  const therapists = await prisma.therapistProfile.findMany()
  return NextResponse.json({ therapists })
}
```

### After (RBAC 적용)
```typescript
import { requireAdmin } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  // ADMIN만 접근 가능
  const { error, user } = await requireAdmin()
  if (error) return error

  const therapists = await prisma.therapistProfile.findMany()
  return NextResponse.json({ therapists })
}
```

---

## 🔧 트러블슈팅

### 1. "NEXTAUTH_SECRET is not set" 에러
```bash
# .env.local 파일에 추가
NEXTAUTH_SECRET=your-secret-key-here
```

생성 방법:
```bash
openssl rand -base64 32
```

### 2. 미들웨어가 작동하지 않음
- Next.js 서버 재시작 필요
- `src/middleware.ts` 파일 위치 확인
- `config.matcher` 경로 확인

### 3. 세션에 role이 없음
- `src/lib/auth-config.ts`의 callbacks 확인
- JWT에 role이 추가되는지 확인

---

## 📝 다음 단계

RBAC 미들웨어 적용이 완료되었습니다!

**이제 할 일:**
1. ✅ 미들웨어 테스트
2. 기존 API 라우트에 `requireAdmin()`, `requireTherapist()` 적용
3. Phase 3 (스케줄 관리) 시작

**적용이 필요한 기존 API:**
- `src/app/api/admin/therapists/*` → `requireAdmin()` 추가
- 향후 `src/app/api/therapist/*` → `requireTherapist()` 추가
