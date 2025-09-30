// 아이포텐 색상 가이드
// 로고 기반 색상 팔레트 정의

export const colors = {
  // 1. 주조색 (Primary Colors)
  primary: {
    // 메인 배경색/브랜드 컬러 - 딥 그린 (Deep Green)
    brand: '#386646',      // 신뢰, 안정, 자연, 건강을 상징
    // 메인 강조색 (1) - 라이트 그린 (Light Green)
    accent: '#98C15E',     // 성장, 활력, 희망을 나타냄
    // 메인 강조색 (2) - 다크 네이비 (Dark Navy)
    text: '#193149',       // 전문성, 안정감, 깊이를 더해줌
  },

  // 2. 보조색 (Secondary Colors)
  secondary: {
    // 포인트 컬러 (잎사귀 색상들)
    orange: '#F78C6B',     // 경고, 주목, 긍정적 피드백
    blue: '#5D93B3',       // 정보, 안내, 진정성 요소
    red: '#C74E5D',        // 오류, 주의사항, 제한적 활력
  },

  // 3. 중립색 (Neutral Colors)
  neutral: {
    light: '#F5F5F5',      // 일반 컨텐츠 영역, 카드 배경
    white: '#FFFFFF',      // 텍스트 배경, 가독성 최우선
  },

  // 4. 헤더 색상 옵션
  header: {
    // 옵션 1: 로고 강조 및 가독성 최우선 (권장)
    option1: {
      background: '#FFFFFF',
      text: '#193149',
    },
    // 옵션 2: 브랜드 아이덴티티 강화
    option2: {
      background: '#386646',
      text: '#FFFFFF',
    },
  },
} as const;

// Tailwind CSS에서 사용할 수 있는 색상 객체
export const tailwindColors = {
  'brand-green': '#386646',
  'accent-green': '#98C15E',
  'text-navy': '#193149',
  'point-orange': '#F78C6B',
  'point-blue': '#5D93B3',
  'point-red': '#C74E5D',
  'neutral-light': '#F5F5F5',
  'neutral-white': '#FFFFFF',
} as const;

// CSS 변수로 사용할 수 있는 색상 정의
export const cssVariables = `
  :root {
    --color-brand-green: ${colors.primary.brand};
    --color-accent-green: ${colors.primary.accent};
    --color-text-navy: ${colors.primary.text};
    --color-point-orange: ${colors.secondary.orange};
    --color-point-blue: ${colors.secondary.blue};
    --color-point-red: ${colors.secondary.red};
    --color-neutral-light: ${colors.neutral.light};
    --color-neutral-white: ${colors.neutral.white};

    /* 헤더 색상 (옵션 1 기본값) */
    --color-header-bg: ${colors.header.option1.background};
    --color-header-text: ${colors.header.option1.text};
  }
`;

// 사용 예시와 가이드
export const colorGuide = {
  usage: {
    // 배경 색상
    backgrounds: {
      main: colors.primary.brand,      // 메인 섹션, 푸터
      content: colors.neutral.light,   // 카드, 컨테이너
      clean: colors.neutral.white,     // 텍스트 배경, 폼
    },

    // 텍스트 색상
    text: {
      primary: colors.primary.text,    // 메인 텍스트
      onDark: colors.neutral.white,    // 어두운 배경의 텍스트
    },

    // 강조 및 액션
    accents: {
      primary: colors.primary.accent,  // 주요 버튼, 링크
      success: colors.secondary.blue,  // 성공 알림, 완료 상태
      warning: colors.secondary.orange, // 주의, 중요 알림
      error: colors.secondary.red,     // 오류, 삭제 버튼
    },

    // 헤더 (권장: 옵션 1)
    header: {
      background: colors.header.option1.background,
      text: colors.header.option1.text,
      logo: 'optimal', // 로고가 가장 잘 보임
    },
  },

  accessibility: {
    // WCAG 준수를 위한 대비율 정보
    contrast: {
      'brand-green/white': 'AAA', // 충분한 대비율
      'text-navy/white': 'AAA',   // 충분한 대비율
      'accent-green/white': 'AA', // 적절한 대비율
    },
  },
} as const;

export default colors;