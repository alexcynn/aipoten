'use client'

import React, { useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'

interface HeaderProps {
  variant?: 'default' | 'brand'
  className?: string
}

const Header: React.FC<HeaderProps> = ({
  variant = 'default',
  className = ''
}) => {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isGuideMenuOpen, setIsGuideMenuOpen] = useState(false)
  const guideMenuTimerRef = useRef<NodeJS.Timeout | null>(null)

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

  // 이용안내 서브메뉴
  const guideSubItems = [
    { href: '/boards/notice', label: '공지사항' },
    { href: '/boards/parent-guide', label: '부모 이용안내' },
    { href: '/boards/therapist-guide', label: '전문가 이용안내' },
    { href: '/boards/faq', label: '자주하는 질문' },
  ]

  // 로그인하지 않은 경우의 메뉴
  const guestNavItems = [
    { href: '/', label: '홈' },
    { href: '/assessments', label: '발달체크' },
    { href: '/videos', label: '놀이영상' },
    { href: '/boards/community', label: '육아소통' },
  ]

  // 부모 메뉴
  const parentNavItems = [
    { href: '/parent/dashboard', label: '대시보드' },
    { href: '/videos', label: '놀이영상' },
    { href: '/boards/community', label: '육아소통' },
  ]

  // 치료사 메뉴
  const therapistNavItems = [
    { href: '/therapist/dashboard', label: '대시보드' },
    { href: '/videos', label: '놀이영상' },
    { href: '/boards/community', label: '육아소통' },
  ]

  // 관리자 메뉴
  const adminNavItems = [
    { href: '/admin/dashboard', label: '대시보드' },
    { href: '/videos', label: '놀이영상' },
    { href: '/boards/community', label: '육아소통' },
  ]

  // 역할에 따른 메뉴 선택
  const getNavItems = () => {
    if (!session?.user) return guestNavItems

    switch (session.user.role) {
      case 'PARENT':
        return parentNavItems
      case 'THERAPIST':
        return therapistNavItems
      case 'ADMIN':
        return adminNavItems
      default:
        return guestNavItems
    }
  }

  const navItems = getNavItems()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const handleSignOut = async () => {
    // 현재 도메인을 기반으로 리디렉션 URL 생성
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    await signOut({ callbackUrl: `${baseUrl}/` })
  }

  // 드롭다운 메뉴 핸들러
  const handleGuideMenuEnter = () => {
    if (guideMenuTimerRef.current) {
      clearTimeout(guideMenuTimerRef.current)
    }
    setIsGuideMenuOpen(true)
  }

  const handleGuideMenuLeave = () => {
    guideMenuTimerRef.current = setTimeout(() => {
      setIsGuideMenuOpen(false)
    }, 200)
  }

  // 로고 링크 URL
  const getLogoHref = () => {
    if (!session?.user) return '/'
    switch (session.user.role) {
      case 'PARENT':
        return '/parent/dashboard'
      case 'THERAPIST':
        return '/therapist/dashboard'
      case 'ADMIN':
        return '/admin/dashboard'
      default:
        return '/'
    }
  }

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
            <Link href={getLogoHref()} className="flex items-center">
              <Image
                src="/images/logo-text.png"
                alt="AI Poten"
                width={160}
                height={40}
                className="h-10 w-auto"
                priority
              />
            </Link>
          </div>

          {/* 데스크탑 네비게이션 */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  font-medium transition-colors duration-200 px-3 py-2 rounded-md
                  ${isActive(item.href)
                    ? 'text-aipoten-green bg-aipoten-accent bg-opacity-10'
                    : linkStyles[variant]
                  }
                `}
              >
                {item.label}
              </Link>
            ))}

            {/* 이용안내 드롭다운 */}
            <div
              className="relative"
              onMouseEnter={handleGuideMenuEnter}
              onMouseLeave={handleGuideMenuLeave}
            >
              <button
                className={`
                  font-medium transition-colors duration-200 px-3 py-2 rounded-md
                  ${linkStyles[variant]}
                `}
              >
                이용안내
              </button>

              {isGuideMenuOpen && (
                <div className="absolute top-full left-0 mt-0 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                  {guideSubItems.map((subItem) => (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* 사용자 액션 버튼 (데스크탑) */}
          <div className="hidden lg:flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
            ) : session?.user ? (
              <>
                <span className="text-sm text-gray-700">
                  {session.user.name}님
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                >
                  로그아웃
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    로그인
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="default" size="sm">
                    회원가입
                  </Button>
                </Link>
              </>
            )}
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
                  ${isActive(item.href)
                    ? 'text-aipoten-green bg-aipoten-accent bg-opacity-10'
                    : linkStyles[variant]
                  }
                  ${variant === 'default' ? 'hover:bg-neutral-light' : 'hover:bg-brand-green/80'}
                `}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            {/* 모바일 이용안내 */}
            <div className="mt-2">
              <div className={`px-3 py-2 text-base font-medium ${linkStyles[variant]}`}>
                이용안내
              </div>
              <div className="pl-4 space-y-1">
                {guideSubItems.map((subItem) => (
                  <Link
                    key={subItem.href}
                    href={subItem.href}
                    className={`
                      block px-3 py-2 rounded-md text-sm transition-colors duration-200
                      ${isActive(subItem.href)
                        ? 'text-aipoten-green bg-aipoten-accent bg-opacity-10'
                        : 'text-gray-600 hover:text-brand-navy hover:bg-neutral-light'
                      }
                    `}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {subItem.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-t border-neutral-light pt-3 mt-3 space-y-2">
              {session?.user ? (
                <>
                  <div className="px-3 py-2 text-sm text-gray-700">
                    {session.user.name}님
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={handleSignOut}
                  >
                    로그아웃
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      로그인
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="default" size="sm" className="w-full">
                      회원가입
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
