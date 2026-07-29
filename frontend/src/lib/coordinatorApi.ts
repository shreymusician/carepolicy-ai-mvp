import type { CaseDetail, CaseSummary, DocumentCategory, InsuranceCompany, InsurancePolicy, PolicyKnowledge } from '../types/coordinator'

export class ApiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(path, { credentials: 'include', ...options })
  } catch {
    throw new ApiError('Unable to reach the server. Check your connection and try again.')
  }

  const body = await response.json().catch(() => null)
  if (!response.ok) {
    throw new ApiError(body?.message || 'Something went wrong. Please try again.')
  }
  return body as T
}

function jsonBody(body: unknown): RequestInit {
  return { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
}

export function listCases(): Promise<CaseSummary[]> {
  return request<{ cases: CaseSummary[] }>('/api/v1/coordinator/cases').then(r => r.cases)
}

export function createCase(patientName: string): Promise<CaseDetail> {
  return request<{ case: CaseDetail }>('/api/v1/coordinator/cases', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patient_name: patientName })
  }).then(r => r.case)
}

export function getCase(caseId: string): Promise<CaseDetail> {
  return request<{ case: CaseDetail }>(`/api/v1/coordinator/cases/${caseId}`).then(r => r.case)
}

export function selectInsurance(caseId: string, policyId: string): Promise<CaseDetail> {
  return request<{ case: CaseDetail }>(
    `/api/v1/coordinator/cases/${caseId}/insurance-selection`,
    jsonBody({ policy_id: policyId })
  ).then(r => r.case)
}

export function confirmPolicyReview(caseId: string): Promise<CaseDetail> {
  return request<{ case: CaseDetail }>(`/api/v1/coordinator/cases/${caseId}/policy-review`, { method: 'PUT' }).then(
    r => r.case
  )
}

export function confirmMedicalRecords(caseId: string): Promise<CaseDetail> {
  return request<{ case: CaseDetail }>(`/api/v1/coordinator/cases/${caseId}/medical-records`, {
    method: 'PUT'
  }).then(r => r.case)
}

export function generatePriorAuthorization(caseId: string): Promise<CaseDetail> {
  return request<{ case: CaseDetail }>(`/api/v1/coordinator/cases/${caseId}/generate`, { method: 'POST' }).then(
    r => r.case
  )
}

export function deleteDocument(caseId: string, documentId: string): Promise<CaseDetail> {
  return request<{ case: CaseDetail }>(`/api/v1/coordinator/cases/${caseId}/documents/${documentId}`, {
    method: 'DELETE'
  }).then(r => r.case)
}

/** Uses XHR (not fetch) so real upload progress can be reported. */
export function uploadDocument(
  caseId: string,
  category: DocumentCategory,
  file: File,
  onProgress: (percent: number) => void
): Promise<CaseDetail> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `/api/v1/coordinator/cases/${caseId}/documents`)
    xhr.withCredentials = true

    xhr.upload.onprogress = event => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100))
    }

    xhr.onload = () => {
      let body: any = null
      try {
        body = JSON.parse(xhr.responseText)
      } catch {
        // ignore parse failure; handled by status check below
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(body.case as CaseDetail)
      } else {
        reject(new ApiError(body?.message || 'Upload failed. Please try again.'))
      }
    }
    xhr.onerror = () => reject(new ApiError('Upload failed. Please try again.'))

    const formData = new FormData()
    formData.append('category', category)
    formData.append('file', file)
    xhr.send(formData)
  })
}

export function listCompanies(): Promise<InsuranceCompany[]> {
  return request<{ companies: InsuranceCompany[] }>('/api/v1/insurance/companies').then(r => r.companies)
}

export interface PolicySearchFilters {
  company?: string
  policyType?: string
  targetAudience?: string
}

export function searchPolicies(query: string, filters: PolicySearchFilters = {}): Promise<InsurancePolicy[]> {
  const params = new URLSearchParams()
  if (query.trim()) params.set('q', query.trim())
  if (filters.company) params.set('company', filters.company)
  if (filters.policyType) params.set('policyType', filters.policyType)
  if (filters.targetAudience) params.set('targetAudience', filters.targetAudience)
  const endpoint = query.trim() ? '/api/v1/insurance/search' : '/api/v1/insurance/policies'
  return request<{ policies: InsurancePolicy[] }>(`${endpoint}?${params.toString()}`).then(r => r.policies)
}

export function getPolicy(policyId: string): Promise<InsurancePolicy> {
  return request<{ policy: InsurancePolicy }>(`/api/v1/insurance/policies/${policyId}`).then(r => r.policy)
}

export function getPolicyKnowledge(
  policyId: string
): Promise<{ available: boolean; knowledge: PolicyKnowledge | null; message?: string }> {
  return request(`/api/v1/insurance/policies/${policyId}/knowledge`)
}
