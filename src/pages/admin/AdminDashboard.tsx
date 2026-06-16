import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { Button } from '@/components/ui/button'
import { useAdminStore } from '@/stores/adminStore'
import { useEnrollmentStore } from '@/stores/enrollmentStore'

export function AdminDashboard() {
  const { t } = useTranslation()
  const escalations = useAdminStore((s) => s.escalations)
  const enrollments = useEnrollmentStore((s) => s.enrollments)
  const openCases = escalations.filter((e) => e.status === 'open')

  useEffect(() => {
    document.title = t('adminDashboardTitle')
  }, [t])

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Breadcrumb items={[{ label: t('adminDashboard') }]} />

      <h1 className="mt-6 font-display text-2xl font-bold text-uni-navy">
        {t('adminDashboard')}
      </h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-uni-border bg-white p-4">
          <p className="text-2xl font-bold text-uni-navy">{enrollments.length}</p>
          <p className="text-sm text-uni-slate">{t('enrollmentsRegistered')}</p>
        </div>
        <div className="rounded-lg border border-uni-border bg-white p-4">
          <p className="text-2xl font-bold text-uni-navy">{openCases.length}</p>
          <p className="text-sm text-uni-slate">{t('openCases')}</p>
        </div>
        <div className="rounded-lg border border-uni-border bg-white p-4">
          <p className="text-2xl font-bold text-uni-navy">2026-1</p>
          <p className="text-sm text-uni-slate">{t('activePeriod')}</p>
        </div>
      </div>

      <nav className="mt-10 flex flex-wrap gap-3" aria-label={t('adminActions')}>
        <Button asChild>
          <Link to="/admin/careers">{t('manageCareers')}</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/admin/reports">{t('viewReports')}</Link>
        </Button>
      </nav>

      {openCases.length > 0 && (
        <section className="mt-10" aria-labelledby="cases-heading">
          <h2 id="cases-heading" className="font-display text-lg font-semibold text-uni-navy">
            {t('chatbotCases')}
          </h2>
          <ul className="mt-4 space-y-3">
            {openCases.map((c) => (
              <li
                key={c.id}
                className="rounded-lg border border-uni-border bg-white p-4 text-sm"
              >
                <p className="font-medium text-uni-navy">{c.studentName}</p>
                <p className="text-uni-slate">{c.summary}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
