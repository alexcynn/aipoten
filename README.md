# 아이포텐 (Aipoten) 🍼

> 영유아 발달 지원 플랫폼 - AI 기반 발달 체크와 맞춤형 놀이영상, 전문 치료사 연결 서비스

## 🌟 주요 기능

### 👶 발달 체크
- AI 기반 월령별 발달 평가
- 6개 영역 종합 발달 분석 (대근육, 소근육, 인지, 언어, 사회성, 정서)
- 개인별 맞춤 발달 리포트

### 🎥 놀이영상
- 월령별 맞춤 놀이 활동 영상
- 난이도별 필터링
- 놀이 영상 북마크 기능

### 🙏 놀이영성
- 10가지 영성 발달 카테고리
- 연령별/난이도별 영성 활동
- 가정에서 실천 가능한 활동 가이드

### 💬 커뮤니티
- 부모-치료사 소통 게시판
- 질문답변 및 경험 공유
- 전문가 Q&A

### 📰 육아정보
- 최신 육아 및 발달 정보
- 연구 기반 육아 가이드
- 전문가 칼럼

## 🚀 빠른 시작

### 개발 환경 실행

```bash
# 의존성 설치
npm install

# 데이터베이스 설정
npx prisma generate
npx prisma migrate dev

# 시드 데이터 생성 (테스트 계정 포함)
npm run db:seed

# 개발 서버 시작
npm run dev
```

서버가 시작되면 [http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

### 🔐 테스트 계정

```
부모 계정:     parent@test.com / test123!
치료사 계정:   therapist@test.com / test123!
관리자 계정:   admin@test.com / test123!
```

## 🛠 기술 스택

### Frontend
- **Next.js 15** - React 프레임워크
- **TypeScript** - 타입 안전성
- **Tailwind CSS 4** - 스타일링
- **NextAuth.js** - 인증 시스템

### Backend
- **Prisma** - ORM
- **SQLite** - 개발 데이터베이스
- **bcryptjs** - 비밀번호 해싱

### DevOps & 배포
- **Docker** - 컨테이너화
- **Nginx** - 리버스 프록시
- **Docker Compose** - 오케스트레이션

## 📁 프로젝트 구조

```
aipoten/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API 라우트
│   │   ├── auth/              # 인증 페이지
│   │   ├── dashboard/         # 대시보드
│   │   ├── assessments/       # 발달 체크
│   │   ├── videos/            # 놀이영상
│   │   ├── spirituality/      # 놀이영성
│   │   ├── boards/            # 게시판
│   │   └── admin/             # 관리자 패널
│   ├── components/            # React 컴포넌트
│   │   ├── ui/               # 기본 UI 컴포넌트
│   │   └── layout/           # 레이아웃 컴포넌트
│   ├── lib/                  # 유틸리티 라이브러리
│   │   ├── services/         # 비즈니스 로직
│   │   ├── utils/            # 헬퍼 함수
│   │   ├── cache.ts          # 캐시 시스템
│   │   └── performance.ts    # 성능 모니터링
│   └── types/                # TypeScript 타입 정의
├── prisma/                   # 데이터베이스 스키마
├── public/                   # 정적 파일
└── docker/                   # Docker 설정
```

## 🗄 데이터베이스 스키마

### 주요 모델
- **User** - 사용자 (부모/치료사/관리자)
- **Child** - 아이 정보
- **DevelopmentAssessment** - 발달 체크
- **Video** - 놀이영상
- **Board/Post** - 게시판/게시글
- **News** - 뉴스/정보

## 🔧 개발 스크립트

```bash
# 개발
npm run dev              # 개발 서버 시작
npm run build            # 프로덕션 빌드
npm run start            # 프로덕션 서버 시작

# 데이터베이스
npm run db:migrate       # 마이그레이션 실행
npm run db:seed          # 시드 데이터 생성
npm run db:studio        # Prisma Studio 실행
npm run db:reset         # 데이터베이스 리셋

# 코드 품질
npm run lint             # ESLint 실행
npm run lint:fix         # ESLint 자동 수정
npm run type-check       # TypeScript 타입 체크

# 배포
npm run deploy           # Docker Compose 배포
npm run logs             # 애플리케이션 로그 확인
```

## 🚀 배포

### Docker 배포 (권장)

```bash
# 환경 변수 설정
cp .env.production .env.local

# Docker Compose로 배포
npm run deploy

# 로그 확인
npm run logs
```

자세한 배포 가이드는 [DEPLOYMENT.md](./DEPLOYMENT.md)를 참조하세요.

## 🎯 주요 기능 페이지

- **홈페이지**: `/` - 서비스 소개 및 로그인
- **대시보드**: `/dashboard` - 사용자 메인 페이지
- **발달체크**: `/assessments` - AI 발달 평가
- **놀이영상**: `/videos` - 맞춤형 놀이 영상
- **놀이영성**: `/spirituality` - 영성 발달 활동
- **커뮤니티**: `/boards` - 소통 게시판
- **관리자**: `/admin` - 시스템 관리

## 🔍 API 엔드포인트

### 인증
- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/signin` - 로그인

### 사용자 & 아이
- `GET /api/users/me` - 내 정보 조회
- `POST /api/children` - 아이 등록
- `GET /api/children/{id}` - 아이 상세 정보

### 발달 체크
- `GET /api/assessment-questions` - 발달 체크 질문
- `POST /api/assessments` - 발달 체크 제출
- `GET /api/assessments/{id}` - 결과 조회

### 컨텐츠
- `GET /api/videos` - 놀이영상 목록
- `GET /api/news` - 뉴스/정보 목록
- `GET /api/boards` - 게시판 목록

### 기타
- `GET /api/health` - 헬스 체크
- `GET /api/search` - 통합 검색
- `POST /api/upload` - 파일 업로드

## 🔒 보안 기능

- **인증**: NextAuth.js 기반 안전한 인증
- **권한 관리**: 역할 기반 접근 제어 (RBAC)
- **Rate Limiting**: API 호출 제한
- **보안 헤더**: XSS, CSRF 방지
- **비밀번호 해싱**: bcrypt 사용

## 📊 성능 최적화

- **이미지 최적화**: WebP/AVIF 지원
- **코드 분할**: 청크 단위 로딩
- **캐싱**: 인메모리 캐시 시스템
- **압축**: gzip 압축 적용
- **번들 최적화**: webpack 설정

## 🐛 문제 해결

### 자주 발생하는 문제

1. **데이터베이스 연결 오류**
   ```bash
   npx prisma migrate reset
   npx prisma migrate dev
   ```

2. **빌드 실패**
   ```bash
   rm -rf .next node_modules
   npm install
   npm run build
   ```

3. **포트 충돌**
   ```bash
   # 다른 포트로 실행
   PORT=3001 npm run dev
   ```

## 📝 라이선스

MIT License - 자세한 내용은 [LICENSE](./LICENSE) 파일을 참조하세요.

## 👥 기여하기

1. Fork 프로젝트
2. Feature 브랜치 생성 (`git checkout -b feature/AmazingFeature`)
3. 변경사항 커밋 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 Push (`git push origin feature/AmazingFeature`)
5. Pull Request 생성

## 📞 지원

문제가 있거나 도움이 필요하시면:
- GitHub Issues: [이슈 등록](https://github.com/aipoten/aipoten/issues)
- 이메일: support@aipoten.com

---

**아이포텐**과 함께 우리 아이의 잠재력을 발견해보세요! 🌟