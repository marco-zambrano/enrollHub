import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { GraduationCap, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'

export function Header() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="border-b border-uni-border bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          to={user ? (user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard') : '/'}
          className="flex items-center gap-2 text-uni-navy no-underline"
          aria-label={`${t('appName')} — ${t('dashboard')}`}
        >
          <GraduationCap className="h-8 w-8 text-uni-blue" aria-hidden="true" />
          <span className="font-display text-xl font-bold">{t('appName')}</span>
        </Link>

        <nav aria-label="Navegación principal">
          <ul className="flex items-center gap-2">
            {user ? (
              <>
                <li className="hidden text-sm text-uni-slate sm:block">
                  {user.name}
                </li>
                <li>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    aria-label={t('logout')}
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">{t('logout')}</span>
                    <span className="hidden sm:inline">{t('logout')}</span>
                  </Button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/login">{t('login')}</Link>
                  </Button>
                </li>
                <li>
                  <Button size="sm" asChild>
                    <Link to="/register">{t('register')}</Link>
                  </Button>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  )
}
