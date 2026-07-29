import { Navigate, Outlet, useLocation, useParams } from 'react-router-dom'
import { CoordinatorCaseProvider, useCoordinatorCase } from '../state/CoordinatorCaseContext'
import { CaseStepProgress } from './CaseStepProgress'
import { CASE_STATUS_ORDER } from '../types/coordinator'

const STEP_PATHS = ['insurance', 'policy-review', 'medical-records', 'prior-authorization']

export function CaseWorkflowLayout() {
  const { caseId } = useParams<{ caseId: string }>()
  if (!caseId) return <Navigate to="/coordinator/dashboard" replace />

  return (
    <CoordinatorCaseProvider caseId={caseId}>
      <CaseWorkflowGuard caseId={caseId} />
    </CoordinatorCaseProvider>
  )
}

function CaseWorkflowGuard({ caseId }: { caseId: string }) {
  const { caseDetail } = useCoordinatorCase()
  const location = useLocation()

  const reachedIndex = Math.min(CASE_STATUS_ORDER.indexOf(caseDetail.status), STEP_PATHS.length - 1)
  const activeSegment = location.pathname.split('/').pop() ?? ''
  const pageIndex = STEP_PATHS.indexOf(activeSegment)

  if (pageIndex === -1) return <Navigate to={`/coordinator/cases/${caseId}/${STEP_PATHS[reachedIndex]}`} replace />
  if (pageIndex > reachedIndex) {
    return <Navigate to={`/coordinator/cases/${caseId}/${STEP_PATHS[reachedIndex]}`} replace />
  }

  return (
    <>
      <div className="border-b border-border bg-white">
        <CaseStepProgress caseId={caseId} currentStatus={caseDetail.status} />
      </div>
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10">
        <Outlet />
      </div>
    </>
  )
}
