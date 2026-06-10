import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Printer } from 'lucide-react'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'
import { useEnrollmentStore } from '@/stores/enrollmentStore'
import { getScheduleById, getSubjectById } from '@/lib/enrollmentValidation'

export function Receipt() {
  const { id } = useParams<{ id: string }>()
  const user = useAuthStore((s) => s.user)
  const enrollments = useEnrollmentStore((s) => s.enrollments)
  const record = enrollments.find((e) => e.id === id)

  useEffect(() => {
    document.title = 'Comprobante de matrícula — EnrollHub'
  }, [])

  if (!record) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <p role="alert">Comprobante no encontrado.</p>
        <Button className="mt-4" asChild>
          <Link to="/student/dashboard">Volver al panel</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Breadcrumb
        items={[
          { label: 'Panel', href: '/student/dashboard' },
          { label: 'Comprobante' },
        ]}
      />

      <article className="mt-6 rounded-lg border border-uni-border bg-white p-8 shadow-sm" id="receipt">
        <header>
          <h1 className="font-display text-2xl font-bold text-uni-navy">
            Comprobante de matrícula
          </h1>
          <p className="mt-1 text-sm text-uni-slate">Período 2026-1</p>
        </header>

        <dl className="mt-6 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium text-uni-navy">Estudiante</dt>
            <dd>{user?.name}</dd>
          </div>
          <div>
            <dt className="font-medium text-uni-navy">Correo</dt>
            <dd>{user?.email}</dd>
          </div>
          <div>
            <dt className="font-medium text-uni-navy">Fecha</dt>
            <dd>{new Date(record.confirmedAt).toLocaleString('es')}</dd>
          </div>
          <div>
            <dt className="font-medium text-uni-navy">ID matrícula</dt>
            <dd>{record.id}</dd>
          </div>
        </dl>

        <table className="mt-8 w-full text-sm">
          <caption className="mb-2 text-left font-medium text-uni-navy">
            Materias matriculadas
          </caption>
          <thead>
            <tr className="border-b border-uni-border">
              <th scope="col" className="p-2 text-left">Código</th>
              <th scope="col" className="p-2 text-left">Materia</th>
              <th scope="col" className="p-2 text-left">Horario</th>
              <th scope="col" className="p-2 text-left">Cr.</th>
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
                Total créditos
              </td>
              <td className="p-2 font-bold">{record.totalCredits}</td>
            </tr>
          </tfoot>
        </table>
      </article>

      <div className="mt-6 flex gap-3">
        <Button onClick={() => window.print()} aria-label="Imprimir comprobante">
          <Printer className="mr-2 h-4 w-4" aria-hidden="true" />
          Imprimir
        </Button>
        <Button variant="outline" asChild>
          <Link to="/student/dashboard">Volver al panel</Link>
        </Button>
      </div>
    </div>
  )
}
