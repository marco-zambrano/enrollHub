import {
  getEligibleSubjects,
  getPendingPrerequisites,
  getRemainingCredits,
  getSubjectById,
} from '@/lib/enrollmentValidation'
import type { User } from '@/stores/authStore'

interface ChatContext {
  user: User | null
  enrollment: { selectedScheduleIds: string[] }
}

export function getChatbotResponse(
  question: string,
  ctx: ChatContext,
): { text: string; escalate: boolean } {
  const q = question.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')

  if (q.includes('materia') && (q.includes('matricular') || q.includes('puedo') || q.includes('cursar'))) {
    const eligible = getEligibleSubjects(ctx.user)
    if (!ctx.user) {
      return { text: 'Inicia sesión para ver las materias disponibles según tu avance académico.', escalate: false }
    }
    if (eligible.length === 0) {
      return { text: 'No tienes materias elegibles en este momento. Revisa tus prerrequisitos pendientes.', escalate: false }
    }
    const list = eligible.map((s) => `${s.code} — ${s.name} (${s.credits} créditos)`).join('; ')
    return { text: `Puedes matricular: ${list}.`, escalate: false }
  }

  if (q.includes('prerrequisito') || q.includes('requisito')) {
    const pending = getPendingPrerequisites(ctx.user)
    if (!ctx.user) return { text: 'Inicia sesión para consultar tus prerrequisitos.', escalate: false }
    if (pending.length === 0) {
      return { text: 'No tienes prerrequisitos pendientes. ¡Puedes continuar con tu matrícula!', escalate: false }
    }
    const list = pending
      .map((p) => `${p.subject.name}: falta ${p.missing.map((m) => getSubjectById(m)?.code || m).join(', ')}`)
      .join('; ')
    return { text: `Prerrequisitos pendientes: ${list}.`, escalate: false }
  }

  if (q.includes('credito') || q.includes('falta')) {
    const remaining = getRemainingCredits(ctx.user)
    if (!ctx.user) return { text: 'Inicia sesión para consultar tus créditos.', escalate: false }
    return {
      text: `Te faltan ${remaining} créditos para completar tu carrera. Llevas ${ctx.user.completedCredits || 0} créditos aprobados.`,
      escalate: false,
    }
  }

  if (q.includes('proceso') || q.includes('como') || q.includes('paso')) {
    return {
      text: 'El proceso de matrícula tiene estos pasos: 1) Revisar elegibilidad, 2) Ver oferta académica, 3) Seleccionar materias y horarios, 4) Validar choques, 5) Confirmar matrícula, 6) Descargar comprobante.',
      escalate: false,
    }
  }

  if (q.includes('horario') || q.includes('choque')) {
    return {
      text: 'El sistema detecta automáticamente choques de horario al seleccionar paralelos. Si hay conflicto, verás un mensaje de error con sugerencia para elegir otro horario.',
      escalate: false,
    }
  }

  if (q.includes('comprobante') || q.includes('descargar')) {
    return {
      text: 'Después de confirmar tu matrícula, accede a "Comprobante" desde tu panel para ver e imprimir tu registro.',
      escalate: false,
    }
  }

  return {
    text: 'No pude resolver tu consulta. He escalado tu caso al equipo administrativo. Te contactarán pronto.',
    escalate: true,
  }
}
