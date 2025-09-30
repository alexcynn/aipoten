export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Navigation Header */}
      <nav className="bg-neutral-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-aipoten-navy">아이포텐</h1>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="#" className="text-aipoten-navy hover:text-aipoten-green px-3 py-2 rounded-md text-sm font-medium">홈</a>
                <a href="#" className="text-gray-600 hover:text-aipoten-green px-3 py-2 rounded-md text-sm font-medium">발달체크</a>
                <a href="#" className="text-gray-600 hover:text-aipoten-green px-3 py-2 rounded-md text-sm font-medium">놀이영성</a>
                <a href="#" className="text-gray-600 hover:text-aipoten-green px-3 py-2 rounded-md text-sm font-medium">추천영상</a>
                <a href="#" className="text-gray-600 hover:text-aipoten-green px-3 py-2 rounded-md text-sm font-medium">게시판</a>
                <button className="btn-aipoten-primary">로그인</button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-aipoten text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            우리 아이의 건강한 성장을 위한
            <br />
            <span className="text-aipoten-accent">아이포텐</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90">
            영유아 발달 체크부터 놀이 영성, 맞춤형 콘텐츠까지
            <br />
            아이의 잠재력을 키우는 모든 것
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-aipoten-green px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
              발달체크 시작하기
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-white hover:text-aipoten-green transition-colors">
              서비스 둘러보기
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-neutral-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-aipoten-navy mb-4">
              아이포텐의 핵심 서비스
            </h2>
            <p className="text-lg text-gray-600">
              전문적이고 체계적인 발달 지원 서비스를 제공합니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card-aipoten p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-aipoten-blue rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-aipoten-navy mb-3">발달체크</h3>
              <p className="text-gray-600">
                월령별 발달 단계를 체크하고 맞춤형 가이드를 받아보세요
              </p>
            </div>

            <div className="card-aipoten p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-aipoten-orange rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white">🎮</span>
              </div>
              <h3 className="text-xl font-semibold text-aipoten-navy mb-3">놀이영성</h3>
              <p className="text-gray-600">
                아이의 영성 발달을 도와주는 다양한 놀이 활동을 제안해드려요
              </p>
            </div>

            <div className="card-aipoten p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-aipoten-red rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white">📹</span>
              </div>
              <h3 className="text-xl font-semibold text-aipoten-navy mb-3">추천영상</h3>
              <p className="text-gray-600">
                아이의 발달 단계에 맞는 교육 콘텐츠를 추천해드립니다
              </p>
            </div>

            <div className="card-aipoten p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-aipoten-green rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white">👥</span>
              </div>
              <h3 className="text-xl font-semibold text-aipoten-navy mb-3">커뮤니티</h3>
              <p className="text-gray-600">
                같은 관심사를 가진 부모들과 정보를 나누고 소통해보세요
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-aipoten-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            지금 시작해보세요
          </h2>
          <p className="text-xl text-white/90 mb-8">
            우리 아이만을 위한 맞춤형 발달 지원 서비스
          </p>
          <button className="bg-white text-aipoten-green px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
            회원가입하고 시작하기
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-aipoten-navy text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">아이포텐</h3>
              <p className="text-gray-300">
                영유아의 건강한 성장을 지원하는 통합 플랫폼
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">서비스</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-aipoten-accent">발달체크</a></li>
                <li><a href="#" className="hover:text-aipoten-accent">놀이영성</a></li>
                <li><a href="#" className="hover:text-aipoten-accent">추천영상</a></li>
                <li><a href="#" className="hover:text-aipoten-accent">커뮤니티</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">지원</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-aipoten-accent">도움말</a></li>
                <li><a href="#" className="hover:text-aipoten-accent">고객지원</a></li>
                <li><a href="#" className="hover:text-aipoten-accent">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">연락처</h4>
              <p className="text-gray-300">
                이메일: support@aipoten.com
                <br />
                전화: 1588-0000
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 아이포텐. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}