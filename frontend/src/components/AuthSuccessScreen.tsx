import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { AuthPortalLayout } from './AuthPortalLayout'
import { SessionLoading } from './SessionLoading'
import { useAuth } from '../state/AuthContext'
import type { UserRole } from '../types/auth'

interface AuthSuccessScreenProps {
  role: UserRole
  loginPath: string
  message: string
  continueTo?: string
}

export function AuthSuccessScreen({ role, loginPath, message, continueTo }: AuthSuccessScreenProps) {
  const { user, initializing, logout } = useAuth()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)

  if (initializing || loggingOut) return <SessionLoading />
  if (!user || user.role !== role) return <Navigate to={loginPath} replace />

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await logout()
    } finally {
      navigate('/', { replace: true })
    }
  }

  return (
    <AuthPortalLayout title="Authentication Successful" subtitle={`Welcome back, ${user.name}.`}>
      <p className="text-sm sm:text-base text-text-muted leading-relaxed mb-8">{message}</p>

      <div className="flex flex-col gap-3">
        {continueTo ? (
          <button
            type="button"
            onClick={() => navigate(continueTo)}
            className="w-full min-h-[48px] inline-flex items-center justify-center bg-primary text-white font-semibold text-base py-3 px-6 rounded-xl hover:bg-blue-700 transition"
          >
            Continue
          </button>
        ) : (
          <>
            <button
              type="button"
              disabled
              className="w-full min-h-[48px] inline-flex items-center justify-center bg-primary/50 text-white font-semibold text-base py-3 px-6 rounded-xl cursor-not-allowed"
            >
              Continue
            </button>
            <p className="text-xs text-text-muted text-center -mt-1">Your dashboard is coming soon.</p>
          </>
        )}

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full min-h-[48px] border-2 border-primary text-primary font-semibold text-base py-3 px-6 rounded-xl transition-colors duration-150 hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60"
        >
          {loggingOut ? 'Logging out…' : 'Log out'}
        </button>
      </div>
    </AuthPortalLayout>
  )
}
