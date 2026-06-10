import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useAccessibilityStore,
  type AccessibilityPreferences,
} from '@/stores/accessibilityStore'

export function useAccessibility() {
  const store = useAccessibilityStore()
  const { i18n } = useTranslation()

  useEffect(() => {
    store.applyToDocument()
  }, [store])

  const setPreference = <K extends keyof AccessibilityPreferences>(
    key: K,
    value: AccessibilityPreferences[K],
  ) => {
    store.setPreference(key, value)
    if (key === 'language') {
      void i18n.changeLanguage(value as string)
      document.documentElement.lang = value as string
    }
  }

  return {
    ...store,
    setPreference,
  }
}
