import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCoordinatorCase } from '../../state/CoordinatorCaseContext'
import { ApiError, confirmMedicalRecords, deleteDocument, uploadDocument } from '../../lib/coordinatorApi'
import { DOCUMENT_CATEGORIES } from '../../types/coordinator'
import type { DocumentCategory } from '../../types/coordinator'

interface UploadInProgress {
  filename: string
  progress: number
  error?: string
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function MedicalRecordsStepPage() {
  const { caseDetail, setCaseDetail } = useCoordinatorCase()
  const navigate = useNavigate()
  const [uploads, setUploads] = useState<Record<string, UploadInProgress>>({})
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const handleFileSelected = (category: DocumentCategory, file: File) => {
    const uploadId = `${category}-${Date.now()}`
    setUploads(current => ({ ...current, [uploadId]: { filename: file.name, progress: 0 } }))

    uploadDocument(caseDetail.id, category, file, percent => {
      setUploads(current => (current[uploadId] ? { ...current, [uploadId]: { ...current[uploadId], progress: percent } } : current))
    })
      .then(updated => {
        setCaseDetail(updated)
        setUploads(current => {
          const next = { ...current }
          delete next[uploadId]
          return next
        })
      })
      .catch(err => {
        setUploads(current => ({
          ...current,
          [uploadId]: {
            ...current[uploadId],
            error: err instanceof ApiError ? err.message : 'Upload failed. Please try again.'
          }
        }))
      })
  }

  const handleRemove = async (documentId: string) => {
    try {
      const updated = await deleteDocument(caseDetail.id, documentId)
      setCaseDetail(updated)
    } catch {
      // Non-critical: leave the document listed if removal fails.
    }
  }

  const handleContinue = async () => {
    if (confirming) return
    setConfirming(true)
    setError(null)
    try {
      const updated = await confirmMedicalRecords(caseDetail.id)
      setCaseDetail(updated)
      navigate(`/coordinator/cases/${caseDetail.id}/prior-authorization`)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setConfirming(false)
    }
  }

  const hasDocuments = caseDetail.medical_documents.length > 0

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">Medical Records</h1>
      <p className="text-text-muted mb-6">Upload the patient's medical documents for this case.</p>

      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {DOCUMENT_CATEGORIES.map(cat => (
          <div key={cat.value} className="bg-white border border-border rounded-2xl p-5">
            <p className="font-semibold text-text mb-3">{cat.label}</p>
            <input
              ref={el => {
                inputRefs.current[cat.value] = el
              }}
              type="file"
              accept="application/pdf,image/jpeg,image/png"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) handleFileSelected(cat.value, file)
                e.target.value = ''
              }}
            />
            <button
              type="button"
              onClick={() => inputRefs.current[cat.value]?.click()}
              className="w-full min-h-[44px] border-2 border-dashed border-border rounded-xl text-sm font-semibold text-text-muted hover:border-primary hover:text-primary transition"
            >
              Upload {cat.label}
            </button>

            <div className="mt-3 flex flex-col gap-2">
              {caseDetail.medical_documents
                .filter(d => d.category === cat.value)
                .map(d => (
                  <div key={d.id} className="flex items-center justify-between gap-2 bg-background-alt rounded-lg px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-sm text-text truncate">{d.filename}</p>
                      <p className="text-xs text-text-muted">{formatSize(d.size)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(d.id)}
                      className="text-xs font-semibold text-red-600 hover:underline shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                ))}

              {Object.entries(uploads)
                .filter(([id]) => id.startsWith(`${cat.value}-`))
                .map(([id, upload]) => (
                  <div key={id} className="bg-background-alt rounded-lg px-3 py-2">
                    <p className="text-sm text-text truncate mb-1">{upload.filename}</p>
                    {upload.error ? (
                      <p className="text-xs text-red-600">{upload.error}</p>
                    ) : (
                      <div className="h-1.5 bg-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-150"
                          style={{ width: `${upload.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-background-alt border border-border rounded-2xl p-6 mb-6">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Extracted Information</p>
        <p className="text-text-light">Medical extraction will appear here after document processing.</p>
      </div>

      <div className="bg-background-alt border border-border rounded-2xl p-6 mb-8">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Structured Patient Summary</p>
        <p className="text-text-light">A structured patient summary will appear here after document processing.</p>
      </div>

      <button
        type="button"
        onClick={handleContinue}
        disabled={confirming || !hasDocuments}
        className="w-full sm:w-auto min-h-[48px] bg-primary text-white font-semibold py-3 px-8 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
      >
        {confirming ? 'Continuing…' : 'Continue'}
      </button>
      {!hasDocuments && <p className="text-xs text-text-muted mt-2">Upload at least one document to continue.</p>}
    </div>
  )
}
