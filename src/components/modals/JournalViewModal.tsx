'use client'

import { useEffect, useState } from 'react'
import { X, FileText } from 'lucide-react'

interface JournalData {
  journal: string
  bookingId: string
  sessionNumber: number
  totalSessions: number
  scheduledAt: string
  completedAt: string | null
  therapistName: string
  childName: string
}

interface JournalViewModalProps {
  bookingId: string | null
  isOpen: boolean
  onClose: () => void
}

export default function JournalViewModal({
  bookingId,
  isOpen,
  onClose,
}: JournalViewModalProps) {
  const [journalData, setJournalData] = useState<JournalData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && bookingId) {
      fetchJournal()
    }
  }, [isOpen, bookingId])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const fetchJournal = async () => {
    if (!bookingId) return

    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/parent/bookings/${bookingId}/journal`)
      const data = await response.json()

      if (response.ok) {
        setJournalData(data)
      } else {
        setError(data.error || '상담일지를 불러올 수 없습니다.')
      }
    } catch (err) {
      setError('서버 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 60,
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 60,
          overflow: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
        }}
      >
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            style={{
              padding: '24px',
              borderBottom: '1px solid #E5E7EB',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FileText style={{ width: '24px', height: '24px', color: '#10B981' }} />
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
                상담일지
              </h2>
            </div>
            <button
              onClick={onClose}
              style={{
                padding: '8px',
                color: '#6B7280',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F3F4F6'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <X style={{ width: '24px', height: '24px' }} />
            </button>
          </div>

          {/* Content */}
          <div
            style={{
              padding: '24px',
              overflowY: 'auto',
              flex: 1,
            }}
          >
            {isLoading && (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div
                  style={{
                    display: 'inline-block',
                    width: '48px',
                    height: '48px',
                    border: '4px solid #E5E7EB',
                    borderTopColor: '#10B981',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                />
                <p style={{ marginTop: '16px', color: '#6B7280' }}>로딩 중...</p>
              </div>
            )}

            {error && (
              <div
                style={{
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: '6px',
                  padding: '16px',
                  color: '#991B1B',
                  textAlign: 'center',
                }}
              >
                {error}
              </div>
            )}

            {journalData && !isLoading && !error && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* 세션 정보 */}
                <div
                  style={{
                    backgroundColor: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    borderRadius: '8px',
                    padding: '16px',
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
                    <div>
                      <span style={{ color: '#065F46', fontWeight: '600' }}>아동:</span>
                      <p style={{ color: '#166534', marginTop: '4px' }}>{journalData.childName}</p>
                    </div>
                    <div>
                      <span style={{ color: '#065F46', fontWeight: '600' }}>치료사:</span>
                      <p style={{ color: '#166534', marginTop: '4px' }}>{journalData.therapistName}</p>
                    </div>
                    <div>
                      <span style={{ color: '#065F46', fontWeight: '600' }}>세션:</span>
                      <p style={{ color: '#166534', marginTop: '4px' }}>
                        {journalData.sessionNumber} / {journalData.totalSessions}회
                      </p>
                    </div>
                    <div>
                      <span style={{ color: '#065F46', fontWeight: '600' }}>일시:</span>
                      <p style={{ color: '#166534', marginTop: '4px' }}>
                        {new Date(journalData.scheduledAt).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 상담일지 내용 */}
                <div>
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#111827',
                      marginBottom: '12px',
                    }}
                  >
                    상담일지 내용
                  </h3>
                  <div
                    style={{
                      backgroundColor: '#F9FAFB',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      padding: '20px',
                      minHeight: '300px',
                      fontSize: '15px',
                      lineHeight: '1.8',
                      color: '#111827',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {journalData.journal}
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '14px', color: '#6B7280', textAlign: 'right' }}>
                    {journalData.journal.length}자
                  </div>
                </div>

                {/* 작성 일시 */}
                {journalData.completedAt && (
                  <div
                    style={{
                      fontSize: '13px',
                      color: '#6B7280',
                      textAlign: 'right',
                      paddingTop: '12px',
                      borderTop: '1px solid #E5E7EB',
                    }}
                  >
                    작성일: {new Date(journalData.completedAt).toLocaleString('ko-KR')}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '24px',
              borderTop: '1px solid #E5E7EB',
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <button
              onClick={onClose}
              style={{
                padding: '10px 24px',
                backgroundColor: '#10B981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#059669'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#10B981'
              }}
            >
              닫기
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  )
}
