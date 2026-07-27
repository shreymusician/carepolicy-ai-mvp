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

export function PolicyHolderPortalPage() {
  const [tab, setTab] = useState<AuthTab>('signin')

  return (
    <AuthPortalLayout
      title="Welcome Back"
      subtitle="Sign in to access your insurance information, policy documents and healthcare support."
    >
      <AuthTabs value={tab} onChange={setTab} />
      {tab === 'signin' ? (
        <SignInForm onSwitchToSignUp={() => setTab('signup')} />
      ) : (
        <CreateAccountForm onSwitchToSignIn={() => setTab('signin')} />
      )}
    </AuthPortalLayout>
  )
}

type SignInErrors = { email?: string; password?: string }

function SignInForm({ onSwitchToSignUp }: { onSwitchToSignUp: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [errors, setErrors] = useState<SignInErrors>({})
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const nextErrors: SignInErrors = {
      email: validateEmail(email),
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
          id="policyholder-email"
          label="Email Address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          error={errors.email}
          onChange={event => {
            setEmail(event.target.value)
            setErrors(current => ({ ...current, email: undefined }))
          }}
        />

        <TextField
          id="policyholder-password"
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
          <CheckboxField id="policyholder-remember" checked={remember} onChange={setRemember}>
            Remember me
          </CheckboxField>
          <LinkButton onClick={() => undefined}>Forgot password?</LinkButton>
        </div>

        <SubmitButton loading={submitting} loadingLabel="Signing in…">
          Sign In
        </SubmitButton>
      </form>

      <div className="flex items-center gap-3 my-6" aria-hidden="true">
        <span className="flex-1 h-px bg-border" />
        <span className="text-xs font-semibold text-text-muted">OR</span>
        <span className="flex-1 h-px bg-border" />
      </div>

      <button
        type="button"
        className="w-full min-h-[48px] inline-flex items-center justify-center gap-2.5 border border-border rounded-xl bg-white text-base font-semibold text-text-light transition-colors duration-150 hover:bg-background-alt focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <svg aria-hidden="true" viewBox="0 0 18 18" className="w-5 h-5">
          <path
            fill="#4285F4"
            d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"
          />
          <path
            fill="#34A853"
            d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"
          />
          <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z" />
          <path
            fill="#EA4335"
            d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"
          />
        </svg>
        Continue with Google
      </button>

      <p className="mt-6 text-center text-sm text-text-muted">
        Don't have an account? <LinkButton onClick={onSwitchToSignUp}>Create Account</LinkButton>
      </p>
    </div>
  )
}

type CreateAccountErrors = {
  fullName?: string
  email?: string
  mobile?: string
  password?: string
  confirmPassword?: string
  terms?: string
}

const EMPTY_CREATE_ACCOUNT = {
  fullName: '',
  email: '',
  mobile: '',
  password: '',
  confirmPassword: ''
}

function CreateAccountForm({ onSwitchToSignIn }: { onSwitchToSignIn: () => void }) {
  const [values, setValues] = useState(EMPTY_CREATE_ACCOUNT)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [errors, setErrors] = useState<CreateAccountErrors>({})
  const [submitting, setSubmitting] = useState(false)

  const setField = (field: keyof typeof EMPTY_CREATE_ACCOUNT) => (value: string) => {
    setValues(current => ({ ...current, [field]: value }))
    setErrors(current => ({ ...current, [field]: undefined }))
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const nextErrors: CreateAccountErrors = {
      fullName: validateRequired(values.fullName, 'Full name'),
      email: validateEmail(values.email),
      mobile: validateMobile(values.mobile),
      password: validatePassword(values.password),
      confirmPassword: validateConfirmPassword(values.password, values.confirmPassword),
      terms: validateAccepted(acceptedTerms, 'Please accept the Terms & Conditions to continue.')
    }
    setErrors(nextErrors)
    if (!isValid(nextErrors)) return

    // UI-only: backend account creation is not connected yet.
    setSubmitting(true)
    setTimeout(() => setSubmitting(false), 1200)
  }

  return (
    <div role="tabpanel" id="signup-panel" aria-labelledby="signup-tab">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <TextField
          id="policyholder-fullname"
          label="Full Name"
          autoComplete="name"
          placeholder="Enter your full name"
          value={values.fullName}
          error={errors.fullName}
          onChange={event => setField('fullName')(event.target.value)}
        />

        <TextField
          id="policyholder-new-email"
          label="Email Address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={values.email}
          error={errors.email}
          onChange={event => setField('email')(event.target.value)}
        />

        <TextField
          id="policyholder-mobile"
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
          id="policyholder-new-password"
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={values.password}
          error={errors.password}
          onChange={event => setField('password')(event.target.value)}
        />

        <TextField
          id="policyholder-confirm-password"
          label="Confirm Password"
          type="password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          value={values.confirmPassword}
          error={errors.confirmPassword}
          onChange={event => setField('confirmPassword')(event.target.value)}
        />

        <CheckboxField
          id="policyholder-terms"
          checked={acceptedTerms}
          error={errors.terms}
          onChange={checked => {
            setAcceptedTerms(checked)
            setErrors(current => ({ ...current, terms: undefined }))
          }}
        >
          I agree to the Terms &amp; Conditions and the Privacy Policy.
        </CheckboxField>

        <SubmitButton loading={submitting} loadingLabel="Creating account…">
          Create Account
        </SubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-text-muted">
        Already have an account? <LinkButton onClick={onSwitchToSignIn}>Sign In</LinkButton>
      </p>
    </div>
  )
}
