import { Link } from 'react-router-dom'
import { BrandMark } from '../components/BrandMark'

interface RoleCard {
  to: string
  title: string
  description: string
  icon: JSX.Element
  badge: string
}

const ROLES: RoleCard[] = [
  {
    to: '/policy-holder',
    title: 'Policy Holder',
    description: 'Review your cover, understand limits, and move through your case with clarity.',
    badge: 'For patients and members',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 sm:h-7 sm:w-7">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
      </svg>
    )
  },
  {
    to: '/insurance-coordinator',
    title: 'Insurance Coordinator',
    description: 'Prepare cases, compare policies, and keep the review workflow moving.',
    badge: 'For hospital teams',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 sm:h-7 sm:w-7">
        <path d="M4 21V6.5L12 3l8 3.5V21" />
        <path d="M9 21v-6h6v6" />
        <path d="M12 8v4M10 10h4" />
      </svg>
    )
  }
]

const QUICK_WINS = ['Clear next steps', 'Simple policy explanations', 'Faster case preparation']
const TRUST_POINTS = ['Secure sign-in', 'Privacy first', 'Official insurer references']

export function HomePage() {
  return (
    <div className="app-shell flex min-h-screen flex-col text-slate-900">
      <main className="flex-1 px-3 py-5 sm:px-6 sm:py-8 lg:px-8 lg:py-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-8">
          <section className="surface-card overflow-hidden p-5 sm:p-8 lg:p-12">
            <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  Health insurance guided by AI
                </div>
                <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                  A simpler way to understand coverage and prepare cases.
                </h1>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
                  MyInsurance helps patients and coordinators move from paperwork to confident decisions with a calm, guided workflow.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link to="/explorer" className="flex items-center justify-center rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700">
                    Browse insurance plans
                  </Link>
                  <Link to="/analyse" className="flex items-center justify-center rounded-full border border-slate-300 px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary">
                    Upload a policy document
                  </Link>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-6 shadow-inner">
                <div className="flex items-center gap-3">
                  <BrandMark className="h-12 w-12" iconClassName="h-6 w-6" />
                  <div>
                    <p className="text-sm font-semibold text-primary">What you get</p>
                    <p className="text-lg font-semibold text-slate-900">Clear guidance, less friction</p>
                  </div>
                </div>
                <div className="mt-5 grid gap-3">
                  {QUICK_WINS.map(item => (
                    <div key={item} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-primary">✓</span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="surface-card p-5 sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Choose your path</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Start where it feels easiest for you</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Whether you are reviewing your own policy or guiding a hospital case, the experience is designed to feel calm and straightforward.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {TRUST_POINTS.map(point => (
                  <span key={point} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-600">
                    {point}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {ROLES.map(role => (
                <Link
                  key={role.to}
                  to={role.to}
                  className="group flex items-center gap-3 rounded-[1.4rem] border border-slate-200 bg-white/90 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_18px_45px_-24px_rgba(0,102,204,0.5)] sm:gap-4 sm:p-5"
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary sm:h-14 sm:w-14">
                    {role.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="mb-1 block text-sm font-semibold uppercase tracking-[0.2em] text-primary">{role.badge}</span>
                    <span className="block text-lg font-semibold text-slate-900">{role.title}</span>
                    <span className="mt-1 block text-sm leading-6 text-slate-600">{role.description}</span>
                  </span>
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-primary">
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-200/80 bg-white/70 py-6 text-center text-sm text-slate-500">
        Privacy · Terms · Contact
      </footer>
    </div>
  )
}
