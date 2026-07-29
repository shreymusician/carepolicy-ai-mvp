import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { useAppState } from '../state/AppState'
import { sendCopilotMessage, type CopilotReply } from './copilotClient'

export type MessageRole = 'user' | 'assistant'

export interface CopilotMessage {
  id: string
  role: MessageRole
  content: string
  pending?: boolean
  error?: boolean
  /** Where the answer came from — lets the UI stay traceable. */
  groundedIn?: string
}

/**
 * What the user is currently looking at. Passed to the copilot so the user never
 * has to restate their situation, and shown in the panel header.
 */
export interface CopilotContextInfo {
  surface: string
  label: string
  documentId?: string
  policyId?: string
  policyName?: string
}

interface CopilotValue {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
  messages: CopilotMessage[]
  sending: boolean
  send: (text: string) => Promise<void>
  newChat: () => void
  context: CopilotContextInfo
  suggestions: string[]
}

const CopilotCtx = createContext<CopilotValue | null>(null)

const GENERAL_SUGGESTIONS = [
  'How does prior authorization work?',
  'What is a waiting period?',
  'Recommend a policy.',
  'Explain this in simple language.'
]

const SURFACE_SUGGESTIONS: Record<string, string[]> = {
  explorer: ['Recommend a policy.', 'Compare two policies.', 'What is a waiting period?'],
  policy: ['Explain this policy.', 'What does this clause mean?', 'Will this treatment be covered?'],
  documents: ['Summarize this report.', 'What documents are missing?'],
  'prior-auth': ['What documents are missing?', 'How does prior authorization work?'],
  analyse: ['Explain this policy.', 'Will this treatment be covered?']
}

function deriveContext(
  pathname: string,
  policyName: string | undefined,
  documentId: string | undefined,
  policyId: string | undefined
): CopilotContextInfo {
  const seg = pathname.split('/').filter(Boolean)[0] || 'home'

  const labels: Record<string, string> = {
    home: 'Home',
    explorer: 'Insurance Explorer',
    policy: policyName ? `${policyName} Policy` : 'Policy Details',
    analyse: 'Policy Analysis',
    documents: 'Medical Document Analysis',
    'prior-auth': 'Prior Authorization',
    hospitals: 'Network Hospitals',
    about: 'About'
  }

  return {
    surface: seg,
    label: labels[seg] || 'MyInsurance',
    documentId,
    policyId,
    policyName
  }
}

export function CopilotProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  const { analysis, selectedPolicy } = useAppState()

  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<CopilotMessage[]>([])
  const [sending, setSending] = useState(false)

  const context = useMemo(
    () =>
      deriveContext(
        location.pathname,
        selectedPolicy?.name,
        analysis?.document_id,
        selectedPolicy?.id
      ),
    [location.pathname, selectedPolicy, analysis]
  )

  const suggestions = useMemo(
    () => SURFACE_SUGGESTIONS[context.surface] || GENERAL_SUGGESTIONS,
    [context.surface]
  )

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen(v => !v), [])
  const newChat = useCallback(() => setMessages([]), [])

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || sending) return

      const userMsg: CopilotMessage = { id: `u-${Date.now()}`, role: 'user', content: trimmed }
      const pendingId = `a-${Date.now()}`

      setMessages(prev => [
        ...prev,
        userMsg,
        { id: pendingId, role: 'assistant', content: '', pending: true }
      ])
      setSending(true)

      let reply: CopilotReply
      try {
        reply = await sendCopilotMessage(trimmed, context)
      } catch (error) {
        reply = {
          content: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
          error: true
        }
      }

      setMessages(prev =>
        prev.map(m =>
          m.id === pendingId
            ? { ...m, content: reply.content, pending: false, error: reply.error, groundedIn: reply.groundedIn }
            : m
        )
      )
      setSending(false)
    },
    [context, sending]
  )

  // Ctrl+Shift+A toggles, Escape closes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault()
        toggle()
      } else if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggle])

  const value: CopilotValue = {
    isOpen,
    open,
    close,
    toggle,
    messages,
    sending,
    send,
    newChat,
    context,
    suggestions
  }

  return <CopilotCtx.Provider value={value}>{children}</CopilotCtx.Provider>
}

export function useCopilot(): CopilotValue {
  const ctx = useContext(CopilotCtx)
  if (!ctx) throw new Error('useCopilot must be used within CopilotProvider')
  return ctx
}
