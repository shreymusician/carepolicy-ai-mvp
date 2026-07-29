import { useNavigate } from 'react-router-dom'
import { CASE_STATUS_ORDER } from '../types/coordinator'
import type { CaseStatus } from '../types/coordinator'

const STEPS: { status: CaseStatus; label: string; path: string }[] = [
  { status: 'insurance_selection', label: 'Insurance Selection', path: 'insurance' },
  { status: 'policy_review', label: 'Policy Review', path: 'policy-review' },
  { status: 'medical_records', label: 'Medical Records', path: 'medical-records' },
  { status: 'prior_authorization', label: 'Prior Authorization', path: 'prior-authorization' }
]

export function CaseStepProgress({ caseId, currentStatus }: { caseId: string; currentStatus: CaseStatus }) {
  const navigate = useNavigate()
  const reachedIndex = Math.min(CASE_STATUS_ORDER.indexOf(currentStatus), STEPS.length - 1)

  return (
    <ol className="flex items-start gap-1 sm:gap-2 max-w-3xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
      {STEPS.map((step, index) => {
        const isReached = index <= reachedIndex
        const isCurrent = index === reachedIndex
        const canNavigate = index <= reachedIndex

        return (
          <li key={step.status} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
            <button
              type="button"
              disabled={!canNavigate}
              onClick={() => canNavigate && navigate(`/coordinator/cases/${caseId}/${step.path}`)}
              aria-current={isCurrent ? 'step' : undefined}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full grid place-items-center text-xs sm:text-sm font-bold shrink-0 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                isReached ? 'bg-primary text-white' : 'bg-background-alt text-text-muted'
              } ${canNavigate ? 'cursor-pointer' : 'cursor-default'}`}
            >
              {index + 1}
            </button>
            <span
              className={`text-[11px] sm:text-xs text-center leading-tight truncate w-full ${
                isCurrent ? 'text-text font-semibold' : 'text-text-muted'
              }`}
            >
              {step.label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
