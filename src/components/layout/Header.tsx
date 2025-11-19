'use client'

import React, { useState, useRef } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Logo from './Logo'

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
    { href: '/language-consulting', label: '언어컨설팅' },
    { href: '/videos', label: '놀이영상' },
    { href: '/boards/community', label: '육아소통' },
  ]

  // 부모 메뉴
  const parentNavItems = [
    { href: '/parent/dashboard', label: '대시보드' },
    { href: '/language-consulting', label: '언어컨설팅' },
    { href: '/videos', label: '놀이영상' },
    { href: '/boards/community', label: '육아소통' },
  ]

  // 치료사 메뉴
  const therapistNavItems = [
    { href: '/therapist/dashboard', label: '대시보드' },
    { href: '/language-consulting', label: '언어컨설팅' },
    { href: '/videos', label: '놀이영상' },
    { href: '/boards/community', label: '육아소통' },
  ]

  // 관리자 메뉴
  const adminNavItems = [
    { href: '/admin/dashboard', label: '대시보드' },
    { href: '/language-consulting', label: '언어컨설팅' },
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

  // 로고 링크 URL - 항상 메인화면으로 이동
  const getLogoHref = () => {
    return '/'
  }

  return (
    <header
      className={`
        sticky top-0 z-50 w-full h-16 px-4 sm:px-6 lg:px-80
        bg-white/80 border-b border-gray-200 backdrop-blur-[5px]
        lg:min-w-[1280px]
        ${className}
      `}
    >
      <div className="flex items-center justify-between h-full">
        {/* 로고 섹션 */}
        <Link href={getLogoHref()} className="flex items-center">
          <Logo />
        </Link>

        {/* 우측 섹션: 네비게이션 + 버튼 */}
        <div className="hidden lg:flex items-center gap-20">
          {/* 데스크탑 네비게이션 */}
          <nav className="flex items-center gap-[30px]">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-stone-900 text-base font-medium font-pretendard hover:text-orange-500 transition-colors"
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
              <button className="text-stone-900 text-base font-medium font-pretendard hover:text-orange-500 transition-colors">
                이용안내
              </button>

              {isGuideMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-[10px] shadow-lg border border-gray-200 py-2 z-50">
                  {guideSubItems.map((subItem) => (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      className="block px-4 py-2 text-sm text-stone-700 hover:bg-[#FFE5E5] hover:text-[#FF6A00] transition-colors font-pretendard"
                    >
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* 사용자 액션 버튼 */}
          <div className="flex items-center gap-7">
            {status === 'loading' ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
            ) : session?.user ? (
              <>
                <span className="text-stone-900 text-base font-medium font-pretendard">
                  {session.user.name}님
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-stone-900 text-base font-medium font-pretendard hover:text-orange-500 transition-colors"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-stone-900 text-base font-medium font-pretendard hover:text-orange-500 transition-colors"
                >
                  로그인
                </Link>
                <Link href="/signup">
                  <div className="flex w-[90px] h-9 justify-center items-center gap-[10px] rounded-[10px] bg-[#FF6A00] hover:bg-orange-600 transition-colors">
                    <span className="text-neutral-50 text-base font-medium font-pretendard">
                      회원가입
                    </span>
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* 모바일 메뉴 버튼 */}
        <div className="lg:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-stone-900 hover:text-orange-500 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="px-4 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-3 py-2 rounded-[10px] text-base font-medium font-pretendard text-stone-900 hover:bg-[#FFE5E5] hover:text-[#FF6A00] transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            {/* 모바일 이용안내 */}
            <div className="mt-2">
              <div className="px-3 py-2 text-base font-medium font-pretendard text-stone-900">
                이용안내
              </div>
              <div className="pl-4 space-y-1">
                {guideSubItems.map((subItem) => (
                  <Link
                    key={subItem.href}
                    href={subItem.href}
                    className="block px-3 py-2 rounded-[10px] text-sm font-pretendard text-stone-600 hover:bg-[#FFE5E5] hover:text-[#FF6A00] transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {subItem.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-3 mt-3 space-y-2">
              {session?.user ? (
                <>
                  <div className="px-3 py-2 text-sm font-pretendard text-stone-900">
                    {session.user.name}님
                  </div>
                  <button
                    className="w-full text-left px-3 py-2 rounded-[10px] font-pretendard text-stone-900 hover:bg-[#FFE5E5] hover:text-[#FF6A00] transition-colors"
                    onClick={handleSignOut}
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block px-3 py-2 rounded-[10px] font-pretendard text-stone-900 hover:bg-[#FFE5E5] hover:text-[#FF6A00] transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    로그인
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3"
                  >
                    <div className="flex h-9 justify-center items-center gap-[10px] rounded-[10px] bg-[#FF6A00] hover:bg-[#E55F00] transition-colors shadow-lg">
                      <span className="text-neutral-50 text-base font-medium font-pretendard">
                        회원가입
                      </span>
                    </div>
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
