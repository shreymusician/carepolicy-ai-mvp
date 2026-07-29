import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { createCase, listCases } from '../../lib/coordinatorApi'
import { ApiError } from '../../lib/coordinatorApi'
import type { CaseStatus, CaseSummary } from '../../types/coordinator'

const STEP_PATH_BY_STATUS: Record<CaseStatus, string> = {
  insurance_selection: 'insurance',
  policy_review: 'policy-review',
  medical_records: 'medical-records',
  prior_authorization: 'prior-authorization',
  ready_for_review: 'prior-authorization'
}

const STATUS_LABEL: Record<CaseStatus, string> = {
  insurance_selection: 'Insurance Selection',
  policy_review: 'Policy Review',
  medical_records: 'Medical Records',
  prior_authorization: 'Prior Authorization',
  ready_for_review: 'Ready for Review'
}

export function CoordinatorDashboardPage() {
  const navigate = useNavigate()
  const [cases, setCases] = useState<CaseSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewCaseForm, setShowNewCaseForm] = useState(false)
  const [patientName, setPatientName] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listCases()
      .then(setCases)
      .catch(() => setCases([]))
      .finally(() => setLoading(false))
  }, [])

  const handleCreateCase = async (event: FormEvent) => {
    event.preventDefault()
    if (creating) return
    if (!patientName.trim()) {
      setError('Patient name is required.')
      return
    }

    setCreating(true)
    setError(null)
    try {
      const created = await createCase(patientName.trim())
      navigate(`/coordinator/cases/${created.id}/insurance`)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
      setCreating(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text">Prior Authorization Cases</h1>
          <p className="text-sm sm:text-base text-text-muted mt-1">
            Track and continue Prior Authorization requests for your patients.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowNewCaseForm(true)}
          className="shrink-0 inline-flex items-center justify-center min-h-[48px] bg-primary text-white font-semibold text-sm sm:text-base py-3 px-6 rounded-xl transition-colors duration-200 hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Start New Prior Authorization
        </button>
      </div>

      {showNewCaseForm && (
        <div className="bg-white border border-border rounded-2xl p-5 sm:p-6 mb-8">
          <form onSubmit={handleCreateCase} className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="flex-1 w-full">
              <label htmlFor="patient-name" className="block text-sm font-semibold text-text-light mb-1.5">
                Patient Name
              </label>
              <input
                id="patient-name"
                type="text"
                value={patientName}
                disabled={creating}
                onChange={e => {
                  setPatientName(e.target.value)
                  setError(null)
                }}
                placeholder="Enter patient name"
                className={`w-full min-h-[48px] px-4 py-3 rounded-xl border bg-white text-base text-text focus:outline-none focus:ring-2 ${
                  error ? 'border-red-600 focus:border-red-600 focus:ring-red-600/20' : 'border-border focus:border-primary focus:ring-primary/20'
                }`}
              />
              {error && (
                <p role="alert" className="mt-1.5 text-sm text-red-600">
                  {error}
                </p>
              )}
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                type="submit"
                disabled={creating}
                className="flex-1 sm:flex-none min-h-[48px] bg-primary text-white font-semibold py-3 px-6 rounded-xl transition-colors hover:bg-blue-700 disabled:opacity-70"
              >
                {creating ? 'Starting…' : 'Start Case'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNewCaseForm(false)
                  setPatientName('')
                  setError(null)
                }}
                disabled={creating}
                className="flex-1 sm:flex-none min-h-[48px] border border-border text-text-light font-semibold py-3 px-6 rounded-xl hover:bg-background-alt"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className="text-text-muted text-center py-16">Loading cases…</p>
      ) : cases.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl">
          <p className="text-text-muted">No Prior Authorization cases yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {cases.map(c => (
            <button
              key={c.id}
              onClick={() => navigate(`/coordinator/cases/${c.id}/${STEP_PATH_BY_STATUS[c.status]}`)}
              className="text-left bg-white border border-border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:border-primary hover:shadow-sm transition"
            >
              <div className="min-w-0">
                <p className="font-bold text-text">{c.patient_name}</p>
                <p className="text-sm text-text-muted mt-0.5">
                  {c.insurance_selection
                    ? `${c.insurance_selection.company_name} — ${c.insurance_selection.policy_name}`
                    : 'No insurance selected yet'}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-primary">
                  {STATUS_LABEL[c.status]}
                </span>
                <span className="text-xs text-text-muted">{c.document_count} document{c.document_count === 1 ? '' : 's'}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
