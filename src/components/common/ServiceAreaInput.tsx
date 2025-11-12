'use client'

import { useEffect, useState } from 'react'
import { formatDaumAddress, validateServiceAreas } from '@/lib/utils/addressUtils'

interface ServiceAreaInputProps {
  serviceAreas: string[]
  onServiceAreasChange: (areas: string[]) => void
  className?: string
  disabled?: boolean
  maxAreas?: number
}

// Daum 우편번호 서비스 타입 정의
declare global {
  interface Window {
    daum: any
  }
}

export default function ServiceAreaInput({
  serviceAreas,
  onServiceAreasChange,
  className = '',
  disabled = false,
  maxAreas = 10
}: ServiceAreaInputProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    // Daum 우편번호 서비스 스크립트 로드
    if (!window.daum) {
      const script = document.createElement('script')
      script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
      script.async = true
      script.onload = () => setScriptLoaded(true)
      document.body.appendChild(script)
    } else {
      setScriptLoaded(true)
    }
  }, [])

  const handleAddressSearch = () => {
    if (!scriptLoaded || !window.daum) {
      alert('주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.')
      return
    }

    if (serviceAreas.length >= maxAreas) {
      alert(`최대 ${maxAreas}개까지만 추가할 수 있습니다.`)
      return
    }

    new window.daum.Postcode({
      oncomplete: function (data: any) {
        // sido: "서울", sigungu: "강남구"
        const formattedArea = formatDaumAddress({
          sido: data.sido,
          sigungu: data.sigungu
        })

        // 중복 체크
        if (serviceAreas.includes(formattedArea)) {
          alert(`"${formattedArea}"는 이미 추가되었습니다.`)
          return
        }

        // 추가
        const newAreas = [...serviceAreas, formattedArea]
        onServiceAreasChange(newAreas)

        // 검증
        const validation = validateServiceAreas(newAreas)
        setErrors(validation.errors)
      }
    }).open()
  }

  const handleRemoveArea = (indexToRemove: number) => {
    const newAreas = serviceAreas.filter((_, index) => index !== indexToRemove)
    onServiceAreasChange(newAreas)

    // 검증
    if (newAreas.length > 0) {
      const validation = validateServiceAreas(newAreas)
      setErrors(validation.errors)
    } else {
      setErrors([])
    }
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-medium text-gray-700">
          서비스 가능 지역 <span className="text-red-500">*</span>
        </label>
        <button
          type="button"
          onClick={handleAddressSearch}
          disabled={disabled || !scriptLoaded || serviceAreas.length >= maxAreas}
          className="px-4 py-2 bg-[#FF6A00] text-white font-medium rounded-[10px] hover:bg-[#E55F00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-lg"
        >
          + 지역 추가
        </button>
      </div>

      {/* 서비스 지역 목록 */}
      {serviceAreas.length > 0 ? (
        <div className="space-y-2 mb-3">
          {serviceAreas.map((area, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-[#FFE5E5] px-4 py-3 rounded-[10px] border border-[#FF6A00]/20"
            >
              <span className="text-gray-800 font-medium">{area}</span>
              <button
                type="button"
                onClick={() => handleRemoveArea(index)}
                disabled={disabled}
                className="text-red-500 hover:text-red-700 font-medium disabled:opacity-50"
              >
                삭제
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-[10px] px-4 py-8 text-center text-gray-500">
          주소 검색으로 서비스 가능 지역을 추가해주세요
        </div>
      )}

      {/* 설명 */}
      <p className="text-sm text-gray-500 mt-2">
        부모님이 입력한 주소와 앞부분(시/군/구)이 일치하는 치료사에게 매칭됩니다.
      </p>

      {/* 에러 메시지 */}
      {errors.length > 0 && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-[10px]">
          {errors.map((error, index) => (
            <p key={index} className="text-sm text-red-600">
              • {error}
            </p>
          ))}
        </div>
      )}

      {/* 추가 가능 개수 표시 */}
      {serviceAreas.length > 0 && serviceAreas.length < maxAreas && (
        <p className="text-xs text-gray-400 mt-2">
          {maxAreas - serviceAreas.length}개 더 추가 가능
        </p>
      )}
    </div>
  )
}
