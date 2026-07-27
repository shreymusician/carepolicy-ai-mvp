import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { AppStateProvider } from './state/AppState'
import { HomePage } from './pages/HomePage'
import { InsuranceExplorerPage } from './pages/InsuranceExplorerPage'
import { PolicyDetailPage } from './pages/PolicyDetailPage'
import { AnalysePage } from './pages/AnalysePage'
import { MedicalDocumentsPage } from './pages/MedicalDocumentsPage'
import { ClaimAssistantPage } from './pages/ClaimAssistantPage'
import { AIAssistantPage } from './pages/AIAssistantPage'
import { NetworkHospitalsPage } from './pages/NetworkHospitalsPage'
import { AboutPage } from './pages/AboutPage'
import './index.css'

export default function App() {
  return (
    <AppStateProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="explorer" element={<InsuranceExplorerPage />} />
            <Route path="policy/:id" element={<PolicyDetailPage />} />
            <Route path="analyse" element={<AnalysePage />} />
            <Route path="documents" element={<MedicalDocumentsPage />} />
            <Route path="claims" element={<ClaimAssistantPage />} />
            <Route path="assistant" element={<AIAssistantPage />} />
            <Route path="hospitals" element={<NetworkHospitalsPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppStateProvider>
  )
}
