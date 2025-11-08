'use client'

import { useState } from 'react'
import { X, Sparkles } from 'lucide-react'

interface AIJournalModalProps {
  isOpen: boolean
  onClose: () => void
  onApply: (journal: string) => void
  childName?: string
  sessionType?: string
}

export default function AIJournalModal({
  isOpen,
  onClose,
  onApply,
  childName: initialChildName = '',
  sessionType: initialSessionType = '언어'
}: AIJournalModalProps) {
  // Form fields
  const [childName, setChildName] = useState(initialChildName)
  const [sessionType, setSessionType] = useState(initialSessionType)
  const [sessionGoal, setSessionGoal] = useState('')
  const [childObservation, setChildObservation] = useState('')
  const [todayActivities, setTodayActivities] = useState('')
  const [materials, setMaterials] = useState('')
  const [strengths, setStrengths] = useState('')
  const [concerns, setConcerns] = useState('')
  const [homework, setHomework] = useState('')
  const [nextPlan, setNextPlan] = useState('')

  // Generated journal
  const [generatedJournal, setGeneratedJournal] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showResult, setShowResult] = useState(false)

  if (!isOpen) return null

  const handleGenerate = async () => {
    setIsGenerating(true)
    setShowResult(false)

    try {
      const response = await fetch('/api/ai/generate-journal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          childName,
          sessionType,
          sessionGoal,
          childObservation,
          todayActivities,
          materials,
          strengths,
          concerns,
          homework,
          nextPlan
        })
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

  const handleApply = () => {
    if (generatedJournal) {
      onApply(generatedJournal)
      onClose()
    }
  }

  const handleClose = () => {
    if (generatedJournal && !confirm('작성 중인 내용이 있습니다. 닫으시겠습니까?')) {
      return
    }
    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: '16px'
      }}
      onClick={handleClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          maxWidth: '800px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            backgroundColor: 'white',
            borderBottom: '1px solid #E5E7EB',
            padding: '20px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 10
          }}
        >
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles style={{ width: '24px', height: '24px', color: '#10B981' }} />
            AI 상담일지 작성
          </h2>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X style={{ width: '24px', height: '24px', color: '#6B7280' }} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {!showResult ? (
            <>
              {/* Input Form */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  아동명
                </label>
                <input
                  type="text"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="예: 김아이"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#10B981'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#D1D5DB'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  세션 유형
                </label>
                <select
                  value={sessionType}
                  onChange={(e) => setSessionType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                >
                  <option>언어</option>
                  <option>놀이</option>
                  <option>감각통합</option>
                  <option>인지</option>
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  세션 목표
                </label>
                <textarea
                  value={sessionGoal}
                  onChange={(e) => setSessionGoal(e.target.value)}
                  placeholder="예: 2어 조합 자발산출 유도"
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#10B981'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#D1D5DB'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  아동 상태/관찰
                </label>
                <textarea
                  value={childObservation}
                  onChange={(e) => setChildObservation(e.target.value)}
                  placeholder="예: 기초적인 2어 조합 보임, 지시 일부 이행"
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#10B981'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#D1D5DB'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  오늘 활동
                </label>
                <textarea
                  value={todayActivities}
                  onChange={(e) => setTodayActivities(e.target.value)}
                  placeholder="예: 그림책 명칭 말하기, 소리모방 놀이, 역할놀이"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#10B981'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#D1D5DB'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    사용 교구/자료
                  </label>
                  <input
                    type="text"
                    value={materials}
                    onChange={(e) => setMaterials(e.target.value)}
                    placeholder="예: 동물 피규어, 의성어 카드"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#10B981'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#D1D5DB'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    관찰된 강점
                  </label>
                  <input
                    type="text"
                    value={strengths}
                    onChange={(e) => setStrengths(e.target.value)}
                    placeholder="예: 모방 의지, 집중력"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#10B981'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#D1D5DB'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    주의가 필요한 부분
                  </label>
                  <input
                    type="text"
                    value={concerns}
                    onChange={(e) => setConcerns(e.target.value)}
                    placeholder="예: 전환 어려움, 산만함"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#10B981'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#D1D5DB'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    가정 활동 제안
                  </label>
                  <input
                    type="text"
                    value={homework}
                    onChange={(e) => setHomework(e.target.value)}
                    placeholder="예: 하루 10분 그림책 읽기"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#10B981'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#D1D5DB'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  다음 세션 계획
                </label>
                <textarea
                  value={nextPlan}
                  onChange={(e) => setNextPlan(e.target.value)}
                  placeholder="예: 2어 조합 산출 확대, 상징놀이 확장"
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#10B981'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#D1D5DB'
                  }}
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: isGenerating ? '#9CA3AF' : '#10B981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: isGenerating ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!isGenerating) {
                    e.currentTarget.style.backgroundColor = '#059669'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isGenerating) {
                    e.currentTarget.style.backgroundColor = '#10B981'
                  }
                }}
              >
                <Sparkles style={{ width: '20px', height: '20px' }} />
                {isGenerating ? 'AI가 생성 중입니다...' : 'AI 상담일지 생성'}
              </button>
            </>
          ) : (
            <>
              {/* Result */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  생성된 상담일지
                </label>
                <textarea
                  value={generatedJournal}
                  onChange={(e) => setGeneratedJournal(e.target.value)}
                  rows={20}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#10B981'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#D1D5DB'
                  }}
                />
                <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '8px' }}>
                  * 생성된 내용을 수정하신 후 "반영" 버튼을 눌러주세요.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowResult(false)}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    backgroundColor: 'white',
                    color: '#374151',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F3F4F6'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white'
                  }}
                >
                  다시 작성
                </button>
                <button
                  onClick={handleApply}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    backgroundColor: '#10B981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#059669'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#10B981'
                  }}
                >
                  상담일지에 반영
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
