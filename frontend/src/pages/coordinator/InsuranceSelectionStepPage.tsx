import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCoordinatorCase } from '../../state/CoordinatorCaseContext'
import { ApiError, listCompanies, searchPolicies, selectInsurance, getPolicy } from '../../lib/coordinatorApi'
import type { InsuranceCompany, InsurancePolicy } from '../../types/coordinator'
import { POLICY_TYPE_OPTIONS, TARGET_AUDIENCE_OPTIONS } from '../../types/coordinator'

const POLICY_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  POLICY_TYPE_OPTIONS.map(o => [o.value, o.label])
)
const TARGET_AUDIENCE_LABELS: Record<string, string> = Object.fromEntries(
  TARGET_AUDIENCE_OPTIONS.map(o => [o.value, o.label])
)

function typeLabel(value: string): string {
  return POLICY_TYPE_LABELS[value] || value
}

function InsurerLogo({ name, logoUrl, size = 'md' }: { name: string; logoUrl?: string; size?: 'md' | 'lg' }) {
  const [failed, setFailed] = useState(false)
  const dims = size === 'lg' ? 'w-14 h-14 text-lg' : 'w-11 h-11 text-sm'
  const initial = name.trim().charAt(0).toUpperCase() || '?'

  if (!logoUrl || failed) {
    return (
      <span
        aria-hidden="true"
        className={`shrink-0 rounded-xl bg-blue-50 text-primary font-bold grid place-items-center ${dims}`}
      >
        {initial}
      </span>
    )
  }

  return (
    <img
      src={logoUrl}
      alt=""
      aria-hidden="true"
      onError={() => setFailed(true)}
      className={`shrink-0 rounded-xl object-contain bg-background-alt border border-border ${dims}`}
    />
  )
}

type LocationState =
  | { mode: 'unset' }
  | { mode: 'granted'; label: string }
  | { mode: 'manual'; label: string }
  | { mode: 'denied' }

interface Filters {
  company: string
  policyType: string
  targetAudience: string
}

const EMPTY_FILTERS: Filters = { company: '', policyType: '', targetAudience: '' }

export function InsuranceSelectionStepPage() {
  const { caseDetail, setCaseDetail } = useCoordinatorCase()
  const navigate = useNavigate()

  const [changing, setChanging] = useState(!caseDetail.insurance_selection)
  const [companies, setCompanies] = useState<InsuranceCompany[]>([])
  const [policies, setPolicies] = useState<InsurancePolicy[]>([])
  const [loadingPolicies, setLoadingPolicies] = useState(true)
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const [location, setLocation] = useState<LocationState>({ mode: 'unset' })
  const [manualCity, setManualCity] = useState('')
  const [detailPolicy, setDetailPolicy] = useState<InsurancePolicy | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [pendingPolicyId, setPendingPolicyId] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listCompanies().then(setCompanies).catch(() => setCompanies([]))
  }, [])

  useEffect(() => {
    if (!changing) return
    const timeout = setTimeout(() => {
      setLoadingPolicies(true)
      searchPolicies(query, filters)
        .then(setPolicies)
        .catch(() => setPolicies([]))
        .finally(() => setLoadingPolicies(false))
    }, 250)
    return () => clearTimeout(timeout)
  }, [query, filters, changing])

  const activeFilterChips = useMemo(() => {
    const chips: { key: keyof Filters | 'location'; label: string }[] = []
    if (filters.company) chips.push({ key: 'company', label: filters.company })
    if (filters.policyType) chips.push({ key: 'policyType', label: typeLabel(filters.policyType) })
    if (filters.targetAudience) chips.push({ key: 'targetAudience', label: TARGET_AUDIENCE_LABELS[filters.targetAudience] || filters.targetAudience })
    if (location.mode === 'granted' || location.mode === 'manual') chips.push({ key: 'location', label: location.label })
    return chips
  }, [filters, location])

  const clearFilter = (key: keyof Filters | 'location') => {
    if (key === 'location') {
      setLocation({ mode: 'unset' })
      return
    }
    setFilters(current => ({ ...current, [key]: '' }))
  }

  const clearAll = () => {
    setFilters(EMPTY_FILTERS)
    setLocation({ mode: 'unset' })
  }

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocation({ mode: 'denied' })
      return
    }
    navigator.geolocation.getCurrentPosition(
      () => setLocation({ mode: 'granted', label: 'Current location' }),
      () => setLocation({ mode: 'denied' })
    )
  }

  const applyManualCity = () => {
    if (!manualCity.trim()) return
    setLocation({ mode: 'manual', label: manualCity.trim() })
  }

  const openDetail = async (policyId: string) => {
    setDetailLoading(true)
    try {
      const full = await getPolicy(policyId)
      setDetailPolicy(full)
    } catch {
      setError('Could not load policy details. Please try again.')
    } finally {
      setDetailLoading(false)
    }
  }

  const handleConfirm = async (policyId: string) => {
    setPendingPolicyId(policyId)
    setConfirming(true)
    setError(null)
    try {
      const updated = await selectInsurance(caseDetail.id, policyId)
      setCaseDetail(updated)
      setChanging(false)
      setDetailPolicy(null)
      navigate(`/coordinator/cases/${caseDetail.id}/policy-review`)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setConfirming(false)
      setPendingPolicyId(null)
    }
  }

  if (!changing && caseDetail.insurance_selection) {
    const selection = caseDetail.insurance_selection
    return (
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">Insurance Selection</h1>
        <p className="text-text-muted mb-6">Confirm the insurance policy for this Prior Authorization case.</p>

        <div className="bg-white border border-border rounded-2xl p-6 mb-6">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">Selected Policy</p>
          <p className="text-lg font-bold text-text">{selection.policy_name}</p>
          <p className="text-text-muted">{selection.company_name}</p>
          <span className="inline-block mt-2 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-primary">
            {typeLabel(selection.policy_type)}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => navigate(`/coordinator/cases/${caseDetail.id}/policy-review`)}
            className="flex-1 min-h-[48px] bg-primary text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-700 transition"
          >
            Continue
          </button>
          <button
            type="button"
            onClick={() => setChanging(true)}
            className="min-h-[48px] border border-border text-text-light font-semibold py-3 px-6 rounded-xl hover:bg-background-alt"
          >
            Change Policy
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">Choose an Insurance Policy</h1>
      <p className="text-text-muted mb-6">Search and choose the insurance company and policy for this patient.</p>

      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">
          {error}
        </div>
      )}

      {caseDetail.insurance_selection && (
        <div className="bg-blue-50 border border-primary/30 rounded-xl px-4 py-3 mb-5 flex items-center justify-between gap-3">
          <p className="text-sm text-text">
            Currently selected: <span className="font-semibold">{caseDetail.insurance_selection.policy_name}</span>
          </p>
          <button type="button" onClick={() => setChanging(false)} className="text-sm font-semibold text-primary shrink-0 hover:underline">
            Keep it
          </button>
        </div>
      )}

      {/* Search + filter trigger */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by company or policy name…"
            aria-label="Search policies"
            className="w-full min-h-[48px] border border-border rounded-xl pl-11 pr-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <button
          type="button"
          onClick={() => setFilterSheetOpen(true)}
          className="relative shrink-0 min-h-[48px] px-4 border border-border rounded-xl font-semibold text-text-light hover:bg-background-alt flex items-center gap-2"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
          </svg>
          <span className="hidden sm:inline">Filters</span>
          {activeFilterChips.length > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary text-white text-[11px] font-bold grid place-items-center">
              {activeFilterChips.length}
            </span>
          )}
        </button>
      </div>

      {/* Active filter chips */}
      {activeFilterChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {activeFilterChips.map(chip => (
            <button
              key={chip.key}
              type="button"
              onClick={() => clearFilter(chip.key)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-background-alt border border-border text-text-light rounded-full pl-3 pr-2 py-1.5 hover:border-primary/50"
            >
              {chip.label}
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3 h-3">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
          ))}
          <button type="button" onClick={clearAll} className="text-xs font-semibold text-primary hover:underline">
            Clear all
          </button>
        </div>
      )}

      {/* Results */}
      {loadingPolicies ? (
        <p className="text-text-muted text-center py-12">Loading policies…</p>
      ) : policies.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-2xl">
          <p className="text-text-muted mb-2">No policies match your search or filters.</p>
          {activeFilterChips.length > 0 && (
            <button type="button" onClick={clearAll} className="text-sm font-semibold text-primary hover:underline">
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {policies.map(policy => {
            const summary = policy.coverage_summary || policy.description
            const highlights = policy.key_benefits?.slice(0, 2) || []
            return (
              <div key={policy._id} className="bg-white border border-border rounded-2xl p-5 flex flex-col gap-3 hover:border-primary/50 hover:shadow-sm transition">
                <div className="flex items-start gap-3">
                  <InsurerLogo name={policy.company_name} logoUrl={policy.company_logo_url} />
                  <div className="min-w-0">
                    <p className="text-sm text-text-muted truncate">{policy.company_name}</p>
                    <p className="font-bold text-text leading-snug">{policy.policy_name}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-primary">
                    {typeLabel(policy.policy_type)}
                  </span>
                  {policy.verification_status === 'verified' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-700">
                      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3 h-3"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      Verified
                    </span>
                  ) : (
                    <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700">
                      Needs confirmation
                    </span>
                  )}
                </div>

                {summary && <p className="text-sm text-text-light leading-relaxed line-clamp-2">{summary}</p>}

                {highlights.length > 0 && (
                  <ul className="text-xs text-text-muted space-y-1">
                    {highlights.map(item => (
                      <li key={item} className="flex items-start gap-1.5">
                        <span className="text-primary mt-0.5">•</span>
                        <span className="line-clamp-1">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => openDetail(policy._id)}
                    className="flex-1 min-h-[44px] border border-border rounded-xl font-semibold text-sm text-text-light hover:bg-background-alt"
                  >
                    View details
                  </button>
                  <button
                    type="button"
                    disabled={confirming}
                    onClick={() => handleConfirm(policy._id)}
                    className="flex-1 min-h-[44px] bg-primary text-white rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-60"
                  >
                    {confirming && pendingPolicyId === policy._id ? 'Selecting…' : 'Select policy'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Filter sheet */}
      {filterSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
          <div
            onClick={() => setFilterSheetOpen(false)}
            aria-hidden="true"
            className="absolute inset-0 bg-black/30"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filter policies"
            className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl border border-border p-5 sm:p-6 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-text">Filters</h2>
              <button type="button" onClick={() => setFilterSheetOpen(false)} aria-label="Close filters" className="w-9 h-9 rounded-full hover:bg-background-alt grid place-items-center">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /></svg>
              </button>
            </div>

            <div className="flex flex-col gap-5">
              <div>
                <label htmlFor="filter-company" className="block text-sm font-semibold text-text-light mb-1.5">Insurance Company</label>
                <select
                  id="filter-company"
                  value={filters.company}
                  onChange={e => setFilters(f => ({ ...f, company: e.target.value }))}
                  className="w-full min-h-[48px] border border-border rounded-xl px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">All Companies</option>
                  {companies.map(c => (
                    <option key={c._id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="filter-type" className="block text-sm font-semibold text-text-light mb-1.5">Policy Type</label>
                <select
                  id="filter-type"
                  value={filters.policyType}
                  onChange={e => setFilters(f => ({ ...f, policyType: e.target.value }))}
                  className="w-full min-h-[48px] border border-border rounded-xl px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">All Types</option>
                  {POLICY_TYPE_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="filter-audience" className="block text-sm font-semibold text-text-light mb-1.5">Target Audience</label>
                <select
                  id="filter-audience"
                  value={filters.targetAudience}
                  onChange={e => setFilters(f => ({ ...f, targetAudience: e.target.value }))}
                  className="w-full min-h-[48px] border border-border rounded-xl px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">Anyone</option>
                  {TARGET_AUDIENCE_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <p className="block text-sm font-semibold text-text-light mb-1.5">Location</p>
                <p className="text-xs text-text-muted mb-2">
                  Used to show hospital network availability where verified data exists. We ask before using your location.
                </p>
                {location.mode === 'granted' || location.mode === 'manual' ? (
                  <div className="flex items-center justify-between bg-background-alt border border-border rounded-xl px-4 py-2.5">
                    <span className="text-sm text-text">{location.label}</span>
                    <button type="button" onClick={() => setLocation({ mode: 'unset' })} className="text-xs font-semibold text-primary hover:underline">
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={requestLocation}
                      className="min-h-[44px] border border-border rounded-xl font-semibold text-sm text-text-light hover:bg-background-alt"
                    >
                      Use my current location
                    </button>
                    {location.mode === 'denied' && (
                      <p className="text-xs text-amber-700">Location unavailable. Enter a city instead.</p>
                    )}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={manualCity}
                        onChange={e => setManualCity(e.target.value)}
                        placeholder="Enter city or state"
                        className="flex-1 min-h-[44px] border border-border rounded-xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                      <button type="button" onClick={applyManualCity} className="min-h-[44px] px-4 border border-border rounded-xl font-semibold text-sm text-text-light hover:bg-background-alt">
                        Set
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  clearAll()
                }}
                className="flex-1 min-h-[48px] border border-border rounded-xl font-semibold text-text-light hover:bg-background-alt"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={() => setFilterSheetOpen(false)}
                className="flex-1 min-h-[48px] bg-primary text-white rounded-xl font-semibold hover:bg-blue-700"
              >
                Show results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Policy detail sheet */}
      {(detailPolicy || detailLoading) && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
          <div onClick={() => setDetailPolicy(null)} aria-hidden="true" className="absolute inset-0 bg-black/30" />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Policy details"
            className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl border border-border p-5 sm:p-6 max-h-[88vh] overflow-y-auto"
          >
            <button
              type="button"
              onClick={() => setDetailPolicy(null)}
              aria-label="Close policy details"
              className="absolute top-4 right-4 w-9 h-9 rounded-full hover:bg-background-alt grid place-items-center"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /></svg>
            </button>

            {detailLoading || !detailPolicy ? (
              <p className="text-text-muted text-center py-16">Loading policy details…</p>
            ) : (
              <>
                <div className="flex items-start gap-3 mb-4 pr-8">
                  <InsurerLogo name={detailPolicy.company_name} logoUrl={detailPolicy.company_logo_url} size="lg" />
                  <div className="min-w-0">
                    <p className="text-sm text-text-muted">{detailPolicy.company_name}</p>
                    <h2 className="text-xl font-bold text-text leading-snug">{detailPolicy.policy_name}</h2>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-primary">
                        {typeLabel(detailPolicy.policy_type)}
                      </span>
                      {detailPolicy.verification_status === 'verified' ? (
                        <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-700">Verified</span>
                      ) : (
                        <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700">Needs confirmation</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-5">
                  {detailPolicy.target_audience?.length > 0 && (
                    <section>
                      <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Who it's for</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {detailPolicy.target_audience.map(a => (
                          <span key={a} className="text-xs font-medium px-2 py-1 rounded-full bg-background-alt text-text-light">
                            {TARGET_AUDIENCE_LABELS[a] || a}
                          </span>
                        ))}
                      </div>
                    </section>
                  )}

                  {(detailPolicy.coverage_summary || detailPolicy.description) && (
                    <section>
                      <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Coverage summary</h3>
                      <p className="text-sm text-text-light leading-relaxed">
                        {detailPolicy.coverage_summary || detailPolicy.description}
                      </p>
                    </section>
                  )}

                  {detailPolicy.sum_insured_range?.label && (
                    <section>
                      <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Sum insured</h3>
                      <p className="text-sm text-text-light">{detailPolicy.sum_insured_range.label}</p>
                    </section>
                  )}

                  {detailPolicy.key_benefits?.length > 0 && (
                    <section>
                      <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Core benefits</h3>
                      <ul className="text-sm text-text-light space-y-1.5">
                        {detailPolicy.key_benefits.map(b => (
                          <li key={b} className="flex items-start gap-2">
                            <span className="text-primary mt-0.5 shrink-0">•</span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {detailPolicy.eligibility && (
                    <section>
                      <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Eligibility &amp; conditions</h3>
                      <p className="text-sm text-text-light leading-relaxed">{detailPolicy.eligibility}</p>
                    </section>
                  )}

                  {detailPolicy.waiting_period && (
                    <section>
                      <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Waiting periods</h3>
                      <p className="text-sm text-text-light leading-relaxed">{detailPolicy.waiting_period}</p>
                    </section>
                  )}

                  {detailPolicy.key_exclusions?.length > 0 && (
                    <section>
                      <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Important limitations</h3>
                      <ul className="text-sm text-text-light space-y-1.5">
                        {detailPolicy.key_exclusions.map(x => (
                          <li key={x} className="flex items-start gap-2">
                            <span className="text-amber-600 mt-0.5 shrink-0">•</span>
                            <span>{x}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  <section className="bg-background-alt border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700">Needs confirmation</span>
                      <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide">Hospital network availability</h3>
                    </div>
                    <p className="text-sm text-text-light leading-relaxed">
                      Cashless hospital network data is not yet verified in this system for this policy. Confirm directly
                      with the insurer or hospital desk before informing the patient.
                    </p>
                  </section>

                  {!detailPolicy.coverage_summary && !detailPolicy.description && !detailPolicy.eligibility && (
                    <p className="text-sm text-text-muted">
                      Structured details for this product are not available yet.
                      {detailPolicy.official_policy_pdf_url && (
                        <>
                          {' '}
                          <a href={detailPolicy.official_policy_pdf_url} target="_blank" rel="noreferrer" className="text-primary font-semibold hover:underline">
                            View official policy document
                          </a>
                        </>
                      )}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 mt-6 sticky bottom-0 bg-white pt-3 -mx-5 px-5 sm:-mx-6 sm:px-6 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setDetailPolicy(null)}
                    className="flex-1 min-h-[48px] border border-border rounded-xl font-semibold text-text-light hover:bg-background-alt"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={confirming}
                    onClick={() => handleConfirm(detailPolicy._id)}
                    className="flex-1 min-h-[48px] bg-primary text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-60"
                  >
                    {confirming ? 'Selecting…' : 'Select this policy'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
