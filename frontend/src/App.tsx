import { useState } from 'react'
import { InsuranceDiscoveryPage } from './pages/InsuranceDiscoveryPage'
import { LandingPage } from './pages/LandingPage'
import { ProcessingPage } from './pages/ProcessingPage'
import { ResultsPage } from './pages/ResultsPage'
import './index.css'

export type AppState = 'discovery' | 'landing' | 'processing' | 'results' | 'error'

interface SelectedPolicy {
  id: string
  name: string
  companyName: string
}

interface AnalysisData {
  document_id: string
  analysis_result: any
  metadata: any
}

interface ErrorState {
  title: string
  message: string
  retry?: () => void
}

export default function App() {
  const [state, setState] = useState<AppState>('discovery')
  const [selectedPolicy, setSelectedPolicy] = useState<SelectedPolicy | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null)
  const [error, setError] = useState<ErrorState | null>(null)

  const handleSelectPolicy = (policy: SelectedPolicy) => {
    setSelectedPolicy(policy)
    setState('landing')
  }

  const handleAnalysisStart = async (formData: FormData) => {
    setState('processing')
    setError(null)

    try {
      const response = await fetch('/api/v1/analyze', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message ||
          (response.status === 413 ? 'File too large (max 10MB)' : 'Analysis failed')
        )
      }

      const data = await response.json()
      setAnalysis(data)
      setState('results')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('Analysis error:', error)

      setError({
        title: 'Analysis Failed',
        message: errorMessage,
        retry: () => handleAnalysisStart(formData)
      })
      setState('error')
    }
  }

  const handleReset = () => {
    setState('discovery')
    setSelectedPolicy(null)
    setAnalysis(null)
    setError(null)
  }

  const handleRetry = () => {
    if (error?.retry) {
      error.retry()
    }
  }

  return (
    <div className="min-h-screen bg-white text-black">
      {state === 'discovery' && (
        <InsuranceDiscoveryPage
          onSelectPolicy={handleSelectPolicy}
          onSkip={() => setState('landing')}
        />
      )}
      {state === 'landing' && (
        <LandingPage
          onSubmit={handleAnalysisStart}
          selectedPolicy={selectedPolicy}
          onChangePolicy={() => setState('discovery')}
        />
      )}
      {state === 'processing' && <ProcessingPage />}
      {state === 'results' && analysis && <ResultsPage data={analysis} onReset={handleReset} />}
      {state === 'error' && (
        <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
          <div className="max-w-md w-full">
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8 text-center">
              <div className="text-5xl mb-4">❌</div>
              <h2 className="text-2xl font-bold text-red-900 mb-3">{error?.title}</h2>
              <p className="text-red-800 mb-6">{error?.message}</p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleRetry}
                  className="bg-primary text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition"
                >
                  Try Again
                </button>
                <button
                  onClick={handleReset}
                  className="border-2 border-primary text-primary font-semibold py-3 px-6 rounded-lg hover:bg-blue-50 transition"
                >
                  Start Over
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
