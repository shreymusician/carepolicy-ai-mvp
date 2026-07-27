import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { BrandMark } from './BrandMark'

interface AuthPortalLayoutProps {
  title: string
  subtitle: string
  children: ReactNode
}

export function AuthPortalLayout({ title, subtitle, children }: AuthPortalLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background-alt/40 text-text">
      <header className="px-4 sm:px-6 py-5">
        <div className="max-w-[480px] mx-auto flex items-center justify-between gap-3">
          <span className="flex items-center gap-2.5 min-w-0">
            <BrandMark className="w-10 h-10 shrink-0" iconClassName="w-5 h-5" />
            <span className="font-bold text-base sm:text-lg text-text truncate">MyInsurance</span>
          </span>
          <Link
            to="/"
            className="shrink-0 inline-flex items-center gap-1.5 min-h-[44px] px-3 -mr-3 rounded-lg text-sm font-semibold text-text-muted transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <path d="M15 6l-6 6 6 6" />
            </svg>
            Back to Home
          </Link>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 pb-12 pt-2 sm:pt-6">
        <div className="max-w-[480px] mx-auto">
          <div className="bg-white border border-border rounded-3xl p-5 sm:p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text mb-2">{title}</h1>
            <p className="text-sm sm:text-base text-text-muted leading-relaxed mb-7">{subtitle}</p>
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
