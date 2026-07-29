import { InfoBadge, TrustNote, type InfoLevel } from '../components/InfoBadge'
import { PolicyChat } from '../components/PolicyChat'

interface ResultsPageProps {
  data: any
  onReset?: () => void
}

export function ResultsPage({ data, onReset }: ResultsPageProps) {
  const analysis = data.analysis_result.document_analysis
  const summary = analysis.ai_generated_knowledge.policy_summary
  const criticalIssues = analysis.risk_assessment.critical_issues
  const importantNotes = analysis.risk_assessment.important_notes || []

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-text mb-2">Your Insurance Explained</h1>
          <p className="text-text-muted">Based on your uploaded policy</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* Executive Summary */}
        <Section icon="📋" title="Coverage Summary" badge="ai">
          <p className="text-lg leading-relaxed text-text-light mb-6">
            {summary.what_is_covered}
          </p>
          {summary.key_points && summary.key_points.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="font-semibold text-text mb-3">Key Points:</p>
              <ul className="space-y-2">
                {summary.key_points.map((point: string, idx: number) => (
                  <li key={idx} className="flex gap-3 text-text">
                    <span className="text-primary font-bold min-w-fit">✓</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Section>

        {/* What's NOT Covered */}
        <Section icon="⛔" title="What's NOT Covered" badge="ai">
          <p className="text-base leading-relaxed text-text-light mb-6">
            {summary.what_is_not_covered}
          </p>
          {analysis.extracted_facts.exclusions && analysis.extracted_facts.exclusions.length > 0 && (
            <div className="space-y-3">
              {analysis.extracted_facts.exclusions.map((exc: any, idx: number) => (
                <div key={idx} className="border-l-4 border-orange-400 bg-orange-50 p-4 rounded">
                  <p className="font-semibold text-orange-900">{exc.exclusion}</p>
                  <p className="text-orange-800 text-sm mt-1">{exc.details}</p>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Critical Issues */}
        {criticalIssues && criticalIssues.length > 0 && (
          <Section icon="⚠️" title="Critical Issues" highlight="red">
            <div className="space-y-3">
              {criticalIssues.map((issue: any, idx: number) => (
                <div key={idx} className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
                  <p className="font-bold text-red-900">{issue.issue}</p>
                  <p className="text-red-800 text-sm mt-2">{issue.explanation}</p>
                  {issue.action_required && (
                    <p className="text-red-700 font-semibold text-sm mt-2">→ {issue.action_required}</p>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Important Notes */}
        {importantNotes && importantNotes.length > 0 && (
          <Section icon="ℹ️" title="Important Notes">
            <div className="space-y-3">
              {importantNotes.map((note: any, idx: number) => (
                <div key={idx} className="border-l-4 border-yellow-400 bg-yellow-50 p-4 rounded">
                  <p className="font-semibold text-yellow-900">{note.issue}</p>
                  <p className="text-yellow-800 text-sm mt-1">{note.explanation}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Policy Details */}
        <Section icon="📄" title="Policy Details" badge="official">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(analysis.extracted_facts.policy_information).map(([key, value]: any) => (
              <FactCard key={key} label={key} value={value} />
            ))}
          </div>
        </Section>

        {/* Treatment-Specific Info */}
        {data.metadata.prescription_provided && analysis.treatment_specific_summary && (
          <Section icon="💊" title="Your Treatment Coverage" highlight="blue" badge="ai">
            <p className="text-lg leading-relaxed text-text-light mb-6">
              {analysis.treatment_specific_summary.coverage_explanation}
            </p>

            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-6 mb-6">
              <p className="text-sm text-text-muted mb-2">Your Out-of-Pocket Cost</p>
              <p className="text-3xl font-bold text-primary">
                {analysis.treatment_specific_summary.potential_financial_responsibility}
              </p>
            </div>

            {analysis.treatment_specific_summary.important_treatment_notes &&
             analysis.treatment_specific_summary.important_treatment_notes.length > 0 && (
              <div>
                <p className="font-semibold text-text mb-3">Important Notes:</p>
                <ul className="space-y-2">
                  {analysis.treatment_specific_summary.important_treatment_notes.map((note: string, idx: number) => (
                    <li key={idx} className="flex gap-3 text-text-light">
                      <span className="text-primary font-bold min-w-fit">•</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Section>
        )}

        {/* Ask MyInsurance */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-2xl">💬</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-text">Ask MyInsurance</h2>
          </div>
          <p className="text-text-muted mb-6">
            Ask a question about this policy — e.g. "Is knee surgery covered?"
          </p>
          <PolicyChat documentId={data.document_id} />
        </div>

        {/* Footer Actions */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onReset}
              className="flex-1 bg-primary text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition text-center"
            >
              Analyze Another Policy
            </button>
            <button
              onClick={() => window.print()}
              className="flex-1 border-2 border-primary text-primary font-semibold py-3 px-6 rounded-lg hover:bg-blue-50 transition text-center"
            >
              Print Report
            </button>
          </div>
        </div>

        {/* Metadata */}
        <div className="mt-8 p-4 bg-background-alt rounded text-xs text-text-muted text-center">
          <div className="mb-2"><TrustNote /></div>
          <p>Document ID: {data.document_id}</p>
          <p>Analysis completed in {(data.metadata.processing_time_ms / 1000).toFixed(1)}s</p>
        </div>
      </div>
    </div>
  )
}

interface SectionProps {
  icon?: string
  title: string
  highlight?: 'red' | 'blue'
  badge?: InfoLevel
  children: React.ReactNode
}

function Section({ icon, title, highlight, badge, children }: SectionProps) {
  return (
    <div className="mb-10 sm:mb-14">
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {icon && <span className="text-2xl">{icon}</span>}
        <h2 className={`text-2xl sm:text-3xl font-bold ${
          highlight === 'red' ? 'text-red-900' : highlight === 'blue' ? 'text-blue-900' : 'text-text'
        }`}>
          {title}
        </h2>
        {badge && <InfoBadge level={badge} />}
      </div>
      <div className={highlight ? (highlight === 'red' ? 'bg-red-50/50' : 'bg-blue-50/50') : ''}>
        <div className={highlight ? (highlight === 'red' ? 'p-6' : 'p-6') : ''}>
          {children}
        </div>
      </div>
    </div>
  )
}

function FactCard({ label, value }: { label: string; value: any }) {
  const raw = value?.value ?? value
  const val = typeof raw === 'string' ? raw.trim() : raw
  const confidence = value?.confidence

  const isEmpty =
    val === null ||
    val === undefined ||
    val === '' ||
    (typeof val === 'string' && ['null', 'n/a', 'na', 'not available', 'unknown', 'not stated'].includes(val.toLowerCase()))

  if (isEmpty) return null

  return (
    <div className="border border-border rounded-lg p-4 hover:shadow-md transition">
      <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">
        {label.replace(/_/g, ' ')}
      </p>
      <p className="text-xl font-bold text-primary mt-2 break-words">{val}</p>
      {confidence && (
        <div className="mt-3 flex items-center gap-2">
          <span
            title={
              confidence === 'high'
                ? 'Read directly from your policy document.'
                : 'Found in your document, but worth confirming with your insurer.'
            }
            className={`text-xs font-semibold px-2 py-1 rounded ${
              confidence === 'high' ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-800'
            }`}
          >
            {confidence === 'high' ? '🟢 From your document' : '🟡 Worth confirming'}
          </span>
        </div>
      )}
    </div>
  )
}
