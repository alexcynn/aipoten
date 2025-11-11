import React from 'react'
import Image from 'next/image'

const Logo: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <Image
      src="/images/logo.png"
      alt="AIPOTEN 아이포텐"
      width={240}
      height={32}
      priority
      className={className}
    />
  )
}

export default Logo
