import { useEffect } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { AccessibleForm } from '@/components/forms/AccessibleForm'
import { FormField } from '@/components/forms/FormField'
import { useAdminStore } from '@/stores/adminStore'

const careerSchema = z.object({
  name: z.string().min(3, 'Ingresa el nombre de la carrera.'),
  totalCredits: z
    .number({ error: 'Los créditos totales deben ser un número.' })
    .min(1, 'Los créditos totales deben ser mayor a 0.'),
})

type CareerForm = z.infer<typeof careerSchema>

export function CareersManagement() {
  const { careers, subjects, periods, addCareer } = useAdminStore()

  useEffect(() => {
    document.title = 'Gestión académica — EnrollHub'
  }, [])

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Breadcrumb
        items={[
          { label: 'Panel', href: '/admin/dashboard' },
          { label: 'Gestión académica' },
        ]}
      />

      <h1 className="mt-6 font-display text-2xl font-bold text-uni-navy">
        Gestión de carreras, asignaturas y períodos
      </h1>

      <section className="mt-10" aria-labelledby="careers-list">
        <h2 id="careers-list" className="font-display text-lg font-semibold text-uni-navy">
          Carreras ({careers.length})
        </h2>
        <table className="mt-4 w-full text-sm">
          <caption className="sr-only">Listado de carreras</caption>
          <thead>
            <tr className="border-b border-uni-border">
              <th scope="col" className="p-2 text-left">Nombre</th>
              <th scope="col" className="p-2 text-left">Créditos totales</th>
            </tr>
          </thead>
          <tbody>
            {careers.map((c) => (
              <tr key={c.id} className="border-b border-uni-border">
                <td className="p-2">{c.name}</td>
                <td className="p-2">{c.totalCredits}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-10" aria-labelledby="subjects-list">
        <h2 id="subjects-list" className="font-display text-lg font-semibold text-uni-navy">
          Asignaturas ({subjects.length})
        </h2>
        <table className="mt-4 w-full text-sm">
          <caption className="sr-only">Listado de asignaturas</caption>
          <thead>
            <tr className="border-b border-uni-border">
              <th scope="col" className="p-2 text-left">Código</th>
              <th scope="col" className="p-2 text-left">Nombre</th>
              <th scope="col" className="p-2 text-left">Créditos</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((s) => (
              <tr key={s.id} className="border-b border-uni-border">
                <td className="p-2">{s.code}</td>
                <td className="p-2">{s.name}</td>
                <td className="p-2">{s.credits}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-10" aria-labelledby="periods-list">
        <h2 id="periods-list" className="font-display text-lg font-semibold text-uni-navy">
          Períodos académicos
        </h2>
        <ul className="mt-4 space-y-2 text-sm">
          {periods.map((p) => (
            <li key={p.id} className="rounded border border-uni-border p-3">
              {p.name} — {p.startDate} a {p.endDate}
              {p.active && (
                <span className="ml-2 rounded bg-uni-blue px-2 py-0.5 text-xs text-white">
                  Activo
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 max-w-md" aria-labelledby="add-career">
        <h2 id="add-career" className="font-display text-lg font-semibold text-uni-navy">
          Agregar carrera
        </h2>
        <AccessibleForm<CareerForm>
          className="mt-4"
          defaultValues={{ name: '', totalCredits: 150 }}
          resolver={zodResolver(careerSchema)}
          submitLabel="Agregar nueva carrera"
          successMessage="Carrera agregada exitosamente."
          onSubmit={async (data) => {
            addCareer({ name: data.name, totalCredits: data.totalCredits })
          }}
        >
          <fieldset className="space-y-4">
            <legend className="sr-only">Nueva carrera</legend>
            <FormField name="name" label="Nombre de la carrera" required />
            <FormField
              name="totalCredits"
              label="Créditos totales"
              type="number"
              required
            />
          </fieldset>
        </AccessibleForm>
      </section>
    </div>
  )
}
