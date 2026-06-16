import { useEffect } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { AccessibleForm } from '@/components/forms/AccessibleForm'
import { FormField } from '@/components/forms/FormField'
import { useAuthStore } from '@/stores/authStore'

const schema = z.object({
  name: z.string().min(3, 'Ingresa tu nombre completo (mínimo 3 caracteres).'),
  email: z.string().email('Formato de correo inválido.'),
})

type ProfileForm = z.infer<typeof schema>

export function Profile() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const updateProfile = useAuthStore((s) => s.updateProfile)

  useEffect(() => {
    document.title = t('profilePageTitle')
  }, [t])

  if (!user) return null

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <Breadcrumb
        items={[
          { label: t('panel'), href: '/student/dashboard' },
          { label: t('profileTitle') },
        ]}
      />

      <h1 className="mt-6 font-display text-2xl font-bold text-uni-navy">{t('profileTitle')}</h1>
      <p className="mt-2 text-sm text-uni-slate">{t('profileDesc')}</p>

      <AccessibleForm<ProfileForm>
        className="mt-8"
        defaultValues={{ name: user.name, email: user.email }}
        resolver={zodResolver(schema)}
        submitLabel={t('profileSubmit')}
        critical
        confirmTitle={t('confirmChangesTitle')}
        confirmSummary={(data) => (
          <p>
            Actualizarás tu nombre a <strong>{data.name}</strong>. ¿Confirmas?
          </p>
        )}
        successMessage={t('profileUpdated')}
        onSubmit={async (data) => {
          updateProfile({ name: data.name, email: data.email })
        }}
      >
        <fieldset className="space-y-4">
          <legend className="sr-only">{t('personalDataSrLegend')}</legend>
          <FormField name="name" label={t('nameLabel')} required autoComplete="name" />
          <FormField
            name="email"
            label={t('emailLabel')}
            type="email"
            required
            autoComplete="email"
          />
        </fieldset>
      </AccessibleForm>
    </div>
  )
}
