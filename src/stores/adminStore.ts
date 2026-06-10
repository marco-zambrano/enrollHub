import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import careersData from '@/data/mock/careers.json'
import subjectsData from '@/data/mock/subjects.json'
import periodsData from '@/data/mock/periods.json'

export interface EscalationCase {
  id: string
  studentName: string
  studentEmail: string
  summary: string
  createdAt: string
  status: 'open' | 'resolved'
}

interface Career {
  id: string
  name: string
  totalCredits: number
}

interface Subject {
  id: string
  code: string
  name: string
  credits: number
  careerId: string
  prerequisites: string[]
}

interface Period {
  id: string
  name: string
  startDate: string
  endDate: string
  enrollmentStart: string
  enrollmentEnd: string
  active: boolean
}

interface AdminState {
  careers: Career[]
  subjects: Subject[]
  periods: Period[]
  escalations: EscalationCase[]
  addCareer: (career: Omit<Career, 'id'>) => void
  updateCareer: (id: string, data: Partial<Career>) => void
  addSubject: (subject: Omit<Subject, 'id'>) => void
  updateSubject: (id: string, data: Partial<Subject>) => void
  addPeriod: (period: Omit<Period, 'id'>) => void
  addEscalation: (data: Omit<EscalationCase, 'id' | 'createdAt' | 'status'>) => void
  resolveEscalation: (id: string) => void
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      careers: careersData as Career[],
      subjects: subjectsData as Subject[],
      periods: periodsData as Period[],
      escalations: [],

      addCareer: (career) =>
        set((s) => ({
          careers: [...s.careers, { ...career, id: `c-${Date.now()}` }],
        })),

      updateCareer: (id, data) =>
        set((s) => ({
          careers: s.careers.map((c) => (c.id === id ? { ...c, ...data } : c)),
        })),

      addSubject: (subject) =>
        set((s) => ({
          subjects: [...s.subjects, { ...subject, id: `s-${Date.now()}` }],
        })),

      updateSubject: (id, data) =>
        set((s) => ({
          subjects: s.subjects.map((sub) => (sub.id === id ? { ...sub, ...data } : sub)),
        })),

      addPeriod: (period) =>
        set((s) => ({
          periods: [...s.periods, { ...period, id: `p-${Date.now()}` }],
        })),

      addEscalation: (data) =>
        set((s) => ({
          escalations: [
            {
              ...data,
              id: `esc-${Date.now()}`,
              createdAt: new Date().toISOString(),
              status: 'open',
            },
            ...s.escalations,
          ],
        })),

      resolveEscalation: (id) =>
        set((s) => ({
          escalations: s.escalations.map((e) =>
            e.id === id ? { ...e, status: 'resolved' as const } : e,
          ),
        })),
    }),
    { name: 'enrollhub-admin' },
  ),
)
