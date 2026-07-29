import { useEffect, useState } from 'react'
import { useCoordinatorCase } from '../../state/CoordinatorCaseContext'
import { ApiError, generatePriorAuthorization, getPolicy } from '../../lib/coordinatorApi'
import type { InsurancePolicy } from '../../types/coordinator'

export function PriorAuthorizationStepPage() {
  const { caseDetail, setCaseDetail } = useCoordinatorCase()
  const [policy, setPolicy] = useState<InsurancePolicy | null>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const policyId = caseDetail.insurance_selection?.policy_id

  useEffect(() => {
    if (!policyId) return
    getPolicy(policyId)
      .then(setPolicy)
      .catch(() => setPolicy(null))
  }, [policyId])

  const handleGenerate = async () => {
    if (generating) return
    setGenerating(true)
    setError(null)
    try {
      const updated = await generatePriorAuthorization(caseDetail.id)
      setCaseDetail(updated)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  if (caseDetail.status === 'ready_for_review') {
    return (
      <div>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8 text-center">
          <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">Ready for Review</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">Prior Authorization Prepared</h1>
          <p className="text-text-light">
            Generated{' '}
            {caseDetail.prior_authorization_generated_at &&
              new Date(caseDetail.prior_authorization_generated_at).toLocaleString()}
          </p>
        </div>

        <CasePreview caseDetail={caseDetail} policy={policy} />

        <div className="bg-background-alt border border-border rounded-2xl p-6 mt-6">
          <p className="text-text-muted text-sm">
            This is a structural preview. AI-assisted validation and form generation are not yet implemented.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">Prior Authorization</h1>
      <p className="text-text-muted mb-6">Review the complete case before generating the Prior Authorization request.</p>

      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">
          {error}
        </div>
      )}

      <CasePreview caseDetail={caseDetail} policy={policy} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
        <PlaceholderCard title="Missing Documents" text="Document completeness check will appear here once medical intelligence is connected." />
        <PlaceholderCard title="Validation Errors" text="Validation checks will appear here once medical intelligence is connected." />
        <PlaceholderCard title="Confidence Score" text="—" />
        <PlaceholderCard title="Required Corrections" text="Suggested corrections will appear here once medical intelligence is connected." />
      </div>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={generating}
        className="w-full sm:w-auto min-h-[48px] bg-primary text-white font-semibold py-3 px-8 rounded-xl hover:bg-blue-700 transition disabled:opacity-70"
      >
        {generating ? 'Generating…' : 'Generate Prior Authorization'}
      </button>
    </div>
  )
}

function CasePreview({
  caseDetail,
  policy
}: {
  caseDetail: ReturnType<typeof useCoordinatorCase>['caseDetail']
  policy: InsurancePolicy | null
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white border border-border rounded-2xl p-5">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">Selected Insurance</p>
        <p className="font-bold text-text">{caseDetail.insurance_selection?.policy_name}</p>
        <p className="text-text-muted">{caseDetail.insurance_selection?.company_name}</p>
      </div>

      <div className="bg-white border border-border rounded-2xl p-5">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">Patient Summary</p>
        <p className="text-text-light">Structured patient summary will appear here after document processing.</p>
      </div>

      <div className="bg-white border border-border rounded-2xl p-5">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">Coverage Summary</p>
        <p className="text-text-light">
          {policy?.coverage_summary || 'Coverage summary will appear here once available.'}
        </p>
      </div>

      <div className="bg-white border border-border rounded-2xl p-5">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
          Medical Documents ({caseDetail.medical_documents.length})
        </p>
        <ul className="space-y-1">
          {caseDetail.medical_documents.map(d => (
            <li key={d.id} className="text-text-light text-sm">
              {d.filename}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function PlaceholderCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="bg-background-alt border border-border rounded-2xl p-5">
      <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">{title}</p>
      <p className="text-text-light text-sm">{text}</p>
    </div>
  )
}
