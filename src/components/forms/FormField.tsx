import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { AlertCircle } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useAccessibilityStore } from '@/stores/accessibilityStore'

interface FormFieldProps {
  name: string
  label: string
  type?: string
  hint?: string
  required?: boolean
  autoComplete?: string
}

export function FormField({
  name,
  label,
  type = 'text',
  hint,
  required = false,
  autoComplete,
}: FormFieldProps) {
  const { t } = useTranslation()
  const {
    register,
    formState: { errors },
  } = useFormContext()
  const expandedSuggestions = useAccessibilityStore((s) => s.expandedErrorSuggestions)
  const error = errors[name]?.message as string | undefined
  const hintId = `${name}-hint`
  const errorId = `${name}-error`

  return (
    <div className="form-group space-y-1.5">
      <Label htmlFor={name}>
        {label}
        {required && (
          <>
            <span aria-hidden="true"> *</span>
            <span className="sr-only"> ({t('required')})</span>
          </>
        )}
      </Label>
      <Input
        id={name}
        type={type}
        autoComplete={autoComplete}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={`${hint ? hintId : ''} ${error ? errorId : ''}`.trim() || undefined}
        {...register(name, type === 'number' ? { valueAsNumber: true } : undefined)}
      />
      {hint && (
        <span id={hintId} className="field-hint block text-xs text-uni-slate">
          {hint}
        </span>
      )}
      {error && (
        <span
          id={errorId}
          className="field-error flex items-start gap-1 text-sm text-uni-error"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            {error}
            {expandedSuggestions && (
              <span className="mt-1 block text-xs">
                {t('errorSuggestion')}
              </span>
            )}
          </span>
        </span>
      )}
    </div>
  )
}
