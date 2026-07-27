import { ComingSoon, StepFlow } from '../components/ComingSoon'

const STEPS = [
  'Upload Policy Document',
  'Upload Medical Records',
  'AI verifies policy conditions',
  'AI checks treatment eligibility',
  'AI identifies missing information',
  'Prior Authorization Readiness Score',
  'Ready to Submit to Insurer'
]

export function PriorAuthorizationPage() {
  return (
    <ComingSoon
      icon="✅"
      title="Prior Authorization Assistant"
      intro="This module helps healthcare workers prepare complete prior authorization requests before treatment begins. The AI verifies policy eligibility, checks coverage, and identifies any missing information needed for insurer approval."
    >
      <h2 className="text-lg font-bold mb-4">How the prior authorization workflow will work</h2>
      <StepFlow steps={STEPS} />

      <div className="mt-8 space-y-4 text-sm text-text-muted leading-relaxed">
        <p>
          <strong>What is Prior Authorization?</strong> Before many planned treatments, hospitals request approval from the insurance company. The insurer verifies the policy covers the treatment, checks eligibility, and confirms medical necessity.
        </p>
        <p>
          <strong>Why it matters:</strong> Getting prior authorization approval before treatment prevents costly delays and claim rejections. It also helps hospitals plan resources and billing more accurately.
        </p>
        <p>
          <strong>How CarePolicy AI helps:</strong> The readiness score will highlight anything still missing from the prior authorization request, so it can be corrected before it reaches the insurer rather than after a rejection. This reduces approval delays and improves treatment readiness.
        </p>
      </div>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-text font-semibold mb-2">🔮 Future capabilities</p>
        <p className="text-sm text-text-muted">After Prior Authorization is complete, CarePolicy AI will support Claim Submission, Claim Tracking, and Settlement Status — helping healthcare workers through the entire insurance cycle.</p>
      </div>
    </ComingSoon>
  )
}
