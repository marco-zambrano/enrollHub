import { useEffect, useRef, useState } from 'react'
import { useAccessibilityStore } from '@/stores/accessibilityStore'

const SESSION_MS = 15 * 60 * 1000
const WARNING_MS = 2 * 60 * 1000

export function useSessionTimeout(onTimeout?: () => void) {
  const sessionExtension = useAccessibilityStore((s) => s.sessionExtension)
  const [showWarning, setShowWarning] = useState(false)
  const [remaining, setRemaining] = useState(WARNING_MS)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const warningRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const resetTimer = () => {
    if (sessionExtension) return
    if (timerRef.current) clearTimeout(timerRef.current)
    if (warningRef.current) clearInterval(warningRef.current)
    setShowWarning(false)

    timerRef.current = setTimeout(() => {
      setShowWarning(true)
      setRemaining(WARNING_MS)
      warningRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1000) {
            if (warningRef.current) clearInterval(warningRef.current)
            onTimeout?.()
            return 0
          }
          return r - 1000
        })
      }, 1000)
    }, SESSION_MS - WARNING_MS)
  }

  useEffect(() => {
    if (sessionExtension) {
      setShowWarning(false)
      return
    }
    resetTimer()
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'] as const
    events.forEach((e) => window.addEventListener(e, resetTimer))
    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer))
      if (timerRef.current) clearTimeout(timerRef.current)
      if (warningRef.current) clearInterval(warningRef.current)
    }
  }, [sessionExtension])

  const extendSession = () => resetTimer()

  return { showWarning, remaining, extendSession, sessionExtension }
}
