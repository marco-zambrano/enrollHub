import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/lib/i18n'
import { useAccessibilityStore } from '@/stores/accessibilityStore'
import './index.css'
import App from './App.tsx'

useAccessibilityStore.getState().applyToDocument()
useAccessibilityStore.persist.onFinishHydration(() => {
  useAccessibilityStore.getState().applyToDocument()
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
