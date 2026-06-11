import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'student' | 'admin'
export type StudentType = 'new' | 'regular'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  studentType?: StudentType
  careerId?: string
  completedCredits?: number
  approvedSubjects?: string[]
}

interface AuthState {
  user: User | null
  users: Array<User & { password: string }>
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  updateProfile: (data: Partial<User>) => void
}

export interface RegisterData {
  email: string
  password: string
  name: string
  careerId: string
}

const MOCK_USERS: Array<User & { password: string }> = [
  {
    id: 'u1',
    email: 'nuevo@uni.edu',
    password: 'demo1234',
    name: 'Ana García',
    role: 'student',
    studentType: 'new',
    careerId: 'c1',
    completedCredits: 0,
    approvedSubjects: [],
  },
  {
    id: 'u2',
    email: 'estudiante@uni.edu',
    password: 'demo1234',
    name: 'Carlos Mendoza',
    role: 'student',
    studentType: 'regular',
    careerId: 'c1',
    completedCredits: 45,
    approvedSubjects: ['s1', 's2', 's3', 's4'],
  },
  {
    id: 'u3',
    email: 'admin@uni.edu',
    password: 'admin1234',
    name: 'María Administradora',
    role: 'admin',
  },
]

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      users: MOCK_USERS,

      login: async (email, password) => {
        await new Promise((r) => setTimeout(r, 300))
        const found = get().users.find(
          (u) => u.email === email && u.password === password,
        )
        if (!found) {
          return {
            success: false,
            error: 'Credenciales incorrectas. Verifica tu correo y contraseña institucional.',
          }
        }
        const { password: _, ...user } = found
        set({ user })
        return { success: true }
      },

      register: async (data) => {
        await new Promise((r) => setTimeout(r, 300))
        const exists = get().users.some((u) => u.email === data.email)
        if (exists) {
          return {
            success: false,
            error: 'Este correo ya está registrado. Intenta iniciar sesión.',
          }
        }
        const newUser: User = {
          id: `u-${Date.now()}`,
          email: data.email,
          name: data.name,
          role: 'student',
          studentType: 'new',
          careerId: data.careerId,
          completedCredits: 0,
          approvedSubjects: [],
        }
        set((s) => ({
          user: newUser,
          users: [...s.users, { ...newUser, password: data.password }],
        }))
        return { success: true }
      },

      logout: () => set({ user: null }),

      updateProfile: (data) => {
        const current = get().user
        if (current) set({ user: { ...current, ...data } })
      },
    }),
    {
      name: 'enrollhub-auth',
      merge: (persisted, initial) => {
        const merged = { ...initial, ...(persisted as Partial<AuthState>) }
        const persistedUsers = (persisted as Partial<AuthState> & { users?: Array<User & { password: string }> }).users ?? []
        const persistedEmails = new Set(persistedUsers.map((u) => u.email))
        const missingMockUsers = MOCK_USERS.filter((u) => !persistedEmails.has(u.email))
        if (!persistedEmails.size) {
          merged.users = [...MOCK_USERS]
        } else if (missingMockUsers.length > 0) {
          merged.users = [...persistedUsers, ...missingMockUsers]
        }
        return merged
      },
    },
  ),
)
