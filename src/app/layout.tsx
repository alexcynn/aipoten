import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '아이포텐 - 영유아 발달 지원 플랫폼',
  description: '아이의 잠재력을 발견하세요. AI 기반 발달 체크와 맞춤형 놀이영상, 전문 치료사 연결 서비스',
  keywords: ['영유아', '발달체크', '놀이영상', '치료사', '육아', '아이포텐'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={`${inter.className} bg-white text-gray-900`}>
        {children}
      </body>
    </html>
  )
}