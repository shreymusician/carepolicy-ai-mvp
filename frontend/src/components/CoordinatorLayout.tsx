import { Link, useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { BrandMark } from './BrandMark'
import { useAuth } from '../state/AuthContext'

export function CoordinatorLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen flex flex-col bg-background-alt/40 text-text">
      <header className="sticky top-0 z-10 bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <Link to="/coordinator/dashboard" className="flex items-center gap-2.5 min-w-0">
            <BrandMark className="w-9 h-9 shrink-0" iconClassName="w-4 h-4" />
            <span className="font-bold text-base text-text truncate">MyInsurance</span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {user && <span className="hidden sm:inline text-sm text-text-muted truncate max-w-[180px]">{user.name}</span>}
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm font-semibold text-text-muted hover:text-primary rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  )
}
