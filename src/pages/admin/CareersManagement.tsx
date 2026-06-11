import { useState, useEffect, useCallback } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFormContext, Controller } from 'react-hook-form'
import { AlertCircle, Pencil, Trash2, X } from 'lucide-react'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { AccessibleForm } from '@/components/forms/AccessibleForm'
import { FormField } from '@/components/forms/FormField'
import { SelectField } from '@/components/forms/SelectField'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Toast } from '@/components/ui/Toast'
import { useAdminStore, type Career, type Subject } from '@/stores/adminStore'

const careerSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  totalCredits: z
    .number({ error: 'Ingresa un número válido.' })
    .min(1, 'Los créditos deben ser mayor a 0.'),
})

type CareerForm = z.infer<typeof careerSchema>

const subjectSchema = z.object({
  careerId: z.string().min(1, 'Selecciona una carrera.'),
  code: z.string().min(2, 'El código debe tener al menos 2 caracteres.'),
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  credits: z
    .number({ error: 'Ingresa un número válido.' })
    .min(1, 'Los créditos deben ser mayor a 0.'),
  prerequisites: z.array(z.string()),
})

type SubjectForm = z.infer<typeof subjectSchema>

function PrerequisitesCheckboxes() {
  const { subjects } = useAdminStore()
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext()
  const careerId = watch('careerId')
  const error = errors.prerequisites?.message as string | undefined
  const errorId = 'prerequisites-error'
  const available = subjects.filter((s) => s.careerId === careerId)

  if (!careerId) {
    return (
      <p className="text-xs text-uni-slate">Selecciona una carrera para ver las materias disponibles como prerrequisito.</p>
    )
  }

  if (available.length === 0) {
    return (
      <p className="text-xs text-uni-slate">No hay materias registradas para esta carrera.</p>
    )
  }

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-uni-navy">
        Prerrequisitos
        <span className="ml-1 text-xs font-normal text-uni-slate">(opcional)</span>
      </legend>
      <Controller
        name="prerequisites"
        control={control}
        render={({ field }) => (
          <div className="space-y-1.5 max-h-48 overflow-y-auto rounded border border-uni-border p-2">
            {available.map((sub) => {
              const checked = field.value.includes(sub.id)
              return (
                <label key={sub.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    value={sub.id}
                    checked={checked}
                    onChange={(e) => {
                      if (e.target.checked) {
                        field.onChange([...field.value, sub.id])
                      } else {
                        field.onChange(field.value.filter((id: string) => id !== sub.id))
                      }
                    }}
                    className="h-4 w-4 accent-uni-blue"
                  />
                  <span>
                    {sub.code} — {sub.name}
                  </span>
                </label>
              )
            })}
          </div>
        )}
      />
      {error && (
        <span
          id={errorId}
          className="field-error flex items-start gap-1 text-sm text-uni-error"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </span>
      )}
    </fieldset>
  )
}

function EditCareerModal({
  career,
  onClose,
  onSaved,
}: {
  career: Career
  onClose: () => void
  onSaved: () => void
}) {
  const { updateCareer, careers } = useAdminStore()

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-career-title"
      className="fixed inset-0 z-[9500] flex items-center justify-center bg-black/40 p-4"
    >
      <div className="w-full max-w-md rounded-lg border border-uni-border bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 id="edit-career-title" className="font-display text-lg font-semibold text-uni-navy">
            Editar carrera
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Cerrar">
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
        <AccessibleForm<CareerForm>
          className="mt-4"
          defaultValues={{ name: career.name, totalCredits: career.totalCredits }}
          resolver={zodResolver(careerSchema)}
          submitLabel="Guardar cambios"
          successMessage="Carrera actualizada exitosamente."
          onSubmit={async (data) => {
            const duplicate = careers.find(
              (c) => c.name.toLowerCase() === data.name.toLowerCase() && c.id !== career.id,
            )
            if (duplicate) {
              throw new Error('Ya existe una carrera con ese nombre.')
            }
            updateCareer(career.id, { name: data.name, totalCredits: data.totalCredits })
            onSaved()
          }}
        >
          <fieldset className="space-y-4">
            <legend className="sr-only">Formulario de edición</legend>
            <FormField
              name="name"
              label="Nombre de la carrera"
              hint="Ej: Ingeniería en Sistemas"
              required
            />
            <FormField
              name="totalCredits"
              label="Créditos totales"
              type="number"
              hint="Número total de créditos que debe cursar el estudiante"
              required
            />
          </fieldset>
        </AccessibleForm>
      </div>
    </div>
  )
}

function EditSubjectModal({
  subject,
  onClose,
  onSaved,
}: {
  subject: Subject
  onClose: () => void
  onSaved: () => void
}) {
  const { careers, subjects, updateSubject } = useAdminStore()
  const careerOptions = careers.map((c) => ({ value: c.id, label: c.name }))

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-subject-title"
      className="fixed inset-0 z-[9500] flex items-center justify-center bg-black/40 p-4"
    >
      <div className="w-full max-w-lg rounded-lg border border-uni-border bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 id="edit-subject-title" className="font-display text-lg font-semibold text-uni-navy">
            Editar asignatura
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Cerrar">
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
        <AccessibleForm<SubjectForm>
          className="mt-4"
          defaultValues={{
            careerId: subject.careerId,
            code: subject.code,
            name: subject.name,
            credits: subject.credits,
            prerequisites: subject.prerequisites,
          }}
          resolver={zodResolver(subjectSchema)}
          submitLabel="Guardar cambios"
          successMessage="Asignatura actualizada exitosamente."
          onSubmit={async (data) => {
            const dupCode = subjects.find(
              (s) => s.code.toUpperCase() === data.code.toUpperCase() && s.id !== subject.id,
            )
            if (dupCode) {
              throw new Error('Ya existe una asignatura con ese código.')
            }
            updateSubject(subject.id, {
              careerId: data.careerId,
              code: data.code,
              name: data.name,
              credits: data.credits,
              prerequisites: data.prerequisites,
            })
            onSaved()
          }}
        >
          <fieldset className="space-y-4">
            <legend className="sr-only">Formulario de edición</legend>
            <SelectField
              name="careerId"
              label="Carrera"
              options={careerOptions}
              required
            />
            <FormField
              name="code"
              label="Código de la asignatura"
              hint="Ej: MAT101"
              required
            />
            <FormField
              name="name"
              label="Nombre de la asignatura"
              hint="Ej: Matemáticas I"
              required
            />
            <FormField
              name="credits"
              label="Créditos"
              type="number"
              hint="Número de créditos académicos"
              required
            />
            <PrerequisitesCheckboxes />
          </fieldset>
        </AccessibleForm>
      </div>
    </div>
  )
}

function ConfirmDeleteDialog({
  title,
  message,
  onConfirm,
  onCancel,
}: {
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
      aria-describedby="confirm-delete-desc"
      className="fixed inset-0 z-[9500] flex items-center justify-center bg-black/40 p-4"
    >
      <div className="w-full max-w-sm rounded-lg border border-uni-border bg-white p-6 shadow-xl">
        <h2 id="confirm-delete-title" className="font-display text-lg font-semibold text-uni-navy">
          {title}
        </h2>
        <p id="confirm-delete-desc" className="mt-2 text-sm text-uni-slate">
          {message}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-uni-error text-white hover:bg-red-700"
          >
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  )
}

export function CareersManagement() {
  const { careers, subjects, periods, addCareer, addSubject, removeCareer, removeSubject } =
    useAdminStore()
  const [careerFilter, setCareerFilter] = useState('')
  const [toast, setToast] = useState<{ message: string } | null>(null)
  const [editingCareer, setEditingCareer] = useState<Career | null>(null)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [deletingCareer, setDeletingCareer] = useState<Career | null>(null)
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null)

  const showToast = useCallback((message: string) => setToast({ message }), [])
  const closeToast = useCallback(() => setToast(null), [])

  useEffect(() => {
    document.title = 'Gestión académica — EnrollHub'
  }, [])

  const filteredSubjects = careerFilter
    ? subjects.filter((s) => s.careerId === careerFilter)
    : subjects

  const careerOptions = careers.map((c) => ({ value: c.id, label: c.name }))

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

      <Toast
        open={!!toast}
        message={toast?.message ?? ''}
        onClose={closeToast}
      />

      {editingCareer && (
        <EditCareerModal
          career={editingCareer}
          onClose={() => setEditingCareer(null)}
          onSaved={() => {
            setEditingCareer(null)
            showToast('Carrera actualizada exitosamente.')
          }}
        />
      )}

      {editingSubject && (
        <EditSubjectModal
          subject={editingSubject}
          onClose={() => setEditingSubject(null)}
          onSaved={() => {
            setEditingSubject(null)
            showToast('Asignatura actualizada exitosamente.')
          }}
        />
      )}

      {deletingCareer && (
        <ConfirmDeleteDialog
          title="Eliminar carrera"
          message={`¿Estás seguro de eliminar "${deletingCareer.name}"? También se eliminarán todas las asignaturas asociadas.`}
          onConfirm={() => {
            removeCareer(deletingCareer.id)
            setDeletingCareer(null)
            showToast('Carrera eliminada exitosamente.')
          }}
          onCancel={() => setDeletingCareer(null)}
        />
      )}

      {deletingSubject && (
        <ConfirmDeleteDialog
          title="Eliminar asignatura"
          message={`¿Estás seguro de eliminar "${deletingSubject.code} — ${deletingSubject.name}"?`}
          onConfirm={() => {
            removeSubject(deletingSubject.id)
            setDeletingSubject(null)
            showToast('Asignatura eliminada exitosamente.')
          }}
          onCancel={() => setDeletingSubject(null)}
        />
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <section aria-labelledby="careers-list">
          <h2 id="careers-list" className="font-display text-lg font-semibold text-uni-navy">
            Carreras ({careers.length})
          </h2>
          <div className="mt-4 max-h-72 overflow-auto rounded-lg border border-uni-border">
            <table className="w-full text-sm">
              <caption className="sr-only">Listado de carreras</caption>
              <thead>
                <tr className="border-b border-uni-border bg-uni-gray">
                  <th scope="col" className="p-2 text-left font-medium">Nombre</th>
                  <th scope="col" className="p-2 text-left font-medium">Créditos</th>
                  <th scope="col" className="p-2 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {careers.map((c) => (
                  <tr key={c.id} className="border-b border-uni-border/50">
                    <td className="p-2 font-medium text-uni-navy">{c.name}</td>
                    <td className="p-2 text-uni-slate">{c.totalCredits}</td>
                    <td className="p-2 text-right">
                      <div className="inline-flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingCareer(c)}
                          aria-label={`Editar ${c.name}`}
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingCareer(c)}
                          aria-label={`Eliminar ${c.name}`}
                          className="text-uni-error hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {careers.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-sm text-uni-slate">
                      No hay carreras registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6">
            <AccessibleForm<CareerForm>
              defaultValues={{ name: '', totalCredits: 150 }}
              resolver={zodResolver(careerSchema)}
              submitLabel="Agregar nueva carrera"
              successMessage="Carrera agregada exitosamente."
              onSubmit={async (data) => {
                const duplicate = careers.find(
                  (c) => c.name.toLowerCase() === data.name.toLowerCase(),
                )
                if (duplicate) {
                  throw new Error('Ya existe una carrera con ese nombre.')
                }
                addCareer({ name: data.name, totalCredits: data.totalCredits })
                showToast('Carrera creada exitosamente.')
              }}
            >
              <fieldset className="space-y-4 rounded-lg border border-uni-border bg-white p-4">
                <legend className="font-display text-base font-semibold text-uni-navy">
                  Agregar carrera
                </legend>
                <FormField
                  name="name"
                  label="Nombre de la carrera"
                  hint="Ej: Ingeniería en Sistemas"
                  required
                />
                <FormField
                  name="totalCredits"
                  label="Créditos totales"
                  type="number"
                  hint="Número total de créditos que debe cursar el estudiante"
                  required
                />
              </fieldset>
            </AccessibleForm>
          </div>
        </section>

        <section aria-labelledby="subjects-list">
          <h2 id="subjects-list" className="font-display text-lg font-semibold text-uni-navy">
            Asignaturas ({filteredSubjects.length})
          </h2>

          <div className="mt-4 flex items-center gap-3">
            <Label htmlFor="career-filter">Filtrar por carrera</Label>
            <select
              id="career-filter"
              value={careerFilter}
              onChange={(e) => setCareerFilter(e.target.value)}
              className="flex-1 rounded-md border border-uni-border bg-white p-2 text-sm text-uni-navy"
              aria-label="Filtrar asignaturas por carrera"
            >
              <option value="">Todas las carreras</option>
              {careers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 max-h-80 overflow-auto rounded-lg border border-uni-border">
            <table className="w-full text-sm">
              <caption className="sr-only">Listado de asignaturas</caption>
              <thead>
                <tr className="border-b border-uni-border bg-uni-gray">
                  <th scope="col" className="p-2 text-left font-medium">Código</th>
                  <th scope="col" className="p-2 text-left font-medium">Nombre</th>
                  <th scope="col" className="p-2 text-left font-medium">Carrera</th>
                  <th scope="col" className="p-2 text-right font-medium">Cr.</th>
                  <th scope="col" className="p-2 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubjects.map((s) => {
                  const career = careers.find((c) => c.id === s.careerId)
                  return (
                    <tr key={s.id} className="border-b border-uni-border/50">
                      <td className="p-2 font-mono text-xs">{s.code}</td>
                      <td className="p-2">{s.name}</td>
                      <td className="p-2 text-xs text-uni-slate">{career?.name || '—'}</td>
                      <td className="p-2 text-right text-xs">{s.credits}</td>
                      <td className="p-2 text-right">
                        <div className="inline-flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingSubject(s)}
                            aria-label={`Editar ${s.name}`}
                          >
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingSubject(s)}
                            aria-label={`Eliminar ${s.name}`}
                            className="text-uni-error hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {filteredSubjects.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-sm text-uni-slate">
                      No hay asignaturas{careerFilter ? ' para esta carrera' : ''}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-8">
            <AccessibleForm<SubjectForm>
              defaultValues={{ careerId: '', code: '', name: '', credits: 4, prerequisites: [] }}
              resolver={zodResolver(subjectSchema)}
              submitLabel="Agregar asignatura"
              successMessage="Asignatura agregada exitosamente."
              onSubmit={async (data) => {
                const dupCode = subjects.find(
                  (s) => s.code.toUpperCase() === data.code.toUpperCase(),
                )
                if (dupCode) {
                  throw new Error('Ya existe una asignatura con ese código.')
                }
                addSubject({
                  careerId: data.careerId,
                  code: data.code,
                  name: data.name,
                  credits: data.credits,
                  prerequisites: data.prerequisites,
                })
                showToast('Asignatura creada exitosamente.')
              }}
            >
              <fieldset className="space-y-4 rounded-lg border border-uni-border bg-white p-4">
                <legend className="font-display text-base font-semibold text-uni-navy">
                  Agregar asignatura
                </legend>
                <SelectField
                  name="careerId"
                  label="Carrera"
                  hint="Selecciona la carrera a la que pertenece la asignatura"
                  options={careerOptions}
                  required
                />
                <FormField
                  name="code"
                  label="Código de la asignatura"
                  hint="Ej: MAT101"
                  required
                />
                <FormField
                  name="name"
                  label="Nombre de la asignatura"
                  hint="Ej: Matemáticas I"
                  required
                />
                <FormField
                  name="credits"
                  label="Créditos"
                  type="number"
                  hint="Número de créditos académicos"
                  required
                />
                <PrerequisitesCheckboxes />
              </fieldset>
            </AccessibleForm>
          </div>
        </section>
      </div>

      <section className="mt-10" aria-labelledby="periods-list">
        <h2 id="periods-list" className="font-display text-lg font-semibold text-uni-navy">
          Períodos académicos
        </h2>
        <ul className="mt-4 space-y-2 text-sm">
          {periods.map((p) => (
            <li key={p.id} className="rounded-lg border border-uni-border bg-white p-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-uni-navy">{p.name}</span>
                  <span className="mx-2 text-uni-slate">—</span>
                  <span className="text-uni-slate">
                    {p.startDate} a {p.endDate}
                  </span>
                </div>
                {p.active && (
                  <span className="rounded bg-uni-blue px-2.5 py-0.5 text-xs font-medium text-white">
                    Activo
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-uni-slate">
                Matrícula: {p.enrollmentStart} – {p.enrollmentEnd}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
