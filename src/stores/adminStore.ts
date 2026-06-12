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

export interface Career {
  id: string
  name: string
  totalCredits: number
}

export interface Subject {
  id: string
  code: string
  name: string
  credits: number
  careerId: string
  prerequisites: string[]
}

export interface Period {
  id: string
  name: string
  startDate: string
  endDate: string
  enrollmentStart: string
  enrollmentEnd: string
  active: boolean
}

const SEED_VERSION = 2

interface AdminState {
  careers: Career[]
  subjects: Subject[]
  periods: Period[]
  escalations: EscalationCase[]
  _seedVersion: number
  addCareer: (career: Omit<Career, 'id'>) => string
  updateCareer: (id: string, data: Partial<Career>) => void
  removeCareer: (id: string) => void
  addSubject: (subject: Omit<Subject, 'id'>) => string
  updateSubject: (id: string, data: Partial<Subject>) => void
  removeSubject: (id: string) => void
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
      _seedVersion: SEED_VERSION,

      addCareer: (career) => {
        const id = `c-${Date.now()}`
        set((s) => ({ careers: [...s.careers, { ...career, id }] }))
        return id
      },

      updateCareer: (id, data) =>
        set((s) => ({
          careers: s.careers.map((c) => (c.id === id ? { ...c, ...data } : c)),
        })),

      removeCareer: (id) =>
        set((s) => ({
          careers: s.careers.filter((c) => c.id !== id),
          subjects: s.subjects.filter((sub) => sub.careerId !== id),
        })),

      addSubject: (subject) => {
        const id = `s-${Date.now()}`
        set((s) => ({ subjects: [...s.subjects, { ...subject, id }] }))
        return id
      },

      updateSubject: (id, data) =>
        set((s) => ({
          subjects: s.subjects.map((sub) => (sub.id === id ? { ...sub, ...data } : sub)),
        })),

      removeSubject: (id) =>
        set((s) => ({ subjects: s.subjects.filter((sub) => sub.id !== id) })),

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
    {
      name: 'enrollhub-admin',
      merge: (persisted, initial) => {
        const p = persisted as Partial<AdminState>
        if (!p._seedVersion || p._seedVersion !== SEED_VERSION) {
          return { ...initial, _seedVersion: SEED_VERSION }
        }
        return { ...initial, ...p }
      },
    },
  ),
)
