import type {
  AuthUser,
  CoordinatorSignupPayload,
  LoginPayload,
  PolicyHolderSignupPayload
} from '../types/auth'

export class AuthApiError extends Error {
  fields?: Record<string, string>

  constructor(message: string, fields?: Record<string, string>) {
    super(message)
    this.name = 'AuthApiError'
    this.fields = fields
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(path, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      ...options
    })
  } catch {
    throw new AuthApiError('Unable to reach the server. Check your connection and try again.')
  }

  const body = await response.json().catch(() => null)

  if (!response.ok) {
    const message = body?.message || 'Something went wrong. Please try again.'
    throw new AuthApiError(message, body?.errors)
  }

  return body as T
}

interface AuthResponse {
  success: true
  user: AuthUser
}

export function signupPolicyHolder(payload: PolicyHolderSignupPayload): Promise<AuthUser> {
  return request<AuthResponse>('/api/v1/auth/policy-holder/signup', {
    method: 'POST',
    body: JSON.stringify(payload)
  }).then(res => res.user)
}

export function loginPolicyHolder(payload: LoginPayload): Promise<AuthUser> {
  return request<AuthResponse>('/api/v1/auth/policy-holder/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  }).then(res => res.user)
}

export function signupCoordinator(payload: CoordinatorSignupPayload): Promise<AuthUser> {
  return request<AuthResponse>('/api/v1/auth/coordinator/signup', {
    method: 'POST',
    body: JSON.stringify(payload)
  }).then(res => res.user)
}

export function loginCoordinator(payload: LoginPayload): Promise<AuthUser> {
  return request<AuthResponse>('/api/v1/auth/coordinator/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  }).then(res => res.user)
}

export function demoLoginPolicyHolder(): Promise<AuthUser> {
  return request<AuthResponse>('/api/v1/auth/demo/login', { method: 'POST' }).then(res => res.user)
}

export function fetchCurrentUser(): Promise<AuthUser> {
  return request<AuthResponse>('/api/v1/auth/me').then(res => res.user)
}

export function logoutRequest(): Promise<void> {
  return request<{ success: true }>('/api/v1/auth/logout', { method: 'POST' }).then(() => undefined)
}
