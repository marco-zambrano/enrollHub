import schedules from '@/data/mock/schedules.json'
import { useAdminStore } from '@/stores/adminStore'
import type { User } from '@/stores/authStore'

export interface Schedule {
  id: string
  subjectId: string
  parallel: string
  professor: string
  day: string
  startTime: string
  endTime: string
  capacity: number
  enrolled: number
}

export interface Subject {
  id: string
  code: string
  name: string
  credits: number
  careerId: string
  prerequisites: string[]
}

const DAY_ORDER = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

function timeToMinutes(time: string) {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function hasScheduleConflict(a: Schedule, b: Schedule) {
  if (a.day !== b.day) return false
  const aStart = timeToMinutes(a.startTime)
  const aEnd = timeToMinutes(a.endTime)
  const bStart = timeToMinutes(b.startTime)
  const bEnd = timeToMinutes(b.endTime)
  return aStart < bEnd && bStart < aEnd
}

export function getEligibleSubjects(user: User | null) {
  if (!user?.careerId) return []
  const approved = new Set(user.approvedSubjects || [])
  return (useAdminStore.getState().subjects as Subject[]).filter((s) => {
    if (s.careerId !== user.careerId) return false
    if (approved.has(s.id)) return false
    return s.prerequisites.every((p) => approved.has(p))
  })
}

export function getPendingPrerequisites(user: User | null) {
  if (!user?.careerId) return []
  const approved = new Set(user.approvedSubjects || [])
  return (useAdminStore.getState().subjects as Subject[])
    .filter((s) => s.careerId === user.careerId && !approved.has(s.id))
    .filter((s) => s.prerequisites.some((p) => !approved.has(p)))
    .map((s) => ({
      subject: s,
      missing: s.prerequisites.filter((p) => !approved.has(p)),
    }))
}

export function getRemainingCredits(user: User | null) {
  if (!user?.careerId) return 0
  const career = useAdminStore.getState().careers.find((c) => c.id === user.careerId)
  if (!career) return 0
  return Math.max(0, career.totalCredits - (user.completedCredits || 0))
}

export function getSchedulesForSubject(subjectId: string) {
  return (schedules as Schedule[]).filter((s) => s.subjectId === subjectId)
}

export function validateEnrollmentSelection(
  scheduleIds: string[],
  user: User | null,
): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  const selected = (schedules as Schedule[]).filter((s) => scheduleIds.includes(s.id))

  for (const sch of selected) {
    const subject = (useAdminStore.getState().subjects as Subject[]).find((s) => s.id === sch.subjectId)
    if (!subject) continue
    const approved = new Set(user?.approvedSubjects || [])
    const missing = subject.prerequisites.filter((p) => !approved.has(p))
    if (missing.length > 0) {
      errors.push(
        `${subject.name}: faltan prerrequisitos (${missing.join(', ')}). Completa las materias requeridas antes de matricular.`,
      )
    }
    if (sch.enrolled >= sch.capacity) {
      errors.push(`${subject.name} paralelo ${sch.parallel}: cupo agotado. Selecciona otro horario.`)
    }
  }

  for (let i = 0; i < selected.length; i++) {
    for (let j = i + 1; j < selected.length; j++) {
      if (hasScheduleConflict(selected[i], selected[j])) {
        errors.push(
          `Choque de horario: ${selected[i].day} ${selected[i].startTime}–${selected[i].endTime} con otra materia seleccionada.`,
        )
      }
    }
  }

  const subjectIds = selected.map((s) => s.subjectId)
  const duplicates = subjectIds.filter((id, i) => subjectIds.indexOf(id) !== i)
  if (duplicates.length > 0) {
    errors.push('No puedes matricular la misma asignatura dos veces en el mismo período.')
  }

  return { valid: errors.length === 0, errors }
}

export function getSubjectById(id: string) {
  return (useAdminStore.getState().subjects as Subject[]).find((s) => s.id === id)
}

export function getScheduleById(id: string) {
  return (schedules as Schedule[]).find((s) => s.id === id)
}

export function sortSchedulesByDay(items: Schedule[]) {
  return [...items].sort(
    (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day) || a.startTime.localeCompare(b.startTime),
  )
}
