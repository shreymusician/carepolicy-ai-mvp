import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'

interface NavItem {
  to: string
  label: string
  disabled?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Home' },
  { to: '/explorer', label: 'Insurance Explorer' },
  { to: '/documents', label: 'Medical Documents' },
  { to: '/prior-auth', label: 'Prior Authorization' },
  { to: '/hospitals', label: 'Network Hospitals', disabled: true },
  { to: '/about', label: 'About' }
]

export function Navbar() {
  const [open, setOpen] = useState(false)

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-full px-3.5 py-2 text-sm font-medium transition ${
      isActive ? 'bg-primary/10 text-primary shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <nav className="mx-auto max-w-6xl px-3 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex shrink-0 items-center gap-2.5" onClick={() => setOpen(false)}>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary font-bold text-white shadow-sm">M</span>
            <span className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">MyInsurance</span>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {NAV_ITEMS.map(item =>
              item.disabled ? (
                <span
                  key={item.to}
                  title="Coming in a future version"
                  className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium text-slate-400"
                >
                  {item.label}
                  <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                    Soon
                  </span>
                </span>
              ) : (
                <NavLink key={item.to} to={item.to} end={item.to === '/'} className={linkClass}>
                  {item.label}
                </NavLink>
              )
            )}
          </div>

          <button
            onClick={() => setOpen(v => !v)}
            aria-label="Toggle navigation"
            aria-expanded={open}
            className="rounded-xl p-2.5 text-slate-700 transition hover:bg-slate-100 lg:hidden"
          >
            <span className="mb-1 block h-0.5 w-5 bg-current" />
            <span className="mb-1 block h-0.5 w-5 bg-current" />
            <span className="block h-0.5 w-5 bg-current" />
          </button>
        </div>

        {open && (
          <div className="flex flex-col gap-1.5 pb-4 lg:hidden">
            {NAV_ITEMS.map(item =>
              item.disabled ? (
                <span key={item.to} className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-400">
                  {item.label}
                  <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">Soon</span>
                </span>
              ) : (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `rounded-xl px-3.5 py-2.5 text-sm font-medium ${
                      isActive ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              )
            )}
          </div>
        )}
      </nav>
    </header>
  )
}
