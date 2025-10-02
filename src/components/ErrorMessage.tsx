import Link from 'next/link'

interface ErrorMessageProps {
  title?: string
  message: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  type?: 'error' | 'warning' | 'info'
}

export default function ErrorMessage({
  title = '오류가 발생했습니다',
  message,
  action,
  type = 'error'
}: ErrorMessageProps) {
  const getIcon = () => {
    switch (type) {
      case 'warning': return '⚠️'
      case 'info': return 'ℹ️'
      default: return '❌'
    }
  }

  const getColorClasses = () => {
    switch (type) {
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800'
      default: return 'bg-red-50 border-red-200 text-red-800'
    }
  }

  const getButtonClasses = () => {
    switch (type) {
      case 'warning': return 'bg-yellow-600 hover:bg-yellow-700'
      case 'info': return 'bg-blue-600 hover:bg-blue-700'
      default: return 'bg-red-600 hover:bg-red-700'
    }
  }

  return (
    <div className="text-center py-12">
      <div className={`max-w-md mx-auto p-6 rounded-lg border ${getColorClasses()}`}>
        <div className="text-4xl mb-4">{getIcon()}</div>
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-sm mb-4">{message}</p>

        {action && (
          <div className="mt-4">
            {action.href ? (
              <Link
                href={action.href}
                className={`inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${getButtonClasses()}`}
              >
                {action.label}
              </Link>
            ) : action.onClick ? (
              <button
                onClick={action.onClick}
                className={`inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${getButtonClasses()}`}
              >
                {action.label}
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}