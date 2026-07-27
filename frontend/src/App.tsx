import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { AppStateProvider } from './state/AppState'
import { HomePage } from './pages/HomePage'
import { PolicyHolderPortalPage } from './pages/PolicyHolderPortalPage'
import { InsuranceCoordinatorPortalPage } from './pages/InsuranceCoordinatorPortalPage'
import { InsuranceExplorerPage } from './pages/InsuranceExplorerPage'
import { PolicyDetailPage } from './pages/PolicyDetailPage'
import { AnalysePage } from './pages/AnalysePage'
import { MedicalDocumentsPage } from './pages/MedicalDocumentsPage'
import { PriorAuthorizationPage } from './pages/PriorAuthorizationPage'
import { NetworkHospitalsPage } from './pages/NetworkHospitalsPage'
import { AboutPage } from './pages/AboutPage'
import './index.css'

export default function App() {
  return (
    <AppStateProvider>
      <BrowserRouter>
        <Routes>
          <Route index element={<HomePage />} />
          <Route path="policy-holder" element={<PolicyHolderPortalPage />} />
          <Route path="insurance-coordinator" element={<InsuranceCoordinatorPortalPage />} />
          <Route element={<Layout />}>
            <Route path="explorer" element={<InsuranceExplorerPage />} />
            <Route path="policy/:id" element={<PolicyDetailPage />} />
            <Route path="analyse" element={<AnalysePage />} />
            <Route path="documents" element={<MedicalDocumentsPage />} />
            <Route path="prior-auth" element={<PriorAuthorizationPage />} />
            <Route path="hospitals" element={<NetworkHospitalsPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppStateProvider>
  )
}
