import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LandingPage } from './LandingPage'
import { ProcessingPage } from './ProcessingPage'
import { ResultsPage } from './ResultsPage'
import { useAppState } from '../state/AppState'

type Stage = 'upload' | 'processing' | 'results' | 'error'

export function AnalysePage() {
  const navigate = useNavigate()
  const { analysis, setAnalysis, selectedPolicy } = useAppState()
  const [stage, setStage] = useState<Stage>(analysis ? 'results' : 'upload')
  const [error, setError] = useState<{ title: string; message: string; retry?: () => void } | null>(null)

  const startAnalysis = async (formData: FormData) => {
    setStage('processing')
    setError(null)

    try {
      const response = await fetch('/api/v1/analyze', { method: 'POST', body: formData })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message ||
            (response.status === 413 ? 'File too large (max 10MB)' : 'Analysis failed')
        )
      }

      setAnalysis(await response.json())
      setStage('results')
    } catch (err) {
      setError({
        title: 'Analysis Failed',
        message: err instanceof Error ? err.message : 'Unknown error occurred',
        retry: () => startAnalysis(formData)
      })
      setStage('error')
    }
  }

  const reset = () => {
    setAnalysis(null)
    setError(null)
    setStage('upload')
  }

  if (stage === 'processing') return <ProcessingPage />

  if (stage === 'results' && analysis) {
    return <ResultsPage data={analysis} onReset={reset} />
  }

  if (stage === 'error') {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-900 mb-3">{error?.title}</h2>
          <p className="text-red-800 mb-6">{error?.message}</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => error?.retry?.()}
              className="bg-primary text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-700 transition"
            >
              Try Again
            </button>
            <button
              onClick={reset}
              className="border-2 border-primary text-primary font-semibold py-3 px-6 rounded-xl hover:bg-blue-50 transition"
            >
              Start Over
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <LandingPage
      onSubmit={startAnalysis}
      selectedPolicy={selectedPolicy}
      onChangePolicy={() =>
        navigate(selectedPolicy ? `/policy/${selectedPolicy.id}` : '/explorer')
      }
    />
  )
}
