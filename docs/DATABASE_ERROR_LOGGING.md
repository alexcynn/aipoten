# 데이터베이스 오류 로깅 가이드

## 개요

서버 배포 후 데이터베이스 연결 문제를 빠르게 파악하고 해결하기 위한 상세한 로깅 시스템이 구현되어 있습니다.

## 로깅 위치

### 1. Prisma Client 초기화 로그 (`src/lib/prisma.ts`)

서버가 시작될 때 다음 정보가 자동으로 로깅됩니다:

```
=== Prisma Database Configuration ===
NODE_ENV: production
DATABASE_URL exists: true
DATABASE_URL preview: postgresql://user...@host:5432/db
=====================================
✅ Database connected successfully
```

또는 연결 실패 시:

```
❌ Database connection failed:
Error name: PrismaClientInitializationError
Error message: Can't reach database server at `localhost:5432`
Error code: P1001
💡 Diagnosis: Database server is not running or refusing connections
```

### 2. API 요청별 오류 로그

각 API 엔드포인트에서 DB 에러 발생 시 상세 정보가 로깅됩니다:

```
================================================================================
🚨 DATABASE ERROR in POST /api/auth/signup
Timestamp: 2025-01-13T12:34:56.789Z
================================================================================
Error Type: PrismaClientKnownRequestError
Error Code: P2002
Error Message: Unique constraint failed on the fields: (`email`)
Meta: { target: ['email'] }
💡 Diagnosis: Unique constraint violation
   Conflicting field(s): email
================================================================================
```

## 헬스체크 엔드포인트

### `/api/health/db`

DB 연결 상태를 확인할 수 있는 엔드포인트입니다.

**성공 응답 (200):**
```json
{
  "status": "healthy",
  "database": "connected",
  "responseTime": "45ms",
  "timestamp": "2025-01-13T12:34:56.789Z",
  "environment": "production",
  "databaseUrl": "postgresql://user..."
}
```

**실패 응답 (503):**
```json
{
  "status": "unhealthy",
  "database": "disconnected",
  "responseTime": "5003ms",
  "timestamp": "2025-01-13T12:34:56.789Z",
  "environment": "production",
  "error": "Can't reach database server",
  "errorName": "PrismaClientInitializationError"
}
```

## 일반적인 오류 유형 및 해결 방법

### 1. 연결 거부 (ECONNREFUSED)

**증상:**
```
💡 Diagnosis: Database server is not running or refusing connections
```

**해결 방법:**
- 데이터베이스 서버가 실행 중인지 확인
- 방화벽 설정 확인
- 데이터베이스 포트가 올바른지 확인

### 2. 호스트를 찾을 수 없음 (ENOTFOUND)

**증상:**
```
💡 Diagnosis: Database host not found. Check DATABASE_URL hostname
```

**해결 방법:**
- `DATABASE_URL`의 호스트명이 올바른지 확인
- DNS 설정 확인
- 네트워크 연결 상태 확인

### 3. 인증 실패

**증상:**
```
💡 Diagnosis: Invalid database credentials. Check username/password in DATABASE_URL
```

**해결 방법:**
- `DATABASE_URL`의 사용자명과 비밀번호 확인
- 데이터베이스 사용자 권한 확인
- 특수문자가 URL 인코딩되었는지 확인

### 4. 데이터베이스가 존재하지 않음

**증상:**
```
💡 Diagnosis: Database does not exist. Run migrations or create database
```

**해결 방법:**
```bash
# 데이터베이스 생성
createdb your_database_name

# 또는 마이그레이션 실행
npx prisma migrate deploy
```

### 5. 연결 타임아웃

**증상:**
```
💡 Diagnosis: Connection timeout. Check network/firewall settings
```

**해결 방법:**
- 네트워크 연결 확인
- 방화벽 규칙 확인
- 데이터베이스 서버 응답 시간 확인
- `DATABASE_URL`에 타임아웃 설정 추가:
  ```
  postgresql://user:pass@host:5432/db?connect_timeout=10
  ```

### 6. 연결 풀 타임아웃 (P2024)

**증상:**
```
Error Code: P2024
💡 Diagnosis: Connection pool timeout
```

**해결 방법:**
- Prisma 연결 풀 크기 조정:
  ```
  DATABASE_URL="postgresql://...?connection_limit=10"
  ```
- 장시간 실행되는 쿼리 최적화
- 연결이 제대로 닫히는지 확인

## 프로덕션 환경 설정

### 환경 변수

```env
# 필수
DATABASE_URL="postgresql://user:password@host:5432/database"

# 선택 (프로덕션 환경)
NODE_ENV="production"

# 연결 풀 설정 (선택)
DATABASE_URL="postgresql://user:password@host:5432/database?connection_limit=10&pool_timeout=30"
```

### Prisma 로그 레벨

개발 환경:
- `query`, `error`, `info`, `warn` 모두 활성화
- 쿼리 실행 시간 로깅

프로덕션 환경:
- `error`, `warn`만 활성화
- 쿼리 로깅 비활성화 (성능)

## API에서 DB 에러 핸들링 사용법

```typescript
import { handleDatabaseError } from '@/lib/db-error-handler'

export async function POST(request: NextRequest) {
  try {
    // DB 작업
    const result = await prisma.user.create({ ... })
    return NextResponse.json(result)
  } catch (error) {
    // 자동으로 로그하고 적절한 에러 메시지 반환
    const dbError = handleDatabaseError(error, 'POST /api/your-endpoint')
    return NextResponse.json(
      { error: dbError.message, errorCode: dbError.errorCode },
      { status: dbError.statusCode }
    )
  }
}
```

## 모니터링 권장사항

### 1. 서버 시작 시 로그 확인
- `✅ Database connected successfully` 메시지 확인
- DATABASE_URL 설정 확인

### 2. 정기적인 헬스체크
```bash
# cron job 또는 모니터링 도구로 정기 확인
curl https://your-domain.com/api/health/db
```

### 3. 로그 수집
- PM2, Docker logs, 또는 클라우드 로그 서비스 사용
- 에러 패턴 분석
- 알림 설정 (연결 실패 시)

### 4. 주요 체크포인트
- [ ] 서버 시작 시 DB 연결 성공
- [ ] `/api/health/db` 정상 응답
- [ ] 프로덕션 환경에서 DATABASE_URL 올바르게 설정
- [ ] 방화벽/보안 그룹에서 DB 포트 허용
- [ ] DB 서버 메모리/CPU 충분
- [ ] 연결 풀 크기 적절

## 문제 해결 체크리스트

DB 연결 문제 발생 시 다음 순서로 확인:

1. **환경 변수 확인**
   ```bash
   echo $DATABASE_URL  # 올바르게 설정되었는지
   ```

2. **DB 서버 상태 확인**
   ```bash
   # PostgreSQL 예시
   pg_isready -h hostname -p 5432
   ```

3. **네트워크 연결 확인**
   ```bash
   telnet hostname 5432
   # 또는
   nc -zv hostname 5432
   ```

4. **로그 확인**
   - 서버 시작 로그
   - `/api/health/db` 응답
   - 에러 로그 상세 내용

5. **데이터베이스 권한 확인**
   ```sql
   -- 사용자 권한 확인
   \du  -- PostgreSQL
   ```

## 추가 리소스

- [Prisma Error Reference](https://www.prisma.io/docs/reference/api-reference/error-reference)
- [Prisma Connection Management](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [Database Connection Troubleshooting](https://www.prisma.io/docs/guides/database/troubleshooting-database-connection-issues)
