import { useCopilot } from './CopilotContext'
import { useIsDesktop } from './useIsDesktop'

export function CopilotFab() {
  const { isOpen, toggle } = useCopilot()
  const isDesktop = useIsDesktop()

  // On mobile the panel covers the screen and carries its own close control.
  if (isOpen && !isDesktop) return null

  return (
    <button
      onClick={toggle}
      aria-label={isOpen ? 'Close MyInsurance Copilot' : 'Open MyInsurance Copilot (Ctrl+Shift+A)'}
      aria-expanded={isOpen}
      title="Ask MyInsurance  ·  Ctrl+Shift+A"
      className={`copilot-fab fixed z-[60] rounded-full bg-primary text-white shadow-lg shadow-primary/25
        grid place-items-center transition-all duration-200
        hover:bg-blue-700 hover:scale-105 active:scale-95
        focus:outline-none focus:ring-4 focus:ring-primary/30
        w-14 h-14
        right-[max(1rem,env(safe-area-inset-right))]
        bottom-[max(1.25rem,env(safe-area-inset-bottom))]
        ${!isOpen ? 'copilot-fab-idle' : ''}`}
      style={isOpen && isDesktop ? { right: 'calc(26rem + 1.75rem)' } : undefined}
    >
      {isOpen ? (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      ) : (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2.5l1.6 4.6 4.6 1.6-4.6 1.6L12 15l-1.6-4.7L5.8 8.7l4.6-1.6L12 2.5z" />
          <path d="M18.5 14l.85 2.4 2.4.85-2.4.85-.85 2.4-.85-2.4-2.4-.85 2.4-.85.85-2.4z" opacity="0.85" />
          <path d="M6 15l.7 1.9 1.9.7-1.9.7L6 20.2l-.7-1.9-1.9-.7 1.9-.7L6 15z" opacity="0.65" />
        </svg>
      )}
    </button>
  )
}
