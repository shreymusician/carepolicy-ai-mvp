import { ComingSoon, StepFlow } from '../components/ComingSoon'

const STEPS = [
  'Upload Claim Form',
  'AI Auto Fill',
  'Validation',
  'Missing Documents',
  'Claim Readiness Score'
]

export function ClaimAssistantPage() {
  return (
    <ComingSoon
      icon="📝"
      title="Claim Assistant"
      intro="This module will prepare insurance claim forms using the policy and medical information already gathered, then check the file is complete before submission."
    >
      <h2 className="text-lg font-bold mb-4">How the claim workflow will work</h2>
      <StepFlow steps={STEPS} />

      <p className="text-sm text-text-muted leading-relaxed mt-8">
        The readiness score will highlight anything still missing, so a claim can be corrected before it reaches the
        insurer rather than after a rejection.
      </p>
    </ComingSoon>
  )
}
