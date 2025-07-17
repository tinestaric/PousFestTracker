import { forwardRef } from 'react'
import { AlertCircle } from 'lucide-react'

interface BaseFormInputProps {
  label?: string
  error?: string
  variant?: 'input' | 'textarea' | 'select'
  children?: React.ReactNode
}

interface InputFormInputProps extends BaseFormInputProps, React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'input'
}

interface TextareaFormInputProps extends BaseFormInputProps, React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant: 'textarea'
}

interface SelectFormInputProps extends BaseFormInputProps, React.SelectHTMLAttributes<HTMLSelectElement> {
  variant: 'select'
}

type FormInputProps = InputFormInputProps | TextareaFormInputProps | SelectFormInputProps

export const FormInput = forwardRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, FormInputProps>(
  ({ label, error, variant = 'input', children, className = '', ...props }, ref) => {
    const baseClasses = "w-full px-4 py-3 bg-white/10 backdrop-blur-sm border rounded-xl text-white placeholder-white/60 focus:bg-white/20 focus:border-white/50 transition-all duration-300"
    const errorClasses = error ? "border-red-400/60 focus:border-red-400" : "border-white/30"
    const finalClasses = `${baseClasses} ${errorClasses} ${className}`

    const renderInput = () => {
      switch (variant) {
        case 'textarea':
          return (
            <textarea
              {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
              ref={ref as React.Ref<HTMLTextAreaElement>}
              className={finalClasses}
            />
          )
        case 'select':
          return (
            <select
              {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
              ref={ref as React.Ref<HTMLSelectElement>}
              className={finalClasses}
            >
              {children}
            </select>
          )
        default:
          return (
            <input
              {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
              ref={ref as React.Ref<HTMLInputElement>}
              className={finalClasses}
            />
          )
      }
    }

    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-white/90 mb-1">
            {label}
          </label>
        )}
        {renderInput()}
        {error && (
          <div className="flex items-center gap-1 text-red-300 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
      </div>
    )
  }
)

FormInput.displayName = 'FormInput'

interface FormCheckboxProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  error?: string
}

export function FormCheckbox({ label, checked, onChange, error }: FormCheckboxProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="rounded border-white/30 bg-white/10 text-white focus:ring-white/50"
        />
        <label className="text-white text-sm">{label}</label>
      </div>
      {error && (
        <div className="flex items-center gap-1 text-red-300 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
} 