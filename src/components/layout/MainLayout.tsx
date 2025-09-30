import React from 'react'
import Header from './Header'
import Footer from './Footer'

interface MainLayoutProps {
  children: React.ReactNode
  headerVariant?: 'default' | 'brand'
  className?: string
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  headerVariant = 'default',
  className = '',
}) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header variant={headerVariant} />
      <main className={`flex-1 ${className}`}>
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout