import { Link } from 'react-router-dom'

interface PortalPlaceholderProps {
  title: string
  description: string
}

export function PortalPlaceholder({ title, description }: PortalPlaceholderProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
      <h1 className="text-2xl sm:text-3xl font-bold text-text mb-3">{title}</h1>
      <p className="text-sm sm:text-base text-text-muted leading-relaxed mb-8">{description}</p>
      <Link
        to="/"
        className="inline-flex items-center justify-center border-2 border-primary text-primary font-semibold text-sm sm:text-base py-3 px-6 rounded-xl hover:bg-blue-50 transition min-h-[44px]"
      >
        Back
      </Link>
    </div>
  )
}
