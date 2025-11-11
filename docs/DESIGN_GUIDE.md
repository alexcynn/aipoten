# 아이포텐 디자인 가이드

Figma 디자인 시스템을 기반으로 한 아이포텐 웹사이트의 종합 디자인 가이드입니다.

## 📐 레이아웃 시스템

### Container 설정
```tsx
// 최대 너비 설정
className="max-w-7xl mx-auto"

// 반응형 패딩
className="px-4 sm:px-6 lg:px-8"

// 전체 구조
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* 콘텐츠 */}
</div>
```

### 섹션 간격
```tsx
// 모바일 → 데스크탑
className="py-12 md:py-16 lg:py-20"  // 상하 패딩
className="mb-10 md:mb-16"            // 하단 마진
className="gap-6 md:gap-12"           // 요소 간 간격
```

### Grid 시스템
```tsx
// 2열 그리드 (모바일: 2열, 데스크탑: 4열)
className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"

// 자동 조정 그리드
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"

// Flex 레이아웃
className="flex flex-col md:flex-row items-center gap-6 md:gap-12"
```

## 📝 타이포그래피

### 폰트 패밀리
- **기본 폰트**: Pretendard
- **클래스**: `font-pretendard`

### 제목 (Headings)

#### H1 - 메인 타이틀
```tsx
// Hero Section
className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-stone-900 leading-tight"
```

#### H2 - 섹션 타이틀
```tsx
// Section Title
className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-stone-900 mb-3 md:mb-4"
```

#### H3 - 서브 타이틀
```tsx
// Card Title
className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-stone-900 mb-3 md:mb-4"
```

### 본문 (Body Text)

#### 대형 본문
```tsx
className="text-sm sm:text-base md:text-lg lg:text-xl text-stone-700"
```

#### 중형 본문
```tsx
className="text-sm sm:text-base md:text-lg text-stone-600"
```

#### 소형 본문 & 캡션
```tsx
className="text-xs md:text-sm text-blue-600"
```

### 폰트 굵기
```tsx
font-bold      // 700 - 제목, 강조
font-semibold  // 600 - 버튼, 라벨
font-medium    // 500 - 내비게이션
font-normal    // 400 - 본문
```

## 🎨 컴포넌트 디자인

### 버튼 (Buttons)

#### Primary Button - 오렌지
```tsx
<button className="inline-block bg-[#FF6A00] text-white px-6 sm:px-8 md:px-10 py-3 md:py-4 rounded-[10px] font-semibold text-base md:text-lg hover:bg-[#E55F00] transition-colors shadow-lg">
  전문가 추천받기
</button>
```

#### Secondary Button - 핑크
```tsx
<button className="inline-block bg-[#FF9999] text-white px-6 sm:px-8 md:px-12 py-3 md:py-4 rounded-full font-semibold text-sm sm:text-base md:text-lg hover:bg-[#FF8888] transition-colors shadow-lg">
  3분 안에 무료 발달체크 시작하기
</button>
```

#### Button Sizes
```tsx
// Small
className="px-4 py-2 text-sm"

// Medium
className="px-6 sm:px-8 py-3 text-base"

// Large
className="px-8 md:px-12 py-3 md:py-4 text-base md:text-lg"
```

### 배지 (Badges)

#### 오렌지 배지 - 라벨
```tsx
<div className="inline-block bg-[#FF6A00] text-white px-4 py-2 rounded-md text-xs sm:text-sm font-semibold">
  01. 발달 체크
</div>
```

#### 핑크 배지 - STEP
```tsx
<div className="inline-block bg-[#FF9999] text-white px-3 md:px-4 py-1 rounded-full text-xs md:text-sm font-semibold">
  STEP 01
</div>
```

### 카드 (Cards)

#### 기본 카드
```tsx
<div className="bg-white rounded-xl md:rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm">
  {/* 콘텐츠 */}
</div>
```

#### 호버 효과 카드
```tsx
<div className="bg-white rounded-2xl p-8 hover:shadow-lg transition-shadow">
  {/* 콘텐츠 */}
</div>
```

#### STEP 카드 (무료 발달체크)
```tsx
<div className="bg-white rounded-xl md:rounded-2xl p-4 sm:p-6 md:p-8 text-center relative">
  <div className="inline-block bg-[#FF9999] text-white px-3 md:px-4 py-1 rounded-full text-xs md:text-sm font-semibold mb-4 md:mb-6">
    STEP 01
  </div>
  <div className="mb-3 md:mb-4 flex justify-center">
    <Image src="/images/ic_step_01.svg" alt="아이콘" width={48} height={48} className="w-12 h-12 md:w-16 md:h-16" />
  </div>
  <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-stone-900 mb-2 md:mb-3">
    제목
  </h3>
  <p className="text-xs md:text-sm text-blue-600">정보</p>
</div>
```

## 🖼️ 이미지 & 아이콘

### 로고
```tsx
// 헤더 로고
<Image
  src="/images/logo.png"
  alt="AIPOTEN 아이포텐"
  width={240}
  height={32}
  priority
/>

// Footer 로고
<Image
  src="/images/footer-logo.png"
  alt="AIPOTEN 아이포텐"
  width={150}
  height={24}
  className="opacity-60 md:w-[200px] md:h-[32px]"
/>
```

### 배경 이미지
```tsx
<div className="absolute inset-0 z-0">
  <Image
    src="/images/hero-background.png"
    alt="Hero Background"
    fill
    className="object-cover"
    priority
  />
  <div className="absolute inset-0 bg-black/20" />
</div>
```

### SVG 아이콘
```tsx
// STEP 아이콘
<Image
  src="/images/ic_step_01.svg"
  alt="아이콘 설명"
  width={48}
  height={48}
  className="w-12 h-12 md:w-16 md:h-16"
/>

// 화살표
<Image
  src="/images/Arrow.svg"
  alt="arrow"
  width={48}
  height={48}
/>
```

### 컨텐츠 이미지
```tsx
// 스마트폰 목업
<Image
  src="/images/step1-phone.png"
  alt="발달 체크 화면"
  width={500}
  height={500}
  className="w-full max-w-[280px] sm:max-w-sm md:max-w-md mx-auto"
/>
```

## 🎯 섹션별 디자인 패턴

### Hero Section
```tsx
<section className="relative h-[400px] md:h-[500px] lg:h-[600px] flex items-center justify-center">
  {/* 배경 이미지 */}
  <div className="absolute inset-0 z-0">
    <Image src="/images/hero-background.png" alt="Hero Background" fill className="object-cover" priority />
    <div className="absolute inset-0 bg-black/20" />
  </div>

  {/* 콘텐츠 */}
  <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-stone-900 leading-tight">
      메인 타이틀
    </h1>
    <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 md:mb-8 text-stone-700">
      서브 타이틀
    </p>
    <Link href="#" className="inline-block bg-[#FF6A00] text-white px-6 sm:px-8 md:px-10 py-3 md:py-4 rounded-[10px] font-semibold text-base md:text-lg hover:bg-[#E55F00] transition-colors shadow-lg">
      CTA 버튼
    </Link>
  </div>
</section>
```

### 정보 섹션 (베이지 배경)
```tsx
<section className="py-12 md:py-16 bg-[#F5EFE7]">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-stone-900 mb-3 md:mb-4">
      섹션 타이틀
    </h2>
    <p className="text-sm sm:text-base md:text-lg text-stone-700">
      설명 텍스트
    </p>
  </div>
</section>
```

### 좌우 레이아웃 섹션
```tsx
<section className="py-12 md:py-16 lg:py-20 bg-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
      <div className="flex-1 text-center md:text-left">
        <div className="inline-block bg-[#FF6A00] text-white px-4 py-2 rounded-md text-xs sm:text-sm font-semibold mb-4 md:mb-6">
          라벨
        </div>
        <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-stone-900 mb-3 md:mb-4">
          타이틀
        </h3>
        <p className="text-sm sm:text-base md:text-lg text-stone-600">
          설명
        </p>
      </div>
      <div className="flex-1 relative">
        <Image src="/images/content.png" alt="이미지" width={500} height={500} className="w-full max-w-[280px] sm:max-w-sm md:max-w-md mx-auto" />
      </div>
    </div>
  </div>
</section>
```

### 그리드 카드 섹션
```tsx
<section className="py-12 md:py-16 lg:py-20 bg-[#FFE5E5]">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-8 md:mb-12">
      <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-stone-900 mb-3 md:mb-4">
        섹션 타이틀
      </h2>
      <p className="text-sm sm:text-base md:text-lg text-stone-700">
        설명
      </p>
    </div>

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
      {/* 카드들 */}
    </div>
  </div>
</section>
```

## 🎭 애니메이션 & 트랜지션

### 호버 효과
```tsx
// 버튼 호버
className="hover:bg-[#E55F00] transition-colors"

// 카드 호버
className="hover:shadow-lg transition-shadow"

// 링크 호버
className="hover:text-orange-500 transition-colors"
```

### 페이드 인/아웃
```tsx
className="transition-opacity duration-300"
```

### 스케일 애니메이션
```tsx
className="hover:scale-105 transition-transform"
```

## 📱 반응형 브레이크포인트

```tsx
// Tailwind 기본 브레이크포인트
sm: 640px   // 모바일 (가로)
md: 768px   // 태블릿
lg: 1024px  // 데스크탑
xl: 1280px  // 대형 데스크탑
2xl: 1536px // 초대형 화면
```

### 사용 예시
```tsx
// 숨김/표시
className="hidden lg:block"       // 데스크탑에서만 표시
className="block md:hidden"       // 모바일에서만 표시

// 크기 조정
className="w-full md:w-1/2 lg:w-1/3"

// 방향 전환
className="flex-col md:flex-row"

// 텍스트 정렬
className="text-center md:text-left"
```

## 🔗 링크 & 내비게이션

### 헤더 링크
```tsx
<Link
  href="/path"
  className="text-stone-900 text-base font-medium font-pretendard hover:text-orange-500 transition-colors"
>
  메뉴 이름
</Link>
```

### Footer 링크
```tsx
<Link
  href="/path"
  className="text-stone-900 text-xs sm:text-sm hover:underline"
>
  링크
</Link>
```

## 🎨 Shadow & Border

### 그림자
```tsx
shadow-sm   // 작은 그림자
shadow-md   // 중간 그림자
shadow-lg   // 큰 그림자 (버튼, 호버 카드)
```

### 테두리
```tsx
// 헤더
className="border-b border-gray-200"

// 카드
className="border border-gray-100"

// 라운드
className="rounded-[10px]"     // 버튼
className="rounded-full"       // 원형 버튼/배지
className="rounded-xl"         // 작은 카드
className="rounded-2xl"        // 큰 카드
```

## ✅ 접근성 체크리스트

- [ ] 충분한 색상 대비율 (WCAG AA 기준 4.5:1)
- [ ] 키보드 네비게이션 지원
- [ ] 포커스 상태 표시
- [ ] 의미있는 alt 텍스트
- [ ] 적절한 ARIA 레이블
- [ ] 터치 영역 최소 44x44px
- [ ] 반응형 텍스트 크기
- [ ] 스크린 리더 호환

## 📋 품질 체크리스트

디자인 구현 시 확인사항:

- [x] 색상 팔레트 일관성
- [x] 타이포그래피 계층 구조
- [x] 반응형 레이아웃
- [x] 버튼/링크 호버 상태
- [x] 이미지 최적화
- [x] 로딩 상태 표시
- [x] 에러 처리
- [x] 접근성 기준 준수
- [x] 브라우저 호환성
- [x] 성능 최적화

## 🚀 Best Practices

### 1. 일관성 유지
- 동일한 역할의 요소는 같은 스타일 사용
- 색상, 여백, 타이포그래피 가이드 준수

### 2. 반응형 우선
- 모바일 퍼스트 접근
- 모든 화면 크기에서 테스트

### 3. 성능 고려
- 이미지 최적화 (WebP, 적절한 크기)
- CSS 애니메이션 사용 (JavaScript 최소화)
- 불필요한 리렌더링 방지

### 4. 접근성
- 시맨틱 HTML 사용
- 키보드 네비게이션 테스트
- 스크린 리더 테스트

### 5. 유지보수성
- 재사용 가능한 컴포넌트 설계
- 명확한 클래스명 사용
- 문서화 철저히

이 가이드를 참고하여 일관되고 아름다운 아이포텐 디자인 시스템을 구축하세요! 🎨✨
