import { useRef } from 'react'
import { Accessibility } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAccessibility } from '@/hooks/useAccessibility'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import {
  AriaRolesOverlay,
  FocusMonitor,
  HeadingTreePanel,
  KeyboardModeIndicator,
  LiveRegionLogPanel,
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
        aria-label="Abrir menú de accesibilidad"
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
            aria-label="Menú de accesibilidad"
            className="fixed top-0 right-0 z-[8002] flex h-full w-full max-w-sm flex-col border-l border-uni-border bg-white shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-uni-border px-4 py-4">
              <h2 className="font-display text-lg font-bold text-uni-navy">
                Accesibilidad
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMenuOpen(false)}
                aria-label="Cerrar menú de accesibilidad"
              >
                Cerrar
              </Button>
            </header>

            <div className="flex-1 overflow-y-auto">
              <Section title="Perceptible" criterion="Principio 1">
                <ToggleRow
                  id="a11y-image-desc"
                  label="Descripción de imágenes"
                  description="WCAG 1.1.1 — Activar descripciones en voz alta"
                  checked={imageDescriptions}
                  onChange={(v) => setPreference('imageDescriptions', v)}
                />
                <ToggleRow
                  id="a11y-headings"
                  label="Indicador de encabezados"
                  description="WCAG 1.3.1 — Resaltar encabezados activos"
                  checked={showHeadings}
                  onChange={(v) => setPreference('showHeadings', v)}
                />
                <ToggleRow
                  id="a11y-reading-order"
                  label="Orden de lectura"
                  description="WCAG 1.3.2 — Mostrar secuencia del DOM"
                  checked={readingOrderVisible}
                  onChange={(v) => setPreference('readingOrderVisible', v)}
                />
                <div className="py-2">
                  <label htmlFor="a11y-colorblind" className="text-sm font-medium text-uni-navy">
                    Modo daltónico (1.4.1)
                  </label>
                  <select
                    id="a11y-colorblind"
                    value={colorblindMode}
                    onChange={(e) =>
                      setPreference('colorblindMode', e.target.value as ColorblindMode)
                    }
                    className="mt-1 w-full rounded-md border border-uni-border p-2 text-sm"
                  >
                    <option value="none">Ninguno</option>
                    <option value="protanopia">Protanopia</option>
                    <option value="deuteranopia">Deuteranopia</option>
                    <option value="tritanopia">Tritanopia</option>
                  </select>
                </div>
                <ToggleRow
                  id="a11y-contrast"
                  label="Alto contraste"
                  description="WCAG 1.4.3 — Fondo negro, texto blanco"
                  checked={highContrast}
                  onChange={(v) => setPreference('highContrast', v)}
                />
                <div className="py-2">
                  <label htmlFor="a11y-font-scale" className="text-sm font-medium text-uni-navy">
                    Tamaño de fuente: {fontScale}% (1.4.4)
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

              <Section title="Operable" criterion="Principio 2">
                <ToggleRow
                  id="a11y-keyboard"
                  label="Indicador modo teclado"
                  description="WCAG 2.1.1"
                  checked={keyboardModeIndicator}
                  onChange={(v) => setPreference('keyboardModeIndicator', v)}
                />
                <ToggleRow
                  id="a11y-focus-monitor"
                  label="Monitor de foco"
                  description="WCAG 2.1.2 — Sin trampas de foco"
                  checked={focusMonitor}
                  onChange={(v) => setPreference('focusMonitor', v)}
                />
                <ToggleRow
                  id="a11y-session"
                  label="Extender sesión"
                  description="WCAG 2.2.1 — Desactivar timeout"
                  checked={sessionExtension}
                  onChange={(v) => setPreference('sessionExtension', v)}
                />
                <ToggleRow
                  id="a11y-motion"
                  label="Detener animaciones"
                  description="WCAG 2.2.2"
                  checked={reduceMotion}
                  onChange={(v) => setPreference('reduceMotion', v)}
                />
                <ToggleRow
                  id="a11y-tab-order"
                  label="Orden de tabulación"
                  description="WCAG 2.4.3"
                  checked={tabOrderVisible}
                  onChange={(v) => setPreference('tabOrderVisible', v)}
                />
                <ToggleRow
                  id="a11y-links"
                  label="Destacar enlaces"
                  description="WCAG 2.4.4"
                  checked={highlightLinks}
                  onChange={(v) => setPreference('highlightLinks', v)}
                />
                <ToggleRow
                  id="a11y-heading-tree"
                  label="Árbol de encabezados"
                  description="WCAG 2.4.6"
                  checked={headingTreeVisible}
                  onChange={(v) => setPreference('headingTreeVisible', v)}
                />
                <div className="py-2">
                  <label htmlFor="a11y-focus-style" className="text-sm font-medium text-uni-navy">
                    Estilo de foco (2.4.7)
                  </label>
                  <select
                    id="a11y-focus-style"
                    value={focusStyle}
                    onChange={(e) =>
                      setPreference('focusStyle', e.target.value as FocusStyle)
                    }
                    className="mt-1 w-full rounded-md border border-uni-border p-2 text-sm"
                  >
                    <option value="default">Predeterminado</option>
                    <option value="thick">Contorno grueso</option>
                    <option value="yellow">Amarillo</option>
                    <option value="green">Verde</option>
                  </select>
                </div>
                <ToggleRow
                  id="a11y-names"
                  label="Verificar nombres accesibles"
                  description="WCAG 2.5.3"
                  checked={accessibleNameCheck}
                  onChange={(v) => setPreference('accessibleNameCheck', v)}
                />
              </Section>

              <Section title="Comprensible" criterion="Principio 3">
                <div className="py-2">
                  <label htmlFor="a11y-lang" className="text-sm font-medium text-uni-navy">
                    Idioma (3.1.1)
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
                  label="Sin cambios automáticos"
                  description="WCAG 3.2.2"
                  checked={noAutoContextChange}
                  onChange={(v) => setPreference('noAutoContextChange', v)}
                />
                <ToggleRow
                  id="a11y-errors"
                  label="Destacar errores"
                  description="WCAG 3.3.1"
                  checked={showErrors}
                  onChange={(v) => setPreference('showErrors', v)}
                />
                <ToggleRow
                  id="a11y-hints"
                  label="Mostrar instrucciones"
                  description="WCAG 3.3.2"
                  checked={showHints}
                  onChange={(v) => setPreference('showHints', v)}
                />
                <ToggleRow
                  id="a11y-suggestions"
                  label="Sugerencias expandidas"
                  description="WCAG 3.3.3"
                  checked={expandedErrorSuggestions}
                  onChange={(v) => setPreference('expandedErrorSuggestions', v)}
                />
                <ToggleRow
                  id="a11y-confirm"
                  label="Confirmación en envíos críticos"
                  description="WCAG 3.3.4"
                  checked={confirmationMode}
                  onChange={(v) => setPreference('confirmationMode', v)}
                />
              </Section>

              <Section title="Robustez" criterion="Principio 4">
                <ToggleRow
                  id="a11y-aria-roles"
                  label="Overlay roles ARIA"
                  description="WCAG 4.1.2"
                  checked={ariaRolesVisible}
                  onChange={(v) => setPreference('ariaRolesVisible', v)}
                />
                <ToggleRow
                  id="a11y-live-log"
                  label="Log aria-live"
                  description="WCAG 4.1.3"
                  checked={liveRegionLogVisible}
                  onChange={(v) => setPreference('liveRegionLogVisible', v)}
                />
              </Section>
            </div>
          </aside>
        </>
      )}

      <FocusMonitor />
      <TabOrderOverlay />
      <HeadingTreePanel />
      <AriaRolesOverlay />
      <LiveRegionLogPanel />
      <KeyboardModeIndicator />
    </>
  )
}
