import { useState, type FormHTMLAttributes, type ReactNode } from 'react'
import {
  FormProvider,
  useForm,
  type DefaultValues,
  type FieldValues,
  type Resolver,
  type SubmitHandler,
} from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useAccessibilityStore } from '@/stores/accessibilityStore'
import { Button } from '@/components/ui/button'

interface AccessibleFormProps<T extends FieldValues> extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  defaultValues?: DefaultValues<T>
  resolver?: Resolver<T>
  onSubmit: SubmitHandler<T>
  children: ReactNode
  submitLabel: string
  critical?: boolean
  confirmTitle?: string
  confirmSummary?: (data: T) => ReactNode
  successMessage?: string
}

export function AccessibleForm<T extends FieldValues>({
  defaultValues,
  resolver,
  onSubmit,
  children,
  submitLabel,
  critical = false,
  confirmTitle,
  confirmSummary,
  successMessage,
  className,
  ...formProps
}: AccessibleFormProps<T>) {
  const { t } = useTranslation()
  const methods = useForm<T>({ defaultValues, resolver })
  const confirmationMode = useAccessibilityStore((s) => s.confirmationMode)
  const addLiveMessage = useAccessibilityStore((s) => s.addLiveRegionMessage)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingData, setPendingData] = useState<T | null>(null)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = methods.handleSubmit(async (data) => {
    if (critical && confirmationMode) {
      setPendingData(data)
      setShowConfirm(true)
      return
    }
    await executeSubmit(data)
  })

  const executeSubmit = async (data: T) => {
    try {
      setErrorMessage(null)
      await onSubmit(data)
      setStatus('success')
      if (successMessage) {
        addLiveMessage(successMessage)
      }
    } catch (err) {
      setStatus('error')
      const msg = err instanceof Error ? err.message : t('formErrorGeneric')
      setErrorMessage(msg)
      addLiveMessage(msg)
    }
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit}
        className={className}
        noValidate
        {...formProps}
      >
        {children}

        {status === 'success' && successMessage && (
          <p role="status" aria-live="polite" className="mt-4 text-sm text-uni-success">
            {successMessage}
          </p>
        )}

        {status === 'error' && (
          <p role="alert" className="mt-4 text-sm text-uni-error">
            {errorMessage ?? t('formErrorRetry')}
          </p>
        )}

        <Button type="submit" className="mt-6">
          {submitLabel}
        </Button>
      </form>

      {showConfirm && pendingData && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          className="fixed inset-0 z-[9500] flex items-center justify-center bg-black/40 p-4"
        >
          <div className="w-full max-w-md rounded-lg border border-uni-border bg-white p-6 shadow-xl">
            <h2 id="confirm-dialog-title" className="font-display text-lg font-semibold text-uni-navy">
              {confirmTitle ?? t('confirmSubmitTitle')}
            </h2>
            <div className="mt-4 text-sm text-uni-slate">
              {confirmSummary ? confirmSummary(pendingData) : (
                <p>{t('confirmSubmitDefault')}</p>
              )}
            </div>
            <div className="mt-6 flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowConfirm(false)
                  setPendingData(null)
                }}
              >
                {t('cancel')}
              </Button>
              <Button
                type="button"
                onClick={async () => {
                  setShowConfirm(false)
                  await executeSubmit(pendingData)
                  setPendingData(null)
                }}
              >
                {t('confirm')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </FormProvider>
  )
}
