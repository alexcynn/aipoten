'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Copy, Sparkles } from 'lucide-react'

export default function JournalTestPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Form fields
  const [childName, setChildName] = useState('김아이 (30개월)')
  const [sessionType, setSessionType] = useState('언어')
  const [sessionGoal, setSessionGoal] = useState('2의 조합 자발산출 유도')
  const [childObservation, setChildObservation] = useState('기초적인 2어 조합 보임. 자시 일부 이행')
  const [todayActivities, setTodayActivities] = useState('예: 그림책 명칭 말하기, 소리모방 놀이, 역할놀이')
  const [materials, setMaterials] = useState('예: 동물 피규어, 의성이 카드, 스티커')
  const [strengths, setStrengths] = useState('예: 모방 의지, 관심 집중, 반응성')
  const [concerns, setConcerns] = useState('예: 전환 어려움, 산만함, 낯가림')
  const [homework, setHomework] = useState('예: 하루 10분 그림책 읽기, 선택지 제시로 말 이끌어내기')
  const [nextPlan, setNextPlan] = useState('예: 2어 조합 산출 확대, 상징놀이 확장')

  // Generated journal
  const [generatedJournal, setGeneratedJournal] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showResult, setShowResult] = useState(false)

  // Prompt management
  const [showPrompt, setShowPrompt] = useState(false)
  const [customPrompt, setCustomPrompt] = useState('')
  const [isPromptEdited, setIsPromptEdited] = useState(false)
  const [showGuide, setShowGuide] = useState(false)

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#F5EFE7] font-pretendard flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6A00] mx-auto"></div>
          <p className="mt-4 text-stone-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'THERAPIST') {
    router.push('/login')
    return null
  }

  // 프롬프트 템플릿 생성 함수 (placeholder 사용)
  const createSessionReportPrompt = () => {
    return `당신은 아동 발달 치료 전문가입니다. 치료사가 작성한 세션 기록을 바탕으로 부모님께서 이해하기 쉽도록 상세하고 따뜻한 톤의 상담일지를 작성해주세요.

## 세션 정보
- 자녀명: {{childName}}
- 세션 유형: {{sessionType}}
- 회차: 1회차
- 세션 목표: {{sessionGoal}}

## 아동 상태 및 관찰
{{childObservation}}

## 오늘 진행한 활동
{{todayActivities}}

## 사용한 교구/자료
{{materials}}

## 관찰된 강점
{{strengths}}

## 주의가 필요한 부분
{{concerns}}

## 가정에서 해보면 좋을 활동
{{homework}}

## 다음 세션 계획
{{nextPlan}}

## 요청사항
위 정보를 바탕으로 부모님께 전달할 상담일지를 작성해주세요. 다음 구조로 작성해주세요:

1. **오늘 세션 개요**
   - 세션의 전반적인 목표와 진행 내용을 2-3문장으로 요약

2. **아이의 상태 및 관찰 내용**
   - 세션 중 관찰된 아이의 상태, 기분, 참여도 등을 자세히 설명
   - 긍정적인 부분과 주의가 필요한 부분을 균형있게 설명

3. **진행한 활동과 아이의 반응**
   - 어떤 활동을 했는지, 아이가 어떻게 반응했는지 구체적으로 설명
   - 사용한 교구나 자료가 있다면 함께 언급

4. **눈에 띄는 강점과 발전**
   - 아이가 잘하는 부분, 이전보다 나아진 부분을 구체적으로 설명
   - 부모님이 자녀의 성장을 느낄 수 있도록 격려하는 톤

5. **주의 깊게 살펴볼 부분**
   - 발달이나 행동에서 주의가 필요한 부분이 있다면 부드럽게 설명
   - 걱정스럽게 들리지 않도록 발전 가능성과 함께 언급

6. **가정에서의 활동 제안**
   - 일상생활에서 부모님과 함께 할 수 있는 활동 제안
   - 구체적이고 실천 가능한 팁 제공

7. **다음 세션 안내**
   - 다음 세션에서 집중할 내용이나 목표 안내
   - 연속성 있는 치료 계획 공유

**작성 시 유의사항:**
- 전문 용어는 가능한 쉬운 말로 풀어서 설명
- 따뜻하고 격려하는 톤 유지
- 긍정적인 면과 개선이 필요한 면을 균형있게 전달
- 구체적인 예시를 들어 이해하기 쉽게 작성
- 마크다운 형식으로 작성

부모님이 읽으시면서 자녀의 발달과 치료 과정을 명확히 이해하고, 가정에서도 도움을 줄 수 있도록 작성해주세요.`
  }

  // 프롬프트 미리보기 업데이트
  const updatePromptPreview = () => {
    if (!isPromptEdited) {
      setCustomPrompt(createSessionReportPrompt())
    }
  }

  // 기본 프롬프트로 복원
  const resetToDefaultPrompt = () => {
    setCustomPrompt(createSessionReportPrompt())
    setIsPromptEdited(false)
  }

  // Placeholder를 실제 값으로 치환하는 함수
  const replacePlaceholders = (template: string) => {
    const sessionTypeNames: Record<string, string> = {
      '언어': '언어치료',
      '놀이': '놀이치료',
      '감각통합': '감각통합치료',
      '인지': '인지치료',
    }

    const sessionTypeName = sessionTypeNames[sessionType] || sessionType

    return template
      .replace(/\{\{childName\}\}/g, childName || '')
      .replace(/\{\{sessionType\}\}/g, sessionTypeName)
      .replace(/\{\{sessionGoal\}\}/g, sessionGoal || '')
      .replace(/\{\{childObservation\}\}/g, childObservation || '')
      .replace(/\{\{todayActivities\}\}/g, todayActivities || '')
      .replace(/\{\{materials\}\}/g, materials || '')
      .replace(/\{\{strengths\}\}/g, strengths || '')
      .replace(/\{\{concerns\}\}/g, concerns || '')
      .replace(/\{\{homework\}\}/g, homework || '')
      .replace(/\{\{nextPlan\}\}/g, nextPlan || '')
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    setShowResult(false)

    try {
      const requestBody: any = {
        childName,
        sessionType,
        sessionGoal,
        childObservation,
        todayActivities,
        materials,
        strengths,
        concerns,
        homework,
        nextPlan,
      }

      // 커스텀 프롬프트가 있으면 placeholder를 치환하여 추가
      if (isPromptEdited && customPrompt) {
        requestBody.customPrompt = replacePlaceholders(customPrompt)
      }

      const response = await fetch('/api/ai/generate-journal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error('상담일지 생성 실패')
      }

      const data = await response.json()
      setGeneratedJournal(data.journal)
      setShowResult(true)
    } catch (error) {
      console.error('상담일지 생성 오류:', error)
      alert('상담일지 생성 중 오류가 발생했습니다.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedJournal)
    alert('복사되었습니다!')
  }

  return (
    <div className="min-h-screen bg-[#F5EFE7] font-pretendard py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h1 className="text-2xl font-bold text-stone-900 mb-2 flex items-center">
            <Sparkles className="mr-2 text-[#FF6A00]" />
            상담일지 작성
          </h1>
          <p className="text-sm text-stone-600 mb-6">AI를 활용한 테스트 페이지</p>

          {/* 아동 선택 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-stone-700 mb-2">
              아동 선택
            </label>
            <select
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
            >
              <option>김아이 (30개월)</option>
            </select>
          </div>

          {/* 세션 유형 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-stone-700 mb-2">
              세션 유형
            </label>
            <select
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
            >
              <option>언어</option>
              <option>놀이</option>
              <option>감각통합</option>
              <option>인지</option>
            </select>
          </div>

          {/* 세션 목표 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-stone-700 mb-2">
              세션 목표
            </label>
            <textarea
              value={sessionGoal}
              onChange={(e) => setSessionGoal(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
            />
          </div>

          {/* 아동 상태/관찰 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-stone-700 mb-2">
              아동 상태/관찰
            </label>
            <textarea
              value={childObservation}
              onChange={(e) => setChildObservation(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
            />
          </div>

          {/* 오늘 활동 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-stone-700 mb-2">
              오늘 활동
            </label>
            <textarea
              value={todayActivities}
              onChange={(e) => setTodayActivities(e.target.value)}
              rows={4}
              placeholder="예: 그림책 명칭 말하기, 소리모방 놀이, 역할놀이"
              className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
            />
          </div>

          {/* 사용 교구/자료 & 강점 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                사용 교구/자료
              </label>
              <input
                type="text"
                value={materials}
                onChange={(e) => setMaterials(e.target.value)}
                placeholder="예: 동물 피규어, 의성이 카드, 스티커"
                className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                강점
              </label>
              <input
                type="text"
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                placeholder="예: 모방 의지, 관심 집중, 반응성"
                className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
              />
            </div>
          </div>

          {/* 아이듬 (우려사항) */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-stone-700 mb-2">
              아이듬
            </label>
            <input
              type="text"
              value={concerns}
              onChange={(e) => setConcerns(e.target.value)}
              placeholder="예: 전환 어려움, 산만함, 낯가림"
              className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
            />
          </div>

          {/* 가정 공식 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-stone-700 mb-2">
              가정 공식
            </label>
            <textarea
              value={homework}
              onChange={(e) => setHomework(e.target.value)}
              rows={4}
              placeholder="예: 하루 10분 그림책 읽기, 선택지 제시로 말 이끌어내기"
              className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
            />
          </div>

          {/* 다음 세션 계획 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-stone-700 mb-2">
              다음 세션 계획
            </label>
            <textarea
              value={nextPlan}
              onChange={(e) => setNextPlan(e.target.value)}
              rows={4}
              placeholder="예: 2어 조합 산출 확대, 상징놀이 확장"
              className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
            />
          </div>

          {/* 프롬프트 관리 섹션 */}
          <div className="mb-4 border-t border-gray-200 pt-6">
            <button
              type="button"
              onClick={() => {
                setShowPrompt(!showPrompt)
                if (!showPrompt) {
                  updatePromptPreview()
                }
              }}
              style={{
                width: '100%',
                backgroundColor: '#F3F4F6',
                color: '#374151',
                padding: '12px',
                borderRadius: '6px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: '1px solid #D1D5DB',
              }}
            >
              <span>🔧 프롬프트 보기/수정</span>
              <span>{showPrompt ? '▲' : '▼'}</span>
            </button>

            {showPrompt && (
              <div className="mt-4 space-y-4">
                {/* 프롬프트 작성 가이드 */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setShowGuide(!showGuide)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left"
                  >
                    <span className="font-medium text-blue-900">📖 프롬프트 작성 가이드</span>
                    <span className="text-blue-600">{showGuide ? '▲' : '▼'}</span>
                  </button>

                  {showGuide && (
                    <div className="px-4 pb-4 text-sm text-blue-900 space-y-3">
                      <div>
                        <h4 className="font-semibold mb-1">✨ 효과적인 프롬프트 작성 팁</h4>
                        <ul className="list-disc ml-5 space-y-1">
                          <li><strong>역할 정의:</strong> AI의 역할을 명확히 지정하세요 (예: "당신은 아동 발달 전문가입니다")</li>
                          <li><strong>구체적 지시:</strong> 원하는 출력 형식과 구조를 명확히 설명하세요</li>
                          <li><strong>톤 조정:</strong> 따뜻한 톤, 전문적 톤 등 원하는 어조를 명시하세요</li>
                          <li><strong>예시 제공:</strong> 원하는 스타일의 예시를 포함하면 더 좋습니다</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-1">🔤 사용 가능한 변수</h4>
                        <p className="text-xs mb-2">프롬프트에서 아래 변수를 사용하면 입력한 값으로 자동 치환됩니다:</p>
                        <ul className="list-disc ml-5 space-y-1 text-xs">
                          <li><code>{`{{childName}}`}</code> - 아동 이름 (현재: {childName})</li>
                          <li><code>{`{{sessionType}}`}</code> - 세션 유형 (현재: {sessionType})</li>
                          <li><code>{`{{sessionGoal}}`}</code> - 세션 목표</li>
                          <li><code>{`{{childObservation}}`}</code> - 아동 상태 관찰</li>
                          <li><code>{`{{todayActivities}}`}</code> - 오늘 활동</li>
                          <li><code>{`{{materials}}`}</code> - 사용 교구</li>
                          <li><code>{`{{strengths}}`}</code> - 강점</li>
                          <li><code>{`{{concerns}}`}</code> - 우려사항</li>
                          <li><code>{`{{homework}}`}</code> - 가정 코칭</li>
                          <li><code>{`{{nextPlan}}`}</code> - 다음 계획</li>
                        </ul>
                        <p className="text-xs mt-2 text-blue-700">
                          💡 팁: 변수는 이중 중괄호 <code>{`{{변수명}}`}</code> 형식으로 사용하세요
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-1">⚡ 빠른 수정 예시</h4>
                        <ul className="list-disc ml-5 space-y-1">
                          <li><strong>더 간결하게:</strong> "2-3문장으로 요약" → "1문장으로 간단히"</li>
                          <li><strong>더 상세하게:</strong> "자세히 설명" → "구체적인 예시와 함께 상세히"</li>
                          <li><strong>톤 변경:</strong> "따뜻한 톤" → "전문적이고 객관적인 톤"</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                {/* 프롬프트 편집기 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-stone-700">
                      프롬프트 편집
                    </label>
                    <button
                      type="button"
                      onClick={resetToDefaultPrompt}
                      style={{
                        backgroundColor: '#EF4444',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      기본값으로 복원
                    </button>
                  </div>
                  <textarea
                    value={customPrompt || createSessionReportPrompt()}
                    onChange={(e) => {
                      setCustomPrompt(e.target.value)
                      setIsPromptEdited(true)
                    }}
                    rows={15}
                    className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] font-mono text-xs"
                    style={{ backgroundColor: '#FAFAFA' }}
                  />
                  <p className="mt-1 text-xs text-stone-500">
                    {isPromptEdited
                      ? '⚠️ 프롬프트가 수정되었습니다. 생성 시 {{변수}}가 실제 입력값으로 치환되어 전송됩니다.'
                      : '기본 프롬프트를 사용합니다. {{변수}}는 자동으로 입력값으로 치환됩니다.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 생성 버튼 */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            style={{
              width: '100%',
              backgroundColor: isGenerating ? '#9CA3AF' : '#FF6A00',
              color: 'white',
              padding: '12px',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              transition: 'background-color 0.3s',
            }}
            onMouseEnter={(e) => {
              if (!isGenerating) e.currentTarget.style.backgroundColor = '#E55F00'
            }}
            onMouseLeave={(e) => {
              if (!isGenerating) e.currentTarget.style.backgroundColor = '#FF6A00'
            }}
          >
            <Sparkles style={{ marginRight: '8px' }} size={20} />
            {isGenerating ? '생성 중...' : 'AI로 부모용 상담일지 생성'}
          </button>

          {/* 생성된 결과 */}
          {showResult && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-stone-900">
                  부모용 상담일지(자동 생성 미리보기)
                </h3>
                <button
                  onClick={handleCopy}
                  className="flex items-center text-sm text-[#FF6A00] hover:text-stone-900"
                >
                  <Copy size={16} className="mr-1" />
                  복사
                </button>
              </div>
              <div className="bg-white rounded p-4 whitespace-pre-wrap text-sm leading-relaxed">
                {generatedJournal}
              </div>
              <p className="text-xs text-stone-600 mt-3">
                * 실제 서비스에서는 LLM API를 호출하여 연령별문장체로만 자동생성됩니다.
                개별 첨부 시 정보가 반영하지 않습니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
