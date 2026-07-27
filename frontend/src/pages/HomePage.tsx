import { Link } from 'react-router-dom'

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
    description:
      'Understand your insurance policy, upload documents, check coverage, compare policies and get AI-powered explanations.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
      </svg>
    )
  },
  {
    to: '/insurance-coordinator',
    title: 'Insurance Coordinator',
    description:
      'Review patient insurance, verify eligibility, analyse medical records and prepare Prior Authorization requests.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
        <path d="M4 21V6.5L12 3l8 3.5V21" />
        <path d="M9 21v-6h6v6" />
        <path d="M12 8v4M10 10h4" />
      </svg>
    )
  }
]

export function HomePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* Hero */}
      <div className="text-center mb-10 sm:mb-14">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary text-white grid place-items-center font-bold text-2xl mx-auto mb-5">
          M
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text mb-2">MyInsurance</h1>
        <p className="text-lg sm:text-xl text-text-light font-light mb-4">
          Making Health Insurance easier for everyone.
        </p>
        <p className="text-sm sm:text-base text-text-muted leading-relaxed max-w-lg mx-auto">
          Whether you're managing your own insurance or processing it professionally, choose how you'd like to
          continue below.
        </p>
      </div>

      {/* Role cards */}
      <div className="flex flex-col gap-5 sm:gap-6">
        {ROLES.map(role => (
          <Link
            key={role.to}
            to={role.to}
            className="group flex items-start gap-4 sm:gap-5 bg-white border border-border rounded-2xl p-5 sm:p-7 shadow-sm hover:shadow-md hover:border-primary transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <span className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-blue-50 text-primary border border-blue-100 grid place-items-center">
              {role.icon}
            </span>
            <span className="flex-1 min-w-0">
              <span className="block font-bold text-lg sm:text-xl text-text mb-1.5">{role.title}</span>
              <span className="block text-sm sm:text-base text-text-muted leading-relaxed mb-4">
                {role.description}
              </span>
              <span className="inline-flex items-center justify-center bg-primary text-white font-semibold text-sm sm:text-base py-3 px-6 rounded-xl group-hover:bg-blue-700 transition min-h-[44px]">
                Continue
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
