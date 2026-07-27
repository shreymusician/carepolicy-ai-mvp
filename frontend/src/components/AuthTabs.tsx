import type { KeyboardEvent } from 'react'

export type AuthTab = 'signin' | 'signup'

const TABS: { id: AuthTab; label: string }[] = [
  { id: 'signin', label: 'Sign In' },
  { id: 'signup', label: 'Create Account' }
]

interface AuthTabsProps {
  value: AuthTab
  onChange: (tab: AuthTab) => void
}

export function AuthTabs({ value, onChange }: AuthTabsProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    onChange(value === 'signin' ? 'signup' : 'signin')
  }

  return (
    <div
      role="tablist"
      aria-label="Authentication options"
      onKeyDown={handleKeyDown}
      className="grid grid-cols-2 gap-1 p-1 bg-background-alt rounded-xl mb-7"
    >
      {TABS.map(tab => {
        const selected = tab.id === value
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`${tab.id}-tab`}
            aria-selected={selected}
            aria-controls={`${tab.id}-panel`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={`min-h-[44px] px-4 rounded-lg text-sm sm:text-base font-semibold transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              selected ? 'bg-white text-primary shadow-sm' : 'text-text-muted hover:text-text-light'
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
