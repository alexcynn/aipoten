'use client'

import React from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()
  const { data: session } = useSession()

  const footerSections = [
    {
      title: '서비스',
      links: [
        { href: '/assessment', label: '발달체크' },
        { href: '/videos', label: '놀이영상' },
        { href: '/therapists', label: '치료사 연결' },
      ],
    },
    {
      title: '커뮤니티',
      links: [
        { href: '/board', label: '게시판' },
        { href: '/news', label: '뉴스' },
      ],
    },
    {
      title: '고객지원',
      links: [
        { href: '/support', label: '고객센터' },
        { href: '/faq', label: '자주묻는질문' },
        { href: '/privacy', label: '개인정보처리방침' },
        { href: '/terms', label: '이용약관' },
        ...(session?.user?.role === 'THERAPIST'
          ? [{ href: '/therapist-terms', label: '전문가 이용약관' }]
          : []
        ),
        { href: '/payment-policy', label: '결제 및 환불정책' },
      ],
    },
    {
      title: '회사소개',
      links: [
        { href: '/about', label: '회사소개' },
        { href: '/careers', label: '채용정보' },
        { href: '/contact', label: '연락처' },
      ],
    },
  ]

  return (
    <footer className="bg-brand-green text-white py-12 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* 메인 푸터 콘텐츠 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* 브랜드 섹션 */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <div className="h-10 w-32 bg-gradient-aipoten rounded-md flex items-center justify-center mb-4">
                <span className="text-white font-bold text-lg">AI POTEN</span>
              </div>
            </div>
            <p className="text-white/80 text-sm mb-4 max-w-md">
              영유아의 건강한 발달을 지원하는 종합 플랫폼입니다.
              AI 기반 발달 체크와 맞춤형 놀이영상으로 우리 아이의 성장을 도와드립니다.
            </p>
            <div className="text-sm text-white/70">
              <p>📧 support@aipoten.com</p>
              <p>📞 1588-1234</p>
              <p>🕒 평일 09:00~18:00</p>
            </div>
          </div>

          {/* 링크 섹션들 */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold text-lg mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/80 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* 구분선 */}
        <div className="border-t border-white/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* 저작권 */}
            <div className="text-sm text-white/60">
              <p>&copy; {currentYear} 아이포텐(AIPOTEN). All rights reserved.</p>
            </div>

            {/* 소셜 미디어 링크 (향후 추가) */}
            <div className="flex space-x-4">
              <Link
                href="#"
                className="text-white/60 hover:text-white transition-colors duration-200"
                aria-label="블로그"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-2v-4h-2v4H8v-7h2v1.5h2V10h2v7z"/>
                </svg>
              </Link>
              <Link
                href="#"
                className="text-white/60 hover:text-white transition-colors duration-200"
                aria-label="유튜브"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </Link>
              <Link
                href="#"
                className="text-white/60 hover:text-white transition-colors duration-200"
                aria-label="인스타그램"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </Link>
            </div>
          </div>

          {/* 추가 법적 정보 */}
          <div className="mt-6 text-xs text-white/50 text-center md:text-left">
            <p>
              사업자등록번호: 123-45-67890 | 대표: 김대표 | 주소: 서울시 강남구 테헤란로 123, 4층
            </p>
            <p className="mt-1">
              통신판매업신고번호: 2024-서울강남-1234 | 개인정보보호책임자: 홍길동
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer