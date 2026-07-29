import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { InfoBadge, TrustNote, PENDING_DETAILS_NOTE } from '../components/InfoBadge'
import { useAppState } from '../state/AppState'

interface Company {
  _id: string
  name: string
  logo_url: string
}

interface Policy {
  _id: string
  company_name: string
  company_logo_url: string
  policy_name: string
  policy_type: string
  description?: string
  coverage_summary?: string
  waiting_period?: string
  target_audience: string[]
  verification_status: 'verified' | 'unverified'
  source_url?: string
  official_policy_pdf_url?: string
}

const POLICY_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'individual', label: 'Individual' },
  { value: 'family_floater', label: 'Family Floater' },
  { value: 'senior_citizen', label: 'Senior Citizen' },
  { value: 'top_up', label: 'Top-Up' },
  { value: 'critical_illness', label: 'Critical Illness' }
]

export function InsuranceExplorerPage() {
  const navigate = useNavigate()
  const { setSelectedPolicy } = useAppState()

  const onSelectPolicy = (policy: { id: string; name: string; companyName: string }) => {
    setSelectedPolicy(policy)
    navigate(`/policy/${policy.id}`)
  }
  const onSkip = () => navigate('/analyse')

  const [companies, setCompanies] = useState<Company[]>([])
  const [policies, setPolicies] = useState<Policy[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [selectedCompany, setSelectedCompany] = useState('')
  const [selectedType, setSelectedType] = useState('')

  useEffect(() => {
    fetch('/api/v1/insurance/companies')
      .then(r => r.json())
      .then(d => setCompanies(d.companies || []))
      .catch(() => setCompanies([]))
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(true)
      const params = new URLSearchParams()
      if (query.trim()) params.set('q', query.trim())
      if (selectedCompany) params.set('company', selectedCompany)
      if (selectedType) params.set('policyType', selectedType)

      const endpoint = query.trim() ? '/api/v1/insurance/search' : '/api/v1/insurance/policies'

      fetch(`${endpoint}?${params.toString()}`)
        .then(r => r.json())
        .then(d => setPolicies(d.policies || []))
        .catch(() => setPolicies([]))
        .finally(() => setLoading(false))
    }, 250)

    return () => clearTimeout(timeout)
  }, [query, selectedCompany, selectedType])

  return (
    <div className="px-3 py-5 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-6xl">
        <section className="surface-card overflow-hidden p-5 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Insurance explorer</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Find the right policy with less effort.</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                Search across insurers and compare policy summaries before you upload a document for a deeper review.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <TrustNote />
            </div>
          </div>
        </section>

        <section className="mt-6 surface-card p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:flex-row">
            <label className="flex-1">
              <span className="sr-only">Search policies</span>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by company or policy name"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {POLICY_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <select
              value={selectedCompany}
              onChange={e => setSelectedCompany(e.target.value)}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="">All Companies</option>
              {companies.map(c => (
                <option key={c._id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {(selectedType || selectedCompany || query) && (
            <button onClick={() => { setSelectedType(''); setSelectedCompany(''); setQuery('') }} className="mt-4 text-sm font-semibold text-primary hover:underline">
              Clear filters
            </button>
          )}
        </section>

        <section className="mt-6">
          {loading ? (
            <div className="surface-card p-10 text-center text-sm text-slate-600">Loading policies…</div>
          ) : policies.length === 0 ? (
            <div className="surface-card p-10 text-center text-sm text-slate-600">No policies match your search yet.</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {policies.map(policy => (
                <button
                  key={policy._id}
                  onClick={() => onSelectPolicy({ id: policy._id, name: policy.policy_name, companyName: policy.company_name })}
                  className="group text-left rounded-[1.25rem] border border-slate-200 bg-white/90 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_16px_45px_-24px_rgba(0,102,204,0.5)] sm:p-5 sm:rounded-[1.5rem]"
                >
                  <div className="flex items-center gap-3">
                    <img src={policy.company_logo_url} alt={policy.company_name} className="h-11 w-11 rounded-xl border border-slate-200 object-cover" />
                    <div>
                      <p className="font-semibold text-slate-900">{policy.company_name}</p>
                      <span className="mt-1 inline-block rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                        {POLICY_TYPES.find(t => t.value === policy.policy_type)?.label || policy.policy_type}
                      </span>
                    </div>
                  </div>

                  <p className="mt-4 text-lg font-semibold text-slate-900">{policy.policy_name}</p>

                  {policy.description && <p className="mt-2 text-sm leading-6 text-slate-600">{policy.description}</p>}
                  {policy.coverage_summary && <p className="mt-2 text-sm leading-6 text-slate-600">{policy.coverage_summary}</p>}
                  {policy.waiting_period && (
                    <p className="mt-2 text-sm text-slate-600">
                      <span className="font-semibold text-slate-900">Waiting period:</span> {policy.waiting_period}
                    </p>
                  )}

                  {!policy.description && !policy.coverage_summary && !policy.waiting_period && (
                    <p className="mt-2 text-sm italic text-slate-500">{PENDING_DETAILS_NOTE}</p>
                  )}

                  <div className="mt-4 border-t border-slate-200 pt-3">
                    <InfoBadge level={policy.verification_status === 'verified' ? 'official' : 'basic'} />
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="mt-8 rounded-[1.5rem] border border-dashed border-primary/30 bg-primary/5 p-5 text-center">
            <button onClick={onSkip} className="text-sm font-semibold text-primary hover:underline">
              Skip to direct document upload →
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
