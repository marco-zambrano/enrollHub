import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'

const STEPS = [
  {
    title: 'Bienvenida',
    desc: 'EnrollHub te guiará paso a paso en tu primera matrícula universitaria.',
  },
  {
    title: 'Revisa la oferta',
    desc: 'Consulta las materias disponibles, paralelos, docentes y horarios del período vigente.',
  },
  {
    title: 'Selecciona materias',
    desc: 'Elige tus asignaturas verificando cupos y evitando choques de horario.',
  },
  {
    title: 'Confirma y descarga',
    desc: 'Revisa tu selección, confirma la matrícula y obtén tu comprobante digital.',
  },
]

export function WelcomeTutorial() {
  const [step, setStep] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Tutorial de bienvenida — EnrollHub'
  }, [])

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Breadcrumb
        items={[
          { label: 'Panel', href: '/student/dashboard' },
          { label: 'Tutorial de bienvenida' },
        ]}
      />

      <h1 className="mt-6 font-display text-2xl font-bold text-uni-navy">
        Tutorial de bienvenida
      </h1>

      <ol className="mt-8 space-y-4" aria-label="Pasos del proceso de matrícula">
        {STEPS.map((s, i) => (
          <li
            key={s.title}
            className={`rounded-lg border p-4 ${
              i === step ? 'border-uni-blue bg-blue-50' : 'border-uni-border bg-white'
            }`}
            aria-current={i === step ? 'step' : undefined}
          >
            <span className="text-xs font-semibold text-uni-blue">Paso {i + 1}</span>
            <h2 className="mt-1 font-display text-lg font-semibold text-uni-navy">{s.title}</h2>
            <p className="mt-1 text-sm text-uni-slate">{s.desc}</p>
          </li>
        ))}
      </ol>

      <div className="mt-8 flex gap-3">
        {step > 0 && (
          <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
            Anterior
          </Button>
        )}
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep((s) => s + 1)}>Siguiente paso</Button>
        ) : (
          <Button
            onClick={() => {
              useAuthStore.getState().updateProfile({ studentType: 'regular' })
              navigate('/student/offer')
            }}
          >
            Ir a la oferta académica
          </Button>
        )}
      </div>
    </div>
  )
}
