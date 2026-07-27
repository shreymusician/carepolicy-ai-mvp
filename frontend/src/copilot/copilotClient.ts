import type { CopilotContextInfo } from './CopilotContext'

export interface CopilotReply {
  content: string
  error?: boolean
  groundedIn?: string
}

/**
 * Resolves a user message to a backend call based on what the user is looking at.
 *
 * Resolvers are tried in order and the first one that can handle the current
 * context wins. New capabilities (a general insurance-knowledge endpoint, medical
 * document Q&A, prior-authorization checks, translation, speech) can be added as
 * additional resolvers without changing the panel or the context provider.
 */
interface Resolver {
  name: string
  canHandle: (ctx: CopilotContextInfo) => boolean
  run: (question: string, ctx: CopilotContextInfo) => Promise<CopilotReply>
}

/** Grounded Q&A against the user's own analysed policy document. */
const analysedDocumentResolver: Resolver = {
  name: 'analysed-document',
  canHandle: ctx => Boolean(ctx.documentId),
  run: async (question, ctx) => {
    const res = await fetch(`/api/v1/chat/${ctx.documentId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    })
    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      return {
        content: data?.error?.message || data?.message || 'The assistant could not answer that right now.',
        error: true
      }
    }

    return {
      content: data.answer || 'No answer was returned.',
      groundedIn: 'Your analysed policy document'
    }
  }
}

/**
 * Nothing is loaded to ground an answer in. The copilot explains what it needs
 * instead of answering from general knowledge, which would risk stating coverage
 * that is not in the user's actual policy.
 */
const needsGroundingResolver: Resolver = {
  name: 'needs-grounding',
  canHandle: () => true,
  run: async (_question, ctx) => {
    const where = ctx.policyName ? `**${ctx.policyName}**` : 'a policy'

    return {
      content: [
        'I answer using official policy documents rather than general knowledge, so I need a document to work from before I can answer that reliably.',
        '',
        ctx.policyId
          ? `You are viewing ${where}. Open **Start Claim Process → Analyse My Policy Document** on this page and upload the policy PDF, and I can answer questions about it directly.`
          : 'Head to **Insurance Explorer**, choose a policy, then upload the policy document — after that I can answer questions about your specific cover.',
        '',
        'You can still browse official policy details and documents on any policy page in the meantime.'
      ].join('\n')
    }
  }
}

const RESOLVERS: Resolver[] = [analysedDocumentResolver, needsGroundingResolver]

export async function sendCopilotMessage(
  question: string,
  context: CopilotContextInfo
): Promise<CopilotReply> {
  const resolver = RESOLVERS.find(r => r.canHandle(context)) ?? needsGroundingResolver
  return resolver.run(question, context)
}
