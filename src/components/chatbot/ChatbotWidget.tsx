import { useRef, useState } from 'react'
import { MessageCircle, Send, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { useAuthStore } from '@/stores/authStore'
import { useEnrollmentStore } from '@/stores/enrollmentStore'
import { useAdminStore } from '@/stores/adminStore'
import { getChatbotResponse } from '@/lib/chatbotEngine'

interface Message {
  id: string
  role: 'user' | 'bot'
  text: string
}

export function ChatbotWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'bot',
      text: '¡Hola! Soy tu asistente de matrícula. Puedo ayudarte con materias, prerrequisitos y el proceso de inscripción.',
    },
  ])
  const panelRef = useRef<HTMLDivElement>(null)
  const user = useAuthStore((s) => s.user)
  const selectedScheduleIds = useEnrollmentStore((s) => s.selectedScheduleIds)
  const addEscalation = useAdminStore((s) => s.addEscalation)

  useFocusTrap(panelRef, open, () => setOpen(false))

  const sendMessage = () => {
    const text = input.trim()
    if (!text) return

    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', text }
    setMessages((prev) => [...prev, userMsg])
    setInput('')

    const response = getChatbotResponse(text, {
      user,
      enrollment: { selectedScheduleIds },
    })
    const botMsg: Message = { id: `b-${Date.now()}`, role: 'bot', text: response.text }
    setMessages((prev) => [...prev, botMsg])

    if (response.escalate) {
      addEscalation({
        studentName: user?.name || 'Visitante',
        studentEmail: user?.email || 'sin correo',
        summary: `Chat: "${text}" — ${response.text}`,
      })
    }
  }

  return (
    <>
      <Button
        className="fixed right-4 bottom-20 z-[7000] h-12 w-12 rounded-full shadow-lg"
        size="icon"
        aria-label="Abrir asistente de matrícula"
        aria-expanded={open}
        aria-controls="chatbot-panel"
        onClick={() => setOpen(!open)}
      >
        <MessageCircle className="h-5 w-5" aria-hidden="true" />
      </Button>

      {open && (
        <div
          ref={panelRef}
          id="chatbot-panel"
          role="dialog"
          aria-label="Asistente de matrícula"
          aria-modal="true"
          className="fixed right-4 bottom-36 z-[7001] flex h-[28rem] w-full max-w-sm flex-col rounded-lg border border-uni-border bg-white shadow-2xl"
        >
          <header className="flex items-center justify-between border-b border-uni-border px-4 py-3">
            <h2 className="font-display text-sm font-semibold text-uni-navy">
              Asistente EnrollHub
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              aria-label="Cerrar asistente"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </header>

          <div
            className="flex-1 space-y-3 overflow-y-auto p-4"
            role="log"
            aria-live="polite"
            aria-relevant="additions"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'ml-auto bg-uni-blue text-white'
                    : 'bg-uni-gray text-uni-navy'
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <form
            className="flex gap-2 border-t border-uni-border p-3"
            onSubmit={(e) => {
              e.preventDefault()
              sendMessage()
            }}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu pregunta..."
              aria-label="Mensaje para el asistente"
            />
            <Button type="submit" size="icon" aria-label="Enviar mensaje">
              <Send className="h-4 w-4" aria-hidden="true" />
            </Button>
          </form>
        </div>
      )}
    </>
  )
}
