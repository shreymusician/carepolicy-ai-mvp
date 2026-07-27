import { createContext, useContext, useState, type ReactNode } from 'react'

export interface AnalysisData {
  document_id: string
  analysis_result: any
  metadata: any
}

export interface SelectedPolicy {
  id: string
  name: string
  companyName: string
}

interface AppStateValue {
  analysis: AnalysisData | null
  setAnalysis: (a: AnalysisData | null) => void
  selectedPolicy: SelectedPolicy | null
  setSelectedPolicy: (p: SelectedPolicy | null) => void
}

const AppStateContext = createContext<AppStateValue | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null)
  const [selectedPolicy, setSelectedPolicy] = useState<SelectedPolicy | null>(null)

  return (
    <AppStateContext.Provider value={{ analysis, setAnalysis, selectedPolicy, setSelectedPolicy }}>
      {children}
    </AppStateContext.Provider>
  )
}

export function useAppState(): AppStateValue {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider')
  return ctx
}
