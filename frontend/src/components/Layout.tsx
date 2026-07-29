import { Outlet, Link } from 'react-router-dom'
import { Navbar } from './Navbar'
import { CopilotProvider } from '../copilot/CopilotContext'
import { CopilotFab } from '../copilot/CopilotFab'
import { CopilotPanel } from '../copilot/CopilotPanel'

export function Layout() {
  return (
    <CopilotProvider>
      <div className="app-shell flex min-h-screen flex-col text-slate-900">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <footer className="mt-16 border-t border-slate-200/80 bg-white/70 backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <p className="text-sm text-slate-600">
              MyInsurance — information sourced from official IRDAI and insurer documents.
            </p>
            <div className="flex flex-wrap gap-5 text-sm">
              <Link to="/explorer" className="text-slate-600 transition hover:text-primary">Insurance Explorer</Link>
              <Link to="/about" className="text-slate-600 transition hover:text-primary">About</Link>
            </div>
          </div>
        </footer>

        <CopilotFab />
        <CopilotPanel />
      </div>
    </CopilotProvider>
  )
}
