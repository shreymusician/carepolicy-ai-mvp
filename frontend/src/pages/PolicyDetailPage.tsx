import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { InfoBadge, TrustNote, DocumentLink, sourceBadgeLevel, PENDING_DETAILS_NOTE } from '../components/InfoBadge'
import { useAppState } from '../state/AppState'

interface Policy {
  _id: string
  company_name: string
  company_logo_url: string
  policy_name: string
  policy_type: string
  description?: string
  coverage_summary?: string
  waiting_period?: string
  eligibility?: string
  sum_insured_range?: { label: string }
  key_benefits?: string[]
  key_exclusions?: string[]
  official_website?: string
  official_policy_pdf_url?: string
  customer_information_sheet_url?: string
  source_url?: string
  source_type?: 'IRDAI' | 'INSURER'
  uin?: string
  product_status?: string
  last_verified_at?: string
  verification_status: 'verified' | 'unverified'
  tags?: string[]
}

interface Explanation {
  in_simple_terms?: string
  what_it_covers?: string[]
  what_to_watch_out_for?: string[]
  who_its_for?: string
  waiting_period_explained?: string
}


const TYPE_LABELS: Record<string, string> = {
  individual: 'Individual',
  family_floater: 'Family Floater',
  senior_citizen: 'Senior Citizen',
  top_up: 'Top-Up',
  critical_illness: 'Critical Illness'
}

export function PolicyDetailPage() {
  const { id: policyId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { setSelectedPolicy } = useAppState()

  const [policy, setPolicy] = useState<Policy | null>(null)
  const [loading, setLoading] = useState(true)
  const [explanation, setExplanation] = useState<Explanation | null>(null)
  const [explaining, setExplaining] = useState(false)
  const [explainMessage, setExplainMessage] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/v1/insurance/policies/${policyId}`)
      .then(r => r.json())
      .then(d => setPolicy(d.policy || null))
      .catch(() => setPolicy(null))
      .finally(() => setLoading(false))
  }, [policyId])

  useEffect(() => {
    if (!policy) return
    const hasContent =
      policy.coverage_summary || policy.waiting_period || policy.eligibility ||
      policy.description || (policy.key_benefits && policy.key_benefits.length > 0)
    if (!hasContent) return

    setExplaining(true)
    fetch(`/api/v1/insurance/policies/${policy._id}/explain`, { method: 'POST' })
      .then(r => r.json())
      .then(d => {
        setExplanation(d.available ? d.explanation : null)
        setExplainMessage(d.available ? null : d.message || null)
      })
      .catch(() => setExplanation(null))
      .finally(() => setExplaining(false))
  }, [policy])

  const onBack = () => navigate('/explorer')
  const onUploadDocuments = () => {
    if (policy) {
      setSelectedPolicy({ id: policy._id, name: policy.policy_name, companyName: policy.company_name })
    }
    navigate('/analyse')
  }

  if (loading) {
    return <div className="py-24 text-center">
      <p className="text-text-muted">Loading policy...</p>
    </div>
  }

  if (!policy) {
    return <div className="py-24 flex flex-col items-center gap-4 px-4">
      <p className="text-text-muted">We couldn't load this policy.</p>
      <button onClick={onBack} className="text-primary font-semibold hover:underline">← Back to Insurance Explorer</button>
    </div>
  }

  const hasOfficialDetails = Boolean(
    policy.coverage_summary || policy.waiting_period || policy.eligibility ||
    policy.sum_insured_range || (policy.key_benefits && policy.key_benefits.length > 0)
  )
  const uin = policy.uin || policy.tags?.find(t => t.startsWith('UIN:'))?.replace('UIN:', '')

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <button onClick={onBack} className="text-primary font-semibold hover:underline text-sm mb-5">
            ← Back to Insurance Explorer
          </button>

          <div className="flex items-start gap-4">
            <img
              src={policy.company_logo_url}
              alt={policy.company_name}
              className="w-14 h-14 rounded-lg object-contain border border-border p-1 bg-white shrink-0"
            />
            <div className="min-w-0">
              <p className="text-text-muted font-medium">{policy.company_name}</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-text mt-1 mb-3 break-words">
                {policy.policy_name}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                  {TYPE_LABELS[policy.policy_type] || policy.policy_type}
                </span>
                <InfoBadge level={sourceBadgeLevel(policy.source_type, hasOfficialDetails)} />
              </div>
              {uin && (
                <p className="text-xs text-text-muted mt-2 font-mono">UIN: {uin}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        {/* Plain-language explanation */}
        {(explaining || explanation || explainMessage) && (
          <section className="mb-10">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <h2 className="text-2xl font-bold text-text">In Simple Terms</h2>
              <InfoBadge level="ai" />
            </div>

            {explaining ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <p className="text-text-muted italic">Preparing a simple explanation...</p>
              </div>
            ) : explanation ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-5">
                {explanation.in_simple_terms && (
                  <p className="text-lg leading-relaxed text-text">{explanation.in_simple_terms}</p>
                )}

                {explanation.who_its_for && (
                  <p className="text-text-light">
                    <span className="font-semibold text-text">Best suited for: </span>
                    {explanation.who_its_for}
                  </p>
                )}

                {explanation.what_it_covers && explanation.what_it_covers.length > 0 && (
                  <div>
                    <p className="font-semibold text-text mb-2">What it covers</p>
                    <ul className="space-y-1.5">
                      {explanation.what_it_covers.map((c, i) => (
                        <li key={i} className="flex gap-2.5 text-text-light">
                          <span className="text-green-600 font-bold shrink-0">✓</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {explanation.what_to_watch_out_for && explanation.what_to_watch_out_for.length > 0 && (
                  <div>
                    <p className="font-semibold text-text mb-2">Things to keep in mind</p>
                    <ul className="space-y-1.5">
                      {explanation.what_to_watch_out_for.map((c, i) => (
                        <li key={i} className="flex gap-2.5 text-text-light">
                          <span className="text-amber-600 font-bold shrink-0">!</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {explanation.waiting_period_explained && (
                  <div className="bg-white border border-blue-200 rounded p-4">
                    <p className="font-semibold text-text mb-1">How the waiting period works</p>
                    <p className="text-text-light">{explanation.waiting_period_explained}</p>
                  </div>
                )}
              </div>
            ) : explainMessage ? (
              <div className="bg-background-alt border border-border rounded-lg p-6">
                <p className="text-text-light">{explainMessage}</p>
              </div>
            ) : null}
          </section>
        )}

        {/* At a glance */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-text mb-4">Policy At a Glance</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlanceCard icon="🏢" label="Company" value={policy.company_name} />
            <GlanceCard icon="📋" label="Policy Type" value={TYPE_LABELS[policy.policy_type] || policy.policy_type} />
            <GlanceCard icon="💰" label="Sum Insured" value={policy.sum_insured_range?.label} />
            <GlanceCard icon="🛡️" label="Coverage" value={policy.coverage_summary} clamp />
            <GlanceCard icon="⏳" label="Waiting Period" value={policy.waiting_period} clamp />
            <GlanceCard icon="👥" label="Eligibility" value={policy.eligibility} clamp />
          </div>
        </section>

        {/* Official details */}
        {hasOfficialDetails && (
          <section className="mb-10">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <h2 className="text-2xl font-bold text-text">Official Information</h2>
              <InfoBadge level={sourceBadgeLevel(policy.source_type, true)} />
            </div>

            <div className="space-y-5">
              {policy.sum_insured_range?.label && (
                <DetailRow title="Cover amount options" body={policy.sum_insured_range.label} />
              )}
              {policy.coverage_summary && (
                <DetailRow title="What's included" body={policy.coverage_summary} />
              )}
              {policy.waiting_period && (
                <DetailRow title="Waiting periods" body={policy.waiting_period} />
              )}
              {policy.eligibility && (
                <DetailRow title="Who can apply" body={policy.eligibility} />
              )}

              {policy.key_benefits && policy.key_benefits.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Key benefits</p>
                  <ul className="space-y-1.5">
                    {policy.key_benefits.map((b, i) => (
                      <li key={i} className="flex gap-2.5 text-text-light">
                        <span className="text-primary font-bold shrink-0">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {policy.key_exclusions && policy.key_exclusions.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Limits & exclusions</p>
                  <ul className="space-y-1.5">
                    {policy.key_exclusions.map((e, i) => (
                      <li key={i} className="flex gap-2.5 text-text-light">
                        <span className="text-amber-600 font-bold shrink-0">•</span>
                        <span>{e}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}

        {/* More information on the way */}
        {!hasOfficialDetails && (
          <section className="mb-10">
            <div className="border-2 border-dashed border-primary/40 bg-blue-50/50 rounded-2xl p-6 sm:p-8 text-center">
              <div className="text-3xl mb-3">📄</div>
              <h2 className="text-xl font-bold text-text mb-2">More details on the way</h2>
              <p className="text-text-light mb-1">{PENDING_DETAILS_NOTE}</p>
              <p className="text-text-muted text-sm mb-6">
                You can upload this policy document now and MyInsurance will explain the coverage, waiting periods
                and exclusions in simple language.
              </p>
              <button
                onClick={onUploadDocuments}
                className="bg-primary text-white font-semibold py-3 px-8 rounded-xl hover:bg-blue-700 transition"
              >
                Upload Policy Document
              </button>
            </div>
          </section>
        )}

        {/* Official documents */}
        <section className="border-t border-border pt-8">
          <h2 className="text-2xl font-bold text-text mb-4">Official Documents</h2>
          <div className="flex flex-col gap-2">
            {policy.customer_information_sheet_url && (
              <DocumentLink href={policy.customer_information_sheet_url} kind="cis" />
            )}
            {policy.official_policy_pdf_url && (
              <DocumentLink href={policy.official_policy_pdf_url} kind="wording" />
            )}
            {policy.official_website && (
              <DocumentLink href={policy.official_website} kind="site" />
            )}
            {uin && <p className="text-xs text-text-muted mt-1 font-mono">Product UIN: {uin}</p>}
            {policy.source_type === 'IRDAI' && (
              <p className="text-xs text-text-muted">
                Listed in the IRDAI approved-product catalogue
                {policy.last_verified_at
                  ? ` · last checked ${new Date(policy.last_verified_at).toLocaleDateString()}`
                  : ''}
              </p>
            )}
          </div>

          <div className="mt-6"><TrustNote /></div>
        </section>

        {/* Prior Authorization workflow */}
        <section className="border-t border-border pt-8 mt-10">
          <h2 className="text-2xl font-bold text-text mb-2">Prepare Prior Authorization</h2>
          <p className="text-text-muted mb-6 leading-relaxed">
            Analyse your own policy document to get a personalised review of your cover, then continue into medical
            documents to prepare your prior authorization request before treatment.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onUploadDocuments}
              className="flex-1 bg-primary text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-700 transition"
            >
              Analyse My Policy Document
            </button>
            <button
              onClick={() => navigate('/documents')}
              className="flex-1 border-2 border-primary text-primary font-semibold py-3 px-6 rounded-xl hover:bg-blue-50 transition"
            >
              Medical Documents
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

function DetailRow({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">{title}</p>
      <p className="text-text-light leading-relaxed">{body}</p>
    </div>
  )
}

function GlanceCard({
  icon,
  label,
  value,
  clamp
}: {
  icon: string
  label: string
  value?: string
  clamp?: boolean
}) {
  const hasValue = Boolean(value && value.trim())
  return (
    <div className="border border-border rounded-2xl p-5 bg-white">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">{label}</p>
      </div>
      {hasValue ? (
        <p className={`text-text font-medium leading-relaxed ${clamp ? 'line-clamp-3 text-sm' : ''}`}>{value}</p>
      ) : (
        <p className="text-sm text-text-muted italic">Details coming soon</p>
      )}
    </div>
  )
}
