import type { Config } from 'tailwindcss'

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 아이포텐 브랜드 색상 추가
        'aipoten-green': '#386646',
        'aipoten-accent': '#98C15E',
        'aipoten-navy': '#193149',
        'aipoten-orange': '#F78C6B',
        'aipoten-blue': '#5D93B3',
        'aipoten-red': '#C74E5D',
      },
    },
  },
  plugins: [],
} satisfies Config