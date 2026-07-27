import { ComingSoon, ItemGrid } from '../components/ComingSoon'

const CAPABILITIES = [
  { icon: '🏥', label: 'Hospitals supporting your policy' },
  { icon: '💳', label: 'Cashless availability' },
  { icon: '📍', label: 'Nearby network hospitals' }
]

export function NetworkHospitalsPage() {
  return (
    <ComingSoon
      icon="🏥"
      title="Network Hospitals"
      intro="In future versions, users will be able to discover hospitals that support their selected insurance policy, check cashless availability, and explore nearby network hospitals."
    >
      <h2 className="text-lg font-bold mb-4">What this module will offer</h2>
      <ItemGrid items={CAPABILITIES} />
    </ComingSoon>
  )
}
