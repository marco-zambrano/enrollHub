import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'
import {
  useAccessibilityStore,
  type AccessibilityPreferences,
} from '@/stores/accessibilityStore'

export function useAccessibility() {
  const { i18n } = useTranslation()

  const prefs = useAccessibilityStore(
    useShallow((s) => ({
      imageDescriptions: s.imageDescriptions,
      showHeadings: s.showHeadings,
      readingOrderVisible: s.readingOrderVisible,
      colorblindMode: s.colorblindMode,
      highContrast: s.highContrast,
      fontScale: s.fontScale,
      keyboardModeIndicator: s.keyboardModeIndicator,
      focusMonitor: s.focusMonitor,
      sessionExtension: s.sessionExtension,
      reduceMotion: s.reduceMotion,
      tabOrderVisible: s.tabOrderVisible,
      highlightLinks: s.highlightLinks,
      headingTreeVisible: s.headingTreeVisible,
      focusStyle: s.focusStyle,
      accessibleNameCheck: s.accessibleNameCheck,
      characterKeyShortcuts: s.characterKeyShortcuts,
      language: s.language,
      noAutoContextChange: s.noAutoContextChange,
      showErrors: s.showErrors,
      showHints: s.showHints,
      expandedErrorSuggestions: s.expandedErrorSuggestions,
      confirmationMode: s.confirmationMode,
      ariaRolesVisible: s.ariaRolesVisible,
      liveRegionLogVisible: s.liveRegionLogVisible,
      menuOpen: s.menuOpen,
    })),
  )

  const setMenuOpen = useAccessibilityStore((s) => s.setMenuOpen)
  const storeSetPreference = useAccessibilityStore((s) => s.setPreference)

  const setPreference = useCallback(
    <K extends keyof AccessibilityPreferences>(
      key: K,
      value: AccessibilityPreferences[K],
    ) => {
      storeSetPreference(key, value)
      if (key === 'language') {
        void i18n.changeLanguage(value as string)
        document.documentElement.lang = value as string
      }
    },
    [storeSetPreference, i18n],
  )

  return {
    ...prefs,
    setPreference,
    setMenuOpen,
  }
}
