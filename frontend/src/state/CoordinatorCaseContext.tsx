import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { getCase } from '../lib/coordinatorApi'
import type { CaseDetail } from '../types/coordinator'

interface CoordinatorCaseContextValue {
  caseDetail: CaseDetail
  refresh: () => Promise<void>
  setCaseDetail: (next: CaseDetail) => void
}

const CoordinatorCaseContext = createContext<CoordinatorCaseContextValue | null>(null)

export function CoordinatorCaseProvider({ caseId, children }: { caseId: string; children: ReactNode }) {
  const [caseDetail, setCaseDetail] = useState<CaseDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const detail = await getCase(caseId)
      setCaseDetail(detail)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load this case.')
    } finally {
      setLoading(false)
    }
  }, [caseId])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-24">
        <p className="text-text-muted">Loading case…</p>
      </div>
    )
  }

  if (error || !caseDetail) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-24 px-4 text-center">
        <p className="text-text-muted">{error || 'This case could not be found.'}</p>
      </div>
    )
  }

  return (
    <CoordinatorCaseContext.Provider value={{ caseDetail, refresh: load, setCaseDetail }}>
      {children}
    </CoordinatorCaseContext.Provider>
  )
}

export function useCoordinatorCase(): CoordinatorCaseContextValue {
  const ctx = useContext(CoordinatorCaseContext)
  if (!ctx) throw new Error('useCoordinatorCase must be used within CoordinatorCaseProvider')
  return ctx
}
