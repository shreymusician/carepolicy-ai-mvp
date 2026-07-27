import { Link } from 'react-router-dom'
import { PolicyChat } from '../components/PolicyChat'
import { InfoBadge, TrustNote } from '../components/InfoBadge'
import { useAppState } from '../state/AppState'

export function AIAssistantPage() {
  const { analysis } = useAppState()

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <h1 className="text-4xl sm:text-5xl font-bold">AI Assistant</h1>
          <InfoBadge level="ai" />
        </div>
        <p className="text-lg text-text-muted leading-relaxed">
          Ask questions about your policy and get answers in plain language.
        </p>
      </div>

      {analysis ? (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 mb-8">
            <p className="text-sm text-text">
              Answering from your analysed policy document.
            </p>
            <p className="text-xs text-text-muted mt-1 font-mono">Document ID: {analysis.document_id}</p>
          </div>

          <PolicyChat documentId={analysis.document_id} />

          <div className="mt-10 pt-6 border-t border-border">
            <TrustNote />
          </div>
        </>
      ) : (
        <div className="border-2 border-dashed border-primary/40 bg-blue-50/50 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4">📄</div>
          <h2 className="text-xl font-bold mb-2">Analyse a policy to begin</h2>
          <p className="text-text-light mb-2 max-w-lg mx-auto leading-relaxed">
            The assistant answers using your own policy document, so its answers stay specific to your cover rather
            than general advice.
          </p>
          <p className="text-text-muted text-sm mb-7 max-w-lg mx-auto">
            Choose a policy and upload your document to get started.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/explorer"
              className="bg-primary text-white font-semibold py-3 px-7 rounded-xl hover:bg-blue-700 transition"
            >
              Explore Insurance Policies
            </Link>
            <Link
              to="/analyse"
              className="border-2 border-primary text-primary font-semibold py-3 px-7 rounded-xl hover:bg-blue-50 transition"
            >
              Upload a Policy Document
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
