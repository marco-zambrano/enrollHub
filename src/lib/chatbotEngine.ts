import type { User } from '@/stores/authStore'
import careersData from '@/data/mock/careers.json'
import subjectsData from '@/data/mock/subjects.json'

interface ChatContext {
  user: User | null
  enrollment: { selectedScheduleIds: string[] }
}

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash'
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

function buildSystemPrompt(ctx: ChatContext): string {
  const { user } = ctx
  const isAdmin = user?.role === 'admin'

  const careerList = careersData
    .map((c) => `- ${c.name} (${c.id}): ${c.totalCredits} créditos totales`)
    .join('\n')

  const subjectsByCareer = careersData
    .map((career) => {
      const subs = subjectsData
        .filter((s) => s.careerId === career.id)
        .map(
          (s) =>
            `    ${s.code} — ${s.name} (${s.credits} créditos)` +
            (s.prerequisites.length > 0
              ? `, prerrequisitos: ${s.prerequisites.join(', ')}`
              : ''),
        )
        .join('\n')
      return `  ${career.name}:\n${subs}`
    })
    .join('\n\n')

  const userSection = user
    ? `- Nombre: ${user.name}
- Correo: ${user.email}
- Rol: ${user.role === 'admin' ? 'Administrador' : 'Estudiante'}
- Carrera: ${user.careerId || 'No asignada'}
- Créditos aprobados: ${user.completedCredits ?? 0}
- Materias aprobadas: ${(user.approvedSubjects ?? []).join(', ') || 'Ninguna'}
- Tipo de estudiante: ${user.studentType || 'No especificado'}`
    : '- No ha iniciado sesión (respuestas generales)'

  const roleRules = isAdmin
    ? `- Como administrador, puedes gestionar carreras, asignaturas y horarios, y ver reportes del sistema.
- Responde preguntas sobre la estructura académica: carreras, sus asignaturas, créditos, códigos y prerrequisitos.`
    : `- Ayuda al estudiante con su matrícula: qué materias puede cursar, prerrequisitos, créditos restantes, proceso de inscripción y horarios.`

  return `Eres un asistente virtual de EnrollHub, una plataforma de matrícula universitaria.

## Catálogo académico completo

### Carreras disponibles
${careerList}

### Asignaturas por carrera
${subjectsByCareer}

## Contexto del usuario
${userSection}

## Reglas
1. Responde SIEMPRE en español, de forma clara y concisa (máximo 3 párrafos).
2. ${roleRules}
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
    const res = await fetch(`${API_BASE}/${MODEL}:generateContent?key=${API_KEY}`, {
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
          maxOutputTokens: 1024,
        },
      }),
    })

    if (!res.ok) {
      const errBody = await res.text()
      console.error(`[chatbot] Gemini API error ${res.status} (model: ${MODEL}):`, errBody)
      return {
        text: `Error del asistente (${res.status}). Revisa que la API key y el modelo "${MODEL}" sean válidos en https://aistudio.google.com/apikey`,
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
