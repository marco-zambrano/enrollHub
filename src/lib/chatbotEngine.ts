import type { User } from '@/stores/authStore'

interface ChatContext {
  user: User | null
  enrollment: { selectedScheduleIds: string[] }
}

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash'
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`

function buildSystemPrompt(ctx: ChatContext): string {
  const { user } = ctx

  return `Eres un asistente virtual de EnrollHub, una plataforma de matrícula universitaria.
Tu rol es ayudar a estudiantes con dudas sobre el proceso de matrícula, materias, horarios y requisitos.

Contexto del estudiante:
${user ? `- Nombre: ${user.name}
- Correo: ${user.email}
- Carrera: ${user.careerId || 'No asignada'}
- Créditos aprobados: ${user.completedCredits ?? 0}
- Materias aprobadas: ${(user.approvedSubjects ?? []).join(', ') || 'Ninguna'}
- Tipo de estudiante: ${user.studentType || 'No especificado'}` : '- No ha iniciado sesión (respuestas generales)'}

Reglas:
1. Responde SIEMPRE en español, de forma clara y concisa (máximo 3 párrafos).
2. Si el usuario pregunta sobre materias que puede cursar, prerrequisitos, créditos o proceso de matrícula, usa el contexto proporcionado.
3. Si la consulta está fuera del alcance de EnrollHub, responde cordialmente que solo puedes ayudar con temas de matrícula.
4. No inventes información. Si no sabes algo, indícalo honestamente.
5. Si el usuario necesita ayuda que no puedes brindar, indica que escalarás el caso al equipo administrativo.`
}

export async function getChatbotResponse(
  question: string,
  ctx: ChatContext,
): Promise<{ text: string; escalate: boolean }> {
  if (!API_KEY || API_KEY === 'tu-api-key-de-gemini') {
    return {
      text: 'El asistente no está configurado. El administrador debe agregar una clave de API de Gemini en el archivo .env.',
      escalate: false,
    }
  }

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: buildSystemPrompt(ctx) }],
        },
        contents: [
          {
            parts: [{ text: question }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 512,
        },
      }),
    })

    if (!res.ok) {
      const errBody = await res.text()
      console.error('Gemini API error:', res.status, errBody)
      return {
        text: 'Ocurrió un error al contactar el asistente. Intenta de nuevo más tarde.',
        escalate: true,
      }
    }

    const data = await res.json()
    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ''

    if (!text) {
      return {
        text: 'No obtuve una respuesta válida. He escalado tu consulta al equipo administrativo.',
        escalate: true,
      }
    }

    return { text, escalate: false }
  } catch (err) {
    console.error('Chatbot API call failed:', err)
    return {
      text: 'No pude conectar con el servidor. He escalado tu caso al equipo administrativo.',
      escalate: true,
    }
  }
}
