import { useFormContext, Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { AlertCircle } from 'lucide-react'
import { Label } from '@/components/ui/label'

interface Option {
  value: string
  label: string
}

interface SelectFieldProps {
  name: string
  label: string
  options: Option[]
  hint?: string
  required?: boolean
}

export function SelectField({ name, label, options, hint, required = false }: SelectFieldProps) {
  const { t } = useTranslation()
  const {
    control,
    formState: { errors },
  } = useFormContext()
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
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <select
            id={name}
            className="w-full rounded-md border border-uni-border bg-white p-2 text-sm text-uni-navy"
            aria-required={required}
            aria-invalid={!!error}
            aria-describedby={`${hint ? hintId : ''} ${error ? errorId : ''}`.trim() || undefined}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
          >
            <option value="">{t('selectOption')}</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}
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
          {error}
        </span>
      )}
    </div>
  )
}

