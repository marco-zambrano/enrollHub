import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, FileText, User, GraduationCap } from 'lucide-react'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'
import {
  getEligibleSubjects,
  getRemainingCredits,
  getScheduleById,
  getSubjectById,
} from '@/lib/enrollmentValidation'
import { useEnrollmentStore } from '@/stores/enrollmentStore'

export function StudentDashboard() {
  const user = useAuthStore((s) => s.user)
  const allEnrollments = useEnrollmentStore((s) => s.enrollments)
  const enrollments = useMemo(
    () => allEnrollments.filter((e) => e.userId === user?.id),
    [allEnrollments, user?.id],
  )

  useEffect(() => {
    document.title = 'Panel del estudiante — EnrollHub'
  }, [])

  const eligible = getEligibleSubjects(user)
  const remaining = getRemainingCredits(user)

  const enrolledSubjects = useMemo(() => {
    const seen = new Set<string>()
    return enrollments.flatMap((enr) =>
      enr.scheduleIds.map((schId) => {
        const sch = getScheduleById(schId)
        const sub = sch ? getSubjectById(sch.subjectId) : null
        if (sub) seen.add(sub.id)
        return { scheduleId: schId, schedule: sch, subject: sub }
      }),
    )
  }, [enrollments])

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Breadcrumb items={[{ label: 'Panel del estudiante' }]} />

      <h1 className="mt-6 font-display text-2xl font-bold text-uni-navy">
        Hola, {user?.name}
      </h1>
      <p className="mt-1 text-sm text-uni-slate">
        Período vigente: 2026-1 — Gestiona tu matrícula desde aquí.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {[
          { label: 'Materias elegibles', value: eligible.length, icon: BookOpen },
          { label: 'Créditos restantes', value: remaining, icon: FileText },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-lg border border-uni-border bg-white p-4 shadow-sm"
          >
            <Icon className="h-5 w-5 text-uni-blue" aria-hidden="true" />
            <p className="mt-2 text-2xl font-bold text-uni-navy">{value}</p>
            <p className="text-sm text-uni-slate">{label}</p>
          </div>
        ))}
      </div>

      {enrolledSubjects.length > 0 && (
        <section className="mt-10" aria-labelledby="enrolled-subjects">
          <h2
            id="enrolled-subjects"
            className="font-display text-lg font-semibold text-uni-navy"
          >
            <GraduationCap className="mr-2 inline h-5 w-5 text-uni-blue" aria-hidden="true" />
            Mis materias matriculadas
          </h2>
          <div className="mt-4 space-y-3">
            {enrollments.map((enr) => {
              const items = enr.scheduleIds.map((schId) => {
                const sch = getScheduleById(schId)
                const sub = sch ? getSubjectById(sch.subjectId) : null
                return { schedule: sch, subject: sub }
              })
              return (
                <div
                  key={enr.id}
                  className="rounded-lg border border-uni-border bg-white p-4 shadow-sm"
                >
                  <p className="mb-2 text-xs text-uni-slate">
                    Matrícula {enr.id} — {new Date(enr.confirmedAt).toLocaleDateString('es')}
                    {' — '}
                    <span className="font-medium">{enr.totalCredits} créditos</span>
                  </p>
                  <table className="w-full text-sm">
                    <caption className="sr-only">Materias de la matrícula</caption>
                    <thead>
                      <tr className="border-b border-uni-border text-left text-xs text-uni-slate">
                        <th scope="col" className="p-1 font-medium">Código</th>
                        <th scope="col" className="p-1 font-medium">Materia</th>
                        <th scope="col" className="p-1 font-medium">Horario</th>
                        <th scope="col" className="p-1 font-medium">Profesor</th>
                        <th scope="col" className="p-1 font-medium text-right">Cr.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(({ schedule, subject }) => (
                        <tr key={schedule?.id} className="border-b border-uni-border/50">
                          <td className="p-1 font-mono text-xs">{subject?.code}</td>
                          <td className="p-1">{subject?.name}</td>
                          <td className="p-1 text-xs">
                            {schedule?.day} {schedule?.startTime}–{schedule?.endTime}
                          </td>
                          <td className="p-1 text-xs text-uni-slate">{schedule?.professor}</td>
                          <td className="p-1 text-right text-xs">{subject?.credits}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            })}
          </div>
        </section>
      )}

      <nav className="mt-10" aria-label="Acciones de matrícula">
        <ul className="flex flex-wrap gap-3">
          <li>
            <Button asChild>
              <Link to="/student/offer">Ver oferta académica</Link>
            </Button>
          </li>
          <li>
            <Button variant="outline" asChild>
              <Link to="/student/enroll">Iniciar matrícula</Link>
            </Button>
          </li>
          <li>
            <Button variant="ghost" asChild>
              <Link to="/student/profile">
                <User className="mr-2 h-4 w-4" aria-hidden="true" />
                Mi perfil
              </Link>
            </Button>
          </li>
        </ul>
      </nav>
    </div>
  )
}
