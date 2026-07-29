const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_PATTERN = /^[6-9]\d{9}$/;

export function validateRequired(value: string | undefined, field: string, errors: Record<string, string>): void {
  if (!value || !value.trim()) {
    errors[field] = `${field} is required.`;
  }
}

export function validateEmailField(value: string | undefined, field: string, errors: Record<string, string>): void {
  if (!value || !value.trim()) {
    errors[field] = `${field} is required.`;
    return;
  }
  if (!EMAIL_PATTERN.test(value.trim())) {
    errors[field] = 'Enter a valid email address.';
  }
}

export function validateMobileField(value: string | undefined, errors: Record<string, string>): void {
  if (!value || !value.trim()) {
    errors.mobile = 'Mobile number is required.';
    return;
  }
  if (!MOBILE_PATTERN.test(value.replace(/[\s-]/g, ''))) {
    errors.mobile = 'Enter a valid 10-digit mobile number.';
  }
}

export function validatePasswordField(value: string | undefined, errors: Record<string, string>): void {
  if (!value) {
    errors.password = 'Password is required.';
    return;
  }
  if (value.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }
}

export function validateConfirmPasswordField(
  password: string | undefined,
  confirmPassword: string | undefined,
  errors: Record<string, string>
): void {
  if (!confirmPassword) {
    errors.confirm_password = 'Please confirm your password.';
    return;
  }
  if (password !== confirmPassword) {
    errors.confirm_password = 'Passwords do not match.';
  }
}
