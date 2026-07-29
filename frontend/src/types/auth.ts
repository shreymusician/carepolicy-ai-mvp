export type UserRole = 'policy_holder' | 'insurance_coordinator'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export interface AuthUser {
  id: string
  role: UserRole
  name: string
  email: string
  hospital_name?: string
  employee_id?: string
  approval_status?: ApprovalStatus
}

export interface PolicyHolderSignupPayload {
  full_name: string
  email: string
  mobile: string
  password: string
  confirm_password: string
}

export interface CoordinatorSignupPayload {
  full_name: string
  hospital_name: string
  email: string
  employee_id: string
  mobile: string
  password: string
  confirm_password: string
}

export interface LoginPayload {
  email: string
  password: string
}
