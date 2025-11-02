'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

interface Child {
  id: string
  name: string
  birthDate: string
  gender: string
  gestationalWeeks: number | null
  birthWeight: number | null
  currentHeight: number | null
  currentWeight: number | null
  medicalHistory: string | null
  createdAt: string
}

interface Booking {
  id: string
  scheduledAt: string
  status: string
  childName: string
  therapistName: string
  fee: number
  sessionNumber: number
  totalSessions: number
}

interface ParentDetail {
  id: string
  name: string
  email: string
  phone: string
  address: string | null
  addressDetail: string | null
  createdAt: string
  children: Child[]
  consultations: Booking[]
  therapies: Booking[]
}

interface ParentInfoModalProps {
  parentId: string | null
  isOpen: boolean
  onClose: () => void
}

const statusLabels: Record<string, { label: string; color: string }> = {
  SCHEDULED: { label: '예약됨', color: 'bg-blue-100 text-blue-800' },
  CONFIRMED: { label: '확정', color: 'bg-green-100 text-green-800' },
  COMPLETED: { label: '완료', color: 'bg-gray-100 text-gray-800' },
  CANCELLED: { label: '취소', color: 'bg-red-100 text-red-800' },
  NO_SHOW: { label: '노쇼', color: 'bg-orange-100 text-orange-800' },
}

export default function ParentInfoModal({ parentId, isOpen, onClose }: ParentInfoModalProps) {
  const [parent, setParent] = useState<ParentDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'info' | 'children' | 'consultations' | 'therapies'>('info')

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

  useEffect(() => {
    if (isOpen && parentId) {
      fetchParentDetail()
    }
  }, [isOpen, parentId])

  const fetchParentDetail = async () => {
    if (!parentId) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${parentId}`)
      if (response.ok) {
        const data = await response.json()
        setParent(data)
      }
    } catch (error) {
      console.error('부모 정보 조회 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate)
    const today = new Date()
    const months = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth())
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12

    if (years > 0) {
      return `${years}세 ${remainingMonths}개월`
    }
    return `${months}개월`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">부모 상세 정보</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('info')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'info'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                기본 정보
              </button>
              <button
                onClick={() => setActiveTab('children')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'children'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                등록 아이 ({parent?.children.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('consultations')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'consultations'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                언어 컨설팅 ({parent?.consultations.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('therapies')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'therapies'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                홈티 ({parent?.therapies.length || 0})
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aipoten-green mx-auto"></div>
              <p className="mt-4 text-gray-600">로딩 중...</p>
            </div>
          ) : parent ? (
            <>
              {/* 기본 정보 탭 */}
              {activeTab === 'info' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">기본 정보</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">이름</p>
                        <p className="text-base font-medium text-gray-900">{parent.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">이메일</p>
                        <p className="text-base font-medium text-gray-900">{parent.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">전화번호</p>
                        <p className="text-base font-medium text-gray-900">{parent.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">가입일</p>
                        <p className="text-base font-medium text-gray-900">
                          {new Date(parent.createdAt).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-gray-500">주소</p>
                        <p className="text-base font-medium text-gray-900">
                          {parent.address
                            ? `${parent.address}${parent.addressDetail ? `, ${parent.addressDetail}` : ''}`
                            : '정보 없음'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">통계</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-600 mb-1">등록 아이</p>
                        <p className="text-2xl font-bold text-blue-900">{parent.children.length}명</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-green-600 mb-1">언어 컨설팅</p>
                        <p className="text-2xl font-bold text-green-900">{parent.consultations.length}회</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-sm text-purple-600 mb-1">홈티</p>
                        <p className="text-2xl font-bold text-purple-900">{parent.therapies.length}회</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 등록 아이 탭 */}
              {activeTab === 'children' && (
                <div className="space-y-4">
                  {parent.children.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      등록된 아이가 없습니다.
                    </div>
                  ) : (
                    parent.children.map((child) => (
                      <div key={child.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">{child.name}</h4>
                            <p className="text-sm text-gray-500">
                              {child.gender === 'MALE' ? '남' : '여'} · {calculateAge(child.birthDate)}
                            </p>
                          </div>
                          <span className="text-xs text-gray-400">
                            등록일: {new Date(child.createdAt).toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-500">생년월일:</span>
                            <span className="ml-2 text-gray-900">
                              {new Date(child.birthDate).toLocaleDateString('ko-KR')}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">출산 주수:</span>
                            <span className="ml-2 text-gray-900">
                              {child.gestationalWeeks ? `${child.gestationalWeeks}주` : '-'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">키:</span>
                            <span className="ml-2 text-gray-900">
                              {child.currentHeight ? `${child.currentHeight}cm` : '-'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">몸무게:</span>
                            <span className="ml-2 text-gray-900">
                              {child.currentWeight ? `${child.currentWeight}kg` : '-'}
                            </span>
                          </div>
                        </div>
                        {child.medicalHistory && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-sm text-gray-500 mb-1">병력/수술력:</p>
                            <p className="text-sm text-gray-900 whitespace-pre-wrap">{child.medicalHistory}</p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* 언어 컨설팅 탭 */}
              {activeTab === 'consultations' && (
                <div className="space-y-4">
                  {parent.consultations.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      언어 컨설팅 내역이 없습니다.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">일시</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">아이</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">치료사</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">회차</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">비용</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {parent.consultations.map((consultation) => (
                            <tr key={consultation.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {new Date(consultation.scheduledAt).toLocaleDateString('ko-KR')}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">{consultation.childName}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{consultation.therapistName}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {consultation.sessionNumber}/{consultation.totalSessions}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                ₩{consultation.fee.toLocaleString()}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  statusLabels[consultation.status]?.color || 'bg-gray-100 text-gray-800'
                                }`}>
                                  {statusLabels[consultation.status]?.label || consultation.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* 홈티 탭 */}
              {activeTab === 'therapies' && (
                <div className="space-y-4">
                  {parent.therapies.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      홈티 내역이 없습니다.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">일시</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">아이</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">치료사</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">회차</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">비용</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {parent.therapies.map((therapy) => (
                            <tr key={therapy.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {new Date(therapy.scheduledAt).toLocaleDateString('ko-KR')}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">{therapy.childName}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{therapy.therapistName}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {therapy.sessionNumber}/{therapy.totalSessions}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                ₩{therapy.fee.toLocaleString()}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  statusLabels[therapy.status]?.color || 'bg-gray-100 text-gray-800'
                                }`}>
                                  {statusLabels[therapy.status]?.label || therapy.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              정보를 불러올 수 없습니다.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}
