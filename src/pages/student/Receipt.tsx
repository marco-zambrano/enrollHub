import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Printer } from 'lucide-react'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'
import { useEnrollmentStore } from '@/stores/enrollmentStore'
import { getScheduleById, getSubjectById } from '@/lib/enrollmentValidation'

export function Receipt() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const user = useAuthStore((s) => s.user)
  const enrollments = useEnrollmentStore((s) => s.enrollments)
  const record = enrollments.find((e) => e.id === id)

  useEffect(() => {
    document.title = t('receiptPageTitle')
  }, [t])

  if (!record) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <p role="alert">{t('receiptNotFound')}</p>
        <Button className="mt-4" asChild>
          <Link to="/student/dashboard">{t('backToPanel')}</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Breadcrumb
        items={[
          { label: t('panel'), href: '/student/dashboard' },
          { label: t('receiptTitle') },
        ]}
      />

      <article className="mt-6 rounded-lg border border-uni-border bg-white p-8 shadow-sm" id="receipt">
        <header>
          <h1 className="font-display text-2xl font-bold text-uni-navy">
            {t('receiptTitle')}
          </h1>
          <p className="mt-1 text-sm text-uni-slate">{t('period')}</p>
        </header>

        <dl className="mt-6 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium text-uni-navy">{t('student')}</dt>
            <dd>{user?.name}</dd>
          </div>
          <div>
            <dt className="font-medium text-uni-navy">{t('email')}</dt>
            <dd>{user?.email}</dd>
          </div>
          <div>
            <dt className="font-medium text-uni-navy">{t('date')}</dt>
            <dd>{new Date(record.confirmedAt).toLocaleString('es')}</dd>
          </div>
          <div>
            <dt className="font-medium text-uni-navy">{t('enrollmentIdLabel')}</dt>
            <dd>{record.id}</dd>
          </div>
        </dl>

        <table className="mt-8 w-full text-sm">
          <caption className="mb-2 text-left font-medium text-uni-navy">
            {t('enrolledCaption')}
          </caption>
          <thead>
            <tr className="border-b border-uni-border">
              <th scope="col" className="p-2 text-left">{t('thCode')}</th>
              <th scope="col" className="p-2 text-left">{t('thSubject')}</th>
              <th scope="col" className="p-2 text-left">{t('thSchedule')}</th>
              <th scope="col" className="p-2 text-left">{t('thCredits')}</th>
            </tr>
          </thead>
          <tbody>
            {record.scheduleIds.map((schId) => {
              const sch = getScheduleById(schId)
              const sub = sch ? getSubjectById(sch.subjectId) : null
              return (
                <tr key={schId} className="border-b border-uni-border">
                  <td className="p-2">{sub?.code}</td>
                  <td className="p-2">{sub?.name}</td>
                  <td className="p-2">
                    {sch?.day} {sch?.startTime}–{sch?.endTime} (Par. {sch?.parallel})
                  </td>
                  <td className="p-2">{sub?.credits}</td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="p-2 text-right font-medium">
                {t('totalCredits')}
              </td>
              <td className="p-2 font-bold">{record.totalCredits}</td>
            </tr>
          </tfoot>
        </table>
      </article>

      <div className="mt-6 flex gap-3">
        <Button onClick={() => window.print()} aria-label={t('printLabel')}>
          <Printer className="mr-2 h-4 w-4" aria-hidden="true" />
          {t('print')}
        </Button>
        <Button variant="outline" asChild>
          <Link to="/student/dashboard">{t('backToPanel')}</Link>
        </Button>
      </div>
    </div>
  )
}
