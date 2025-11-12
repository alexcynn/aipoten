'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/layout/AdminLayout'

interface SystemSettings {
  id: string
  bankName: string | null
  accountNumber: string | null
  accountHolder: string | null
  settlementRate: number | null
  consultationDefaultFee: number | null
  consultationDefaultSettlement: number | null
}

interface TherapyMapping {
  id: string
  developmentCategory: string
  therapyType: string
  priority: number
  isActive: boolean
}

const DEVELOPMENT_CATEGORIES = [
  { value: 'GROSS_MOTOR', label: '대근육' },
  { value: 'FINE_MOTOR', label: '소근육' },
  { value: 'COGNITIVE', label: '인지' },
  { value: 'LANGUAGE', label: '언어' },
  { value: 'SOCIAL', label: '사회성' },
]

const THERAPY_TYPES = [
  { value: 'SPEECH_THERAPY', label: '언어치료' },
  { value: 'SENSORY_INTEGRATION', label: '감각통합' },
  { value: 'PLAY_THERAPY', label: '놀이치료' },
  { value: 'ART_THERAPY', label: '미술치료' },
  { value: 'MUSIC_THERAPY', label: '음악치료' },
  { value: 'OCCUPATIONAL_THERAPY', label: '작업치료' },
  { value: 'COGNITIVE_THERAPY', label: '인지치료' },
  { value: 'BEHAVIORAL_THERAPY', label: '행동치료' },
]

export default function AdminSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [mappings, setMappings] = useState<TherapyMapping[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // 폼 상태
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountHolder, setAccountHolder] = useState('')
  const [settlementRate, setSettlementRate] = useState<number>(5)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    if (session.user?.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }

    fetchData()
  }, [session, status, router])

  const fetchData = async () => {
    try {
      const [settingsRes, mappingsRes] = await Promise.all([
        fetch('/api/admin/settings'),
        fetch('/api/admin/therapy-mappings'),
      ])

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json()
        setSettings(settingsData)
        setBankName(settingsData.bankName || '')
        setAccountNumber(settingsData.accountNumber || '')
        setAccountHolder(settingsData.accountHolder || '')
        setSettlementRate(settingsData.settlementRate ?? 5)
      }

      if (mappingsRes.ok) {
        const mappingsData = await mappingsRes.json()
        setMappings(mappingsData.mappings || [])
      }
    } catch (error) {
      console.error('데이터 조회 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    setMessage(null)

    // 검증
    if (settlementRate < 0 || settlementRate > 100) {
      setMessage({ type: 'error', text: '정산율은 0~100 사이의 값이어야 합니다.' })
      setIsSaving(false)
      return
    }

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bankName,
          accountNumber,
          accountHolder,
          settlementRate,
        }),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: '설정이 저장되었습니다.' })
        fetchData()
      } else {
        const data = await response.json()
        setMessage({ type: 'error', text: data.error || '저장 중 오류가 발생했습니다.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '서버 오류가 발생했습니다.' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleMapping = async (category: string, therapyType: string) => {
    const existing = mappings.find(
      m => m.developmentCategory === category && m.therapyType === therapyType
    )

    try {
      if (existing) {
        // 삭제
        const response = await fetch(`/api/admin/therapy-mappings/${existing.id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          setMappings(mappings.filter(m => m.id !== existing.id))
          setMessage({ type: 'success', text: '매핑이 제거되었습니다.' })
        }
      } else {
        // 추가
        const response = await fetch('/api/admin/therapy-mappings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            developmentCategory: category,
            therapyType: therapyType,
            priority: 0,
            isActive: true,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          setMappings([...mappings, data.mapping])
          setMessage({ type: 'success', text: '매핑이 추가되었습니다.' })
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: '오류가 발생했습니다.' })
    }

    setTimeout(() => setMessage(null), 3000)
  }

  const isMapped = (category: string, therapyType: string) => {
    return mappings.some(
      m => m.developmentCategory === category && m.therapyType === therapyType && m.isActive
    )
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6A00] mx-auto"></div>
          <p className="mt-4 text-stone-600 font-pretendard">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <AdminLayout title="시스템 설정">
      <div className="space-y-6">
        {/* 메시지 표시 */}
        {message && (
          <div
            className={`p-4 rounded-xl font-pretendard ${
              message.type === 'success'
                ? 'bg-[#FFE5E5] text-[#FF6A00] border border-[#FF9999]'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* 계좌 정보 설정 */}
        <div className="bg-white shadow rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-stone-900 font-pretendard">아이포텐 입금 계좌 정보</h2>
            <button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="px-6 py-2 bg-[#FF6A00] text-white rounded-[10px] hover:bg-[#E55F00] disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg transition-colors font-pretendard"
            >
              {isSaving ? '저장 중...' : '💾 설정 저장'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2 font-pretendard">
                은행명
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] font-pretendard"
                placeholder="예: 국민은행"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2 font-pretendard">
                계좌번호
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] font-pretendard"
                placeholder="000-00-0000-000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2 font-pretendard">
                예금주
              </label>
              <input
                type="text"
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] font-pretendard"
                placeholder="예: (주)아이포텐"
              />
            </div>
          </div>

          {/* 홈티 정산율 설정 */}
          <div className="mb-6 p-4 bg-[#FFE5E5] border border-[#FFE5E5] rounded-xl">
            <h3 className="text-md font-semibold text-stone-900 mb-3 font-pretendard">홈티 정산 설정</h3>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2 font-pretendard">
                플랫폼 수수료율 (%)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  value={settlementRate}
                  onChange={(e) => setSettlementRate(parseFloat(e.target.value) || 0)}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#FF6A00] font-pretendard"
                  min="0"
                  max="100"
                  step="0.1"
                />
                <span className="text-sm text-stone-600 font-pretendard">%</span>
              </div>
              <p className="text-sm text-stone-600 mt-2 font-pretendard">
                홈티(THERAPY) 예약 시 플랫폼 수수료율입니다. (0~100 사이 값)
              </p>
              <div className="mt-3 text-sm text-stone-700 bg-white p-3 rounded-xl border border-gray-200 font-pretendard">
                <p className="font-medium mb-1">💡 계산 예시 (정산율 {settlementRate}%)</p>
                <p>• 결제 금액: 100,000원</p>
                <p>• 플랫폼 수수료: {Math.round(100000 * (settlementRate / 100)).toLocaleString()}원 ({settlementRate}%)</p>
                <p>• 치료사 정산금: {(100000 - Math.round(100000 * (settlementRate / 100))).toLocaleString()}원</p>
              </div>
            </div>
          </div>

        </div>

        {/* 치료사 매핑 설정 */}
        <div className="bg-white shadow rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-stone-900 font-pretendard">치료사 매핑 설정</h2>
            <span className="text-xs bg-[#FFE5E5] text-[#FF6A00] px-3 py-1 rounded-full font-semibold font-pretendard">
              ✓ 자동 저장
            </span>
          </div>
          <p className="text-sm text-stone-600 mb-6 font-pretendard">
            발달체크 결과에서 또래 수준 미달(추적검사 요망 이하)인 영역에 대해 추천할 치료 분야를 설정합니다.
            체크박스를 클릭하면 즉시 저장됩니다.
          </p>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#F9F9F9]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider font-pretendard">
                    발달 영역
                  </th>
                  {THERAPY_TYPES.map(therapy => (
                    <th
                      key={therapy.value}
                      className="px-3 py-3 text-center text-xs font-medium text-stone-500 uppercase tracking-wider font-pretendard"
                    >
                      {therapy.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {DEVELOPMENT_CATEGORIES.map(category => (
                  <tr key={category.value}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-stone-900 font-pretendard">
                      {category.label}
                    </td>
                    {THERAPY_TYPES.map(therapy => (
                      <td key={therapy.value} className="px-3 py-4 whitespace-nowrap text-center">
                        <input
                          type="checkbox"
                          checked={isMapped(category.value, therapy.value)}
                          onChange={() => handleToggleMapping(category.value, therapy.value)}
                          className="h-4 w-4 text-[#FF6A00] focus:ring-[#FF6A00] border-gray-300 rounded cursor-pointer"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-sm text-stone-600 font-pretendard">
            <p>
              ✓ 체크된 항목: 해당 발달 영역이 미달일 때 해당 치료 분야를 추천합니다.
            </p>
            <p className="mt-1">
              예시: "대근육"에 "감각통합"이 체크되어 있으면, 대근육 영역이 또래 수준 미달일 때 감각통합 치료사를 추천합니다.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
