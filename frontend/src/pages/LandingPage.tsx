import { useRef, useState } from 'react'

interface LandingPageProps {
  onSubmit: (formData: FormData) => void
  selectedPolicy?: { id: string; name: string; companyName: string } | null
  onChangePolicy?: () => void
}

const HELP_STEPS = [
  'Upload the insurance policy PDF you want reviewed.',
  'Add a prescription if you want treatment-specific context.',
  'Receive a clear, human-friendly explanation with follow-up questions.'
]

export function LandingPage({ onSubmit, selectedPolicy, onChangePolicy }: LandingPageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const prescriptionInputRef = useRef<HTMLInputElement>(null)

  const [policyFile, setPolicyFile] = useState<File | null>(null)
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null)
  const [policyDragActive, setPolicyDragActive] = useState(false)
  const [prescriptionDragActive, setPrescriptionDragActive] = useState(false)

  const handlePolicyChange = (file: File | null) => {
    if (file && file.type === 'application/pdf') {
      setPolicyFile(file)
    } else if (file) {
      alert('Policy must be a PDF file')
    }
  }

  const handlePrescriptionChange = (file: File | null) => {
    if (file && ['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
      setPrescriptionFile(file)
    } else if (file) {
      alert('Prescription must be a PDF or image (PNG/JPG)')
    }
  }

  const handlePolicyDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setPolicyDragActive(true)
    } else if (e.type === 'dragleave') {
      setPolicyDragActive(false)
    }
  }

  const handlePolicyDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setPolicyDragActive(false)
    const files = e.dataTransfer.files
    if (files && files[0]) {
      handlePolicyChange(files[0])
    }
  }

  const handlePrescriptionDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setPrescriptionDragActive(true)
    } else if (e.type === 'dragleave') {
      setPrescriptionDragActive(false)
    }
  }

  const handlePrescriptionDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setPrescriptionDragActive(false)
    const files = e.dataTransfer.files
    if (files && files[0]) {
      handlePrescriptionChange(files[0])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!policyFile) {
      alert('Please upload an insurance policy')
      return
    }

    const formData = new FormData()
    formData.append('policy', policyFile)
    if (prescriptionFile) {
      formData.append('prescription', prescriptionFile)
    }

    onSubmit(formData)
  }

  return (
    <div className="px-3 py-5 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Policy review in a few steps</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Make your insurance documents easier to understand.
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Upload a policy and optional prescription to get a clear summary of what is covered, what is excluded, and what to review next.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="surface-card p-5 sm:p-8">
            <h2 className="text-xl font-semibold text-slate-900">How it works</h2>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
              {HELP_STEPS.map(step => (
                <li key={step} className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">•</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>

            {selectedPolicy && (
              <div className="mt-6 rounded-[1.25rem] border border-primary/20 bg-primary/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Selected policy</p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{selectedPolicy.companyName}</p>
                    <p className="text-sm text-slate-600">{selectedPolicy.name}</p>
                  </div>
                  {onChangePolicy && (
                    <button onClick={onChangePolicy} className="text-sm font-semibold text-primary hover:underline">
                      Change
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="surface-card p-5 sm:p-8">
            <div className="mb-6">
              <label className="block text-lg font-semibold text-slate-900">
                Insurance policy <span className="text-primary">*</span>
              </label>
              <p className="mt-2 text-sm text-slate-600">Upload a PDF policy document up to 10MB.</p>

              <div
                onDragEnter={handlePolicyDrag}
                onDragLeave={handlePolicyDrag}
                onDragOver={handlePolicyDrag}
                onDrop={handlePolicyDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`mt-4 cursor-pointer rounded-[1.25rem] border-2 border-dashed p-6 text-center transition sm:rounded-[1.5rem] sm:p-8 ${
                  policyDragActive
                    ? 'border-primary bg-primary/10'
                    : policyFile
                      ? 'border-emerald-400 bg-emerald-50'
                      : 'border-slate-300 bg-slate-50 hover:border-primary hover:bg-blue-50/50'
                }`}
              >
                {policyFile ? (
                  <div>
                    <div className="text-3xl">✓</div>
                    <p className="mt-2 font-semibold text-slate-900">{policyFile.name}</p>
                    <p className="text-sm text-slate-600">{(policyFile.size / 1024 / 1024).toFixed(1)}MB</p>
                  </div>
                ) : (
                  <div>
                    <div className="text-4xl">📄</div>
                    <p className="mt-2 font-semibold text-slate-900">Click to upload or drag and drop</p>
                    <p className="text-sm text-slate-600">PDF only</p>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept=".pdf" onChange={(e) => handlePolicyChange(e.target.files?.[0] || null)} className="hidden" />
              </div>
              {policyFile && (
                <button type="button" onClick={() => setPolicyFile(null)} className="mt-3 text-sm font-semibold text-primary hover:underline">
                  Remove file
                </button>
              )}
            </div>

            <div className="mb-8">
              <label className="block text-lg font-semibold text-slate-900">
                Prescription <span className="text-sm font-normal text-slate-500">(Optional)</span>
              </label>
              <p className="mt-2 text-sm text-slate-600">Add a prescription PDF or image for treatment-specific context.</p>

              <div
                onDragEnter={handlePrescriptionDrag}
                onDragLeave={handlePrescriptionDrag}
                onDragOver={handlePrescriptionDrag}
                onDrop={handlePrescriptionDrop}
                onClick={() => prescriptionInputRef.current?.click()}
                className={`mt-4 cursor-pointer rounded-[1.25rem] border-2 border-dashed p-6 text-center transition sm:rounded-[1.5rem] sm:p-8 ${
                  prescriptionDragActive
                    ? 'border-primary bg-primary/10'
                    : prescriptionFile
                      ? 'border-emerald-400 bg-emerald-50'
                      : 'border-slate-300 bg-slate-50 hover:border-primary hover:bg-blue-50/50'
                }`}
              >
                {prescriptionFile ? (
                  <div>
                    <div className="text-3xl">✓</div>
                    <p className="mt-2 font-semibold text-slate-900">{prescriptionFile.name}</p>
                    <p className="text-sm text-slate-600">{(prescriptionFile.size / 1024 / 1024).toFixed(1)}MB</p>
                  </div>
                ) : (
                  <div>
                    <div className="text-4xl">📋</div>
                    <p className="mt-2 font-semibold text-slate-900">Attach a prescription</p>
                    <p className="text-sm text-slate-600">PDF, PNG or JPG</p>
                  </div>
                )}
                <input ref={prescriptionInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => handlePrescriptionChange(e.target.files?.[0] || null)} className="hidden" />
              </div>
              {prescriptionFile && (
                <button type="button" onClick={() => setPrescriptionFile(null)} className="mt-3 text-sm font-semibold text-primary hover:underline">
                  Remove file
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={!policyFile}
              className={`w-full rounded-full px-6 py-3.5 text-sm font-semibold text-white transition ${
                policyFile ? 'bg-primary hover:bg-blue-700' : 'cursor-not-allowed bg-slate-400'
              }`}
            >
              {policyFile ? 'Analyze my insurance' : 'Upload a policy to begin'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
