import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCoordinatorCase } from '../../state/CoordinatorCaseContext'
import { ApiError, confirmPolicyReview, getPolicy, getPolicyKnowledge } from '../../lib/coordinatorApi'
import type { InsurancePolicy, PolicyKnowledge } from '../../types/coordinator'

const NOT_AVAILABLE_NOTE = 'Structured details for this product are not available yet.'

export function PolicyReviewStepPage() {
  const { caseDetail, setCaseDetail } = useCoordinatorCase()
  const navigate = useNavigate()

  const [policy, setPolicy] = useState<InsurancePolicy | null>(null)
  const [knowledge, setKnowledge] = useState<PolicyKnowledge | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const policyId = caseDetail.insurance_selection?.policy_id

  useEffect(() => {
    if (!policyId) return
    setLoading(true)
    Promise.all([getPolicy(policyId), getPolicyKnowledge(policyId)])
      .then(([policyRes, knowledgeRes]) => {
        setPolicy(policyRes)
        setKnowledge(knowledgeRes.available ? knowledgeRes.knowledge : null)
      })
      .catch(() => {
        setPolicy(null)
        setKnowledge(null)
      })
      .finally(() => setLoading(false))
  }, [policyId])

  const handleConfirm = async () => {
    if (confirming) return
    setConfirming(true)
    setError(null)
    try {
      const updated = await confirmPolicyReview(caseDetail.id)
      setCaseDetail(updated)
      navigate(`/coordinator/cases/${caseDetail.id}/medical-records`)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setConfirming(false)
    }
  }

  if (!policyId) {
    return <p className="text-text-muted">No insurance policy selected for this case.</p>
  }

  if (loading) {
    return <p className="text-text-muted text-center py-16">Loading policy conditions…</p>
  }

  const fact = (topic: string) => knowledge?.facts?.[topic]?.value || undefined

  const rows: { title: string; body?: string }[] = [
    { title: 'Coverage', body: fact('coverage') || policy?.coverage_summary },
    { title: 'Exclusions', body: fact('exclusions') },
    { title: 'Waiting Period', body: fact('waiting_periods') || policy?.waiting_period },
    { title: 'Room Rent', body: fact('room_rent_limits') },
    { title: 'Claim Conditions', body: fact('claim_submission_rules') },
    { title: 'Pre-existing Disease Rules', body: fact('pre_existing_disease_rules') }
  ]

  const requiredDocuments = knowledge?.claim_knowledge?.required_documents || []
  const hasAnyKnowledge = rows.some(r => r.body) || requiredDocuments.length > 0

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-text mb-1">Policy Conditions &amp; Eligibility Review</h1>
      <p className="text-text-muted mb-6">
        {policy?.company_name} — {policy?.policy_name}
      </p>

      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">
          {error}
        </div>
      )}

      {!hasAnyKnowledge && (
        <div className="bg-background-alt border border-border rounded-2xl p-6 mb-6">
          <p className="text-text-light">{NOT_AVAILABLE_NOTE}</p>
          {policy?.official_policy_pdf_url && (
            <a
              href={policy.official_policy_pdf_url}
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-3 text-primary font-semibold hover:underline"
            >
              View official policy document →
            </a>
          )}
        </div>
      )}

      <div className="flex flex-col gap-5 mb-6">
        {rows
          .filter(r => r.body)
          .map(r => (
            <div key={r.title} className="bg-white border border-border rounded-2xl p-5">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">{r.title}</p>
              <p className="text-text-light leading-relaxed">{r.body}</p>
            </div>
          ))}

        {requiredDocuments.length > 0 && (
          <div className="bg-white border border-border rounded-2xl p-5">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Documents Required</p>
            <ul className="space-y-1.5">
              {requiredDocuments.map((doc, i) => (
                <li key={i} className="flex gap-2.5 text-text-light">
                  <span className="text-primary font-bold shrink-0">•</span>
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="bg-white border border-border rounded-2xl p-5 mb-6">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Official References</p>
        <div className="flex flex-col gap-1.5">
          {policy?.official_policy_pdf_url && (
            <a href={policy.official_policy_pdf_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
              Official Policy Wording
            </a>
          )}
          {!policy?.official_policy_pdf_url && <p className="text-text-muted text-sm">Not available yet.</p>}
        </div>
      </div>

      <button
        type="button"
        onClick={handleConfirm}
        disabled={confirming}
        className="w-full sm:w-auto min-h-[48px] bg-primary text-white font-semibold py-3 px-8 rounded-xl hover:bg-blue-700 transition disabled:opacity-70"
      >
        {confirming ? 'Confirming…' : 'Confirm Review & Continue'}
      </button>
    </div>
  )
}
