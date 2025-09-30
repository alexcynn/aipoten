import React from 'react';
import { colors } from '../colors';

interface HeaderProps {
  variant?: 'default' | 'brand';
  className?: string;
}

const Header: React.FC<HeaderProps> = ({
  variant = 'default',
  className = ''
}) => {
  const headerStyles = {
    default: 'header-default', // 옵션 1: 순백색 배경 (권장)
    brand: 'header-brand',     // 옵션 2: 브랜드 그린 배경
  };

  return (
    <header
      className={`
        ${headerStyles[variant]}
        sticky top-0 z-50 w-full border-b border-neutral-light shadow-sm
        ${className}
      `}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 로고 섹션 */}
          <div className="flex items-center space-x-4">
            <div className="logo-container">
              {/* 로고 이미지가 들어갈 자리 */}
              <div className="h-10 w-32 bg-gradient-aipoten rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-lg">AI POTEN</span>
              </div>
            </div>
          </div>

          {/* 네비게이션 메뉴 */}
          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="/assessment"
              className={`
                font-medium transition-colors duration-200
                ${variant === 'default'
                  ? 'text-aipoten-navy hover:text-aipoten-accent'
                  : 'text-white hover:text-accent-green'
                }
              `}
            >
              발달체크
            </a>
            <a
              href="/videos"
              className={`
                font-medium transition-colors duration-200
                ${variant === 'default'
                  ? 'text-aipoten-navy hover:text-aipoten-accent'
                  : 'text-white hover:text-accent-green'
                }
              `}
            >
              놀이영상
            </a>
            <a
              href="/therapists"
              className={`
                font-medium transition-colors duration-200
                ${variant === 'default'
                  ? 'text-aipoten-navy hover:text-aipoten-accent'
                  : 'text-white hover:text-accent-green'
                }
              `}
            >
              치료사 연결
            </a>
            <a
              href="/about"
              className={`
                font-medium transition-colors duration-200
                ${variant === 'default'
                  ? 'text-aipoten-navy hover:text-aipoten-accent'
                  : 'text-white hover:text-accent-green'
                }
              `}
            >
              서비스 소개
            </a>
          </nav>

          {/* 사용자 액션 버튼 */}
          <div className="flex items-center space-x-4">
            <button
              className={`
                px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200
                ${variant === 'default'
                  ? 'text-aipoten-navy hover:bg-neutral-light'
                  : 'text-white hover:bg-brand-green/80'
                }
              `}
            >
              로그인
            </button>
            <button className="btn-aipoten-primary">
              회원가입
            </button>
          </div>

          {/* 모바일 메뉴 버튼 */}
          <div className="md:hidden">
            <button
              className={`
                p-2 rounded-md transition-colors duration-200
                ${variant === 'default'
                  ? 'text-aipoten-navy hover:bg-neutral-light'
                  : 'text-white hover:bg-brand-green/80'
                }
              `}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 모바일 메뉴 (확장 시) */}
      <div className="md:hidden border-t border-neutral-light">
        <div className="px-2 pt-2 pb-3 space-y-1">
          <a
            href="/assessment"
            className={`
              block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200
              ${variant === 'default'
                ? 'text-aipoten-navy hover:bg-neutral-light'
                : 'text-white hover:bg-brand-green/80'
              }
            `}
          >
            발달체크
          </a>
          <a
            href="/videos"
            className={`
              block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200
              ${variant === 'default'
                ? 'text-aipoten-navy hover:bg-neutral-light'
                : 'text-white hover:bg-brand-green/80'
              }
            `}
          >
            놀이영상
          </a>
          <a
            href="/therapists"
            className={`
              block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200
              ${variant === 'default'
                ? 'text-aipoten-navy hover:bg-neutral-light'
                : 'text-white hover:bg-brand-green/80'
              }
            `}
          >
            치료사 연결
          </a>
          <a
            href="/about"
            className={`
              block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200
              ${variant === 'default'
                ? 'text-aipoten-navy hover:bg-neutral-light'
                : 'text-white hover:bg-brand-green/80'
              }
            `}
          >
            서비스 소개
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;