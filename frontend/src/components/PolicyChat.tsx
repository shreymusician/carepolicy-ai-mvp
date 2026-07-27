import { useState } from 'react'

interface ChatMessage {
  question: string
  answer?: string
  error?: string
}

const SUGGESTIONS = [
  'Is knee surgery covered?',
  'What is my waiting period?',
  'Does this policy cover maternity?',
  'Is cashless hospitalisation available?'
]

export function PolicyChat({ documentId, compact = false }: { documentId: string; compact?: boolean }) {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)

  const ask = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    setLoading(true)
    setQuestion('')
    setMessages(prev => [...prev, { question: trimmed }])

    try {
      const response = await fetch(`/api/v1/chat/${documentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmed })
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error?.message || 'Something went wrong. Please try again.')
      }
      setMessages(prev =>
        prev.map((m, i) => (i === prev.length - 1 ? { ...m, answer: data.answer } : m))
      )
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      setMessages(prev => prev.map((m, i) => (i === prev.length - 1 ? { ...m, error: msg } : m)))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {messages.length === 0 && !compact && (
        <div className="flex flex-wrap gap-2 mb-6">
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => ask(s)}
              disabled={loading}
              className="text-sm border border-border rounded-full px-4 py-2 hover:border-primary hover:text-primary transition disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {messages.length > 0 && (
        <div className="space-y-4 mb-6">
          {messages.map((m, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex justify-end">
                <div className="bg-primary text-white rounded-2xl px-4 py-3 max-w-[85%] sm:max-w-[70%]">
                  {m.question}
                </div>
              </div>
              <div className="flex justify-start">
                {m.answer ? (
                  <div className="bg-background-alt border border-border rounded-2xl px-4 py-3 max-w-[85%] sm:max-w-[70%] text-text-light">
                    {m.answer}
                  </div>
                ) : m.error ? (
                  <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 max-w-[85%] sm:max-w-[70%] text-red-800">
                    {m.error}
                  </div>
                ) : (
                  <div className="bg-background-alt border border-border rounded-2xl px-4 py-3 text-text-muted italic">
                    Thinking...
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <form
        onSubmit={e => {
          e.preventDefault()
          ask(question)
        }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <input
          type="text"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Type your question..."
          disabled={loading}
          className="flex-1 border border-border rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className={`px-7 py-3 rounded-xl font-semibold text-white transition ${
            loading || !question.trim()
              ? 'bg-text-muted cursor-not-allowed opacity-50'
              : 'bg-primary hover:bg-blue-700'
          }`}
        >
          {loading ? 'Asking...' : 'Ask'}
        </button>
      </form>
    </div>
  )
}
