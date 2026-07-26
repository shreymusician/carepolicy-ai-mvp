import { useRef, useState } from 'react'

interface LandingPageProps {
  onSubmit: (formData: FormData) => void
}

export function LandingPage({ onSubmit }: LandingPageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const prescriptionInputRef = useRef<HTMLInputElement>(null)
  const policyDragRef = useRef<HTMLDivElement>(null)
  const prescriptionDragRef = useRef<HTMLDivElement>(null)

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
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-3 text-text">CarePolicy AI</h1>
          <p className="text-2xl text-text-light font-light">
            Making Health Insurance Understandable
          </p>
        </div>

        {/* Main Content */}
        <form onSubmit={handleSubmit} className="w-full">
          {/* Policy Upload */}
          <div className="mb-10">
            <label className="block text-lg font-semibold mb-3 text-text">
              Insurance Policy <span className="text-primary">*</span>
            </label>
            <p className="text-sm text-text-muted mb-4">Upload your policy PDF (up to 10MB)</p>

            <div
              ref={policyDragRef}
              onDragEnter={handlePolicyDrag}
              onDragLeave={handlePolicyDrag}
              onDragOver={handlePolicyDrag}
              onDrop={handlePolicyDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition ${
                policyDragActive
                  ? 'border-primary bg-blue-50'
                  : policyFile
                  ? 'border-green-500 bg-green-50'
                  : 'border-border hover:border-primary hover:bg-background-alt'
              }`}
            >
              {policyFile ? (
                <div>
                  <div className="text-3xl mb-2">✓</div>
                  <p className="font-semibold text-text text-lg">{policyFile.name}</p>
                  <p className="text-sm text-text-muted mt-1">
                    {(policyFile.size / 1024 / 1024).toFixed(1)}MB
                  </p>
                </div>
              ) : (
                <div>
                  <div className="text-4xl mb-3 text-text-muted">📄</div>
                  <p className="text-lg text-text font-medium">Click to upload or drag and drop</p>
                  <p className="text-sm text-text-muted mt-1">PDF file only</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={(e) => handlePolicyChange(e.target.files?.[0] || null)}
                className="hidden"
              />
            </div>
            {policyFile && (
              <button
                type="button"
                onClick={() => setPolicyFile(null)}
                className="text-sm text-primary hover:underline mt-2"
              >
                Remove file
              </button>
            )}
          </div>

          {/* Prescription Upload */}
          <div className="mb-12">
            <label className="block text-lg font-semibold mb-3 text-text">
              Doctor's Prescription <span className="text-text-muted font-normal">(Optional)</span>
            </label>
            <p className="text-sm text-text-muted mb-4">Upload prescription PDF or image to help AI understand your specific treatment (up to 10MB)</p>

            <div
              ref={prescriptionDragRef}
              onDragEnter={handlePrescriptionDrag}
              onDragLeave={handlePrescriptionDrag}
              onDragOver={handlePrescriptionDrag}
              onDrop={handlePrescriptionDrop}
              onClick={() => prescriptionInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition ${
                prescriptionDragActive
                  ? 'border-primary bg-blue-50'
                  : prescriptionFile
                  ? 'border-green-500 bg-green-50'
                  : 'border-border hover:border-primary hover:bg-background-alt'
              }`}
            >
              {prescriptionFile ? (
                <div>
                  <div className="text-3xl mb-2">✓</div>
                  <p className="font-semibold text-text text-lg">{prescriptionFile.name}</p>
                  <p className="text-sm text-text-muted mt-1">
                    {(prescriptionFile.size / 1024 / 1024).toFixed(1)}MB
                  </p>
                </div>
              ) : (
                <div>
                  <div className="text-4xl mb-3 text-text-muted">📋</div>
                  <p className="text-lg text-text font-medium">Click to upload or drag and drop</p>
                  <p className="text-sm text-text-muted mt-1">PDF or image (PNG/JPG)</p>
                </div>
              )}
              <input
                ref={prescriptionInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => handlePrescriptionChange(e.target.files?.[0] || null)}
                className="hidden"
              />
            </div>
            {prescriptionFile && (
              <button
                type="button"
                onClick={() => setPrescriptionFile(null)}
                className="text-sm text-primary hover:underline mt-2"
              >
                Remove file
              </button>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!policyFile}
            className={`w-full py-4 px-6 rounded-lg font-bold text-lg text-white transition ${
              policyFile
                ? 'bg-primary hover:bg-blue-700 cursor-pointer'
                : 'bg-text-muted cursor-not-allowed opacity-50'
            }`}
          >
            {policyFile ? 'Analyze My Insurance' : 'Upload a Policy to Begin'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-text-muted text-sm mt-10">
          Your documents are analyzed securely using AI. We process your data only to generate your report.
        </p>
      </div>
    </div>
  )
}
