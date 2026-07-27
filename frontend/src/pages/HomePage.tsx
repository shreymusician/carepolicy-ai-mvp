import { Link } from 'react-router-dom'

const WORKFLOW = [
  { n: 1, title: 'Explore Insurance Policies', body: 'Browse IRDAI-approved health insurance products.' },
  { n: 2, title: 'Understand Your Policy', body: 'AI explains coverage, waiting periods and exclusions in plain language.' },
  { n: 3, title: 'Analyse Medical Documents', body: 'Extract structured information from hospital paperwork.' },
  { n: 4, title: 'Prior Authorization Assistant', body: 'Prepare prior authorization requests with AI assistance before treatment.' }
]

const FEATURES = [
  { icon: '🔍', title: 'Insurance Explorer', body: 'Browse IRDAI-approved insurance products.', to: '/explorer' },
  { icon: '📘', title: 'Policy Intelligence', body: 'AI explains insurance policies in simple language.', to: '/explorer' },
  { icon: '🧾', title: 'Medical Intelligence', body: 'Extract structured medical information from hospital documents.', to: '/documents' },
  { icon: '✅', title: 'Prior Authorization Assistant', body: 'Prepare complete prior authorization requests with AI assistance before treatment.', to: '/prior-auth' },
  { icon: '💬', title: 'AI Assistant', body: 'Ask questions about insurance policies and prior authorization.', to: '/assistant' }
]

const TRUST = [
  { icon: '🟢', title: 'Official IRDAI information', body: 'Products taken from the IRDAI approved-product catalogue.' },
  { icon: '🟢', title: 'Official insurer documents', body: 'Details read from the insurer’s own published documents.' },
  { icon: '📄', title: 'Customer Information Sheets', body: 'The standardised summary every insurer must publish.' },
  { icon: '📄', title: 'Official Policy Wordings', body: 'The full approved policy contract, linked for you to read.' }
]

export function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20 sm:pt-24 sm:pb-28 text-center">
        <span className="inline-block text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-primary border border-blue-200 mb-6">
          Built on official IRDAI-approved product information
        </span>
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-5">CarePolicy AI</h1>
        <p className="text-xl sm:text-2xl text-text-light font-light mb-6">
          Making Health Insurance Simple, Accessible and Intelligent.
        </p>
        <p className="text-base sm:text-lg text-text-muted max-w-2xl mx-auto leading-relaxed mb-10">
          CarePolicy AI helps citizens and healthcare workers understand insurance policies, analyse medical
          documents, and prepare prior authorization requests with AI assistance.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/explorer"
            className="bg-primary text-white font-semibold py-3.5 px-8 rounded-xl hover:bg-blue-700 transition"
          >
            Get Started
          </Link>
          <Link
            to="/explorer"
            className="border-2 border-primary text-primary font-semibold py-3.5 px-8 rounded-xl hover:bg-blue-50 transition"
          >
            Explore Insurance Policies
          </Link>
        </div>
      </section>

      {/* Workflow */}
      <section className="bg-background-alt border-y border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-3">How it works</h2>
          <p className="text-text-muted text-center mb-12">From finding a policy to prior authorization readiness.</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {WORKFLOW.map((s, i) => (
              <div key={s.n} className="relative">
                <div className="bg-white border border-border rounded-2xl p-6 h-full">
                  <div className="w-10 h-10 rounded-full bg-primary text-white grid place-items-center font-bold mb-4">
                    {s.n}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                  <p className="text-sm text-text-muted leading-relaxed">{s.body}</p>
                </div>
                {i < WORKFLOW.length - 1 && (
                  <span className="hidden md:block absolute top-1/2 -right-3 text-border text-2xl leading-none">→</span>
                )}
                {i < WORKFLOW.length - 1 && (
                  <span className="md:hidden block text-center text-border text-2xl leading-none py-1">↓</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-3">What CarePolicy AI does</h2>
        <p className="text-text-muted text-center mb-12">One platform across the whole insurance journey.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(f => (
            <Link
              key={f.title}
              to={f.to}
              className="border border-border rounded-2xl p-6 hover:border-primary hover:shadow-md transition bg-white"
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{f.body}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section className="bg-background-alt border-y border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-3">Where our information comes from</h2>
          <p className="text-text-muted text-center max-w-2xl mx-auto mb-12">
            Every policy detail shown in CarePolicy AI is taken from official regulatory or insurer sources, so you
            can always trace what you read back to the original document.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {TRUST.map(t => (
              <div key={t.title} className="bg-white border border-border rounded-2xl p-6 flex gap-4">
                <span className="text-xl shrink-0">{t.icon}</span>
                <div>
                  <h3 className="font-semibold mb-1">{t.title}</h3>
                  <p className="text-sm text-text-muted leading-relaxed">{t.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">Start with your policy</h2>
        <p className="text-text-muted mb-8 max-w-xl mx-auto">
          Find an insurance product and let CarePolicy AI explain exactly what it covers.
        </p>
        <Link
          to="/explorer"
          className="inline-block bg-primary text-white font-semibold py-3.5 px-8 rounded-xl hover:bg-blue-700 transition"
        >
          Explore Insurance Policies
        </Link>
      </section>
    </div>
  )
}
