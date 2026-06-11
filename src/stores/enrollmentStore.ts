import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useAdminStore } from '@/stores/adminStore'
import { getScheduleById, getSubjectById } from '@/lib/enrollmentValidation'

export interface EnrollmentRecord {
  id: string
  userId: string
  periodId: string
  scheduleIds: string[]
  confirmedAt: string
  totalCredits: number
}

interface EnrollmentState {
  selectedScheduleIds: string[]
  enrollments: EnrollmentRecord[]
  toggleSchedule: (scheduleId: string) => void
  clearSelection: () => void
  confirmEnrollment: (userId: string) => EnrollmentRecord | null
  getUserEnrollments: (userId: string) => EnrollmentRecord[]
}

export const useEnrollmentStore = create<EnrollmentState>()(
  persist(
    (set, get) => ({
      selectedScheduleIds: [],
      enrollments: [],

      toggleSchedule: (scheduleId) =>
        set((s) => {
          const exists = s.selectedScheduleIds.includes(scheduleId)
          return {
            selectedScheduleIds: exists
              ? s.selectedScheduleIds.filter((id) => id !== scheduleId)
              : [...s.selectedScheduleIds, scheduleId],
          }
        }),

      clearSelection: () => set({ selectedScheduleIds: [] }),

      confirmEnrollment: (userId) => {
        const { selectedScheduleIds, enrollments } = get()
        if (selectedScheduleIds.length === 0) return null

        const activePeriod = useAdminStore.getState().periods.find((p) => p.active)
        const totalCredits = selectedScheduleIds.reduce((sum, id) => {
          const sch = getScheduleById(id)
          const sub = sch ? getSubjectById(sch.subjectId) : null
          return sum + (sub?.credits || 0)
        }, 0)

        const record: EnrollmentRecord = {
          id: `enr-${Date.now()}`,
          userId,
          periodId: activePeriod?.id || 'p1',
          scheduleIds: [...selectedScheduleIds],
          confirmedAt: new Date().toISOString(),
          totalCredits,
        }

        set({
          enrollments: [...enrollments, record],
          selectedScheduleIds: [],
        })
        return record
      },

      getUserEnrollments: (userId) =>
        get().enrollments.filter((e) => e.userId === userId),
    }),
    { name: 'enrollhub-enrollment' },
  ),
)
