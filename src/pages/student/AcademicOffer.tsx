import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'
import { getEligibleSubjects, getSchedulesForSubject } from '@/lib/enrollmentValidation'

export function AcademicOffer() {
  const user = useAuthStore((s) => s.user)
  const eligible = getEligibleSubjects(user)

  useEffect(() => {
    document.title = 'Oferta académica — EnrollHub'
  }, [])

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Breadcrumb
        items={[
          { label: 'Panel', href: '/student/dashboard' },
          { label: 'Oferta académica' },
        ]}
      />

      <h1 className="mt-6 font-display text-2xl font-bold text-uni-navy">
        Oferta académica — Período 2026-1
      </h1>
      <p className="mt-2 text-sm text-uni-slate">
        Materias disponibles según tu avance académico y prerrequisitos cumplidos.
      </p>

      {eligible.length === 0 ? (
        <p role="status" className="mt-8 text-uni-slate">
          No hay materias elegibles en este momento.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <caption className="sr-only">
              Listado de materias disponibles con horarios y cupos
            </caption>
            <thead>
              <tr className="border-b border-uni-border bg-uni-gray">
                <th scope="col" className="p-3 font-semibold text-uni-navy">Código</th>
                <th scope="col" className="p-3 font-semibold text-uni-navy">Materia</th>
                <th scope="col" className="p-3 font-semibold text-uni-navy">Créditos</th>
                <th scope="col" className="p-3 font-semibold text-uni-navy">Paralelos</th>
                <th scope="col" className="p-3 font-semibold text-uni-navy">Cupos</th>
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
                          {sch.parallel}: {sch.capacity - sch.enrolled} disponibles
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
        <Link to="/student/enroll">Continuar a matrícula</Link>
      </Button>
    </div>
  )
}
