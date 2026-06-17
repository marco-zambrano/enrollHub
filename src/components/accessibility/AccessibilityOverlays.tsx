import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAccessibilityStore } from '@/stores/accessibilityStore'

interface OverlayItem {
  id: string
  label: string
  top: number
  left: number
  target: HTMLElement | SVGElement
  className?: string
}

function isVisible(el: Element) {
  const rect = el.getBoundingClientRect()
  return (
    rect.width > 0 &&
    rect.height > 0 &&
    rect.bottom >= 0 &&
    rect.right >= 0 &&
    rect.top <= window.innerHeight &&
    rect.left <= window.innerWidth
  )
}

function shortText(text: string, fallback: string) {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (!clean) return fallback
  return clean.length > 80 ? `${clean.slice(0, 77)}...` : clean
}

function positionFor(el: Element) {
  const rect = el.getBoundingClientRect()
  return {
    top: Math.max(4, rect.top + 4),
    left: Math.max(4, rect.left + 4),
  }
}

function markerPositionsFor(elements: HTMLElement[]) {
  const markerSize = 24
  const gap = 8
  const minTop = 8
  const maxTop = Math.max(minTop, window.innerHeight - markerSize - 8)
  const raw = elements.map((el, index) => {
    const rect = el.getBoundingClientRect()
    const desiredTop = Math.max(minTop, Math.min(maxTop, rect.top + rect.height / 2 - markerSize / 2))
    const left = rect.left >= markerSize + gap + 8
      ? rect.left - markerSize - gap
      : rect.right + markerSize + gap <= window.innerWidth - 8
        ? rect.right + gap
        : 8

    return { el, index, desiredTop, left }
  })

  const sorted = [...raw].sort((a, b) => a.desiredTop - b.desiredTop)
  let lastTop = minTop - markerSize - 6
  const resolved = new Map<number, number>()

  sorted.forEach((item) => {
    const top = Math.min(maxTop, Math.max(item.desiredTop, lastTop + markerSize + 6))
    resolved.set(item.index, top)
    lastTop = top
  })

  const overflow = lastTop - maxTop
  if (overflow > 0) {
    let previous = minTop - markerSize - 6
    sorted.forEach((item) => {
      const shifted = Math.max(minTop, (resolved.get(item.index) ?? item.desiredTop) - overflow)
      const top = Math.max(shifted, previous + markerSize + 6)
      resolved.set(item.index, Math.min(top, maxTop))
      previous = resolved.get(item.index) ?? top
    })
  }

  return elements.map((el, index) => {
    const item = raw[index]

    return {
      id: `reading-marker-${index}`,
      label: String(index + 1),
      top: resolved.get(index) ?? item.desiredTop,
      left: Math.max(8, Math.min(window.innerWidth - markerSize - 8, item.left)),
      target: el,
    }
  })
}

function isInsideA11yOverlay(el: HTMLElement) {
  return Boolean(
    el.closest(
      '#accessibility-menu-panel, #chatbot-panel, [data-a11y-reading-panel], [data-a11y-tab-order-panel], [data-a11y-role-panel], [data-a11y-live-log], [data-a11y-image-panel]',
    ),
  )
}

function getReadingLabel(el: HTMLElement) {
  const tag = el.tagName.toLowerCase()
  const heading = el.matches('h1, h2, h3, h4, h5, h6') ? tag.toUpperCase() : tag
  return shortText(`${heading}: ${el.textContent || el.getAttribute('aria-label') || ''}`, `<${tag}>`)
}

function useOverlayItems(
  active: boolean,
  className: string,
  collect: () => OverlayItem[],
) {
  const [items, setItems] = useState<OverlayItem[]>([])

  useEffect(() => {
    if (!active) return

    const update = () => {
      document.querySelectorAll(`.${className}`).forEach((el) => el.classList.remove(className))
      const next = collect()
      next.forEach((item) => item.target.classList.add(className))
      setItems(next)
    }

    update()

    const observer = new MutationObserver(update)
    observer.observe(document.body, { childList: true, subtree: true })
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
      document.querySelectorAll(`.${className}`).forEach((el) => el.classList.remove(className))
    }
  }, [active, className, collect])

  return items
}

export function FocusMonitor() {
  const { t } = useTranslation()
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
      className="pointer-events-none fixed right-4 bottom-4 z-[9000] max-w-xs rounded-md border border-uni-border bg-white p-3 text-sm shadow-lg"
    >
      <p className="font-semibold text-uni-navy">{t('a11yFocusActive')}</p>
      <p className="mt-1 break-words text-uni-slate">{focused || t('a11yFocusNone')}</p>
    </div>
  )
}

export function ImageDescriptionsOverlay() {
  const { t } = useTranslation()
  const visible = useAccessibilityStore((s) => s.imageDescriptions)
  const collectItems = useCallback(() =>
    Array.from(document.querySelectorAll<HTMLElement | SVGElement>('img, svg'))
      .filter((el) => !el.closest('#accessibility-menu-panel'))
      .filter((el) => el.getAttribute('aria-hidden') !== 'true')
      .filter(isVisible)
      .map((el, index) => {
        const description =
          el.getAttribute('alt') ||
          el.getAttribute('aria-label') ||
          el.querySelector('title')?.textContent ||
          t('a11yImageNoDescription')
        return {
          id: `image-${index}`,
          label: shortText(`${t('a11yImageLabel')}: ${description}`, t('a11yImageNoDescription')),
          ...positionFor(el),
          target: el,
        }
      }),
    [t],
  )
  const items = useOverlayItems(visible, 'a11y-image-description-target', collectItems)

  if (!visible) return null

  return (
    <aside
      data-a11y-image-panel="true"
      aria-label={t('a11yImageDesc')}
      className="pointer-events-none fixed top-52 left-4 z-[9000] max-h-40 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-md border border-uni-border bg-white p-3 text-sm shadow-lg"
    >
      <h2 className="text-sm font-semibold text-uni-navy">{t('a11yImageDesc')}</h2>
      <p className="mt-1 text-xs text-uni-slate">{t('a11yImageDescCount', { count: items.length })}</p>
      <ol className="mt-2 max-h-24 space-y-1 overflow-hidden text-xs text-uni-slate">
        {items.slice(0, 6).map((item, index) => (
          <li key={item.id} className="truncate">
            {index + 1}. {item.label}
          </li>
        ))}
      </ol>
    </aside>
  )
}

export function ReadingOrderOverlay() {
  const visible = useAccessibilityStore((s) => s.readingOrderVisible)
  const collectItems = useCallback(() => {
    const candidates = Array.from(
      document.querySelectorAll<HTMLElement>(
        'section[aria-labelledby], article[aria-labelledby], form[aria-labelledby], h1, h2, h3, h4, h5, h6, main a[href], main button:not([disabled])',
      ),
    )
      .filter((el) => !isInsideA11yOverlay(el))
      .filter(isVisible)
      .filter((el) => {
        if (!el.matches('h1, h2, h3, h4, h5, h6')) return true
        const labelledContainer = el.closest<HTMLElement>('section[aria-labelledby], article[aria-labelledby], form[aria-labelledby]')
        if (!labelledContainer || !el.id) return true
        return !labelledContainer.getAttribute('aria-labelledby')?.split(/\s+/).includes(el.id)
      })

    const elements = candidates.filter((el, index) => candidates.indexOf(el) === index)
    const markers = markerPositionsFor(elements)

    return elements.map((el, index) => ({
        id: `reading-${index}`,
        label: getReadingLabel(el),
        top: markers[index].top,
        left: markers[index].left,
        target: el,
      }))
  }, [])
  const items = useOverlayItems(visible, 'a11y-reading-order-target', collectItems)

  if (!visible) return null

  return (
    <>
      {items.map((item, index) => (
        <div
          key={item.id}
          className="a11y-reading-order-marker"
          style={{ top: item.top, left: item.left }}
          aria-hidden="true"
        >
          {index + 1}
        </div>
      ))}
    </>
  )
}

function accessibleNameFor(el: HTMLElement) {
  const labelledBy = el.getAttribute('aria-labelledby')
  const labelledByText = labelledBy
    ?.split(/\s+/)
    .map((id) => document.getElementById(id)?.textContent || '')
    .join(' ')
  const labelText =
    labelledByText ||
    el.getAttribute('aria-label') ||
    (el instanceof HTMLInputElement && ['button', 'submit', 'reset'].includes(el.type) ? el.value : '') ||
    (el.id ? document.querySelector<HTMLLabelElement>(`label[for="${CSS.escape(el.id)}"]`)?.textContent : '') ||
    el.closest('label')?.textContent ||
    el.getAttribute('title') ||
    el.textContent ||
    ''

  return labelText.replace(/\s+/g, ' ').trim()
}

function readableTextFor(el: HTMLElement) {
  const value =
    accessibleNameFor(el) ||
    el.getAttribute('placeholder') ||
    el.getAttribute('alt') ||
    el.getAttribute('title') ||
    el.textContent ||
    ''

  return shortText(value, '')
}

export function ReadAloudController() {
  const { t } = useTranslation()
  const active = useAccessibilityStore((s) => s.readAloud)
  const language = useAccessibilityStore((s) => s.language)

  useEffect(() => {
    if (!active) {
      window.speechSynthesis?.cancel()
      return
    }

    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
      useAccessibilityStore.getState().addLiveRegionMessage(t('a11yReadAloudUnsupported'))
      return
    }

    let lastText = ''
    let lastAt = 0

    const speak = (text: string) => {
      const clean = text.replace(/\s+/g, ' ').trim()
      if (!clean) return
      const now = Date.now()
      if (clean === lastText && now - lastAt < 1200) return
      lastText = clean
      lastAt = now

      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(clean)
      utterance.lang = language === 'en' ? 'en-US' : 'es-ES'
      utterance.rate = 0.95
      window.speechSynthesis.speak(utterance)
      useAccessibilityStore.getState().addLiveRegionMessage(`${t('a11yReadAloudSpeaking')}: ${clean}`)
    }

    const speakSelection = () => {
      const selected = window.getSelection()?.toString() || ''
      if (selected.trim()) speak(selected)
    }

    const speakTarget = (event: Event) => {
      const target = event.target as HTMLElement | null
      if (!target || target.closest('[data-read-aloud-ignore="true"]')) return
      speak(readableTextFor(target))
    }

    document.addEventListener('focusin', speakTarget)
    document.addEventListener('click', speakTarget)
    document.addEventListener('mouseup', speakSelection)
    document.addEventListener('keyup', speakSelection)

    speak(t('a11yReadAloudEnabled'))

    return () => {
      document.removeEventListener('focusin', speakTarget)
      document.removeEventListener('click', speakTarget)
      document.removeEventListener('mouseup', speakSelection)
      document.removeEventListener('keyup', speakSelection)
      window.speechSynthesis.cancel()
    }
  }, [active, language, t])

  return null
}

function getTabOrderScope(): ParentNode {
  const visiblePanel = document.querySelector<HTMLElement>(
    '#accessibility-menu-panel, #chatbot-panel, [role="dialog"][aria-modal="true"]',
  )

  if (visiblePanel && isVisible(visiblePanel)) return visiblePanel

  return document
}

export function AccessibleNameCheckPanel() {
  const { t } = useTranslation()
  const visible = useAccessibilityStore((s) => s.accessibleNameCheck)
  const collectItems = useCallback(() =>
    Array.from(
      document.querySelectorAll<HTMLElement>(
        'a[href], button, input, select, textarea, [role="button"], [role="link"], [role="checkbox"], [role="radio"], [role="tab"], [role="menuitem"]',
      ),
    )
      .filter((el) => !el.closest('#accessibility-menu-panel'))
      .filter((el) => el.getAttribute('aria-hidden') !== 'true')
      .filter((el) => !(el instanceof HTMLInputElement && el.type === 'hidden'))
      .filter(isVisible)
      .filter((el) => accessibleNameFor(el).length === 0)
      .map((el, index) => ({
        id: `name-${index}`,
        label: `${t('a11yMissingName')}: <${el.tagName.toLowerCase()}>`,
        ...positionFor(el),
        target: el,
      })),
    [t],
  )
  const items = useOverlayItems(visible, 'a11y-name-warning-target', collectItems)

  if (!visible) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed top-52 right-4 z-[9000] max-w-xs rounded-md border border-uni-border bg-white p-3 text-sm shadow-lg"
    >
      <p className="font-semibold text-uni-navy">{t('a11yNames')}</p>
      <p className="mt-1 text-uni-slate">
        {items.length === 0
          ? t('a11yMissingNameNone')
          : t('a11yMissingNameCount', { count: items.length })}
      </p>
    </div>
  )
}

export function TabOrderOverlay() {
  const { t } = useTranslation()
  const visible = useAccessibilityStore((s) => s.tabOrderVisible)
  const collectItems = useCallback(() => {
    const scope = getTabOrderScope()
    return Array.from(
      scope.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    )
      .filter((el) => !el.closest('[data-a11y-tab-order-panel]'))
      .filter((el) => !el.closest('[aria-hidden="true"]'))
      .filter((el) => el.getAttribute('aria-hidden') !== 'true')
      .filter((el) => !(el instanceof HTMLInputElement && el.type === 'hidden'))
      .filter(isVisible)
      .map((el, index) => ({
        id: `tab-${index}`,
        label: shortText(accessibleNameFor(el), `<${el.tagName.toLowerCase()}>`),
        top: 0,
        left: 0,
        target: el,
      }))
  }, [])
  const items = useOverlayItems(visible, 'a11y-tab-order-target', collectItems)

  if (!visible) return null

  return (
    <aside
      data-a11y-tab-order-panel="true"
      aria-label={t('a11yTabOrder')}
      className="fixed bottom-4 left-4 z-[9000] max-h-48 w-80 max-w-[calc(100vw-2rem)] overflow-auto rounded-md border border-uni-border bg-white p-3 text-sm shadow-lg"
    >
      <h2 className="font-semibold text-uni-navy">{t('a11yTabOrder')}</h2>
      <p className="mt-1 text-xs text-uni-slate">{t('a11yTabOrderCount', { count: items.length })}</p>
      <ol className="mt-2 space-y-1 text-xs text-uni-slate">
        {items.map((item, index) => (
          <li key={item.id} className="flex gap-2">
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-uni-blue px-1 text-[0.65rem] font-bold text-white">
              {index + 1}
            </span>
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
          </li>
        ))}
      </ol>
    </aside>
  )
}

export function HeadingTreePanel() {
  const { t } = useTranslation()
  const visible = useAccessibilityStore((s) => s.headingTreeVisible)
  const menuOpen = useAccessibilityStore((s) => s.menuOpen)
  const [headings, setHeadings] = useState<Array<{ level: number; text: string }>>([])

  useEffect(() => {
    if (!visible) return
    const timer = window.setTimeout(() => {
      const els = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
      setHeadings(
        Array.from(els).map((el) => ({
          level: parseInt(el.tagName[1], 10),
          text: el.textContent?.trim() || '',
        })),
      )
    }, 0)
    return () => window.clearTimeout(timer)
  }, [visible])

  if (!visible) return null

  return (
    <aside
      className={`pointer-events-none fixed top-20 z-[7600] max-h-40 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-md border border-uni-border bg-white p-3 shadow-lg ${
        menuOpen ? 'left-4' : 'right-4'
      }`}
      aria-label={t('a11yHeadingTreeTitle')}
    >
      <h2 className="text-sm font-semibold text-uni-navy">{t('a11yHeadingTreeTitle')}</h2>
      <ul className="mt-2 max-h-24 space-y-1 overflow-hidden text-sm">
        {headings.slice(0, 6).map((h, i) => (
          <li key={i} style={{ paddingLeft: `${(h.level - 1) * 12}px` }}>
            <span className="text-uni-slate">H{h.level}:</span> {h.text}
          </li>
        ))}
      </ul>
    </aside>
  )
}

export function AriaRolesOverlay() {
  const { t } = useTranslation()
  const visible = useAccessibilityStore((s) => s.ariaRolesVisible)
  const collectItems = useCallback(() =>
    Array.from(document.querySelectorAll<HTMLElement>('[role]'))
      .filter((el) => !el.closest('[data-a11y-role-panel]'))
      .filter((el) => el.getAttribute('aria-hidden') !== 'true')
      .filter(isVisible)
      .map((el, index) => ({
        id: `role-${index}`,
        label: shortText(`role="${el.getAttribute('role') || ''}"`, t('a11yAriaRoles')),
        ...positionFor(el),
        target: el,
      })),
    [t],
  )
  const items = useOverlayItems(visible, 'a11y-role-target', collectItems)

  if (!visible) return null

  return (
    <div
      data-a11y-role-panel="true"
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 left-1/2 z-[9000] max-w-xs -translate-x-1/2 rounded-md border border-uni-border bg-white p-3 text-sm shadow-lg"
    >
      <p className="font-semibold text-uni-navy">{t('a11yAriaRoles')}</p>
      <p className="mt-1 text-uni-slate">{t('a11yAriaRolesCount', { count: items.length })}</p>
    </div>
  )
}

export function LiveRegionLogPanel() {
  const { t } = useTranslation()
  const visible = useAccessibilityStore((s) => s.liveRegionLogVisible)
  const log = useAccessibilityStore((s) => s.liveRegionLog)

  useEffect(() => {
    if (!visible) return

    let lastMessage = ''
    const addLiveMessage = useAccessibilityStore.getState().addLiveRegionMessage
    const readLiveRegions = () => {
      const regions = document.querySelectorAll<HTMLElement>(
        '[aria-live], [role="status"], [role="alert"], [role="log"]',
      )
      regions.forEach((region) => {
        if (region.closest('[data-a11y-live-log]')) return
        const message = region.textContent?.replace(/\s+/g, ' ').trim()
        if (!message || message === lastMessage) return
        lastMessage = message
        addLiveMessage(message)
      })
    }

    readLiveRegions()
    const observer = new MutationObserver(readLiveRegions)
    observer.observe(document.body, { childList: true, subtree: true, characterData: true })
    return () => observer.disconnect()
  }, [visible])

  if (!visible) return null

  return (
    <aside
      data-a11y-live-log="true"
      className="fixed top-20 left-4 z-[9000] max-h-28 w-80 max-w-[calc(100vw-2rem)] overflow-auto rounded-md border border-uni-border bg-white p-3 shadow-lg"
      aria-label={t('a11yLiveLogTitle')}
    >
      <h2 className="text-sm font-semibold text-uni-navy">{t('a11yLiveLogTitle')}</h2>
      <ul className="mt-2 space-y-1 text-xs text-uni-slate" role="log" aria-live="polite">
        {log.length === 0 ? (
          <li>{t('a11yLiveLogEmpty')}</li>
        ) : (
          log.map((msg, i) => <li key={i}>{msg}</li>)
        )}
      </ul>
    </aside>
  )
}

export function KeyboardModeIndicator() {
  const { t } = useTranslation()
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
      {t('a11yKeyboardMode')}
    </div>
  )
}

export function NoAutoContextChangeNotice() {
  const { t } = useTranslation()
  const active = useAccessibilityStore((s) => s.noAutoContextChange)

  useEffect(() => {
    if (!active) return

    const announce = (event: Event) => {
      const target = event.target as HTMLElement | null
      if (!target?.matches('select, input, textarea')) return
      useAccessibilityStore.getState().addLiveRegionMessage(t('a11yNoAutoActive'))
    }

    document.addEventListener('change', announce, true)
    return () => document.removeEventListener('change', announce, true)
  }, [active, t])

  if (!active) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed top-16 left-1/2 z-[9000] max-w-xs -translate-x-1/2 rounded-md border border-uni-border bg-white p-3 text-xs shadow-lg"
    >
      {t('a11yNoAutoActive')}
    </div>
  )
}
