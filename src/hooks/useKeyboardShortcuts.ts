import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccessibilityStore } from '@/stores/accessibilityStore'
import { useAuthStore } from '@/stores/authStore'

export function useKeyboardShortcuts() {
  const navigate = useNavigate()
  const active = useAccessibilityStore((s) => s.characterKeyShortcuts)
  const toggleMenu = useAccessibilityStore((s) => s.toggleMenu)
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    if (!active) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input, textarea, or contenteditable
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return
      }

      // Ignore if modifier keys are pressed
      if (e.ctrlKey || e.altKey || e.metaKey) return

      const key = e.key.toLowerCase()

      switch (key) {
        case 'a':
          e.preventDefault()
          toggleMenu()
          break
        case 'c':
          e.preventDefault()
          const chatbotBtn = document.querySelector<HTMLButtonElement>('[aria-controls="chatbot-panel"]')
          if (chatbotBtn) chatbotBtn.click()
          break
        case 'd':
          e.preventDefault()
          if (user?.role === 'admin') navigate('/admin/dashboard')
          else if (user?.role === 'student') navigate('/student/dashboard')
          else navigate('/login')
          break
        case 'h':
          e.preventDefault()
          navigate('/')
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [active, navigate, toggleMenu, user])
}
