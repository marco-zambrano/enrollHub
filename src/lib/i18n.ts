import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  es: {
    translation: {
      appName: 'EnrollHub',
      tagline: 'Matrícula universitaria inteligente y accesible',
      skipToContent: 'Ir al contenido principal',
      login: 'Iniciar sesión',
      register: 'Registrarse',
      dashboard: 'Panel principal',
      logout: 'Cerrar sesión',
      welcome: 'Bienvenido a EnrollHub',
      welcomeDesc:
        'Gestiona tu matrícula de forma clara, rápida y accesible para todos.',
      getStarted: 'Comenzar matrícula',
      learnMore: 'Conocer el proceso',
    },
  },
  en: {
    translation: {
      appName: 'EnrollHub',
      tagline: 'Smart and accessible university enrollment',
      skipToContent: 'Skip to main content',
      login: 'Sign in',
      register: 'Register',
      dashboard: 'Dashboard',
      logout: 'Sign out',
      welcome: 'Welcome to EnrollHub',
      welcomeDesc:
        'Manage your enrollment in a clear, fast, and accessible way for everyone.',
      getStarted: 'Start enrollment',
      learnMore: 'Learn about the process',
    },
  },
}

void i18n.use(initReactI18next).init({
  resources,
  lng: 'es',
  fallbackLng: 'es',
  interpolation: { escapeValue: false },
})

export default i18n
