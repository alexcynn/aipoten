/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 아이포텐 브랜드 색상 팔레트
        // 주조색 (Primary Colors)
        brand: {
          green: '#386646',    // 딥 그린 - 메인 브랜드 컬러
          accent: '#98C15E',   // 라이트 그린 - 메인 강조색
          navy: '#193149',     // 다크 네이비 - 텍스트/구조 색상
        },

        // 보조색 (Secondary Colors) - 잎사귀 포인트 컬러들
        point: {
          orange: '#F78C6B',   // 따뜻한 오렌지 - 경고/주목
          blue: '#5D93B3',     // 청량한 블루 - 정보/안내
          red: '#C74E5D',      // 활발한 레드 - 오류/주의
        },

        // 중립색 (Neutral Colors)
        neutral: {
          light: '#F5F5F5',    // 밝은 그레이 - 카드 배경
          white: '#FFFFFF',    // 순백색 - 텍스트 배경
        },

        // 헤더 색상 옵션들
        header: {
          // 옵션 1: 가독성 우선 (권장)
          bg: '#FFFFFF',
          text: '#193149',
          // 옵션 2: 브랜드 강화
          'bg-alt': '#386646',
          'text-alt': '#FFFFFF',
        },

        // shadcn/ui 호환성을 위한 기본 색상 확장
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: '#386646', // 브랜드 그린
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#98C15E', // 액센트 그린
          foreground: '#193149',
        },
        muted: {
          DEFAULT: '#F5F5F5', // 중립 라이트
          foreground: '#193149',
        },
        accent: {
          DEFAULT: '#98C15E', // 액센트 그린
          foreground: '#193149',
        },
        destructive: {
          DEFAULT: '#C74E5D', // 포인트 레드
          foreground: '#FFFFFF',
        },
        border: '#F5F5F5',
        input: '#F5F5F5',
        ring: '#98C15E',
      },

      // 아이포텐 색상 시스템에 맞는 추가 유틸리티
      textColor: {
        'aipoten-primary': '#193149',    // 메인 텍스트
        'aipoten-accent': '#98C15E',     // 강조 텍스트
        'aipoten-muted': '#6B7280',      // 보조 텍스트
      },

      backgroundColor: {
        'aipoten-primary': '#386646',    // 브랜드 배경
        'aipoten-accent': '#98C15E',     // 액센트 배경
        'aipoten-light': '#F5F5F5',      // 라이트 배경
        'aipoten-white': '#FFFFFF',      // 화이트 배경
      },

      borderColor: {
        'aipoten-light': '#F5F5F5',      // 기본 보더
        'aipoten-accent': '#98C15E',     // 강조 보더
      },

      // 아이포텐 브랜딩을 위한 폰트 패밀리 (필요시)
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },

      // 그래프와 차트를 위한 추가 색상 팔레트
      charts: {
        1: '#386646',  // 브랜드 그린
        2: '#98C15E',  // 액센트 그린
        3: '#5D93B3',  // 포인트 블루
        4: '#F78C6B',  // 포인트 오렌지
        5: '#C74E5D',  // 포인트 레드
        6: '#193149',  // 다크 네이비
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};