import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { AccessibleForm } from '@/components/forms/AccessibleForm'
import { FormField } from '@/components/forms/FormField'
import { SelectField } from '@/components/forms/SelectField'
import { useAuthStore } from '@/stores/authStore'
import { useAdminStore } from '@/stores/adminStore'

const schema = z
  .object({
    name: z.string().min(3, 'Ingresa tu nombre completo (mínimo 3 caracteres).'),
    email: z
      .string()
      .min(1, 'El correo es obligatorio.')
      .email('Formato de correo inválido. Usa nombre@uni.edu.'),
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres.'),
    confirmPassword: z.string().min(1, 'Confirma tu contraseña.'),
    careerId: z.string().min(1, 'Selecciona una carrera.'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Las contraseñas no coinciden. Verifica ambos campos.',
    path: ['confirmPassword'],
  })

type RegisterForm = z.infer<typeof schema>

export function Register() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const register = useAuthStore((s) => s.register)
  const careers = useAdminStore((s) => s.careers)

  useEffect(() => {
    document.title = t('registerPageTitle')
  }, [t])

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <Breadcrumb items={[{ label: t('home'), href: '/' }, { label: t('register') }]} />

      <h1 className="mt-6 font-display text-2xl font-bold text-uni-navy">
        {t('registerTitle')}
      </h1>
      <p className="mt-2 text-sm text-uni-slate">
        {t('registerDesc')}
      </p>

      <AccessibleForm<RegisterForm>
        className="mt-8"
        defaultValues={{
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          careerId: '',
        }}
        resolver={zodResolver(schema)}
        submitLabel={t('registerSubmit')}
        critical
        confirmTitle={t('confirmRegTitle')}
        confirmSummary={(data) => (
          <p>
            Registrarás la cuenta <strong>{data.email}</strong> para la carrera seleccionada.
            ¿Deseas continuar?
          </p>
        )}
        successMessage={t('accountCreated')}
        onSubmit={async (data) => {
          const result = await register({
            email: data.email,
            password: data.password,
            name: data.name,
            careerId: data.careerId,
          })
          if (!result.success) throw new Error(result.error)
          navigate('/student/welcome')
        }}
      >
        <fieldset className="space-y-4">
          <legend className="mb-2 text-sm font-medium text-uni-navy">{t('personalDataLegend')}</legend>
          <FormField
            name="name"
            label={t('nameLabel')}
            hint={t('nameHint')}
            required
            autoComplete="name"
          />
          <FormField
            name="email"
            label={t('emailLabel')}
            type="email"
            hint={t('emailHint')}
            required
            autoComplete="email"
          />
          <FormField
            name="password"
            label={t('passwordLabel')}
            type="password"
            hint={t('passwordMinHint')}
            required
            autoComplete="new-password"
          />
          <FormField
            name="confirmPassword"
            label={t('confirmPasswordLabel')}
            type="password"
            required
            autoComplete="new-password"
          />
          <SelectField
            name="careerId"
            label={t('careerLabel')}
            hint={t('careerHint')}
            required
            options={careers.map((c) => ({ value: c.id, label: c.name }))}
          />
        </fieldset>
      </AccessibleForm>

      <p className="mt-6 text-center text-sm text-uni-slate">
        {t('hasAccount')}{' '}
        <Link to="/login" className="text-uni-blue underline-offset-2 hover:underline">
          {t('signInHere')}
        </Link>
      </p>
    </div>
  )
}
