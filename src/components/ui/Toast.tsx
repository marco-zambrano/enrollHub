import { useEffect, type ReactNode } from 'react'
import { CheckCircle2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ToastProps {
  open: boolean
  message: string
  onClose: () => void
  duration?: number
  icon?: ReactNode
}

export function Toast({ open, message, onClose, duration = 4000, icon }: ToastProps) {
  useEffect(() => {
    if (!open) return
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [open, duration, onClose])

  if (!open) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed right-4 top-4 z-[9999] animate-slide-in rounded-lg border border-uni-border bg-white p-4 shadow-lg"
    >
      <div className="flex items-center gap-3">
        {icon ?? <CheckCircle2 className="h-5 w-5 text-uni-success" aria-hidden="true" />}
        <p className="text-sm font-medium text-uni-navy">{message}</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          aria-label="Cerrar notificación"
          className="ml-2 h-6 w-6 p-0"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}
