'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, MessageSquare, Newspaper, FileText, Play, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const MobileNav: React.FC = () => {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/',
      label: '홈',
      icon: Home,
    },
    {
      href: '/board',
      label: '게시판',
      icon: MessageSquare,
    },
    {
      href: '/news',
      label: '뉴스',
      icon: Newspaper,
    },
    {
      href: '/assessment',
      label: '발달체크',
      icon: FileText,
    },
    {
      href: '/videos',
      label: '놀이영상',
      icon: Play,
    },
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-light">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center space-y-1 text-xs transition-colors duration-200',
                isActive
                  ? 'text-brand-accent bg-brand-accent/10'
                  : 'text-brand-navy/60 hover:text-brand-accent'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default MobileNav