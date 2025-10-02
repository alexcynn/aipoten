'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'

interface ProfilePictureUploadProps {
  currentImageUrl?: string | null
  onImageUpload: (imageUrl: string) => void
  type?: 'profile' | 'child' | 'post'
  size?: 'sm' | 'md' | 'lg'
}

export default function ProfilePictureUpload({
  currentImageUrl,
  onImageUpload,
  type = 'profile',
  size = 'md'
}: ProfilePictureUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError('')

    // 파일 크기 체크 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('파일 크기는 5MB를 초과할 수 없습니다.')
      return
    }

    // 파일 형식 체크
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('JPG, PNG, WebP 파일만 업로드 가능합니다.')
      return
    }

    // 미리보기 생성
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // 파일 업로드
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '업로드 실패')
      }

      const data = await response.json()
      onImageUpload(data.url)
      setPreviewUrl(data.url)
    } catch (err: any) {
      setError(err.message)
      setPreviewUrl(currentImageUrl || null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemove = () => {
    setPreviewUrl(null)
    onImageUpload('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative group">
        <div
          className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-gray-300 bg-gray-100 flex items-center justify-center cursor-pointer hover:border-aipoten-green transition-colors`}
          onClick={handleClick}
        >
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt="프로필 사진"
              width={size === 'sm' ? 64 : size === 'md' ? 96 : 128}
              height={size === 'sm' ? 64 : size === 'md' ? 96 : 128}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-gray-400 text-center">
              <div className="text-2xl mb-1">📷</div>
              <div className="text-xs">사진 추가</div>
            </div>
          )}

          {/* 로딩 오버레이 */}
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            </div>
          )}

          {/* 호버 오버레이 */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all">
            <div className="text-white opacity-0 group-hover:opacity-100 text-xs text-center">
              {previewUrl ? '변경' : '추가'}
            </div>
          </div>
        </div>

        {/* 제거 버튼 */}
        {previewUrl && !isUploading && (
          <button
            onClick={handleRemove}
            className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
          >
            ×
          </button>
        )}
      </div>

      {/* 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* 업로드 버튼 */}
      <button
        onClick={handleClick}
        disabled={isUploading}
        className="mt-2 px-3 py-1 text-sm text-aipoten-green hover:text-aipoten-navy disabled:opacity-50"
      >
        {isUploading ? '업로드 중...' : previewUrl ? '사진 변경' : '사진 추가'}
      </button>

      {/* 에러 메시지 */}
      {error && (
        <div className="mt-2 text-xs text-red-600 text-center max-w-xs">
          {error}
        </div>
      )}

      {/* 도움말 */}
      <div className="mt-1 text-xs text-gray-500 text-center max-w-xs">
        JPG, PNG, WebP (최대 5MB)
      </div>
    </div>
  )
}