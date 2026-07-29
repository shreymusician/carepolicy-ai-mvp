import { Navigate, Outlet } from 'react-router-dom'
import { SessionLoading } from './SessionLoading'
import { CoordinatorLayout } from './CoordinatorLayout'
import { useAuth } from '../state/AuthContext'

export function RequireCoordinator() {
  const { user, initializing } = useAuth()

  if (initializing) return <SessionLoading />
  if (!user || user.role !== 'insurance_coordinator') return <Navigate to="/insurance-coordinator" replace />

  return (
    <CoordinatorLayout>
      <Outlet />
    </CoordinatorLayout>
  )
}
