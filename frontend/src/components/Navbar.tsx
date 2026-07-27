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
  { to: '/claims', label: 'Claim Assistant' },
  { to: '/assistant', label: 'AI Assistant' },
  { to: '/hospitals', label: 'Network Hospitals', disabled: true },
  { to: '/about', label: 'About' }
]

export function Navbar() {
  const [open, setOpen] = useState(false)

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition ${
      isActive ? 'bg-blue-50 text-primary' : 'text-text-light hover:text-primary hover:bg-background-alt'
    }`

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-border">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 shrink-0" onClick={() => setOpen(false)}>
            <span className="w-8 h-8 rounded-lg bg-primary text-white grid place-items-center font-bold">C</span>
            <span className="font-bold text-lg text-text">CarePolicy AI</span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map(item =>
              item.disabled ? (
                <span
                  key={item.to}
                  title="Coming in a future version"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-text-muted/60 cursor-not-allowed flex items-center gap-1.5"
                >
                  {item.label}
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-background-alt text-text-muted">
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
            className="lg:hidden p-2 rounded-lg hover:bg-background-alt text-text"
          >
            <span className="block w-5 h-0.5 bg-current mb-1" />
            <span className="block w-5 h-0.5 bg-current mb-1" />
            <span className="block w-5 h-0.5 bg-current" />
          </button>
        </div>

        {open && (
          <div className="lg:hidden pb-4 flex flex-col gap-1">
            {NAV_ITEMS.map(item =>
              item.disabled ? (
                <span
                  key={item.to}
                  className="px-3 py-2.5 rounded-lg text-sm font-medium text-text-muted/60 flex items-center gap-2"
                >
                  {item.label}
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-background-alt text-text-muted">
                    Soon
                  </span>
                </span>
              ) : (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `px-3 py-2.5 rounded-lg text-sm font-medium ${
                      isActive ? 'bg-blue-50 text-primary' : 'text-text-light hover:bg-background-alt'
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
