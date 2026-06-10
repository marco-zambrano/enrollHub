import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, BookOpen, FileText, User } from 'lucide-react'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'
import {
  getEligibleSubjects,
  getPendingPrerequisites,
  getRemainingCredits,
} from '@/lib/enrollmentValidation'
import { useEnrollmentStore } from '@/stores/enrollmentStore'

export function StudentDashboard() {
  const user = useAuthStore((s) => s.user)
  const enrollments = useEnrollmentStore((s) => s.getUserEnrollments(user?.id || ''))

  useEffect(() => {
    document.title = 'Panel del estudiante — EnrollHub'
  }, [])

  const eligible = getEligibleSubjects(user)
  const pending = getPendingPrerequisites(user)
  const remaining = getRemainingCredits(user)

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Breadcrumb items={[{ label: 'Panel del estudiante' }]} />

      <h1 className="mt-6 font-display text-2xl font-bold text-uni-navy">
        Hola, {user?.name}
      </h1>
      <p className="mt-1 text-sm text-uni-slate">
        Período vigente: 2026-1 — Gestiona tu matrícula desde aquí.
      </p>

      {user?.studentType === 'regular' && pending.length > 0 && (
        <div
          role="alert"
          className="mt-6 flex items-start gap-3 rounded-lg border border-uni-warning bg-amber-50 p-4"
        >
          <AlertTriangle className="h-5 w-5 shrink-0 text-uni-warning" aria-hidden="true" />
          <div>
            <p className="font-medium text-uni-navy">Prerrequisitos pendientes</p>
            <p className="mt-1 text-sm text-uni-slate">
              Tienes {pending.length} materia(s) con requisitos sin cumplir. Revisa antes de matricular.
            </p>
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Materias elegibles', value: eligible.length, icon: BookOpen },
          { label: 'Créditos restantes', value: remaining, icon: FileText },
          { label: 'Matrículas activas', value: enrollments.length, icon: FileText },
          { label: 'Prerrequisitos pend.', value: pending.length, icon: AlertTriangle },
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
