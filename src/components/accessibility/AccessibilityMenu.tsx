import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Accessibility } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAccessibility } from '@/hooks/useAccessibility'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import {
  AriaRolesOverlay,
  AccessibleNameCheckPanel,
  FocusMonitor,
  HeadingTreePanel,
  ImageDescriptionsOverlay,
  KeyboardModeIndicator,
  LiveRegionLogPanel,
  NoAutoContextChangeNotice,
  ReadAloudController,
  ReadingOrderOverlay,
  TabOrderOverlay,
} from './AccessibilityOverlays'
import type { ColorblindMode, FocusStyle } from '@/stores/accessibilityStore'

function ToggleRow({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string
  label: string
  description?: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <div>
        <label htmlFor={id} className="text-sm font-medium text-uni-navy">
          {label}
        </label>
        {description && (
          <p id={`${id}-desc`} className="text-xs text-uni-slate">
            {description}
          </p>
        )}
      </div>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-describedby={description ? `${id}-desc` : undefined}
        className="mt-1 h-5 w-5 shrink-0 accent-uni-blue"
      />
    </div>
  )
}

function Section({
  title,
  criterion,
  children,
}: {
  title: string
  criterion: string
  children: React.ReactNode
}) {
  return (
    <details className="border-b border-uni-border" open>
      <summary className="cursor-pointer px-4 py-3 font-display text-sm font-semibold text-uni-navy">
        {title}
        <span className="ml-2 text-xs font-normal text-uni-slate">({criterion})</span>
      </summary>
      <div className="space-y-1 px-4 pb-4">{children}</div>
    </details>
  )
}

export function AccessibilityMenu() {
  const { t } = useTranslation()
  const panelRef = useRef<HTMLElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const {
    menuOpen,
    setMenuOpen,
    setPreference,
    highContrast,
    fontScale,
    colorblindMode,
    imageDescriptions,
    readAloud,
    showHeadings,
    readingOrderVisible,
    keyboardModeIndicator,
    focusMonitor,
    sessionExtension,
    reduceMotion,
    tabOrderVisible,
    highlightLinks,
    headingTreeVisible,
    focusStyle,
    accessibleNameCheck,
    characterKeyShortcuts,
    language,
    noAutoContextChange,
    showErrors,
    showHints,
    expandedErrorSuggestions,
    confirmationMode,
    ariaRolesVisible,
    liveRegionLogVisible,
  } = useAccessibility()

  useFocusTrap(panelRef, menuOpen, () => {
    setMenuOpen(false)
    triggerRef.current?.focus()
  })

  return (
    <>
      <Button
        ref={triggerRef}
        className="fixed right-4 bottom-4 z-[8000] h-14 w-14 rounded-full shadow-lg"
        size="icon"
        aria-label={t('a11yOpenMenu')}
        aria-expanded={menuOpen}
        aria-controls="accessibility-menu-panel"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <Accessibility className="h-6 w-6" aria-hidden="true" />
      </Button>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-[8001] bg-black/20"
            aria-hidden="true"
            onClick={() => setMenuOpen(false)}
          />
          <aside
            ref={panelRef}
            id="accessibility-menu-panel"
            role="complementary"
            aria-label={t('a11yTitle')}
            className="fixed top-0 right-0 z-[8002] flex h-full w-full max-w-sm flex-col border-l border-uni-border bg-white shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-uni-border px-4 py-4">
              <h2 className="font-display text-lg font-bold text-uni-navy">
                {t('a11yTitle')}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMenuOpen(false)}
                aria-label={t('a11yCloseMenu')}
              >
                {t('close')}
              </Button>
            </header>

            <div className="flex-1 overflow-y-auto">
              <Section title={t('a11yPerceptible')} criterion={t('a11yPrinciple', { n: 1 })}>
                <ToggleRow
                  id="a11y-image-desc"
                  label={t('a11yImageDesc')}
                  description={t('a11yImageDescHint')}
                  checked={imageDescriptions}
                  onChange={(v) => setPreference('imageDescriptions', v)}
                />
                <ToggleRow
                  id="a11y-read-aloud"
                  label={t('a11yReadAloud')}
                  description={t('a11yReadAloudHint')}
                  checked={readAloud}
                  onChange={(v) => setPreference('readAloud', v)}
                />
                <ToggleRow
                  id="a11y-headings"
                  label={t('a11yHeadings')}
                  description={t('a11yHeadingsHint')}
                  checked={showHeadings}
                  onChange={(v) => setPreference('showHeadings', v)}
                />
                <ToggleRow
                  id="a11y-reading-order"
                  label={t('a11yReadingOrder')}
                  description={t('a11yReadingOrderHint')}
                  checked={readingOrderVisible}
                  onChange={(v) => setPreference('readingOrderVisible', v)}
                />
                <div className="py-2">
                  <label htmlFor="a11y-colorblind" className="text-sm font-medium text-uni-navy">
                    {t('a11yColorblind')}
                  </label>
                  <select
                    id="a11y-colorblind"
                    value={colorblindMode}
                    onChange={(e) =>
                      setPreference('colorblindMode', e.target.value as ColorblindMode)
                    }
                    className="mt-1 w-full rounded-md border border-uni-border p-2 text-sm"
                  >
                    <option value="none">{t('a11yColorblindNone')}</option>
                    <option value="protanopia">Protanopia</option>
                    <option value="deuteranopia">Deuteranopia</option>
                    <option value="tritanopia">Tritanopia</option>
                  </select>
                </div>
                <ToggleRow
                  id="a11y-contrast"
                  label={t('a11yContrast')}
                  description={t('a11yContrastHint')}
                  checked={highContrast}
                  onChange={(v) => setPreference('highContrast', v)}
                />
                <div className="py-2">
                  <label htmlFor="a11y-font-scale" className="text-sm font-medium text-uni-navy">
                    {t('a11yFontScale', { scale: fontScale })}
                  </label>
                  <input
                    id="a11y-font-scale"
                    type="range"
                    min={100}
                    max={200}
                    step={10}
                    value={fontScale}
                    onChange={(e) => setPreference('fontScale', Number(e.target.value))}
                    className="mt-2 w-full accent-uni-blue"
                    aria-valuemin={100}
                    aria-valuemax={200}
                    aria-valuenow={fontScale}
                  />
                </div>
              </Section>

              <Section title={t('a11yOperable')} criterion={t('a11yPrinciple', { n: 2 })}>
                <ToggleRow
                  id="a11y-shortcuts"
                  label={t('a11yShortcuts')}
                  description={t('a11yShortcutsHint')}
                  checked={characterKeyShortcuts}
                  onChange={(v) => setPreference('characterKeyShortcuts', v)}
                />
                <ToggleRow
                  id="a11y-keyboard"
                  label={t('a11yKeyboard')}
                  description={t('a11yKeyboardHint')}
                  checked={keyboardModeIndicator}
                  onChange={(v) => setPreference('keyboardModeIndicator', v)}
                />
                <ToggleRow
                  id="a11y-focus-monitor"
                  label={t('a11yFocusMonitor')}
                  description={t('a11yFocusMonitorHint')}
                  checked={focusMonitor}
                  onChange={(v) => setPreference('focusMonitor', v)}
                />
                <ToggleRow
                  id="a11y-session"
                  label={t('a11ySession')}
                  description={t('a11ySessionHint')}
                  checked={sessionExtension}
                  onChange={(v) => setPreference('sessionExtension', v)}
                />
                <ToggleRow
                  id="a11y-motion"
                  label={t('a11yMotion')}
                  description={t('a11yMotionHint')}
                  checked={reduceMotion}
                  onChange={(v) => setPreference('reduceMotion', v)}
                />
                <ToggleRow
                  id="a11y-tab-order"
                  label={t('a11yTabOrder')}
                  description={t('a11yTabOrderHint')}
                  checked={tabOrderVisible}
                  onChange={(v) => setPreference('tabOrderVisible', v)}
                />
                <ToggleRow
                  id="a11y-links"
                  label={t('a11yLinks')}
                  description={t('a11yLinksHint')}
                  checked={highlightLinks}
                  onChange={(v) => setPreference('highlightLinks', v)}
                />
                <ToggleRow
                  id="a11y-heading-tree"
                  label={t('a11yHeadingTree')}
                  description={t('a11yHeadingTreeHint')}
                  checked={headingTreeVisible}
                  onChange={(v) => setPreference('headingTreeVisible', v)}
                />
                <div className="py-2">
                  <label htmlFor="a11y-focus-style" className="text-sm font-medium text-uni-navy">
                    {t('a11yFocusStyle')}
                  </label>
                  <select
                    id="a11y-focus-style"
                    value={focusStyle}
                    onChange={(e) =>
                      setPreference('focusStyle', e.target.value as FocusStyle)
                    }
                    className="mt-1 w-full rounded-md border border-uni-border p-2 text-sm"
                  >
                    <option value="default">{t('a11yFocusDefault')}</option>
                    <option value="thick">{t('a11yFocusThick')}</option>
                    <option value="yellow">{t('a11yFocusYellow')}</option>
                    <option value="green">{t('a11yFocusGreen')}</option>
                  </select>
                </div>
                <ToggleRow
                  id="a11y-names"
                  label={t('a11yNames')}
                  description={t('a11yNamesHint')}
                  checked={accessibleNameCheck}
                  onChange={(v) => setPreference('accessibleNameCheck', v)}
                />
              </Section>

              <Section title={t('a11yComprehensible')} criterion={t('a11yPrinciple', { n: 3 })}>
                <div className="py-2">
                  <label htmlFor="a11y-lang" className="text-sm font-medium text-uni-navy">
                    {t('a11yLang')}
                  </label>
                  <select
                    id="a11y-lang"
                    value={language}
                    onChange={(e) =>
                      setPreference('language', e.target.value as 'es' | 'en')
                    }
                    className="mt-1 w-full rounded-md border border-uni-border p-2 text-sm"
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <ToggleRow
                  id="a11y-no-auto"
                  label={t('a11yNoAuto')}
                  description={t('a11yNoAutoHint')}
                  checked={noAutoContextChange}
                  onChange={(v) => setPreference('noAutoContextChange', v)}
                />
                <ToggleRow
                  id="a11y-errors"
                  label={t('a11yErrors')}
                  description={t('a11yErrorsHint')}
                  checked={showErrors}
                  onChange={(v) => setPreference('showErrors', v)}
                />
                <ToggleRow
                  id="a11y-hints"
                  label={t('a11yHints')}
                  description={t('a11yHintsHint')}
                  checked={showHints}
                  onChange={(v) => setPreference('showHints', v)}
                />
                <ToggleRow
                  id="a11y-suggestions"
                  label={t('a11ySuggestions')}
                  description={t('a11ySuggestionsHint')}
                  checked={expandedErrorSuggestions}
                  onChange={(v) => setPreference('expandedErrorSuggestions', v)}
                />
                <ToggleRow
                  id="a11y-confirm"
                  label={t('a11yConfirm')}
                  description={t('a11yConfirmHint')}
                  checked={confirmationMode}
                  onChange={(v) => setPreference('confirmationMode', v)}
                />
              </Section>

              <Section title={t('a11yRobust')} criterion={t('a11yPrinciple', { n: 4 })}>
                <ToggleRow
                  id="a11y-aria-roles"
                  label={t('a11yAriaRoles')}
                  description={t('a11yAriaRolesHint')}
                  checked={ariaRolesVisible}
                  onChange={(v) => setPreference('ariaRolesVisible', v)}
                />
                <ToggleRow
                  id="a11y-live-log"
                  label={t('a11yLiveLog')}
                  description={t('a11yLiveLogHint')}
                  checked={liveRegionLogVisible}
                  onChange={(v) => setPreference('liveRegionLogVisible', v)}
                />
              </Section>
            </div>
          </aside>
        </>
      )}

      <FocusMonitor />
      <ReadAloudController />
      <ImageDescriptionsOverlay />
      <ReadingOrderOverlay />
      <TabOrderOverlay />
      <HeadingTreePanel />
      <AccessibleNameCheckPanel />
      <AriaRolesOverlay />
      <LiveRegionLogPanel />
      <KeyboardModeIndicator />
      <NoAutoContextChangeNotice />
    </>
  )
}
