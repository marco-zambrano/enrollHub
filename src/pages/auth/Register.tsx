import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { AccessibleForm } from '@/components/forms/AccessibleForm'
import { FormField } from '@/components/forms/FormField'
import { SelectField } from '@/components/forms/SelectField'
import { useAuthStore } from '@/stores/authStore'
import careers from '@/data/mock/careers.json'

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
  const navigate = useNavigate()
  const register = useAuthStore((s) => s.register)

  useEffect(() => {
    document.title = 'Registro — EnrollHub'
  }, [])

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <Breadcrumb items={[{ label: 'Inicio', href: '/' }, { label: 'Registro' }]} />

      <h1 className="mt-6 font-display text-2xl font-bold text-uni-navy">
        Registro de primer ingreso
      </h1>
      <p className="mt-2 text-sm text-uni-slate">
        Crea tu cuenta para acceder al proceso de matrícula.
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
        submitLabel="Crear cuenta de estudiante"
        critical
        confirmTitle="Confirmar registro"
        confirmSummary={(data) => (
          <p>
            Registrarás la cuenta <strong>{data.email}</strong> para la carrera seleccionada.
            ¿Deseas continuar?
          </p>
        )}
        successMessage="Cuenta creada exitosamente."
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
          <legend className="mb-2 text-sm font-medium text-uni-navy">Datos personales</legend>
          <FormField
            name="name"
            label="Nombre completo"
            hint="Como aparece en tu documento de identidad"
            required
            autoComplete="name"
          />
          <FormField
            name="email"
            label="Correo institucional"
            type="email"
            hint="Será tu usuario de acceso al sistema"
            required
            autoComplete="email"
          />
          <FormField
            name="password"
            label="Contraseña"
            type="password"
            hint="Mínimo 8 caracteres. Puedes usar un gestor de contraseñas."
            required
            autoComplete="new-password"
          />
          <FormField
            name="confirmPassword"
            label="Confirmar contraseña"
            type="password"
            required
            autoComplete="new-password"
          />
          <SelectField
            name="careerId"
            label="Carrera"
            hint="Selecciona la carrera en la que te matricularás"
            required
            options={careers.map((c) => ({ value: c.id, label: c.name }))}
          />
        </fieldset>
      </AccessibleForm>

      <p className="mt-6 text-center text-sm text-uni-slate">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="text-uni-blue underline-offset-2 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  )
}
