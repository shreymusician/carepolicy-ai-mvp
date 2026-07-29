import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  fetchCurrentUser,
  loginCoordinator,
  loginPolicyHolder,
  demoLoginPolicyHolder,
  logoutRequest,
  signupCoordinator,
  signupPolicyHolder
} from '../lib/authApi'
import type {
  AuthUser,
  CoordinatorSignupPayload,
  LoginPayload,
  PolicyHolderSignupPayload
} from '../types/auth'

interface AuthContextValue {
  user: AuthUser | null
  /** True only until the initial session check (GET /auth/me) resolves. */
  initializing: boolean
  signupPolicyHolder: (payload: PolicyHolderSignupPayload) => Promise<AuthUser>
  loginPolicyHolder: (payload: LoginPayload) => Promise<AuthUser>
  signupCoordinator: (payload: CoordinatorSignupPayload) => Promise<AuthUser>
  loginCoordinator: (payload: LoginPayload) => Promise<AuthUser>
  demoLoginPolicyHolder: () => Promise<AuthUser>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchCurrentUser()
      .then(current => {
        if (!cancelled) setUser(current)
      })
      .catch(() => {
        if (!cancelled) setUser(null)
      })
      .finally(() => {
        if (!cancelled) setInitializing(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const value: AuthContextValue = {
    user,
    initializing,
    signupPolicyHolder: async payload => {
      const nextUser = await signupPolicyHolder(payload)
      setUser(nextUser)
      return nextUser
    },
    loginPolicyHolder: async payload => {
      const nextUser = await loginPolicyHolder(payload)
      setUser(nextUser)
      return nextUser
    },
      demoLoginPolicyHolder: async () => {
        const nextUser = await demoLoginPolicyHolder()
        setUser(nextUser)
        return nextUser
      },
    signupCoordinator: async payload => {
      const nextUser = await signupCoordinator(payload)
      setUser(nextUser)
      return nextUser
    },
    loginCoordinator: async payload => {
      const nextUser = await loginCoordinator(payload)
      setUser(nextUser)
      return nextUser
    },
    logout: async () => {
      try {
        await logoutRequest()
      } finally {
        setUser(null)
      }
    }
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
