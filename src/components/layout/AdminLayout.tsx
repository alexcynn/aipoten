'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Header from '@/components/layout/Header'
import {
  LayoutDashboard,
  Users,
  UserCog,
  BarChart3,
  Calendar,
  Menu,
  X,
  LogOut,
  ChevronLeft,
  Settings,
  MessageSquare,
  Home,
  CreditCard,
  BookOpen,
  HelpCircle
} from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
  title?: string
}

interface MenuItem {
  href: string
  label: string
  icon: React.ReactNode
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null)

  const menuItems: MenuItem[] = [
    { href: '/admin/dashboard', label: '대시보드', icon: <LayoutDashboard size={20} /> },
    { href: '/admin/users', label: '부모 관리', icon: <Users size={20} /> },
    { href: '/admin/therapists', label: '치료사 관리', icon: <UserCog size={20} /> },
    { href: '/admin/assessments', label: '발달체크 현황', icon: <BarChart3 size={20} /> },
    { href: '/admin/consultations', label: '언어 컨설팅', icon: <MessageSquare size={20} /> },
    { href: '/admin/therapies', label: '홈티 관리', icon: <Home size={20} /> },
    { href: '/admin/payments', label: '결제 관리', icon: <CreditCard size={20} /> },
    { href: '/admin/refunds', label: '환불 요청', icon: <Calendar size={20} /> },
    { href: '/admin/inquiries', label: '1:1 문의 관리', icon: <HelpCircle size={20} /> },
    { href: '/admin/knowledge-base', label: 'RAG 지식 관리', icon: <BookOpen size={20} /> },
    { href: '/admin/settings', label: '시스템 설정', icon: <Settings size={20} /> },
  ]

  const isActive = (href: string) => {
    if (href === '/admin/dashboard') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  const handleSignOut = async () => {
    // 현재 도메인을 기반으로 리디렉션 URL 생성
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    await signOut({ callbackUrl: `${baseUrl}/` })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Desktop Sidebar */}
      <aside
        className={`fixed top-16 left-0 z-40 transition-all duration-300 hidden lg:block ${
          isSidebarOpen ? 'w-64' : 'w-20'
        }`}
        style={{ backgroundColor: '#2d4a3a', height: 'calc(100vh - 4rem)' }}
      >
        <div className="h-full flex flex-col">
          {/* Logo & Toggle */}
          <div className="p-4 flex items-center justify-between border-b border-white border-opacity-10">
            {isSidebarOpen ? (
              <>
                <Link href="/admin/dashboard" className="flex items-center">
                  <span className="text-white text-xl font-bold">AI Poten</span>
                </Link>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="text-white hover:bg-white hover:bg-opacity-10 p-2 rounded-lg transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="text-white hover:bg-white hover:bg-opacity-10 p-2 rounded-lg transition-colors w-full"
              >
                <Menu size={20} className="mx-auto" />
              </button>
            )}
          </div>

          {/* Menu Items */}
          <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onMouseEnter={() => setHoveredMenu(item.href)}
                onMouseLeave={() => setHoveredMenu(null)}
                className={`
                  flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 text-white
                  ${isActive(item.href) ? 'font-medium' : ''}
                  ${!isSidebarOpen && 'justify-center'}
                `}
                style={{
                  backgroundColor: isActive(item.href)
                    ? 'rgba(255, 255, 255, 0.2)'
                    : hoveredMenu === item.href
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'transparent'
                }}
                title={!isSidebarOpen ? item.label : undefined}
              >
                {item.icon}
                {isSidebarOpen && <span>{item.label}</span>}
              </Link>
            ))}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-white border-opacity-10">
            {isSidebarOpen ? (
              <div className="space-y-3">
                <div className="text-white text-sm">
                  <p className="font-medium">{session?.user?.name}</p>
                  <p className="text-white text-opacity-60 text-xs">{session?.user?.email}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-white text-opacity-80 hover:text-white text-sm w-full"
                >
                  <LogOut size={16} />
                  <span>로그아웃</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleSignOut}
                className="text-white hover:bg-white hover:bg-opacity-10 p-2 rounded-lg transition-colors w-full"
                title="로그아웃"
              >
                <LogOut size={20} className="mx-auto" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}
      >
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Sidebar */}
        <aside
          className="fixed top-0 left-0 w-64 h-screen"
          style={{ backgroundColor: '#2d4a3a' }}
        >
          <div className="h-full flex flex-col">
            {/* Logo & Close */}
            <div className="p-4 flex items-center justify-between border-b border-white border-opacity-10">
              <Link href="/admin/dashboard" className="flex items-center">
                <span className="text-white text-xl font-bold">AI Poten</span>
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white hover:bg-white hover:bg-opacity-10 p-2 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  onMouseEnter={() => setHoveredMenu(item.href)}
                  onMouseLeave={() => setHoveredMenu(null)}
                  className={`
                    flex items-center gap-3 px-3 py-3 rounded-lg transition-colors text-white
                    ${isActive(item.href) ? 'font-medium' : ''}
                  `}
                  style={{
                    backgroundColor: isActive(item.href)
                      ? 'rgba(255, 255, 255, 0.2)'
                      : hoveredMenu === item.href
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'transparent'
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* User Info */}
            <div className="p-4 border-t border-white border-opacity-10">
              <div className="space-y-3">
                <div className="text-white text-sm">
                  <p className="font-medium">{session?.user?.name}</p>
                  <p className="text-white text-opacity-60 text-xs">{session?.user?.email}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-white text-opacity-80 hover:text-white text-sm w-full"
                >
                  <LogOut size={16} />
                  <span>로그아웃</span>
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 pt-16 ${
          isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
        }`}
      >
        {/* Page Title Bar */}
        {title && (
          <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
            <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden text-gray-600 hover:text-gray-900"
              >
                <Menu size={24} />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
