import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BookOpen, Clock, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Landing() {
  const { t } = useTranslation()

  useEffect(() => {
    document.title = 'EnrollHub — Matrícula Universitaria'
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <section className="text-center">
        <h1 className="text-4xl font-bold text-uni-navy sm:text-5xl">{t('welcome')}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-uni-slate">{t('welcomeDesc')}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button size="lg" asChild>
            <Link to="/register">{t('getStarted')}</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/login">{t('login')}</Link>
          </Button>
        </div>
      </section>

      <section className="mt-16" aria-labelledby="video-heading">
        <h2 id="video-heading" className="sr-only">Video institucional</h2>
        <div className="mx-auto max-w-3xl">
          <div className="relative aspect-video overflow-hidden rounded-lg shadow-md">
            <iframe
              src="https://www.youtube.com/embed/iG9CE55wbtY"
              title="Do schools kill creativity? | Sir Ken Robinson | TED"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          </div>
          <p className="mt-2 text-center text-sm text-uni-slate">
            Sir Ken Robinson — ¿Las escuelas matan la creatividad? (TED)
          </p>
        </div>
      </section>

      <section className="mt-16 grid gap-6 sm:grid-cols-3" aria-labelledby="features-heading">
        <h2 id="features-heading" className="sr-only">
          Características principales
        </h2>
        {[
          {
            icon: BookOpen,
            title: 'Proceso guiado',
            desc: 'Matrícula en máximo 8 pasos con validación automática de prerrequisitos y horarios.',
          },
          {
            icon: Shield,
            title: 'WCAG 2.2 AA',
            desc: 'Menú de accesibilidad permanente con 4 categorías y soporte completo de teclado.',
          },
          {
            icon: Clock,
            title: 'Rápido y confiable',
            desc: 'Completa tu matrícula en menos de 5 minutos con confirmación y comprobante digital.',
          },
        ].map(({ icon: Icon, title, desc }) => (
          <article
            key={title}
            className="rounded-lg border border-uni-border bg-white p-6 text-left shadow-sm"
          >
            <Icon className="h-8 w-8 text-uni-blue" aria-hidden="true" />
            <h3 className="mt-4 font-display text-lg font-semibold text-uni-navy">{title}</h3>
            <p className="mt-2 text-sm text-uni-slate">{desc}</p>
          </article>
        ))}
      </section>

      <section className="mt-12 rounded-lg bg-uni-gray p-6 text-left" aria-labelledby="demo-heading">
        <h2 id="demo-heading" className="font-display text-lg font-semibold text-uni-navy">
          Cuentas de demostración
        </h2>
        <ul className="mt-3 space-y-1 text-sm text-uni-slate">
          <li>Primer ingreso: nuevo@uni.edu / demo1234</li>
          <li>Estudiante regular: estudiante@uni.edu / demo1234</li>
          <li>Administrador: admin@uni.edu / admin1234</li>
        </ul>
      </section>
    </div>
  )
}
