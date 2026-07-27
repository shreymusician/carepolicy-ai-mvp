import { Outlet, Link } from 'react-router-dom'
import { Navbar } from './Navbar'

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-text">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-border mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <p className="text-sm text-text-muted">
            CarePolicy AI — information sourced from official IRDAI and insurer documents.
          </p>
          <div className="flex gap-5 text-sm">
            <Link to="/explorer" className="text-text-muted hover:text-primary">Insurance Explorer</Link>
            <Link to="/about" className="text-text-muted hover:text-primary">About</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
