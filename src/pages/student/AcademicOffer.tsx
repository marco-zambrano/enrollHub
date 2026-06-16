import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'
import { getEligibleSubjects, getSchedulesForSubject } from '@/lib/enrollmentValidation'

export function AcademicOffer() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const eligible = getEligibleSubjects(user)

  useEffect(() => {
    document.title = t('academicOfferTitle')
  }, [t])

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Breadcrumb
        items={[
          { label: t('panel'), href: '/student/dashboard' },
          { label: t('academicOffer') },
        ]}
      />

      <h1 className="mt-6 font-display text-2xl font-bold text-uni-navy">
        {t('academicOfferHeading')}
      </h1>
      <p className="mt-2 text-sm text-uni-slate">
        {t('academicOfferDesc')}
      </p>

      {eligible.length === 0 ? (
        <p role="status" className="mt-8 text-uni-slate">
          {t('noEligible')}
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <caption className="sr-only">
              {t('offerCaption')}
            </caption>
            <thead>
              <tr className="border-b border-uni-border bg-uni-gray">
                <th scope="col" className="p-3 font-semibold text-uni-navy">{t('thCode')}</th>
                <th scope="col" className="p-3 font-semibold text-uni-navy">{t('thSubject')}</th>
                <th scope="col" className="p-3 font-semibold text-uni-navy">{t('thCredits')}</th>
                <th scope="col" className="p-3 font-semibold text-uni-navy">{t('thParallels')}</th>
                <th scope="col" className="p-3 font-semibold text-uni-navy">{t('thSlots')}</th>
              </tr>
            </thead>
            <tbody>
              {eligible.map((subject) => {
                const schedules = getSchedulesForSubject(subject.id)
                return (
                  <tr key={subject.id} className="border-b border-uni-border">
                    <td className="p-3">{subject.code}</td>
                    <td className="p-3">{subject.name}</td>
                    <td className="p-3">{subject.credits}</td>
                    <td className="p-3">
                      <ul>
                        {schedules.map((sch) => (
                          <li key={sch.id}>
                            {sch.parallel}: {sch.day} {sch.startTime}–{sch.endTime} ({sch.professor})
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-3">
                      {schedules.map((sch) => (
                        <div key={sch.id}>
                          {sch.parallel}: {t('slotsAvailable', { count: sch.capacity - sch.enrolled })}
                        </div>
                      ))}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <Button className="mt-8" asChild>
        <Link to="/student/enroll">{t('continueToEnroll')}</Link>
      </Button>
    </div>
  )
}
