'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession } from 'next-auth/react'

const Footer: React.FC = () => {
  const { data: session } = useSession()

  return (
    <footer className="bg-[#F9F9F9] py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="mb-4 md:mb-6">
          <Image
            src="/images/footer-logo.png"
            alt="AIPOTEN 아이포텐"
            width={150}
            height={24}
            className="opacity-60 md:w-[200px] md:h-[32px]"
          />
        </div>

        {/* Links */}
        <div className="mb-4 md:mb-6">
          <div className="flex flex-wrap gap-2 md:gap-3 text-xs sm:text-sm text-stone-900">
            <Link href="/terms" className="hover:underline">이용약관</Link>
            <span className="text-gray-400">·</span>
            {session?.user?.role === 'THERAPIST' && (
              <>
                <Link href="/therapist-terms" className="hover:underline">전문가 이용약관</Link>
                <span className="text-gray-400">·</span>
              </>
            )}
            <Link href="/payment-policy" className="hover:underline">결제 및 환불정책</Link>
            <span className="text-gray-400">·</span>
            <Link href="/privacy" className="font-semibold hover:underline">개인정보 처리방침</Link>
          </div>
        </div>

        {/* Company Info */}
        <div className="text-[10px] sm:text-xs text-[#999999] space-y-1 mb-4 md:mb-6">
          <p>사업자명: 아이포텐 (AIPOTEN) | 대표: 김은홍 | 사업자 등록번호: 262-08-03275</p>
          <p>주소: 경기도 성남시 수정구 창업로 43, 1층 196호 | 이메일: contact@aipoten.co.kr</p>
        </div>

        {/* Copyright */}
        <div className="text-[10px] sm:text-xs text-[#999999]">
          <p>© AIPOTEN. All rights reserved</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
