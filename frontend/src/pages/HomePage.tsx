import { Link } from 'react-router-dom'
import { BrandMark } from '../components/BrandMark'

interface RoleCard {
  to: string
  title: string
  description: string
  icon: JSX.Element
}

const ROLES: RoleCard[] = [
  {
    to: '/policy-holder',
    title: 'Policy Holder',
    description: 'Understand and manage your own insurance.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 sm:w-7 sm:h-7">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
      </svg>
    )
  },
  {
    to: '/insurance-coordinator',
    title: 'Insurance Coordinator',
    description: 'Process insurance professionally.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 sm:w-7 sm:h-7">
        <path d="M4 21V6.5L12 3l8 3.5V21" />
        <path d="M9 21v-6h6v6" />
        <path d="M12 8v4M10 10h4" />
      </svg>
    )
  }
]

const TRUST_POINTS = ['Secure Authentication', 'Privacy Protected', 'Official Insurance Documents Supported']

export function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-text">
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-10 sm:py-16">
        <div className="max-w-2xl w-full">
          {/* Identity */}
          <header className="text-center mb-9 sm:mb-12">
            <BrandMark
              className="w-16 h-16 sm:w-[4.5rem] sm:h-[4.5rem] mx-auto mb-6"
              iconClassName="w-8 h-8 sm:w-9 sm:h-9"
            />
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-text mb-2.5">MyInsurance</h1>
            <p className="text-lg sm:text-xl text-text-light font-medium mb-3">
              Health insurance made simple.
            </p>
            <p className="text-sm sm:text-base text-text-muted leading-relaxed max-w-md mx-auto">
              Continue as a Policy Holder or as an Insurance Coordinator.
            </p>
          </header>

          <p className="text-center text-xs font-semibold uppercase tracking-wider text-text-muted mb-4 sm:mb-5">
            Select how you'd like to continue
          </p>

          {/* Role cards */}
          <div className="flex flex-col gap-4 sm:gap-5">
            {ROLES.map(role => (
              <Link
                key={role.to}
                to={role.to}
                className="group flex items-center gap-4 sm:gap-5 bg-white border border-border rounded-3xl p-6 sm:p-8 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-12px_rgba(0,0,0,0.14)] hover:border-primary/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <span className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-blue-50 text-primary grid place-items-center">
                  {role.icon}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-bold text-lg sm:text-xl text-text mb-1.5">{role.title}</span>
                  <span className="block text-sm sm:text-base text-text-muted leading-relaxed">
                    {role.description}
                  </span>
                </span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 w-5 h-5 sm:w-6 sm:h-6 text-text-muted transition-all duration-200 group-hover:text-primary group-hover:translate-x-0.5"
                >
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </Link>
            ))}
          </div>

          {/* Trust */}
          <ul className="mt-10 sm:mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm text-text-muted">
            {TRUST_POINTS.map(point => (
              <li key={point} className="flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-primary/70 shrink-0">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </main>

      <footer className="py-6 sm:py-8 text-center border-t border-border/60">
        <p className="text-xs text-text-muted tracking-wide">Privacy &nbsp;·&nbsp; Terms &nbsp;·&nbsp; Contact</p>
      </footer>
    </div>
  )
}
