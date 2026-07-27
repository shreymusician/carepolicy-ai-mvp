export type InfoLevel = 'official' | 'irdai' | 'insurer' | 'basic' | 'ai'

const STYLES: Record<InfoLevel, { dot: string; wrap: string; label: string; meaning: string }> = {
  official: {
    dot: '🟢',
    wrap: 'bg-green-50 text-green-800 border-green-200',
    label: 'Official Information',
    meaning: 'This information has been verified from official insurer documents.'
  },
  irdai: {
    dot: '🟢',
    wrap: 'bg-green-50 text-green-800 border-green-200',
    label: 'Official IRDAI Information',
    meaning: 'Verified from the IRDAI approved-product catalogue, the insurance regulator of India.'
  },
  insurer: {
    dot: '🟢',
    wrap: 'bg-green-50 text-green-800 border-green-200',
    label: 'Official Insurer Information',
    meaning: "Verified from the insurer's own official policy documents."
  },
  basic: {
    dot: '🟡',
    wrap: 'bg-amber-50 text-amber-800 border-amber-200',
    label: 'Basic Information Available',
    meaning: 'Basic policy information is available. Some details will be available after processing official documents.'
  },
  ai: {
    dot: '🔵',
    wrap: 'bg-blue-50 text-blue-800 border-blue-200',
    label: 'AI Summary',
    meaning: 'Easy-to-understand explanation generated from verified policy information.'
  }
}

export function InfoBadge({ level, className = '' }: { level: InfoLevel; className?: string }) {
  const s = STYLES[level]
  return (
    <span
      title={s.meaning}
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${s.wrap} ${className}`}
    >
      <span aria-hidden="true">{s.dot}</span>
      {s.label}
    </span>
  )
}

export function TrustNote({ className = '' }: { className?: string }) {
  return (
    <span
      title="CarePolicy AI only displays information verified from official insurer sources to ensure accuracy."
      className={`inline-flex items-center gap-1 text-xs text-text-muted cursor-help ${className}`}
    >
      <span aria-hidden="true">ⓘ</span>
      How we source information
    </span>
  )
}

export const PENDING_DETAILS_NOTE =
  'Additional policy details will be added as official documentation becomes available.'

export function sourceBadgeLevel(sourceType?: string, hasOfficialDetails?: boolean): InfoLevel {
  if (sourceType === 'IRDAI') return 'irdai'
  if (sourceType === 'INSURER') return 'insurer'
  return hasOfficialDetails ? 'official' : 'basic'
}

export function DocumentLink({ href, kind }: { href: string; kind: 'cis' | 'wording' | 'site'; }) {
  const label =
    kind === 'cis' ? '📄 Customer Information Sheet'
    : kind === 'wording' ? '📄 Official Policy Wording'
    : '🔗 Official website'

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
    >
      {label} →
    </a>
  )
}
