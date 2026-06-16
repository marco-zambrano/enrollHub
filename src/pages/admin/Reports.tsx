import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Download } from 'lucide-react'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { Button } from '@/components/ui/button'
import { useEnrollmentStore } from '@/stores/enrollmentStore'
import { exportEnrollmentsCSV } from '@/lib/reportExport'
import { getScheduleById, getSubjectById } from '@/lib/enrollmentValidation'

export function Reports() {
  const { t } = useTranslation()
  const enrollments = useEnrollmentStore((s) => s.enrollments)

  useEffect(() => {
    document.title = t('reportsPageTitle')
  }, [t])

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Breadcrumb
        items={[
          { label: t('panel'), href: '/admin/dashboard' },
          { label: t('reports') },
        ]}
      />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold text-uni-navy">
          {t('reportsTitle')}
        </h1>
        <Button
          onClick={() => exportEnrollmentsCSV(enrollments)}
          aria-label={t('exportCSVLabel')}
        >
          <Download className="mr-2 h-4 w-4" aria-hidden="true" />
          {t('exportCSV')}
        </Button>
      </div>

      {enrollments.length === 0 ? (
        <p className="mt-8 text-uni-slate" role="status">
          {t('noEnrollments')}
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <caption className="sr-only">{t('reportsCaption')}</caption>
            <thead>
              <tr className="border-b border-uni-border bg-uni-gray">
                <th scope="col" className="p-3 text-left">{t('thId')}</th>
                <th scope="col" className="p-3 text-left">{t('thUser')}</th>
                <th scope="col" className="p-3 text-left">{t('thSubjects')}</th>
                <th scope="col" className="p-3 text-left">{t('thCredits')}</th>
                <th scope="col" className="p-3 text-left">{t('thDate')}</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((e) => (
                <tr key={e.id} className="border-b border-uni-border">
                  <td className="p-3">{e.id}</td>
                  <td className="p-3">{e.userId}</td>
                  <td className="p-3">
                    {e.scheduleIds
                      .map((id) => {
                        const sch = getScheduleById(id)
                        const sub = sch ? getSubjectById(sch.subjectId) : null
                        return sub?.code
                      })
                      .join(', ')}
                  </td>
                  <td className="p-3">{e.totalCredits}</td>
                  <td className="p-3">
                    {new Date(e.confirmedAt).toLocaleDateString('es')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
