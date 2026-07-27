const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MOBILE_PATTERN = /^[6-9]\d{9}$/

export function validateRequired(value: string, label: string): string | undefined {
  return value.trim() ? undefined : `${label} is required.`
}

export function validateEmail(value: string, label = 'Email address'): string | undefined {
  if (!value.trim()) return `${label} is required.`
  if (!EMAIL_PATTERN.test(value.trim())) return 'Enter a valid email address.'
  return undefined
}

export function validateMobile(value: string): string | undefined {
  if (!value.trim()) return 'Mobile number is required.'
  if (!MOBILE_PATTERN.test(value.replace(/[\s-]/g, ''))) return 'Enter a valid 10-digit mobile number.'
  return undefined
}

export function validatePassword(value: string): string | undefined {
  if (!value) return 'Password is required.'
  if (value.length < 8) return 'Password must be at least 8 characters.'
  return undefined
}

export function validateConfirmPassword(password: string, confirmPassword: string): string | undefined {
  if (!confirmPassword) return 'Please confirm your password.'
  if (password !== confirmPassword) return 'Passwords do not match.'
  return undefined
}

export function validateAccepted(accepted: boolean, message: string): string | undefined {
  return accepted ? undefined : message
}

/** True when every entry is undefined, i.e. the form has no validation errors. */
export function isValid(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).every(error => error === undefined)
}
