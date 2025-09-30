'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  variant?: 'default' | 'brand'
  className?: string
}

const Header: React.FC<HeaderProps> = ({
  variant = 'default',
  className = ''
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const headerStyles = {
    default: 'bg-neutral-white text-brand-navy border-neutral-light',
    brand: 'bg-brand-green text-white border-brand-green',
  }

  const linkStyles = {
    default: 'text-brand-navy hover:text-brand-accent',
    brand: 'text-white hover:text-brand-accent',
  }

  const mobileButtonStyles = {
    default: 'text-brand-navy hover:bg-neutral-light',
    brand: 'text-white hover:bg-brand-green/80',
  }

  const navItems = [
    { href: '/', label: '홈' },
    { href: '/board', label: '게시판' },
    { href: '/news', label: '뉴스' },
    { href: '/assessment', label: '발달체크' },
    { href: '/videos', label: '놀이영상' },
    { href: '/therapists', label: '치료사' },
  ]

  return (
    <header
      className={`
        ${headerStyles[variant]}
        sticky top-0 z-50 w-full border-b shadow-sm
        ${className}
      `}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 로고 섹션 */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center">
              <div className="h-10 w-32 bg-gradient-aipoten rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-lg">AI POTEN</span>
              </div>
            </Link>
          </div>

          {/* 데스크탑 네비게이션 */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  font-medium transition-colors duration-200
                  ${linkStyles[variant]}
                `}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* 사용자 액션 버튼 (데스크탑) */}
          <div className="hidden lg:flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              로그인
            </Button>
            <Button variant="default" size="sm">
              회원가입
            </Button>
          </div>

          {/* 모바일 메뉴 버튼 */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={mobileButtonStyles[variant]}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {isMobileMenuOpen && (
        <div className={`lg:hidden border-t ${headerStyles[variant]}`}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200
                  ${linkStyles[variant]}
                  ${variant === 'default' ? 'hover:bg-neutral-light' : 'hover:bg-brand-green/80'}
                `}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="border-t border-neutral-light pt-3 mt-3 space-y-2">
              <Button variant="ghost" size="sm" className="w-full justify-start">
                로그인
              </Button>
              <Button variant="default" size="sm" className="w-full">
                회원가입
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header