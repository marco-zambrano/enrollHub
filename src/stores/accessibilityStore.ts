import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ColorblindMode = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia'
export type FocusStyle = 'default' | 'thick' | 'yellow' | 'green'

export interface AccessibilityPreferences {
  // Perceptible
  imageDescriptions: boolean
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

        html.toggleAttribute('data-high-contrast', s.highContrast)
        html.toggleAttribute('data-highlight-links', s.highlightLinks)
        html.toggleAttribute('data-reduce-motion', s.reduceMotion)
        html.toggleAttribute('data-show-errors', s.showErrors)
        html.toggleAttribute('data-show-hints', s.showHints)
        html.toggleAttribute('data-show-headings', s.showHeadings)
        html.toggleAttribute('data-keyboard-mode', s.keyboardModeIndicator)
        html.toggleAttribute('data-image-descriptions', s.imageDescriptions)

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
        const {
          menuOpen: _menuOpen,
          liveRegionLog: _liveRegionLog,
          setPreference: _setPreference,
          toggleMenu: _toggleMenu,
          setMenuOpen: _setMenuOpen,
          addLiveRegionMessage: _addLiveRegionMessage,
          applyToDocument: _applyToDocument,
          ...prefs
        } = state
        return prefs
      },
    },
  ),
)
