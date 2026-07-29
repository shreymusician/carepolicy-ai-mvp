import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { AppStateProvider } from './state/AppState'
import { AuthProvider } from './state/AuthContext'
import { HomePage } from './pages/HomePage'
import { PolicyHolderPortalPage } from './pages/PolicyHolderPortalPage'
import { InsuranceCoordinatorPortalPage } from './pages/InsuranceCoordinatorPortalPage'
import { PolicyHolderSuccessPage } from './pages/PolicyHolderSuccessPage'
import { InsuranceCoordinatorSuccessPage } from './pages/InsuranceCoordinatorSuccessPage'
import { RequireCoordinator } from './components/RequireCoordinator'
import { CaseWorkflowLayout } from './components/CaseWorkflowLayout'
import { CoordinatorDashboardPage } from './pages/coordinator/CoordinatorDashboardPage'
import { InsuranceSelectionStepPage } from './pages/coordinator/InsuranceSelectionStepPage'
import { PolicyReviewStepPage } from './pages/coordinator/PolicyReviewStepPage'
import { MedicalRecordsStepPage } from './pages/coordinator/MedicalRecordsStepPage'
import { PriorAuthorizationStepPage } from './pages/coordinator/PriorAuthorizationStepPage'
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
    <AuthProvider>
    <AppStateProvider>
      <BrowserRouter>
        <Routes>
          <Route index element={<HomePage />} />
          <Route path="policy-holder" element={<PolicyHolderPortalPage />} />
          <Route path="policy-holder/success" element={<PolicyHolderSuccessPage />} />
          <Route path="insurance-coordinator" element={<InsuranceCoordinatorPortalPage />} />
          <Route path="insurance-coordinator/success" element={<InsuranceCoordinatorSuccessPage />} />

          <Route path="coordinator" element={<RequireCoordinator />}>
            <Route path="dashboard" element={<CoordinatorDashboardPage />} />
            <Route path="cases/:caseId" element={<CaseWorkflowLayout />}>
              <Route path="insurance" element={<InsuranceSelectionStepPage />} />
              <Route path="policy-review" element={<PolicyReviewStepPage />} />
              <Route path="medical-records" element={<MedicalRecordsStepPage />} />
              <Route path="prior-authorization" element={<PriorAuthorizationStepPage />} />
            </Route>
          </Route>

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
    </AuthProvider>
  )
}
