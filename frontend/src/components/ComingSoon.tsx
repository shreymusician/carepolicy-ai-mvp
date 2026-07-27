import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

interface ComingSoonProps {
  icon: string
  title: string
  intro: string
  children?: ReactNode
}

export function ComingSoon({ icon, title, intro, children }: ComingSoonProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
      <div className="text-center mb-12">
        <div className="text-5xl mb-5">{icon}</div>
        <div className="flex justify-center mb-4">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            Coming Next
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">{title}</h1>
        <p className="text-lg text-text-muted leading-relaxed">{intro}</p>
      </div>

      {children}

      <div className="mt-12 text-center">
        <Link
          to="/explorer"
          className="inline-block bg-primary text-white font-semibold py-3 px-7 rounded-xl hover:bg-blue-700 transition"
        >
          Explore Insurance Policies
        </Link>
      </div>
    </div>
  )
}

export function StepFlow({ steps }: { steps: string[] }) {
  return (
    <div className="bg-background-alt border border-border rounded-2xl p-6 sm:p-8">
      <div className="flex flex-col gap-1">
        {steps.map((s, i) => (
          <div key={s}>
            <div className="bg-white border border-border rounded-xl px-5 py-4 flex items-center gap-4">
              <span className="w-8 h-8 rounded-full bg-primary/10 text-primary grid place-items-center text-sm font-bold shrink-0">
                {i + 1}
              </span>
              <span className="font-medium">{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div className="text-center text-border text-xl leading-none py-1">↓</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export function ItemGrid({ items }: { items: Array<{ icon: string; label: string }> }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {items.map(it => (
        <div key={it.label} className="border border-border rounded-xl p-5 flex items-center gap-3">
          <span className="text-xl">{it.icon}</span>
          <span className="font-medium">{it.label}</span>
        </div>
      ))}
    </div>
  )
}
