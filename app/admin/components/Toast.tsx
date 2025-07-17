import { useEffect, useState } from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import type { AppError } from './types'

interface ToastProps {
  error: AppError
  onDismiss: (id: string) => void
}

export function Toast({ error, onDismiss }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onDismiss(error.id), 300)
    }, error.type === 'error' ? 6000 : 4000)

    return () => clearTimeout(timer)
  }, [error.id, error.type, onDismiss])

  const getIcon = () => {
    switch (error.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />
      default:
        return <Info className="w-5 h-5 text-blue-400" />
    }
  }

  const getBackgroundColor = () => {
    switch (error.type) {
      case 'success':
        return 'bg-green-500/20 border-green-400/30'
      case 'error':
        return 'bg-red-500/20 border-red-400/30'
      case 'warning':
        return 'bg-yellow-500/20 border-yellow-400/30'
      default:
        return 'bg-blue-500/20 border-blue-400/30'
    }
  }

  return (
    <div
      className={`
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        transition-all duration-300 ease-in-out
        ${getBackgroundColor()}
        backdrop-blur-sm border rounded-xl p-4 shadow-lg max-w-sm
      `}
    >
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm">{error.message}</p>
          {error.details && (
            <p className="text-white/70 text-xs mt-1">{error.details}</p>
          )}
        </div>
        <button
          onClick={() => {
            setIsVisible(false)
            setTimeout(() => onDismiss(error.id), 300)
          }}
          className="text-white/60 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

interface ToastContainerProps {
  errors: AppError[]
  onDismiss: (id: string) => void
}

export function ToastContainer({ errors, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {errors.map((error) => (
        <Toast key={error.id} error={error} onDismiss={onDismiss} />
      ))}
    </div>
  )
} 