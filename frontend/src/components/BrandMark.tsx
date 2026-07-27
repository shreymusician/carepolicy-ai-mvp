interface BrandMarkProps {
  className?: string
  iconClassName?: string
}

export function BrandMark({ className = 'w-12 h-12', iconClassName = 'w-6 h-6' }: BrandMarkProps) {
  return (
    <span
      className={`rounded-2xl bg-primary text-white grid place-items-center shadow-[0_10px_24px_-8px_rgba(0,102,204,0.45)] ${className}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={iconClassName}
      >
        <path d="M12 3l7 3v5.5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
        <path d="M9 12.2l2 2 4-4.2" />
      </svg>
    </span>
  )
}
