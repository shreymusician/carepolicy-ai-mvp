import { ComingSoon, ItemGrid } from '../components/ComingSoon'

const DOCUMENTS = [
  { icon: '🏥', label: 'Discharge Summary' },
  { icon: '📋', label: 'Medical Reports' },
  { icon: '🧪', label: 'Lab Reports' },
  { icon: '🧾', label: 'Bills' },
  { icon: '💊', label: 'Prescriptions' }
]

export function MedicalDocumentsPage() {
  return (
    <ComingSoon
      icon="🧾"
      title="Medical Documents"
      intro="This module will read hospital paperwork and turn it into structured medical information that can be used to prepare an insurance claim."
    >
      <h2 className="text-lg font-bold mb-4">Documents this module will analyse</h2>
      <ItemGrid items={DOCUMENTS} />

      <p className="text-sm text-text-muted leading-relaxed mt-8">
        Extracted details will be linked to your selected insurance policy, so CarePolicy AI can show how the
        treatment relates to the coverage in that policy.
      </p>
    </ComingSoon>
  )
}
