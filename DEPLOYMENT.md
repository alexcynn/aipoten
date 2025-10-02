# Aipoten 배포 가이드

## 배포 개요

아이포텐은 영유아 발달 지원 플랫폼으로, Next.js 15, Prisma, NextAuth.js를 기반으로 구축되었습니다.

## 시스템 요구사항

- Node.js 18 이상
- Docker & Docker Compose (컨테이너 배포 시)
- SQLite 또는 PostgreSQL 데이터베이스
- 최소 2GB RAM, 20GB 디스크 공간

## 배포 방법

### 1. 환경 변수 설정

`.env.production` 파일을 복사하여 `.env.local` 파일을 생성하고 다음 값들을 설정하세요:

```bash
# 필수 설정
DATABASE_URL="file:./prod.db"  # 또는 PostgreSQL 연결 문자열
NEXTAUTH_SECRET="매우-긴-랜덤-문자열-64자-이상"
NEXTAUTH_URL="https://yourdomain.com"

# 선택 설정
UPLOAD_MAX_SIZE=5242880
BCRYPT_ROUNDS=12
```

### 2. Docker 배포 (권장)

```bash
# 1. 환경 변수 파일 생성
cp .env.production .env

# 2. Docker Compose로 시작
docker-compose up -d

# 3. 로그 확인
docker-compose logs -f app
```

### 3. 직접 배포

```bash
# 1. 의존성 설치
npm ci --production

# 2. 데이터베이스 설정
npx prisma generate
npx prisma migrate deploy

# 3. 시드 데이터 (선택사항)
npm run db:seed

# 4. 빌드
npm run build

# 5. 시작
npm start
```

## 모니터링

### 헬스 체크
- URL: `GET /api/health`
- 정상: HTTP 200, JSON 응답
- 비정상: HTTP 503

### 로그 모니터링
```bash
# Docker 환경
docker-compose logs -f app

# PM2 환경 (선택사항)
pm2 logs aipoten
```

## 백업

### 데이터베이스 백업
```bash
# SQLite
cp data/prod.db backups/prod_$(date +%Y%m%d_%H%M%S).db

# PostgreSQL
pg_dump $DATABASE_URL > backups/aipoten_$(date +%Y%m%d_%H%M%S).sql
```

### 파일 업로드 백업
```bash
tar -czf backups/uploads_$(date +%Y%m%d_%H%M%S).tar.gz public/uploads/
```

## 보안 설정

### Nginx 보안 헤더
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block

### Rate Limiting
- API: 10req/sec
- Login: 5req/min

## 성능 최적화

### 캐시 설정
- 정적 파일: 30일 캐시
- API 응답: 인메모리 캐시 (5분)
- 이미지 최적화: WebP/AVIF 지원

### 데이터베이스 최적화
- 연결 풀링
- 인덱스 최적화
- 쿼리 최적화

## 트러블슈팅

### 일반적인 문제

1. **빌드 실패**
   ```bash
   # node_modules 재설치
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **데이터베이스 연결 실패**
   ```bash
   # 마이그레이션 재실행
   npx prisma migrate reset
   npx prisma migrate deploy
   ```

3. **권한 문제**
   ```bash
   # 파일 권한 확인
   chown -R nextjs:nodejs /app
   chmod -R 755 /app/public/uploads
   ```

### 로그 분석
```bash
# 에러 로그 필터링
docker-compose logs app | grep ERROR

# 성능 메트릭 확인
curl http://localhost:3000/api/admin/stats
```

## 업데이트

### 애플리케이션 업데이트
```bash
# 1. 코드 업데이트
git pull origin main

# 2. 의존성 업데이트
npm ci

# 3. 데이터베이스 마이그레이션
npx prisma migrate deploy

# 4. 빌드 및 재시작
npm run build
docker-compose restart app
```

### 데이터베이스 마이그레이션
```bash
# 마이그레이션 생성
npx prisma migrate dev --name migration_name

# 프로덕션 적용
npx prisma migrate deploy
```

## 스케일링

### 수평 확장
- 로드 밸런서 추가
- 여러 인스턴스 실행
- 데이터베이스 읽기 복제본

### 성능 모니터링
- 응답 시간 추적
- 메모리 사용량 모니터링
- 데이터베이스 쿼리 분석

## 지원

문제가 발생하시면 다음 정보와 함께 문의해 주세요:
- 에러 메시지 및 로그
- 환경 정보 (OS, Node.js 버전)
- 재현 단계