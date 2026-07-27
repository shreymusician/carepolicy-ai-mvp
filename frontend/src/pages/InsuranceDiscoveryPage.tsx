import { useEffect, useState } from 'react'

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

interface InsuranceDiscoveryPageProps {
  onSelectPolicy: (policy: { id: string; name: string; companyName: string }) => void
  onSkip: () => void
}

const POLICY_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'individual', label: 'Individual' },
  { value: 'family_floater', label: 'Family Floater' },
  { value: 'senior_citizen', label: 'Senior Citizen' },
  { value: 'top_up', label: 'Top-Up' },
  { value: 'critical_illness', label: 'Critical Illness' }
]

export function InsuranceDiscoveryPage({ onSelectPolicy, onSkip }: InsuranceDiscoveryPageProps) {
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
    <div className="min-h-screen bg-white">
      <div className="border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-text mb-2">Find Your Insurance Policy</h1>
          <p className="text-text-muted text-lg">Search and select a policy to understand its coverage</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by company or policy name (e.g. Star Health, Care Supreme)..."
            className="w-full border border-border rounded-lg px-5 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="border border-border rounded-lg px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {POLICY_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>

          <select
            value={selectedCompany}
            onChange={e => setSelectedCompany(e.target.value)}
            className="border border-border rounded-lg px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Companies</option>
            {companies.map(c => (
              <option key={c._id} value={c.name}>{c.name}</option>
            ))}
          </select>

          {(selectedType || selectedCompany || query) && (
            <button
              onClick={() => { setSelectedType(''); setSelectedCompany(''); setQuery('') }}
              className="text-sm text-primary hover:underline px-2"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <p className="text-text-muted text-center py-12">Loading policies...</p>
        ) : policies.length === 0 ? (
          <p className="text-text-muted text-center py-12">No policies match your search.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {policies.map(policy => (
              <button
                key={policy._id}
                onClick={() => onSelectPolicy({ id: policy._id, name: policy.policy_name, companyName: policy.company_name })}
                className="text-left border border-border rounded-xl p-5 hover:border-primary hover:shadow-md transition bg-white"
              >
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={policy.company_logo_url}
                    alt={policy.company_name}
                    className="w-10 h-10 rounded object-cover border border-border"
                  />
                  <div>
                    <p className="font-semibold text-text">{policy.company_name}</p>
                    <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-700 mt-1">
                      {POLICY_TYPES.find(t => t.value === policy.policy_type)?.label || policy.policy_type}
                    </span>
                  </div>
                </div>

                <p className="text-lg font-bold text-text mb-2">{policy.policy_name}</p>

                {policy.description && (
                  <p className="text-sm text-text-light mb-2 line-clamp-2">{policy.description}</p>
                )}
                {policy.coverage_summary && (
                  <p className="text-sm text-text-muted line-clamp-2 mb-2">{policy.coverage_summary}</p>
                )}
                {policy.waiting_period && (
                  <p className="text-xs text-text-muted line-clamp-2">
                    <span className="font-semibold">Waiting period:</span> {policy.waiting_period}
                  </p>
                )}

                <div className="mt-3 pt-3 border-t border-border">
                  {policy.verification_status === 'verified' ? (
                    <span className="text-xs font-semibold text-green-700">
                      ✓ Verified from official insurer document
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-orange-700">
                      ⚠ Details not yet verified — refer to the insurer's official policy document
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="text-center mt-10 pt-8 border-t border-border">
          <button onClick={onSkip} className="text-primary font-semibold hover:underline">
            Skip — Upload a policy document directly →
          </button>
        </div>
      </div>
    </div>
  )
}
