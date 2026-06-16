import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'
import { useEnrollmentStore } from '@/stores/enrollmentStore'
import { useAccessibilityStore } from '@/stores/accessibilityStore'
import { useSessionTimeout } from '@/hooks/useSessionTimeout'
import {
  getEligibleSubjects,
  getScheduleById,
  getSchedulesForSubject,
  getSubjectById,
  validateEnrollmentSelection,
} from '@/lib/enrollmentValidation'

export function EnrollmentWizard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { selectedScheduleIds, toggleSchedule, confirmEnrollment } = useEnrollmentStore()
  const confirmationMode = useAccessibilityStore((s) => s.confirmationMode)
  const addLiveMessage = useAccessibilityStore((s) => s.addLiveRegionMessage)
  const [step, setStep] = useState(0)
  const [showConfirm, setShowConfirm] = useState(false)
  const { showWarning, remaining, extendSession, sessionExtension } = useSessionTimeout()

  const STEPS = [
    t('stepEligibility'),
    t('stepSelection'),
    t('stepValidation'),
    t('stepConfirmation'),
  ]

  const eligible = getEligibleSubjects(user)
  const validation = validateEnrollmentSelection(selectedScheduleIds, user)

  useEffect(() => {
    document.title = t('enrollmentWizardTitle')
  }, [t])

  const handleConfirm = () => {
    if (confirmationMode) {
      setShowConfirm(true)
      return
    }
    finalize()
  }

  const finalize = () => {
    if (!user || !validation.valid) return
    const record = confirmEnrollment(user.id)
    if (record) {
      addLiveMessage(t('enrollmentConfirmed'))
      navigate(`/student/receipt/${record.id}`)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Breadcrumb
        items={[
          { label: t('panel'), href: '/student/dashboard' },
          { label: t('enrollmentWizard') },
        ]}
      />

      <h1 className="mt-6 font-display text-2xl font-bold text-uni-navy">
        {t('enrollmentWizard')}
      </h1>

      <ol className="mt-6 flex gap-2" aria-label={t('enrollmentSteps')}>
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={`flex-1 rounded-md px-3 py-2 text-center text-xs font-medium sm:text-sm ${
              i === step
                ? 'bg-uni-blue text-white'
                : i < step
                  ? 'bg-uni-gray text-uni-navy'
                  : 'bg-white text-uni-slate border border-uni-border'
            }`}
            aria-current={i === step ? 'step' : undefined}
          >
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      {showWarning && !sessionExtension && (
        <div role="alert" className="mt-6 rounded-lg border border-uni-warning bg-amber-50 p-4">
          <p className="font-medium text-uni-navy">
            {t('sessionExpiry', { seconds: Math.ceil(remaining / 1000) })}
          </p>
          <Button className="mt-2" size="sm" onClick={extendSession}>
            {t('extendSession')}
          </Button>
        </div>
      )}

      {step === 0 && (
        <section className="mt-8" aria-labelledby="step-eligibility">
          <h2 id="step-eligibility" className="font-display text-lg font-semibold text-uni-navy">
            {t('preValidation')}
          </h2>
          <p className="mt-2 text-sm text-uni-slate">
            {t('eligibleCount', { count: eligible.length })}
          </p>
          <Button className="mt-6" onClick={() => setStep(1)}>
            {t('continueToSelection')}
          </Button>
        </section>
      )}

      {step === 1 && (
        <section className="mt-8" aria-labelledby="step-selection">
          <h2 id="step-selection" className="font-display text-lg font-semibold text-uni-navy">
            {t('selectSubjects')}
          </h2>
          <fieldset className="mt-4 space-y-4">
            <legend className="text-sm font-medium text-uni-navy">
              {t('availableParallels')}
            </legend>
            {eligible.map((subject) => (
              <div key={subject.id} className="rounded-lg border border-uni-border p-4">
                <p className="font-medium text-uni-navy">
                  {subject.code} — {subject.name} ({subject.credits} {t('credits')})
                </p>
                <ul className="mt-3 space-y-2">
                  {getSchedulesForSubject(subject.id).map((sch) => {
                    const full = sch.enrolled >= sch.capacity
                    const checked = selectedScheduleIds.includes(sch.id)
                    return (
                      <li key={sch.id}>
                        <label className="flex cursor-pointer items-start gap-3">
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={full}
                            onChange={() => toggleSchedule(sch.id)}
                            aria-describedby={`sch-desc-${sch.id}`}
                          />
                          <span id={`sch-desc-${sch.id}`}>
                            Paralelo {sch.parallel}: {sch.day} {sch.startTime}–{sch.endTime} —{' '}
                            {sch.professor}
                            {full && (
                              <span className="ml-2 text-uni-error">({t('slotFull')})</span>
                            )}
                          </span>
                        </label>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </fieldset>
          <div className="mt-6 flex gap-3">
            <Button variant="outline" onClick={() => setStep(0)}>{t('previous')}</Button>
            <Button onClick={() => setStep(2)} disabled={selectedScheduleIds.length === 0}>
              {t('validateSelection')}
            </Button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="mt-8" aria-labelledby="step-validation">
          <h2 id="step-validation" className="font-display text-lg font-semibold text-uni-navy">
            {t('validationResult')}
          </h2>
          {validation.valid ? (
            <div className="mt-4 flex items-start gap-2 text-uni-success" role="status">
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
              <p>{t('validationOk')}</p>
            </div>
          ) : (
            <ul className="mt-4 space-y-2" role="alert">
              {validation.errors.map((err, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-uni-error">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
                  {err}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-6 flex gap-3">
            <Button variant="outline" onClick={() => setStep(1)}>{t('correctSelection')}</Button>
            <Button onClick={() => setStep(3)} disabled={!validation.valid}>
              {t('goToConfirmation')}
            </Button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="mt-8" aria-labelledby="step-confirm">
          <h2 id="step-confirm" className="font-display text-lg font-semibold text-uni-navy">
            {t('enrollmentSummary')}
          </h2>
          <table className="mt-4 w-full text-sm">
            <caption className="sr-only">{t('selectedCaption')}</caption>
            <thead>
              <tr className="border-b border-uni-border">
                <th scope="col" className="p-2 text-left">{t('thSubject')}</th>
                <th scope="col" className="p-2 text-left">{t('thSchedule')}</th>
                <th scope="col" className="p-2 text-left">{t('thCredits')}</th>
              </tr>
            </thead>
            <tbody>
              {selectedScheduleIds.map((id) => {
                const sch = getScheduleById(id)
                const sub = sch ? getSubjectById(sch.subjectId) : null
                return (
                  <tr key={id} className="border-b border-uni-border">
                    <td className="p-2">{sub?.name}</td>
                    <td className="p-2">
                      {sch?.day} {sch?.startTime}–{sch?.endTime} (Par. {sch?.parallel})
                    </td>
                    <td className="p-2">{sub?.credits}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className="mt-6 flex gap-3">
            <Button variant="outline" onClick={() => setStep(2)}>{t('previous')}</Button>
            <Button onClick={handleConfirm}>{t('confirmEnrollment')}</Button>
          </div>
        </section>
      )}

      {showConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="enroll-confirm-title"
          className="fixed inset-0 z-[9500] flex items-center justify-center bg-black/40 p-4"
        >
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 id="enroll-confirm-title" className="font-display text-lg font-semibold">
              {t('confirmEnrollTitle')}
            </h2>
            <p className="mt-2 text-sm text-uni-slate">
              {t('confirmEnrollDesc', { count: selectedScheduleIds.length })}
            </p>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" onClick={() => setShowConfirm(false)}>
                {t('cancel')}
              </Button>
              <Button
                onClick={() => {
                  setShowConfirm(false)
                  finalize()
                }}
              >
                {t('yesConfirmEnroll')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
