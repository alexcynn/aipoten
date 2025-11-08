'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Header from '@/components/layout/Header'
import AIJournalModal from '@/components/modals/AIJournalModal'
import { ArrowLeft, Sparkles } from 'lucide-react'

export default function TherapistJournalPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const bookingId = params.id as string

  const [journal, setJournal] = useState('')
  const [existingJournal, setExistingJournal] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [bookingStatus, setBookingStatus] = useState<string | null>(null)
  const [isAIModalOpen, setIsAIModalOpen] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    if (session.user?.role !== 'THERAPIST') {
      router.push('/dashboard')
      return
    }

    fetchJournal()
  }, [session, status, router, bookingId])

  const fetchJournal = async () => {
    try {
      const response = await fetch(`/api/therapist/bookings/${bookingId}/journal`)
      if (response.ok) {
        const data = await response.json()
        if (data.journal) {
          setExistingJournal(data.journal)
          setJournal(data.journal)
        }
        setBookingStatus(data.status)
      } else {
        const errorData = await response.json()
        setMessage({ type: 'error', text: errorData.error || '상담일지를 불러올 수 없습니다.' })
      }
    } catch (error) {
      console.error('상담일지 조회 오류:', error)
      setMessage({ type: 'error', text: '서버 오류가 발생했습니다.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!journal.trim()) {
      setMessage({ type: 'error', text: '상담일지 내용을 입력해주세요.' })
      return
    }

    if (!confirm('상담일지를 저장하시겠습니까?\n\n저장 후 예약이 "정산 대기" 상태로 전환됩니다.')) {
      return
    }

    setIsSaving(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/therapist/bookings/${bookingId}/journal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ journal })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || '상담일지가 저장되었습니다.' })
        setExistingJournal(journal)
        setTimeout(() => {
          router.push('/therapist/dashboard')
        }, 2000)
      } else {
        setMessage({ type: 'error', text: data.error || '상담일지 저장에 실패했습니다.' })
      }
    } catch (error) {
      console.error('상담일지 저장 오류:', error)
      setMessage({ type: 'error', text: '서버 오류가 발생했습니다.' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAIJournalApply = (aiJournal: string) => {
    setJournal(aiJournal)
    setMessage({ type: 'success', text: 'AI 상담일지가 반영되었습니다. 내용을 확인하고 저장해주세요.' })
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-neutral-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aipoten-green mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  const isReadOnly = existingJournal !== null || bookingStatus !== 'CONFIRMED'

  return (
    <div className="min-h-screen bg-neutral-light">
      <Header />

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            style={{
              display: 'flex',
              alignItems: 'center',
              color: '#4B5563',
              background: 'none',
              border: 'none',
              fontSize: '16px',
              cursor: 'pointer',
              marginBottom: '24px',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#111827'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#4B5563'
            }}
          >
            <ArrowLeft style={{ width: '20px', height: '20px', marginRight: '8px' }} />
            돌아가기
          </button>

          {/* Message */}
          {message && (
            <div
              style={{
                marginBottom: '24px',
                padding: '16px',
                borderRadius: '6px',
                backgroundColor: message.type === 'success' ? '#F0FDF4' : '#FEF2F2',
                color: message.type === 'success' ? '#166534' : '#991B1B',
                border: `1px solid ${message.type === 'success' ? '#BBF7D0' : '#FECACA'}`
              }}
            >
              {message.text}
            </div>
          )}

          {/* Title */}
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
              상담일지 {existingJournal ? '조회' : '작성'}
            </h1>
            <p style={{ color: '#6B7280' }}>
              {existingJournal
                ? '작성된 상담일지입니다.'
                : '세션 완료 후 상담일지를 작성해주세요.'}
            </p>
          </div>

          {/* Notice */}
          {!existingJournal && bookingStatus === 'CONFIRMED' && (
            <div
              style={{
                marginBottom: '24px',
                padding: '16px',
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                borderRadius: '6px',
                color: '#1E40AF'
              }}
            >
              <p style={{ fontSize: '14px', marginBottom: '8px', fontWeight: '600' }}>📝 안내사항</p>
              <ul style={{ fontSize: '14px', paddingLeft: '20px', margin: 0 }}>
                <li>상담일지를 저장하면 자동으로 "정산 대기" 상태로 전환됩니다.</li>
                <li>저장 후에는 수정할 수 없으니 신중하게 작성해주세요.</li>
              </ul>
            </div>
          )}

          {/* Warning if not in correct status */}
          {bookingStatus && bookingStatus !== 'CONFIRMED' && !existingJournal && (
            <div
              style={{
                marginBottom: '24px',
                padding: '16px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '6px',
                color: '#991B1B'
              }}
            >
              <p style={{ fontSize: '14px', fontWeight: '600' }}>⚠️ 상담일지 작성 불가</p>
              <p style={{ fontSize: '14px', marginTop: '8px' }}>
                현재 예약 상태({bookingStatus})에서는 상담일지를 작성할 수 없습니다.
                예약을 먼저 확인해주세요.
              </p>
            </div>
          )}

          {/* Journal Form */}
          <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label
                htmlFor="journal"
                style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#111827'
                }}
              >
                상담일지
              </label>
              {!existingJournal && bookingStatus === 'CONFIRMED' && (
                <button
                  onClick={() => setIsAIModalOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    backgroundColor: '#10B981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
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
                  <Sparkles style={{ width: '16px', height: '16px' }} />
                  AI 상담일지 작성
                </button>
              )}
            </div>
            <textarea
              id="journal"
              value={journal}
              onChange={(e) => setJournal(e.target.value)}
              disabled={isReadOnly}
              placeholder={isReadOnly ? '' : '세션 내용, 아동의 반응, 진전 사항, 추천사항 등을 상세히 기록해주세요...'}
              style={{
                width: '100%',
                minHeight: '400px',
                padding: '12px',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical',
                backgroundColor: isReadOnly ? '#F9FAFB' : 'white',
                color: '#111827',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => {
                if (!isReadOnly) {
                  e.currentTarget.style.borderColor = '#3B82F6'
                }
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#D1D5DB'
              }}
            />
            <div style={{ marginTop: '8px', fontSize: '14px', color: '#6B7280', textAlign: 'right' }}>
              {journal.length}자
            </div>
          </div>

          {/* Actions */}
          {!existingJournal && bookingStatus === 'CONFIRMED' && (
            <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => router.back()}
                style={{
                  padding: '10px 20px',
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
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !journal.trim()}
                style={{
                  padding: '10px 20px',
                  backgroundColor: isSaving || !journal.trim() ? '#9CA3AF' : '#10B981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: isSaving || !journal.trim() ? 'not-allowed' : 'pointer',
                  opacity: isSaving || !journal.trim() ? 0.5 : 1,
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!isSaving && journal.trim()) {
                    e.currentTarget.style.backgroundColor = '#059669'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSaving && journal.trim()) {
                    e.currentTarget.style.backgroundColor = '#10B981'
                  }
                }}
              >
                {isSaving ? '저장 중...' : '저장'}
              </button>
            </div>
          )}
        </div>
      </main>

      {/* AI Journal Modal */}
      <AIJournalModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onApply={handleAIJournalApply}
      />
    </div>
  )
}
