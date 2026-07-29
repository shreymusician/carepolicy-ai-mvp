import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useCopilot } from './CopilotContext'
import { useIsDesktop } from './useIsDesktop'

export function CopilotPanel() {
  const { isOpen, close, messages, sending, send, newChat, context, suggestions } = useCopilot()
  const [draft, setDraft] = useState('')
  const isDesktop = useIsDesktop()
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const endRef = useRef<HTMLDivElement>(null)

  // Driven inline so the slide direction is explicit per breakpoint.
  const closedTransform = isDesktop ? 'translateX(calc(100% + 2rem))' : 'translateY(100%)'

  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isOpen])

  const submit = (text: string) => {
    if (!text.trim() || sending) return
    setDraft('')
    void send(text)
  }

  return (
    <>
      {/* Mobile scrim — desktop keeps the app visible and interactive */}
      <div
        onClick={close}
        aria-hidden="true"
        className={`fixed inset-0 z-[55] bg-black/20 lg:hidden transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      <aside
        role="dialog"
        aria-modal="false"
        aria-label="MyInsurance Copilot"
        style={{
          transform: isOpen ? 'translate3d(0,0,0)' : closedTransform,
          transition: 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        className="fixed z-[58] bg-white border border-border shadow-2xl flex flex-col
          inset-x-0 bottom-0 top-16 rounded-t-2xl
          lg:inset-y-4 lg:left-auto lg:right-4 lg:top-4 lg:bottom-4 lg:w-[26rem] lg:rounded-2xl"
      >
        {/* Header */}
        <header className="px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="font-bold text-text leading-tight">MyInsurance Copilot</h2>
              <p className="text-xs text-text-muted mt-1 leading-snug">
                Ask anything about insurance, medical documents, or prior authorization.
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={newChat}
                title="Start a new chat"
                aria-label="Start a new chat"
                className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-background-alt transition"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
              <button
                onClick={close}
                aria-label="Close Copilot"
                className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-background-alt transition"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3">
            <span className="inline-flex items-center gap-1.5 text-xs text-green-700">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Connected
            </span>
            <span className="text-xs text-text-muted truncate">
              Currently viewing: <span className="font-medium text-text-light">{context.label}</span>
            </span>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {messages.length === 0 ? (
            <div className="py-6">
              <div className="text-3xl mb-3">✨</div>
              <p className="text-text font-semibold mb-1">How can I help?</p>
              <p className="text-sm text-text-muted mb-5 leading-relaxed">
                I answer using official policy documents, so you can trace every answer back to the source.
              </p>
              <div className="flex flex-col gap-2">
                {suggestions.map(s => (
                  <button
                    key={s}
                    onClick={() => submit(s)}
                    className="text-left text-sm border border-border rounded-xl px-4 py-2.5 hover:border-primary hover:text-primary transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {messages.map(m =>
                m.role === 'user' ? (
                  <div key={m.id} className="copilot-msg flex justify-end">
                    <div className="bg-primary text-white rounded-2xl rounded-br-md px-4 py-2.5 max-w-[85%] text-sm">
                      {m.content}
                    </div>
                  </div>
                ) : (
                  <div key={m.id} className="copilot-msg flex justify-start">
                    <div
                      className={`rounded-2xl rounded-bl-md px-4 py-3 max-w-[92%] text-sm border ${
                        m.error
                          ? 'bg-red-50 border-red-200 text-red-800'
                          : 'bg-background-alt border-border text-text-light'
                      }`}
                    >
                      {m.pending ? (
                        <span className="copilot-typing inline-flex gap-1 py-1" aria-label="Assistant is typing">
                          <i /><i /><i />
                        </span>
                      ) : (
                        <>
                          <div className="copilot-markdown">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                          </div>
                          {m.groundedIn && (
                            <p className="text-[11px] text-text-muted mt-2.5 pt-2 border-t border-border">
                              Source: {m.groundedIn}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Composer */}
        <div className="border-t border-border p-3 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <form
            onSubmit={e => {
              e.preventDefault()
              submit(draft)
            }}
            className="flex items-end gap-2"
          >
            <textarea
              ref={inputRef}
              rows={1}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  submit(draft)
                }
              }}
              placeholder="Ask the Copilot..."
              disabled={sending}
              className="flex-1 resize-none border border-border rounded-xl px-3.5 py-2.5 text-sm max-h-32
                focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={sending || !draft.trim()}
              aria-label="Send message"
              className={`shrink-0 w-10 h-10 rounded-xl grid place-items-center text-white transition ${
                sending || !draft.trim() ? 'bg-text-muted opacity-50 cursor-not-allowed' : 'bg-primary hover:bg-blue-700'
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </form>
          <p className="text-[11px] text-text-muted mt-2 px-1">
            Answers come from official documents. Verify important details with your insurer.
          </p>
        </div>
      </aside>
    </>
  )
}
