'use client'

import { useEffect, useState } from 'react'

interface AddressSearchInputProps {
  address: string
  addressDetail: string
  onAddressChange: (address: string) => void
  onAddressDetailChange: (addressDetail: string) => void
  className?: string
  disabled?: boolean
}

// Daum 우편번호 서비스 타입 정의
declare global {
  interface Window {
    daum: any
  }
}

export default function AddressSearchInput({
  address,
  addressDetail,
  onAddressChange,
  onAddressDetailChange,
  className = '',
  disabled = false,
}: AddressSearchInputProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false)

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

    new window.daum.Postcode({
      oncomplete: function (data: any) {
        // 도로명 주소 또는 지번 주소를 사용
        let fullAddress = data.address // 기본 주소
        let extraAddress = '' // 참고 항목

        // 도로명 주소인 경우
        if (data.addressType === 'R') {
          if (data.bname !== '') {
            extraAddress += data.bname
          }
          if (data.buildingName !== '') {
            extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName
          }
          fullAddress += extraAddress !== '' ? ` (${extraAddress})` : ''
        }

        // 우편번호와 주소 정보를 업데이트
        onAddressChange(fullAddress)

        // 상세주소 입력 필드로 포커스 이동
        const detailInput = document.getElementById('addressDetail')
        if (detailInput) {
          detailInput.focus()
        }
      },
    }).open()
  }

  return (
    <div className={className}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          주소
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={address}
            readOnly
            placeholder="주소 검색 버튼을 클릭하세요"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 focus:ring-2 focus:ring-[#FF6A00] focus:border-transparent"
            disabled={disabled}
          />
          <button
            type="button"
            onClick={handleAddressSearch}
            disabled={disabled || !scriptLoaded}
            className="px-4 py-2 bg-[#FF6A00] text-white font-medium rounded-md hover:bg-[#E55F00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            주소 검색
          </button>
        </div>
      </div>

      <div className="mt-3">
        <label htmlFor="addressDetail" className="block text-sm font-medium text-gray-700 mb-2">
          상세주소
        </label>
        <input
          id="addressDetail"
          type="text"
          value={addressDetail}
          onChange={(e) => onAddressDetailChange(e.target.value)}
          placeholder="상세주소를 입력하세요 (예: 101동 1234호)"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FF6A00] focus:border-transparent"
          disabled={disabled}
        />
      </div>
    </div>
  )
}
