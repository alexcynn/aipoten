'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface SessionData {
  id: string
  sessionNumber: number
  scheduledAt: string
  status: string
  therapistNote: string | null
  booking: {
    id: string
    sessionType: string
    child: {
      id: string
      name: string
      birthDate: string
    }
    therapist: {
      specialties: string
      user: {
        name: string
      }
    }
  }
}

const THERAPY_TYPE_LABELS: Record<string, string> = {
  SPEECH_THERAPY: '언어치료',
  SENSORY_INTEGRATION: '감각통합',
  PLAY_THERAPY: '놀이치료',
  ART_THERAPY: '미술치료',
  MUSIC_THERAPY: '음악치료',
  OCCUPATIONAL_THERAPY: '작업치료',
  COGNITIVE_THERAPY: '인지치료',
  BEHAVIORAL_THERAPY: '행동치료',
}

export default function TherapistSessionReportPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const params = useParams()
  const sessionId = params.id as string

  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  // 폼 데이터
  const [formData, setFormData] = useState({
    sessionType: '',
    sessionGoal: '',
    observation: '',
    activities: '',
    materials: '',
    strengths: '',
    concerns: '',
    homeCoaching: '',
    nextPlan: '',
  })

  // AI 생성된 상담일지
  const [generatedReport, setGeneratedReport] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    if (authStatus === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    if (session.user?.role !== 'THERAPIST') {
      router.push('/dashboard')
      return
    }

    fetchSessionData()
  }, [session, authStatus, router, sessionId])

  const fetchSessionData = async () => {
    try {
      const response = await fetch(`/api/therapy-sessions/${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        setSessionData(data.session)

        // 기존 치료사 노트가 있으면 표시
        if (data.session.therapistNote) {
          setGeneratedReport(data.session.therapistNote)
          setShowPreview(true)
        }

        // 세션 유형 기본값 설정
        if (data.session.booking.therapist.specialties) {
          try {
            const specialties = JSON.parse(data.session.booking.therapist.specialties)
            if (specialties.length > 0) {
              setFormData(prev => ({ ...prev, sessionType: specialties[0] }))
            }
          } catch (e) {
            console.error('specialties 파싱 오류:', e)
          }
        }
      } else {
        alert('세션 정보를 가져올 수 없습니다.')
        router.push('/therapist/dashboard')
      }
    } catch (error) {
      console.error('세션 조회 오류:', error)
      alert('세션 정보를 가져오는 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateReport = async () => {
    // 필수 항목 검증
    if (!formData.sessionGoal.trim() || !formData.observation.trim() || !formData.activities.trim()) {
      alert('세션 목표, 아동 상태/관찰, 오늘 활동은 필수 입력 항목입니다.')
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch('/api/therapy-sessions/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          childName: sessionData?.booking.child.name,
          sessionType: formData.sessionType,
          sessionNumber: sessionData?.sessionNumber,
          ...formData,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setGeneratedReport(data.report)
        setShowPreview(true)
      } else {
        const data = await response.json()
        alert(data.error || 'AI 상담일지 생성에 실패했습니다.')
      }
    } catch (error) {
      console.error('AI 생성 오류:', error)
      alert('AI 상담일지 생성 중 오류가 발생했습니다.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = async () => {
    if (!generatedReport.trim()) {
      alert('상담일지 내용이 없습니다. AI 생성을 먼저 해주세요.')
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch(`/api/therapy-sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          therapistNote: generatedReport,
          status: 'COMPLETED',
          completedAt: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        alert('상담일지가 저장되었습니다.')
        router.push('/therapist/dashboard')
      } else {
        const data = await response.json()
        alert(data.error || '상담일지 저장에 실패했습니다.')
      }
    } catch (error) {
      console.error('저장 오류:', error)
      alert('상담일지 저장 중 오류가 발생했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  if (authStatus === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-neutral-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aipoten-green mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!session || !sessionData) {
    return null
  }

  return (
    <div className="min-h-screen bg-neutral-light">
      <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-6">
          <Link href="/therapist/dashboard" className="text-aipoten-green hover:text-aipoten-navy mb-2 inline-block">
            ← 대시보드로 돌아가기
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">상담일지 작성</h1>
          <p className="text-gray-600 mt-1">
            {sessionData.booking.child.name} • {sessionData.sessionNumber}회차 • {' '}
            {new Date(sessionData.scheduledAt).toLocaleDateString('ko-KR')}
          </p>
        </div>

        {/* 상담일지 작성 폼 */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📋 상담일지 작성</h2>

          <div className="space-y-6">
            {/* 이름 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이름 선택
              </label>
              <input
                type="text"
                value={sessionData.booking.child.name}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>

            {/* 세션 유형 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                세션 유형
              </label>
              <select
                value={formData.sessionType}
                onChange={(e) => setFormData({ ...formData, sessionType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aipoten-green"
              >
                <option value="">선택하세요</option>
                {Object.entries(THERAPY_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* 세션 목표 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                세션 목표 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.sessionGoal}
                onChange={(e) => setFormData({ ...formData, sessionGoal: e.target.value })}
                placeholder="예: 2어 조합 자발산출 유도"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aipoten-green"
              />
            </div>

            {/* 아동 상태/관찰 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                아동 상태/관찰 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.observation}
                onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
                placeholder="예: 기초적인 2어 조합 보임, 자시 일부 이행 민감"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aipoten-green"
              />
            </div>

            {/* 오늘 활동 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                오늘 활동 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.activities}
                onChange={(e) => setFormData({ ...formData, activities: e.target.value })}
                placeholder="예: 그림책 명칭 말하기, 소리모방 놀이, 역할놀이"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aipoten-green"
              />
            </div>

            {/* 사용 교구/자료 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                사용 교구/자료
              </label>
              <input
                type="text"
                value={formData.materials}
                onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                placeholder="예: 동물 피규어, 의성어 카드, 스티커"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aipoten-green"
              />
            </div>

            {/* 강점 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                강점
              </label>
              <input
                type="text"
                value={formData.strengths}
                onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                placeholder="예: 모방 의지, 관심 집중, 방송하기"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aipoten-green"
              />
            </div>

            {/* 아이점 (주의사항) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                아이점 (주의사항)
              </label>
              <input
                type="text"
                value={formData.concerns}
                onChange={(e) => setFormData({ ...formData, concerns: e.target.value })}
                placeholder="예: 전환 어려움, 산만함, 낯가림"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aipoten-green"
              />
            </div>

            {/* 가정 코칭 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                가정 코칭
              </label>
              <textarea
                value={formData.homeCoaching}
                onChange={(e) => setFormData({ ...formData, homeCoaching: e.target.value })}
                placeholder="예: 하루 10분 그림책 읽기, 선택지 제시하기, 역할놀이 해보기"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aipoten-green"
              />
            </div>

            {/* 다음 세션 계획 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                다음 세션 계획
              </label>
              <textarea
                value={formData.nextPlan}
                onChange={(e) => setFormData({ ...formData, nextPlan: e.target.value })}
                placeholder="예: 2어 조합 산출 확장, 일상생활 표현 연습"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aipoten-green"
              />
            </div>
          </div>

          {/* AI 생성 버튼 */}
          <div className="mt-6">
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="w-full px-6 py-3 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: isGenerating ? '#6B7280' : '#386646',
                color: '#FFFFFF'
              }}
            >
              {isGenerating ? '✨ AI로 부모용 상담일지 생성 중...' : '✨ AI로 부모용 상담일지 생성'}
            </button>
          </div>
        </div>

        {/* AI 생성 결과 미리보기 */}
        {showPreview && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">📄 부모님께 전달될 상담일지</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                닫기
              </button>
            </div>

            {/* 수정 가능한 텍스트 영역 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                내용 수정
              </label>
              <textarea
                value={generatedReport}
                onChange={(e) => setGeneratedReport(e.target.value)}
                rows={20}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aipoten-green font-mono text-sm"
              />
            </div>

            {/* 마크다운 미리보기 */}
            <div className="prose max-w-none bg-gray-50 p-6 rounded-md">
              <div dangerouslySetInnerHTML={{ __html: generatedReport.replace(/\n/g, '<br>') }} />
            </div>
          </div>
        )}

        {/* 저장 버튼 */}
        {showPreview && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex gap-4">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 px-6 py-3 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: isSaving ? '#6B7280' : '#386646',
                  color: '#FFFFFF'
                }}
              >
                {isSaving ? '저장 중...' : '상담일지 저장'}
              </button>
              <Link
                href="/therapist/dashboard"
                className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                취소
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
