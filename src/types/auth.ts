export type UserRole = 'policy_holder' | 'insurance_coordinator';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface JwtPayload {
  sub: string;
  role: UserRole;
  email: string;
  name: string;
}

export interface PolicyHolderSignupRequest {
  full_name: string;
  email: string;
  mobile: string;
  password: string;
  confirm_password: string;
}

export interface CoordinatorSignupRequest {
  full_name: string;
  hospital_name: string;
  email: string;
  employee_id: string;
  mobile: string;
  password: string;
  confirm_password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUserResponse {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  hospital_name?: string;
  employee_id?: string;
  approval_status?: ApprovalStatus;
}

export class ValidationError extends Error {
  fields: Record<string, string>;

  constructor(fields: Record<string, string>) {
    super('Validation failed');
    this.name = 'ValidationError';
    this.fields = fields;
  }
}

export class DuplicateEmailError extends Error {
  constructor() {
    super('An account with this email already exists.');
    this.name = 'DuplicateEmailError';
  }
}

export class AccountNotFoundError extends Error {
  constructor() {
    super('No account was found with this email address.');
    this.name = 'AccountNotFoundError';
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Incorrect password. Please try again.');
    this.name = 'InvalidCredentialsError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message = 'You must be signed in to access this resource.') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}
