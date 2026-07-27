import { Link } from 'react-router-dom'

const AUDIENCES = [
  { icon: '👤', title: 'Citizens', body: 'Understand what a policy actually covers before and during treatment.' },
  { icon: '🩺', title: 'Healthcare Workers', body: 'Verify insurance coverage and prepare prior authorization requests before treatment begins.' },
  { icon: '🏢', title: 'Insurance Staff', body: 'Reference approved product terms and support prior authorization verification.' }
]

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="text-text-light leading-relaxed space-y-4">{children}</div>
    </section>
  )
}

export function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
      <h1 className="text-4xl sm:text-5xl font-bold mb-4">About CarePolicy AI</h1>
      <p className="text-lg text-text-muted mb-14">
        Making Health Insurance Simple, Accessible and Intelligent.
      </p>

      <Section title="What is CarePolicy AI?">
        <p>
          CarePolicy AI is an AI-powered health insurance platform. It brings insurance product information, policy
          understanding, medical document analysis and prior authorization preparation into one place, so healthcare
          workers can prepare accurate authorization requests before treatment begins, not deal with rejections after.
        </p>
      </Section>

      <Section title="Our mission">
        <p>
          Health insurance is written in language most people never get to fully understand — until they are already
          in hospital and least able to deal with it. Our mission is to make the terms of a policy clear before that
          moment, in words anyone can follow.
        </p>
      </Section>

      <Section title="Why IRDAI">
        <p>
          IRDAI is the insurance regulator of India, and every health insurance product sold here must be approved by
          it and given a Unique Identification Number (UIN). Building on the IRDAI approved-product catalogue means the
          products shown in CarePolicy AI are real, approved products — traceable to a regulator-published document
          rather than a marketing page.
        </p>
        <p>
          Where we show a policy detail, we show where it came from: official IRDAI information, official insurer
          documents, Customer Information Sheets, or official policy wordings. If something cannot be confirmed from an
          official source, we leave it blank rather than filling it in.
        </p>
      </Section>

      <Section title="How AI helps">
        <p>
          The AI does not decide whether prior authorization is approved. It translates — taking verified policy information and
          restating it in plain language, answering questions about a specific policy, pulling structure out of
          medical paperwork, and identifying missing information before requests are submitted to insurers.
        </p>
        <p>
          Because explanations are generated only from verified policy data, the AI is constrained by what the official
          documents actually say. Anything AI-written is labelled as an AI summary, so it is always clear which parts
          are the insurer's words and which are the explanation.
        </p>
        <p>
          CarePolicy AI helps healthcare workers prepare prior authorization requests that are complete and accurate,
          reducing approval delays, preventing rejections, and improving treatment readiness.
        </p>
      </Section>

      <Section title="Who it is for">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 not-prose">
          {AUDIENCES.map(a => (
            <div key={a.title} className="border border-border rounded-2xl p-5">
              <div className="text-2xl mb-3">{a.icon}</div>
              <h3 className="font-bold mb-1.5">{a.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{a.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <div className="border-t border-border pt-8">
        <Link
          to="/explorer"
          className="inline-block bg-primary text-white font-semibold py-3 px-7 rounded-xl hover:bg-blue-700 transition"
        >
          Explore Insurance Policies
        </Link>
      </div>
    </div>
  )
}
