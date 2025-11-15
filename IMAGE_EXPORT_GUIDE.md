# Figma 이미지 Export 가이드

언어컨설팅 페이지에 필요한 이미지를 Figma에서 저장하는 방법입니다.

## 필요한 이미지

### 1. 히어로 섹션 배경 이미지
**파일명**: `language-consulting-hero.jpg`
**저장 위치**: `C:\work\aipoten\public\images\language-consulting-hero.jpg`

## Figma에서 이미지 Export 방법

### 방법 1: 디자인 요소 선택해서 Export

1. **Figma에서 이미지 선택**
   - Figma 디자인 파일에서 export할 이미지 영역을 선택합니다
   - 히어로 섹션의 배경 이미지를 찾습니다

2. **Export 설정**
   - 우측 패널에서 "Export" 섹션을 찾습니다
   - "+" 버튼을 클릭하여 export 설정을 추가합니다

3. **포맷 및 크기 설정**
   - **히어로 이미지**:
     - 포맷: JPG
     - 크기: 2x (retina 디스플레이 대응)
     - 권장 크기: 1200x800px 이상

4. **Export 실행**
   - "Export [선택한 레이어명]" 버튼을 클릭합니다
   - 저장 위치를 `C:\work\aipoten\public\images\`로 선택합니다
   - 파일명을 `language-consulting-hero.jpg`로 지정합니다

### 방법 2: Frame 전체 Export

1. **Frame 선택**
   - 좌측 레이어 패널에서 export할 Frame을 선택합니다

2. **우클릭 메뉴 사용**
   - 선택한 Frame에서 우클릭합니다
   - "Copy/Paste as" → "Copy as PNG" 선택
   - 또는 "Export..." 메뉴를 선택합니다

3. **이미지 저장**
   - 복사한 이미지를 이미지 편집 프로그램에 붙여넣기하여 JPG로 저장
   - 또는 Export 대화상자에서 JPG 포맷으로 저장

## 이미지 최적화 권장사항

### 데스크탑 이미지
- **크기**: 1200-1600px (width)
- **포맷**: JPG (사진), PNG (투명 배경 필요 시)
- **품질**: 80-90% (JPG)
- **파일 크기**: 200KB 이하 권장

### 모바일 이미지
- **크기**: 800-1000px (width)
- **포맷**: JPG (사진), WebP (최신 브라우저)
- **품질**: 70-80% (JPG)
- **파일 크기**: 100KB 이하 권장

## 반응형 이미지 구현 (선택사항)

더 나은 성능을 위해 다양한 크기의 이미지를 준비할 수 있습니다:

```
public/images/
  language-consulting-hero.jpg           (데스크탑용, 1600x1067px)
  language-consulting-hero-tablet.jpg    (태블릿용, 1200x800px)
  language-consulting-hero-mobile.jpg    (모바일용, 800x533px)
```

이후 Next.js Image 컴포넌트에서 srcSet을 사용하여 적용:

```tsx
<Image
  src="/images/language-consulting-hero.jpg"
  alt="언어컨설팅"
  fill
  className="object-cover rounded-lg"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

## 빠른 이미지 준비 방법

이미지 준비가 안 된 경우, 임시로 placeholder 이미지를 사용할 수 있습니다:

```tsx
// 임시 이미지 URL 사용 (개발 중)
<Image
  src="https://via.placeholder.com/1600x1067/F5EFE7/FF6A00?text=Language+Consulting"
  alt="언어컨설팅"
  fill
  className="object-cover rounded-lg"
/>
```

## 현재 페이지에서 사용 중인 이미지

| 이미지 경로 | 설명 | 크기 권장 |
|------------|------|----------|
| `/images/language-consulting-hero.jpg` | 히어로 섹션 배경 | 1600x1067px |
| `/images/footer-logo.png` | 푸터 로고 | 200x32px |

## 이미지 저장 후 확인사항

1. 파일이 `public/images/` 폴더에 올바르게 저장되었는지 확인
2. 파일명이 코드에서 사용하는 이름과 일치하는지 확인
3. 이미지가 너무 크지 않은지 확인 (200KB 이하 권장)
4. 브라우저에서 페이지를 새로고침하여 이미지가 표시되는지 확인

## 문제 해결

### 이미지가 표시되지 않는 경우

1. **파일 경로 확인**
   ```
   올바른 경로: C:\work\aipoten\public\images\language-consulting-hero.jpg
   ```

2. **파일명 확인**
   - 대소문자 구분 확인
   - 공백이나 특수문자 없는지 확인

3. **개발 서버 재시작**
   ```bash
   # 개발 서버 중지 후 재시작
   npm run dev
   ```

4. **브라우저 캐시 삭제**
   - Ctrl + Shift + R (Windows)
   - Cmd + Shift + R (Mac)

## 추가 도움

이미지 최적화가 필요한 경우 다음 온라인 도구를 사용할 수 있습니다:

- **TinyPNG**: https://tinypng.com/ (PNG/JPG 압축)
- **Squoosh**: https://squoosh.app/ (Google의 이미지 최적화 도구)
- **ImageOptim**: https://imageoptim.com/ (Mac용)
