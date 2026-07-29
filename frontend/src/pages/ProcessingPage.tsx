import { useEffect, useState } from 'react'

export function ProcessingPage() {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const messages = [
    'Uploading your documents...',
    'Detecting the document type...',
    'Extracting text from the PDF...',
    'Reviewing policy terms...',
    'Checking coverage and exclusions...',
    'Preparing a simple explanation...',
    'Generating your report...'
  ]

  const messageIndex = Math.min(Math.floor(elapsedSeconds / 2), messages.length - 1)

  return (
    <div className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-xl flex-col items-center rounded-[2rem] border border-slate-200 bg-white/90 p-8 text-center shadow-[0_18px_60px_-24px_rgba(15,23,42,0.25)] sm:p-10">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          <span className="h-2 w-2 rounded-full bg-primary" />
          Reviewing your documents
        </div>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Analyzing your insurance</h2>
        <p className="mt-3 text-base leading-7 text-slate-600">
          We are reading the documents and preparing a clearer summary for you.
        </p>

        <div className="mt-8 mb-6 flex h-20 w-20 items-center justify-center rounded-full border-[6px] border-primary/15 border-t-primary animate-spin" />

        <p className="mb-8 h-8 text-lg font-medium text-slate-700">{messages[messageIndex]}</p>

        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${Math.min((elapsedSeconds / 15) * 100, 95)}%` }}
          />
        </div>

        <p className="mt-4 text-sm font-medium text-primary">{elapsedSeconds}s</p>
        <p className="mt-1 text-sm text-slate-500">This usually takes around 10–15 seconds</p>
      </div>
    </div>
  )
}
