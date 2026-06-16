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
        <h2 id="video-heading" className="sr-only">{t('videoHeading')}</h2>
        <div className="mx-auto max-w-3xl">
          <div className="relative aspect-video overflow-hidden rounded-lg shadow-md">
            <iframe
              src="https://www.youtube.com/embed/iG9CE55wbtY?cc_load_policy=1&cc_lang_pref=es"
              title="Do schools kill creativity? | Sir Ken Robinson | TED"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          </div>
          <p className="mt-2 text-center text-sm text-uni-slate">
            {t('videoCaption')}
          </p>

          <details className="mt-4 rounded-lg border border-uni-border bg-white p-4">
            <summary className="cursor-pointer font-display text-sm font-semibold text-uni-navy">
              {t('transcriptTitle')}
            </summary>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-uni-slate">
              <p>{t('transcriptP1')}</p>
              <p>{t('transcriptP2')}</p>
              <p>{t('transcriptP3')}</p>
            </div>
          </details>

          <details className="mt-2 rounded-lg border border-uni-border bg-white p-4">
            <summary className="cursor-pointer font-display text-sm font-semibold text-uni-navy">
              {t('audioDescTitle')}
            </summary>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-uni-slate">
              <p>
                <strong>{t('a11yFocusActive').split(' ')[0]}:</strong> {t('audioDescScene')}
              </p>
              <p>
                <strong>Orador:</strong> {t('audioDescSpeaker')}
              </p>
              <p>
                <strong>Público:</strong> {t('audioDescAudience')}
              </p>
              <p>
                <strong>Visual:</strong> {t('audioDescVisual')}
              </p>
            </div>
          </details>
        </div>
      </section>

      <section className="mt-16 grid gap-6 sm:grid-cols-3" aria-labelledby="features-heading">
        <h2 id="features-heading" className="sr-only">
          {t('featuresHeading')}
        </h2>
        {[
          {
            icon: BookOpen,
            title: t('featureGuidedTitle'),
            desc: t('featureGuidedDesc'),
          },
          {
            icon: Shield,
            title: t('featureWcagTitle'),
            desc: t('featureWcagDesc'),
          },
          {
            icon: Clock,
            title: t('featureFastTitle'),
            desc: t('featureFastDesc'),
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
          {t('demoTitle')}
        </h2>
        <ul className="mt-3 space-y-1 text-sm text-uni-slate">
          <li>{t('demoNew')}</li>
          <li>{t('demoStudent')}</li>
          <li>{t('demoAdmin')}</li>
        </ul>
      </section>
    </div>
  )
}
