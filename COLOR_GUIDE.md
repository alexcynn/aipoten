# 아이포텐 색상 가이드

로고 이미지를 바탕으로 제작된 아이포텐 웹사이트의 전체적인 색상 가이드입니다.

## 🎨 색상 팔레트

### 1. 주조색 (Primary Colors)

| 역할 | 색상 이름 | HEX 코드 | Tailwind 클래스 | 설명 |
|------|-----------|----------|-----------------|------|
| 메인 브랜드 컬러 | 딥 그린 (Deep Green) | `#386646` | `bg-brand-green` | 신뢰, 안정, 자연, 건강을 상징. 사이트의 기본 톤 |
| 메인 강조색 (1) | 라이트 그린 (Light Green) | `#98C15E` | `bg-brand-accent` | 성장, 활력, 희망. 주요 버튼, 링크 강조 |
| 메인 강조색 (2) | 다크 네이비 (Dark Navy) | `#193149` | `bg-brand-navy` | 전문성, 안정감. 텍스트, 아이콘 색상 |

### 2. 보조색 (Secondary Colors)

| 역할 | 색상 이름 | HEX 코드 | Tailwind 클래스 | 설명 |
|------|-----------|----------|-----------------|------|
| 포인트 컬러 | 따뜻한 오렌지 | `#F78C6B` | `bg-point-orange` | 경고, 주목, 긍정적 피드백 |
| 포인트 컬러 | 청량한 블루 | `#5D93B3` | `bg-point-blue` | 정보, 안내, 치료사 연결 완료 |
| 포인트 컬러 | 활발한 레드 | `#C74E5D` | `bg-point-red` | 오류, 주의사항, 제한적 활력 |

### 3. 중립색 (Neutral Colors)

| 역할 | 색상 이름 | HEX 코드 | Tailwind 클래스 | 설명 |
|------|-----------|----------|-----------------|------|
| 배경 | 밝은 그레이 | `#F5F5F5` | `bg-neutral-light` | 카드 배경, 구분선 |
| 배경 | 순백색 | `#FFFFFF` | `bg-neutral-white` | 텍스트 배경, 가독성 최우선 |

## 🔼 헤더 색상 옵션

### 옵션 1: 로고 강조 및 가독성 최우선 ⭐ **권장**

```tsx
// 헤더 배경색: 순백색 (#FFFFFF)
// 메뉴 텍스트: 다크 네이비 (#193149)
<Header variant="default" />
```

**장점:**
- 로고의 모든 색상이 가장 선명하게 대비됨
- 깔끔하고 모던한 느낌
- 정보 전달 서비스에 가장 적합

### 옵션 2: 브랜드 아이덴티티 강화

```tsx
// 헤더 배경색: 딥 그린 (#386646)
// 메뉴 텍스트: 순백색 (#FFFFFF)
<Header variant="brand" />
```

**장점:**
- 브랜드 정체성 강화
- 로고의 밝은 요소들이 돋보임

## 💡 사용 가이드

### 배경 색상

```tsx
// 메인 섹션, 푸터
<div className="bg-brand-green">

// 카드, 컨테이너
<div className="bg-neutral-light">

// 텍스트 배경, 폼
<div className="bg-neutral-white">
```

### 텍스트 색상

```tsx
// 메인 텍스트
<h1 className="text-brand-navy">

// 강조 텍스트
<span className="text-brand-accent">

// 어두운 배경의 텍스트
<p className="text-neutral-white">
```

### 버튼 스타일

```tsx
// 주요 액션 버튼
<button className="btn-aipoten-primary">
  시작하기
</button>

// 보조 버튼
<button className="btn-aipoten-secondary">
  더 알아보기
</button>
```

### 상태별 색상

```tsx
// 성공 상태
<div className="bg-point-blue text-white">성공</div>

// 경고 상태
<div className="bg-point-orange text-white">주의</div>

// 오류 상태
<div className="bg-point-red text-white">오류</div>
```

### 카드 스타일

```tsx
// 기본 카드
<div className="card-aipoten">

// 강조 카드
<div className="card-aipoten-highlight">
```

## 🚀 구현 방법

### 1. Tailwind CSS 사용

```tsx
import React from 'react';

const Component = () => (
  <div className="bg-brand-green text-white p-6">
    <h2 className="text-brand-accent">제목</h2>
    <p className="text-neutral-white">내용</p>
  </div>
);
```

### 2. CSS 변수 사용

```css
.custom-component {
  background-color: var(--color-brand-green);
  color: var(--color-neutral-white);
}
```

### 3. TypeScript 상수 사용

```tsx
import { colors } from './colors';

const styles = {
  background: colors.primary.brand,
  color: colors.neutral.white,
};
```

## 📱 반응형 고려사항

- 모바일에서는 터치 영역을 고려하여 버튼 크기 충분히 확보
- 대비율 WCAG AA 기준 준수 (텍스트와 배경 간 4.5:1 이상)
- 다크모드 지원 시 색상 조정 필요

## 🎯 사용 예시

### 메인 페이지 히어로 섹션

```tsx
<section className="bg-gradient-aipoten py-20">
  <div className="container mx-auto text-center">
    <h1 className="text-4xl font-bold text-white mb-6">
      아이의 잠재력을 발견하세요
    </h1>
    <p className="text-xl text-white/90 mb-8">
      AI 기반 발달 체크와 맞춤형 놀이영상
    </p>
    <button className="btn-aipoten-primary text-lg px-8 py-3">
      무료 체험하기
    </button>
  </div>
</section>
```

### 발달 체크 결과 카드

```tsx
<div className="card-aipoten-highlight p-6">
  <div className="flex items-center mb-4">
    <div className="badge-aipoten">우수</div>
    <h3 className="text-brand-navy font-semibold ml-3">대근육 발달</h3>
  </div>
  <p className="text-brand-navy/80 mb-4">
    또래 대비 우수한 발달 수준을 보이고 있습니다.
  </p>
  <button className="link-aipoten">
    추천 놀이영상 보기 →
  </button>
</div>
```

### 치료사 프로필 카드

```tsx
<div className="card-aipoten p-6 hover:shadow-lg transition-shadow">
  <div className="flex items-start space-x-4">
    <img
      src="/therapist-avatar.jpg"
      className="w-16 h-16 rounded-full"
    />
    <div className="flex-1">
      <h4 className="text-brand-navy font-semibold">김치료 치료사</h4>
      <p className="text-brand-navy/70 text-sm">언어치료 전문</p>
      <div className="flex space-x-2 mt-2">
        <span className="badge-aipoten-outline">5년 경력</span>
        <span className="badge-aipoten-outline">온라인 상담</span>
      </div>
    </div>
    <div className="text-right">
      <div className="text-brand-accent font-semibold">⭐ 4.9</div>
      <button className="btn-aipoten-primary mt-2">상담 신청</button>
    </div>
  </div>
</div>
```

## 📋 체크리스트

프로젝트에 색상 시스템을 적용할 때 확인해야 할 사항들:

- [ ] `colors.ts` 파일 임포트
- [ ] `tailwind.config.js`에 색상 팔레트 추가
- [ ] `globals.css`에 CSS 변수 정의
- [ ] 헤더 컴포넌트에 색상 적용
- [ ] 주요 UI 컴포넌트에 브랜드 색상 적용
- [ ] 버튼, 링크, 폼 요소 스타일링
- [ ] 상태별 색상 (성공, 경고, 오류) 적용
- [ ] 접근성 검증 (대비율 확인)
- [ ] 다크모드 지원 여부 결정

이 가이드를 참고하여 일관성 있고 브랜드 정체성이 강한 아이포텐 웹사이트를 구축하세요! 🎨✨