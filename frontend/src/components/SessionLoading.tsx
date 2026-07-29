export function SessionLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="w-6 h-6 text-primary animate-spin" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={3} className="opacity-25" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
      </svg>
      <span className="sr-only">Checking your session…</span>
    </div>
  )
}
