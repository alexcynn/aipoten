interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
  fullScreen?: boolean
}

export default function LoadingSpinner({
  size = 'md',
  message = '로딩 중...',
  fullScreen = false
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  }

  const Container = fullScreen ? 'div' : 'div'
  const containerClasses = fullScreen
    ? 'min-h-screen bg-neutral-light flex items-center justify-center'
    : 'flex items-center justify-center p-8'

  return (
    <Container className={containerClasses}>
      <div className="text-center">
        <div className={`animate-spin rounded-full border-b-2 border-aipoten-green mx-auto ${sizeClasses[size]}`}></div>
        {message && (
          <p className="mt-4 text-gray-600">{message}</p>
        )}
      </div>
    </Container>
  )
}