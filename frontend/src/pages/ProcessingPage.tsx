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
    'Detecting document type...',
    'Extracting text from PDF...',
    'Analyzing policy details...',
    'Finding coverage information...',
    'Understanding your treatment...',
    'Generating your report...'
  ]

  const messageIndex = Math.min(Math.floor(elapsedSeconds / 2), messages.length - 1)

  return (
    <div className="bg-white flex items-center justify-center px-4 py-24">
      <div className="max-w-md w-full text-center">
        <h2 className="text-4xl font-bold mb-8 text-text">Analyzing Your Insurance</h2>

        {/* Spinner */}
        <div className="mb-12">
          <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>

        {/* Message */}
        <p className="text-xl text-text-light mb-8 h-8">{messages[messageIndex]}</p>

        {/* Progress Bar */}
        <div className="w-full bg-border rounded-full h-2 mb-6">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min((elapsedSeconds / 15) * 100, 95)}%` }}
          ></div>
        </div>

        {/* Timer */}
        <p className="text-lg font-mono text-primary">{elapsedSeconds}s</p>
        <p className="text-sm text-text-muted mt-2">
          This usually takes 10-15 seconds
        </p>
      </div>
    </div>
  )
}
