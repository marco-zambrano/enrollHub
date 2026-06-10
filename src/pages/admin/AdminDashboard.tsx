import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { Button } from '@/components/ui/button'
import { useAdminStore } from '@/stores/adminStore'
import { useEnrollmentStore } from '@/stores/enrollmentStore'

export function AdminDashboard() {
  const escalations = useAdminStore((s) => s.escalations)
  const enrollments = useEnrollmentStore((s) => s.enrollments)
  const openCases = escalations.filter((e) => e.status === 'open')

  useEffect(() => {
    document.title = 'Panel administrativo — EnrollHub'
  }, [])

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Breadcrumb items={[{ label: 'Panel administrativo' }]} />

      <h1 className="mt-6 font-display text-2xl font-bold text-uni-navy">
        Panel administrativo
      </h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-uni-border bg-white p-4">
          <p className="text-2xl font-bold text-uni-navy">{enrollments.length}</p>
          <p className="text-sm text-uni-slate">Matrículas registradas</p>
        </div>
        <div className="rounded-lg border border-uni-border bg-white p-4">
          <p className="text-2xl font-bold text-uni-navy">{openCases.length}</p>
          <p className="text-sm text-uni-slate">Casos escalados abiertos</p>
        </div>
        <div className="rounded-lg border border-uni-border bg-white p-4">
          <p className="text-2xl font-bold text-uni-navy">2026-1</p>
          <p className="text-sm text-uni-slate">Período activo</p>
        </div>
      </div>

      <nav className="mt-10 flex flex-wrap gap-3" aria-label="Acciones administrativas">
        <Button asChild>
          <Link to="/admin/careers">Gestionar carreras y materias</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/admin/reports">Ver reportes</Link>
        </Button>
      </nav>

      {openCases.length > 0 && (
        <section className="mt-10" aria-labelledby="cases-heading">
          <h2 id="cases-heading" className="font-display text-lg font-semibold text-uni-navy">
            Casos escalados del chatbot
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
