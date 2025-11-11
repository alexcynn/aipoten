import type { Config } from 'tailwindcss'

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        pretendard: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'sans-serif'],
      },
      colors: {
        // 아이포텐 브랜드 색상 (기존 호환성)
        'aipoten-green': '#386646',
        'aipoten-accent': '#98C15E',
        'aipoten-navy': '#193149',
        'aipoten-orange': '#F78C6B',
        'aipoten-blue': '#5D93B3',
        'aipoten-red': '#C74E5D',

        // 새로운 브랜드 컬러 시스템 (COLOR_GUIDE.md)
        // 주조색 (Primary Colors)
        'brand-green': '#386646',    // 딥 그린 - 신뢰, 안정
        'brand-accent': '#98C15E',   // 라이트 그린 - 성장, 활력
        'brand-navy': '#193149',     // 다크 네이비 - 전문성

        // 보조색 (Secondary Colors)
        'point-orange': '#F78C6B',   // 따뜻한 오렌지 - 주목
        'point-blue': '#5D93B3',     // 청량한 블루 - 정보
        'point-red': '#C74E5D',      // 활발한 레드 - 경고

        // 중립색 (Neutral Colors)
        'neutral-light': '#F5F5F5',  // 밝은 그레이
        'neutral-white': '#FFFFFF',  // 순백색
      },
    },
  },
  plugins: [],
} satisfies Config