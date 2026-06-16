import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SkipLink } from './SkipLink'
import { Header } from './Header'
import { AccessibilityMenu } from '@/components/accessibility/AccessibilityMenu'
import { ChatbotWidget } from '@/components/chatbot/ChatbotWidget'

export function AppLayout() {
  const { t } = useTranslation()

  return (
    <>
      <SkipLink />
      <div className="flex min-h-svh flex-col">
        <Header />
        <main id="main-content" className="flex-1" tabIndex={-1}>
          <Outlet />
        </main>
        <footer className="border-t border-uni-border bg-uni-gray px-4 py-6 text-center text-sm text-uni-slate">
          <p>
            {t('footerText', { year: new Date().getFullYear() })}
          </p>
        </footer>
      </div>
      <AccessibilityMenu />
      <ChatbotWidget />
      {/* SVG filters for colorblind modes */}
      <svg className="sr-only" aria-hidden="true">
        <defs>
          <filter id="protanopia-filter">
            <feColorMatrix type="matrix" values="0.567,0.433,0,0,0 0.558,0.442,0,0,0 0,0.242,0.758,0,0 0,0,0,1,0" />
          </filter>
          <filter id="deuteranopia-filter">
            <feColorMatrix type="matrix" values="0.625,0.375,0,0,0 0.7,0.3,0,0,0 0,0.3,0.7,0,0 0,0,0,1,0" />
          </filter>
          <filter id="tritanopia-filter">
            <feColorMatrix type="matrix" values="0.95,0.05,0,0,0 0,0.433,0.567,0,0 0,0.475,0.525,0,0 0,0,0,1,0" />
          </filter>
        </defs>
      </svg>
    </>
  )
}
