import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { AccessibleForm } from '@/components/forms/AccessibleForm'
import { FormField } from '@/components/forms/FormField'
import { useAuthStore } from '@/stores/authStore'

const schema = z.object({
  email: z
    .string()
    .min(1, 'El correo es obligatorio. Ingresa tu correo institucional.')
    .email('Formato de correo inválido. Usa el formato nombre@uni.edu.'),
  password: z
    .string()
    .min(1, 'La contraseña es obligatoria. Ingresa tu contraseña institucional.'),
})

type LoginForm = z.infer<typeof schema>

export function Login() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)

  useEffect(() => {
    document.title = 'Iniciar sesión — EnrollHub'
  }, [])

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <Breadcrumb items={[{ label: 'Inicio', href: '/' }, { label: 'Iniciar sesión' }]} />

      <h1 className="mt-6 font-display text-2xl font-bold text-uni-navy">Iniciar sesión</h1>
      <p className="mt-2 text-sm text-uni-slate">
        Accede con tus credenciales institucionales.
      </p>

      <AccessibleForm<LoginForm>
        className="mt-8"
        defaultValues={{ email: '', password: '' }}
        resolver={zodResolver(schema)}
        submitLabel="Iniciar sesión con credenciales institucionales"
        onSubmit={async (data) => {
          const result = await login(data.email, data.password)
          if (!result.success) throw new Error(result.error)
          const user = useAuthStore.getState().user
          if (user?.role === 'admin') navigate('/admin/dashboard')
          else if (user?.studentType === 'new') navigate('/student/welcome')
          else navigate('/student/dashboard')
        }}
      >
        <fieldset className="space-y-4">
          <legend className="sr-only">Credenciales de acceso</legend>
          <FormField
            name="email"
            label="Correo institucional"
            type="email"
            hint="Usa el correo asignado por la universidad, por ejemplo nombre@uni.edu"
            required
            autoComplete="email"
          />
          <FormField
            name="password"
            label="Contraseña"
            type="password"
            hint="Puedes pegar tu contraseña desde un gestor de contraseñas"
            required
            autoComplete="current-password"
          />
        </fieldset>
      </AccessibleForm>

      <p className="mt-6 text-center text-sm text-uni-slate">
        ¿Primera vez?{' '}
        <Link to="/register" className="text-uni-blue underline-offset-2 hover:underline">
          Regístrate aquí
        </Link>
      </p>
    </div>
  )
}
