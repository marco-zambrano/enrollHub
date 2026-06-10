import { useEffect, useState } from 'react'
import { useAccessibilityStore } from '@/stores/accessibilityStore'

export function FocusMonitor() {
  const active = useAccessibilityStore((s) => s.focusMonitor)
  const [focused, setFocused] = useState('')

  useEffect(() => {
    if (!active) return
    const handler = () => {
      const el = document.activeElement
      if (!el || el === document.body) {
        setFocused('')
        return
      }
      const tag = el.tagName.toLowerCase()
      const label =
        el.getAttribute('aria-label') ||
        (el as HTMLElement).innerText?.slice(0, 40) ||
        el.getAttribute('id') ||
        tag
      setFocused(`<${tag}> ${label}`)
    }
    document.addEventListener('focusin', handler)
    return () => document.removeEventListener('focusin', handler)
  }, [active])

  if (!active) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 left-4 z-[9000] max-w-xs rounded-md border border-uni-border bg-white p-3 text-sm shadow-lg"
    >
      <p className="font-semibold text-uni-navy">Foco activo</p>
      <p className="mt-1 break-words text-uni-slate">{focused || 'Ninguno'}</p>
    </div>
  )
}

export function TabOrderOverlay() {
  const visible = useAccessibilityStore((s) => s.tabOrderVisible)

  useEffect(() => {
    if (!visible) return
    const focusable = document.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )
    focusable.forEach((el, i) => {
      el.dataset.tabOrder = String(i + 1)
      el.classList.add('tab-order-marker')
    })
    return () => {
      focusable.forEach((el) => {
        delete el.dataset.tabOrder
        el.classList.remove('tab-order-marker')
      })
    }
  }, [visible])

  if (!visible) return null

  return (
    <style>{`
      .tab-order-marker::before {
        content: attr(data-tab-order);
        position: absolute;
        top: -8px;
        left: -8px;
        background: #2563eb;
        color: white;
        font-size: 10px;
        font-weight: bold;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        pointer-events: none;
      }
      .tab-order-marker { position: relative; }
    `}</style>
  )
}

export function HeadingTreePanel() {
  const visible = useAccessibilityStore((s) => s.headingTreeVisible)
  const [headings, setHeadings] = useState<Array<{ level: number; text: string }>>([])

  useEffect(() => {
    if (!visible) return
    const els = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    setHeadings(
      Array.from(els).map((el) => ({
        level: parseInt(el.tagName[1], 10),
        text: el.textContent?.trim() || '',
      })),
    )
  }, [visible])

  if (!visible) return null

  return (
    <aside
      className="fixed bottom-20 right-80 z-[9000] max-h-64 w-72 overflow-auto rounded-md border border-uni-border bg-white p-3 shadow-lg"
      aria-label="Árbol de encabezados"
    >
      <h2 className="text-sm font-semibold text-uni-navy">Encabezados de la página</h2>
      <ul className="mt-2 space-y-1 text-sm">
        {headings.map((h, i) => (
          <li key={i} style={{ paddingLeft: `${(h.level - 1) * 12}px` }}>
            <span className="text-uni-slate">H{h.level}:</span> {h.text}
          </li>
        ))}
      </ul>
    </aside>
  )
}

export function AriaRolesOverlay() {
  const visible = useAccessibilityStore((s) => s.ariaRolesVisible)

  useEffect(() => {
    if (!visible) return
    const els = document.querySelectorAll('[role]')
    els.forEach((el) => el.classList.add('aria-role-highlight'))
    return () => els.forEach((el) => el.classList.remove('aria-role-highlight'))
  }, [visible])

  if (!visible) return null

  return (
    <style>{`
      .aria-role-highlight::after {
        content: attr(role);
        position: absolute;
        top: 0;
        right: 0;
        background: #7c3aed;
        color: white;
        font-size: 9px;
        padding: 1px 4px;
        border-radius: 2px;
        pointer-events: none;
      }
      .aria-role-highlight { position: relative; }
    `}</style>
  )
}

export function LiveRegionLogPanel() {
  const visible = useAccessibilityStore((s) => s.liveRegionLogVisible)
  const log = useAccessibilityStore((s) => s.liveRegionLog)

  if (!visible) return null

  return (
    <aside
      className="fixed bottom-20 left-4 z-[9000] max-h-48 w-80 overflow-auto rounded-md border border-uni-border bg-white p-3 shadow-lg"
      aria-label="Historial de mensajes aria-live"
    >
      <h2 className="text-sm font-semibold text-uni-navy">Log aria-live</h2>
      <ul className="mt-2 space-y-1 text-xs text-uni-slate" role="log" aria-live="polite">
        {log.length === 0 ? (
          <li>Sin mensajes aún</li>
        ) : (
          log.map((msg, i) => <li key={i}>{msg}</li>)
        )}
      </ul>
    </aside>
  )
}

export function KeyboardModeIndicator() {
  const active = useAccessibilityStore((s) => s.keyboardModeIndicator)
  const [keyboard, setKeyboard] = useState(false)

  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') setKeyboard(true)
    }
    const onMouse = () => setKeyboard(false)
    window.addEventListener('keydown', onKey)
    window.addEventListener('mousedown', onMouse)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('mousedown', onMouse)
    }
  }, [active])

  if (!active || !keyboard) return null

  return (
    <div
      className="fixed top-16 left-1/2 z-[9000] -translate-x-1/2 rounded-full bg-uni-navy px-4 py-1 text-xs font-medium text-white"
      role="status"
      aria-live="polite"
    >
      Modo teclado activo
    </div>
  )
}
