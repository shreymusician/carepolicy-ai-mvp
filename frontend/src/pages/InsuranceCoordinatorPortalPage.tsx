import { useState } from 'react'
import type { FormEvent } from 'react'
import { AuthPortalLayout } from '../components/AuthPortalLayout'
import { AuthTabs } from '../components/AuthTabs'
import type { AuthTab } from '../components/AuthTabs'
import { CheckboxField, LinkButton, SubmitButton, TextField } from '../components/FormControls'
import {
  isValid,
  validateAccepted,
  validateConfirmPassword,
  validateEmail,
  validateMobile,
  validatePassword,
  validateRequired
} from '../utils/validation'

export function InsuranceCoordinatorPortalPage() {
  const [tab, setTab] = useState<AuthTab>('signin')

  return (
    <AuthPortalLayout
      title="Coordinator Login"
      subtitle="Secure access for hospital insurance coordinators and healthcare professionals."
    >
      <AuthTabs value={tab} onChange={setTab} />
      {tab === 'signin' ? <SignInForm /> : <RequestAccessForm />}
    </AuthPortalLayout>
  )
}

type SignInErrors = { hospitalEmail?: string; password?: string }

function SignInForm() {
  const [hospitalEmail, setHospitalEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [errors, setErrors] = useState<SignInErrors>({})
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const nextErrors: SignInErrors = {
      hospitalEmail: validateEmail(hospitalEmail, 'Hospital email'),
      password: validateRequired(password, 'Password')
    }
    setErrors(nextErrors)
    if (!isValid(nextErrors)) return

    // UI-only: backend authentication is not connected yet.
    setSubmitting(true)
    setTimeout(() => setSubmitting(false), 1200)
  }

  return (
    <div role="tabpanel" id="signin-panel" aria-labelledby="signin-tab">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <TextField
          id="coordinator-email"
          label="Hospital Email"
          type="email"
          autoComplete="email"
          placeholder="name@hospital.org"
          value={hospitalEmail}
          error={errors.hospitalEmail}
          onChange={event => {
            setHospitalEmail(event.target.value)
            setErrors(current => ({ ...current, hospitalEmail: undefined }))
          }}
        />

        <TextField
          id="coordinator-password"
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          error={errors.password}
          onChange={event => {
            setPassword(event.target.value)
            setErrors(current => ({ ...current, password: undefined }))
          }}
        />

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CheckboxField id="coordinator-remember" checked={remember} onChange={setRemember}>
            Remember me
          </CheckboxField>
          <LinkButton onClick={() => undefined}>Forgot password?</LinkButton>
        </div>

        <SubmitButton loading={submitting} loadingLabel="Signing in…">
          Sign In
        </SubmitButton>
      </form>
    </div>
  )
}

type RequestAccessErrors = {
  fullName?: string
  hospitalName?: string
  hospitalEmail?: string
  employeeId?: string
  mobile?: string
  password?: string
  confirmPassword?: string
  terms?: string
}

const EMPTY_REQUEST_ACCESS = {
  fullName: '',
  hospitalName: '',
  hospitalEmail: '',
  employeeId: '',
  mobile: '',
  password: '',
  confirmPassword: ''
}

function RequestAccessForm() {
  const [values, setValues] = useState(EMPTY_REQUEST_ACCESS)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [errors, setErrors] = useState<RequestAccessErrors>({})
  const [submitting, setSubmitting] = useState(false)

  const setField = (field: keyof typeof EMPTY_REQUEST_ACCESS) => (value: string) => {
    setValues(current => ({ ...current, [field]: value }))
    setErrors(current => ({ ...current, [field]: undefined }))
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const nextErrors: RequestAccessErrors = {
      fullName: validateRequired(values.fullName, 'Full name'),
      hospitalName: validateRequired(values.hospitalName, 'Hospital name'),
      hospitalEmail: validateEmail(values.hospitalEmail, 'Hospital email'),
      employeeId: validateRequired(values.employeeId, 'Employee ID'),
      mobile: validateMobile(values.mobile),
      password: validatePassword(values.password),
      confirmPassword: validateConfirmPassword(values.password, values.confirmPassword),
      terms: validateAccepted(acceptedTerms, 'Please accept the Terms & Conditions to continue.')
    }
    setErrors(nextErrors)
    if (!isValid(nextErrors)) return

    // UI-only: backend access requests are not connected yet.
    setSubmitting(true)
    setTimeout(() => setSubmitting(false), 1200)
  }

  return (
    <div role="tabpanel" id="signup-panel" aria-labelledby="signup-tab">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <TextField
          id="coordinator-fullname"
          label="Full Name"
          autoComplete="name"
          placeholder="Enter your full name"
          value={values.fullName}
          error={errors.fullName}
          onChange={event => setField('fullName')(event.target.value)}
        />

        <TextField
          id="coordinator-hospital-name"
          label="Hospital Name"
          autoComplete="organization"
          placeholder="Enter your hospital name"
          value={values.hospitalName}
          error={errors.hospitalName}
          onChange={event => setField('hospitalName')(event.target.value)}
        />

        <TextField
          id="coordinator-new-email"
          label="Hospital Email"
          type="email"
          autoComplete="email"
          placeholder="name@hospital.org"
          value={values.hospitalEmail}
          error={errors.hospitalEmail}
          onChange={event => setField('hospitalEmail')(event.target.value)}
        />

        <TextField
          id="coordinator-employee-id"
          label="Employee ID"
          placeholder="Enter your employee ID"
          value={values.employeeId}
          error={errors.employeeId}
          onChange={event => setField('employeeId')(event.target.value)}
        />

        <TextField
          id="coordinator-mobile"
          label="Mobile Number"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="10-digit mobile number"
          value={values.mobile}
          error={errors.mobile}
          onChange={event => setField('mobile')(event.target.value)}
        />

        <TextField
          id="coordinator-new-password"
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={values.password}
          error={errors.password}
          onChange={event => setField('password')(event.target.value)}
        />

        <TextField
          id="coordinator-confirm-password"
          label="Confirm Password"
          type="password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          value={values.confirmPassword}
          error={errors.confirmPassword}
          onChange={event => setField('confirmPassword')(event.target.value)}
        />

        <CheckboxField
          id="coordinator-terms"
          checked={acceptedTerms}
          error={errors.terms}
          onChange={checked => {
            setAcceptedTerms(checked)
            setErrors(current => ({ ...current, terms: undefined }))
          }}
        >
          I agree to the Terms &amp; Conditions and the Privacy Policy.
        </CheckboxField>

        <SubmitButton loading={submitting} loadingLabel="Submitting request…">
          Request Access
        </SubmitButton>
      </form>

      <p className="mt-5 text-sm text-text-muted leading-relaxed bg-background-alt border border-border rounded-xl px-4 py-3">
        Coordinator accounts may require administrator verification before activation.
      </p>
    </div>
  )
}
