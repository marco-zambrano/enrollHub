import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import i18n from '@/lib/i18n'
import { useAccessibilityStore } from '@/stores/accessibilityStore'
import './index.css'
import App from './App.tsx'

useAccessibilityStore.getState().applyToDocument()
useAccessibilityStore.persist.onFinishHydration(() => {
  const state = useAccessibilityStore.getState()
  state.applyToDocument()
  void i18n.changeLanguage(state.language)
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
