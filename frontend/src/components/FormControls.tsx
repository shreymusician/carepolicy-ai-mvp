import type { InputHTMLAttributes, ReactNode } from 'react'

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'className'> {
  id: string
  label: string
  error?: string
}

export function TextField({ id, label, error, ...inputProps }: TextFieldProps) {
  const errorId = `${id}-error`

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-text-light mb-1.5">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`w-full min-h-[48px] px-4 py-3 rounded-xl border bg-white text-base text-text placeholder:text-text-muted/60 transition-colors duration-150 focus:outline-none focus:ring-2 ${
          error
            ? 'border-red-600 focus:border-red-600 focus:ring-red-600/20'
            : 'border-border focus:border-primary focus:ring-primary/20'
        }`}
        {...inputProps}
      />
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

interface CheckboxFieldProps {
  id: string
  checked: boolean
  onChange: (checked: boolean) => void
  error?: string
  children: ReactNode
}

export function CheckboxField({ id, checked, onChange, error, children }: CheckboxFieldProps) {
  const errorId = `${id}-error`

  return (
    <div>
      <div className="flex items-start gap-2.5">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={event => onChange(event.target.checked)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="mt-0.5 w-5 h-5 shrink-0 rounded border-border text-primary accent-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-1"
        />
        <label htmlFor={id} className="text-sm text-text-light leading-relaxed">
          {children}
        </label>
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

interface SubmitButtonProps {
  loading: boolean
  loadingLabel: string
  children: ReactNode
}

export function SubmitButton({ loading, loadingLabel, children }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading}
      aria-busy={loading}
      className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 bg-primary text-white font-semibold text-base py-3 px-6 rounded-xl transition-colors duration-200 hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {loading && (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="w-4 h-4 animate-spin" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={3} className="opacity-25" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
        </svg>
      )}
      {loading ? loadingLabel : children}
    </button>
  )
}

/** Inline text button used for "Forgot password" and tab-switch links. */
export function LinkButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-sm font-semibold text-primary rounded hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {children}
    </button>
  )
}
