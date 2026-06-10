import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { Landing } from '@/pages/Landing'
import { Login } from '@/pages/auth/Login'
import { Register } from '@/pages/auth/Register'
import { StudentDashboard } from '@/pages/student/StudentDashboard'
import { AcademicOffer } from '@/pages/student/AcademicOffer'
import { EnrollmentWizard } from '@/pages/student/EnrollmentWizard'
import { Receipt } from '@/pages/student/Receipt'
import { Profile } from '@/pages/student/Profile'
import { WelcomeTutorial } from '@/pages/student/WelcomeTutorial'
import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { CareersManagement } from '@/pages/admin/CareersManagement'
import { Reports } from '@/pages/admin/Reports'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Landing /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      {
        path: 'student/welcome',
        element: (
          <ProtectedRoute role="student">
            <WelcomeTutorial />
          </ProtectedRoute>
        ),
      },
      {
        path: 'student/dashboard',
        element: (
          <ProtectedRoute role="student">
            <StudentDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'student/offer',
        element: (
          <ProtectedRoute role="student">
            <AcademicOffer />
          </ProtectedRoute>
        ),
      },
      {
        path: 'student/enroll',
        element: (
          <ProtectedRoute role="student">
            <EnrollmentWizard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'student/receipt/:id',
        element: (
          <ProtectedRoute role="student">
            <Receipt />
          </ProtectedRoute>
        ),
      },
      {
        path: 'student/profile',
        element: (
          <ProtectedRoute role="student">
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/dashboard',
        element: (
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/careers',
        element: (
          <ProtectedRoute role="admin">
            <CareersManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/reports',
        element: (
          <ProtectedRoute role="admin">
            <Reports />
          </ProtectedRoute>
        ),
      },
    ],
  },
])
