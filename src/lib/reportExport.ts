import type { EnrollmentRecord } from '@/stores/enrollmentStore'
import { getScheduleById, getSubjectById } from '@/lib/enrollmentValidation'

export function exportEnrollmentsCSV(enrollments: EnrollmentRecord[]) {
  const headers = ['ID', 'Usuario', 'Período', 'Materias', 'Créditos', 'Fecha']
  const rows = enrollments.map((e) => {
    const subjects = e.scheduleIds
      .map((id) => {
        const sch = getScheduleById(id)
        const sub = sch ? getSubjectById(sch.subjectId) : null
        return sub ? `${sub.code} (${sch?.parallel})` : id
      })
      .join('; ')
    return [e.id, e.userId, e.periodId, subjects, String(e.totalCredits), e.confirmedAt]
  })

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `matriculas-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
