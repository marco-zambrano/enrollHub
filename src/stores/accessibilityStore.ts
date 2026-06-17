import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ColorblindMode = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia'
export type FocusStyle = 'default' | 'thick' | 'yellow' | 'green'

export interface AccessibilityPreferences {
  // Perceptible
  imageDescriptions: boolean
  readAloud: boolean
  showHeadings: boolean
  readingOrderVisible: boolean
  colorblindMode: ColorblindMode
  highContrast: boolean
  fontScale: number

  // Operable
  keyboardModeIndicator: boolean
  focusMonitor: boolean
  sessionExtension: boolean
  reduceMotion: boolean
  tabOrderVisible: boolean
  highlightLinks: boolean
  headingTreeVisible: boolean
  focusStyle: FocusStyle
  accessibleNameCheck: boolean
  characterKeyShortcuts: boolean

  // Comprehensible
  language: 'es' | 'en'
  noAutoContextChange: boolean
  showErrors: boolean
  showHints: boolean
  expandedErrorSuggestions: boolean
  confirmationMode: boolean

  // Robustez
  ariaRolesVisible: boolean
  liveRegionLogVisible: boolean

  // Menu state
  menuOpen: boolean
}

interface AccessibilityState extends AccessibilityPreferences {
  liveRegionLog: string[]
  setPreference: <K extends keyof AccessibilityPreferences>(
    key: K,
    value: AccessibilityPreferences[K],
  ) => void
  toggleMenu: () => void
  setMenuOpen: (open: boolean) => void
  addLiveRegionMessage: (message: string) => void
  applyToDocument: () => void
}

const defaults: AccessibilityPreferences = {
  imageDescriptions: false,
  readAloud: false,
  showHeadings: false,
  readingOrderVisible: false,
  colorblindMode: 'none',
  highContrast: false,
  fontScale: 100,
  keyboardModeIndicator: false,
  focusMonitor: false,
  sessionExtension: false,
  reduceMotion: false,
  tabOrderVisible: false,
  highlightLinks: false,
  headingTreeVisible: false,
  focusStyle: 'default',
  accessibleNameCheck: false,
  characterKeyShortcuts: false,
  language: 'es',
  noAutoContextChange: false,
  showErrors: false,
  showHints: false,
  expandedErrorSuggestions: false,
  confirmationMode: true,
  ariaRolesVisible: false,
  liveRegionLogVisible: false,
  menuOpen: false,
}

function setBooleanAttribute(element: HTMLElement, name: string, value: boolean) {
  if (value) {
    element.setAttribute(name, 'true')
  } else {
    element.removeAttribute(name)
  }
}

export const useAccessibilityStore = create<AccessibilityState>()(
  persist(
    (set, get) => ({
      ...defaults,
      liveRegionLog: [],

      setPreference: (key, value) => {
        set({ [key]: value } as Partial<AccessibilityState>)
        get().applyToDocument()
      },

      toggleMenu: () => set((s) => ({ menuOpen: !s.menuOpen })),

      setMenuOpen: (open) => set({ menuOpen: open }),

      addLiveRegionMessage: (message) =>
        set((s) => ({
          liveRegionLog: [...s.liveRegionLog.slice(-19), message],
        })),

      applyToDocument: () => {
        const s = get()
        const html = document.documentElement

        html.lang = s.language
        html.style.setProperty('--font-scale', String(s.fontScale / 100))

        setBooleanAttribute(html, 'data-high-contrast', s.highContrast)
        setBooleanAttribute(html, 'data-highlight-links', s.highlightLinks)
        setBooleanAttribute(html, 'data-reduce-motion', s.reduceMotion)
        setBooleanAttribute(html, 'data-show-errors', s.showErrors)
        setBooleanAttribute(html, 'data-show-hints', s.showHints)
        setBooleanAttribute(html, 'data-show-headings', s.showHeadings)
        setBooleanAttribute(html, 'data-keyboard-mode', s.keyboardModeIndicator)
        setBooleanAttribute(html, 'data-image-descriptions', s.imageDescriptions)
        setBooleanAttribute(html, 'data-read-aloud', s.readAloud)
        setBooleanAttribute(html, 'data-tab-order', s.tabOrderVisible)
        setBooleanAttribute(html, 'data-reading-order', s.readingOrderVisible)
        setBooleanAttribute(html, 'data-accessible-name-check', s.accessibleNameCheck)
        setBooleanAttribute(html, 'data-no-auto-context-change', s.noAutoContextChange)

        if (s.colorblindMode === 'none') {
          html.removeAttribute('data-colorblind')
        } else {
          html.setAttribute('data-colorblind', s.colorblindMode)
        }

        if (s.focusStyle === 'default') {
          html.removeAttribute('data-focus-style')
        } else {
          html.setAttribute('data-focus-style', s.focusStyle)
        }
      },
    }),
    {
      name: 'enrollhub-a11y-prefs',
      partialize: (state) => {
        const excluded = new Set([
          'menuOpen',
          'liveRegionLog',
          'setPreference',
          'toggleMenu',
          'setMenuOpen',
          'addLiveRegionMessage',
          'applyToDocument',
        ])
        return Object.fromEntries(
          Object.entries(state).filter(([key]) => !excluded.has(key)),
        ) as AccessibilityPreferences
      },
    },
  ),
)
