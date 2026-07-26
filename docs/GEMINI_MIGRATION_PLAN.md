# Gemini Migration Plan

**Status:** ✅ MIGRATION COMPLETE — implemented and verified 2026-07-27.
**Decision:** Replace Anthropic Claude API with Google Gemini API as the LLM provider.

This document originally served as a discovery report (sections below are preserved as the pre-migration analysis). The migration has since been implemented following this plan's recommendations, with one architectural addition beyond what was originally scoped: an `AIProvider` interface abstraction (see "Completion Summary" below) rather than a direct string-replacement of the Anthropic-specific code in `LlmService`.

---

## Completion Summary

**What was built:**
- `src/providers/AIProvider.ts` — the vendor-agnostic interface (`analyze(prompt: string): Promise<string>`)
- `src/providers/GeminiProvider.ts` — Gemini implementation using the official `@google/generative-ai` SDK; owns all Gemini-specific request/response/error handling
- `LlmService` refactored to hold an `AIProvider` and never touch vendor-specific request/response shapes directly; retry/backoff/timeout logic preserved and now generic
- `ConfigService` now reads `AI_PROVIDER`, `GEMINI_MODEL`, `GEMINI_API_KEY`; `CLAUDE_API_KEY` removed entirely; `validate()` now checks `GEMINI_API_KEY`, `MONGODB_URI`, `PORT`, `NODE_ENV`
- Cosmetic renames in `AnalysisController` (`claudeResponse` → `llmResponse`) and `types/api.ts` (`claude_api` → `gemini_api`)
- `axios` dependency removed (dead after the direct-HTTP Claude code was replaced by the Gemini SDK); `@google/generative-ai` added

**Deviation from original plan, and why:** Section 6's open question #2 ("REST API vs official SDK") is resolved as **official SDK** (`@google/generative-ai`) rather than raw REST via axios — it handles auth and response parsing more robustly and is Google's supported integration path.

**Bug found and fixed during verification:** `ConfigService` is a singleton constructed at module-`require()` time. Because `dotenv.config()` was called as a plain statement positioned after the config-dependent imports in `app.ts`, the compiled CommonJS `require()` order meant `ConfigService` (and its `validate()`) ran *before* `.env` was loaded — so validation always saw empty env vars, independent of `.env`'s actual contents. Fixed with `src/env.ts`, a bootstrap module now imported first in `app.ts`. This bug pre-dates this migration (it existed with `CLAUDE_API_KEY` too) but blocked verifying that the server starts, so it was fixed as part of this work.

**Live verification result:** the configured `GEMINI_API_KEY` does not have access to `gemini-2.5-flash` (404 — no longer available to new users) or `gemini-2.0-flash` / `gemini-pro-latest` (429 — quota exceeded) at time of testing. `gemini-flash-latest` was verified working end-to-end (real API call, valid JSON, passed `ResponseParserService` validation) and is now the configured default in `.env` / `.env.example` / `ConfigService`. This is a characteristic of the specific API key/account, not a defect in the integration — swap `GEMINI_MODEL` if a different key has access to a different model.

**Original discovery report follows, preserved for historical reference:**

---

## 1. Files That Depend on Claude

Search performed across `src/` for: `CLAUDE_API_KEY`, `Anthropic`, `Claude`, `LlmService`.

| File | Nature of Dependency |
|---|---|
| `src/services/LlmService.ts` | **Core dependency.** Entire class is written against the Anthropic Messages API (`https://api.anthropic.com/v1/messages`, `x-api-key` header, `anthropic-version` header, Claude request/response shape). |
| `src/config/service.ts` | Reads `CLAUDE_API_KEY` env var, hard-codes `llm.provider = 'anthropic'` and `llm.model = 'claude-opus-4-1-20250805'`. Boot-time validation (`validate()`) throws if `CLAUDE_API_KEY` is missing. |
| `src/controllers/AnalysisController.ts` | No structural dependency, but contains Claude-specific naming: log messages (`"Building Claude prompt"`, `"Calling Claude API"`) and a variable named `claudeResponse`. |
| `src/types/api.ts` | `HealthResponse.dependencies` has a field literally named `claude_api: 'healthy' | 'unhealthy'`. |
| `.env.example` | Already updated in this session to reference `GEMINI_API_KEY` instead of `CLAUDE_API_KEY` (see Task 1). |
| `README.md` | Documentation mentions Claude API key prerequisite, Claude prompt/analysis steps, and service descriptions. Not code, but will be stale once migrated. |
| `docs/API.md` | Documents `LlmError` as "Claude API call failed". Not code, but stale after migration. |

**Not Claude-dependent (safe as-is):**
- `src/services/PromptBuilderService.ts` — builds a plain-text prompt with generic "AI assistant" instructions and a JSON schema. Provider-agnostic; no Anthropic-specific formatting. Can be reused as-is or adapted with minimal changes for Gemini's prompt conventions.
- `src/types/analysis.ts` — `LlmError` is a generic error class name, not Anthropic-specific. Can stay as the shared error type for whichever LLM provider is active, or be renamed later purely for clarity (not required).
- `src/services/ResponseParserService.ts` — parses JSON out of a raw response string; provider-agnostic, works with any LLM that returns JSON in text.

---

## 2. Classes That Need Modification

### `LlmService` (`src/services/LlmService.ts`) — full rewrite required
Current implementation is Anthropic-specific end to end:
- `apiUrl = 'https://api.anthropic.com/v1/messages'`
- `model = 'claude-opus-4-1-20250805'`
- Request body shape: `{ model, max_tokens, messages: [{ role, content }] }`
- Headers: `x-api-key`, `anthropic-version`
- Response shape assumption: `response.data.content[0].text`
- Error message text mentions "Claude API" explicitly (`validateApiResponse`, `extractErrorMessage`)

For Gemini, this needs to become:
- New endpoint: Gemini's `generateContent` REST endpoint (e.g. `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`) or the official `@google/generative-ai` SDK
- New auth scheme: API key passed as query param or header depending on chosen integration method (REST vs SDK), not `x-api-key`/`anthropic-version`
- New request body shape: Gemini's `contents` array format instead of Anthropic's `messages` array
- New response parsing: Gemini returns `response.candidates[0].content.parts[0].text` instead of `response.data.content[0].text`
- Error handling: Gemini's error codes/messages differ from Anthropic's (different rate-limit/auth error shapes)

### `ConfigService` (`src/config/service.ts`) — targeted edits
- Change `llm.provider` from `'anthropic'` to `'google'` (or `'gemini'`)
- Change `llm.model` to a Gemini model identifier (e.g. `gemini-2.0-flash` or whichever model is chosen)
- Change `apiKey: process.env.CLAUDE_API_KEY` to `apiKey: process.env.GEMINI_API_KEY`
- Update `validate()` error message from `'CLAUDE_API_KEY environment variable is not set'` to reference `GEMINI_API_KEY`

### `AnalysisController` (`src/controllers/AnalysisController.ts`) — cosmetic only
- Rename `claudeResponse` variable (e.g. to `llmResponse`)
- Update log strings that say "Claude" to be provider-neutral or say "Gemini"
- No structural/logic changes needed — it calls `LlmService.analyze(prompt)` through the same interface

### `types/api.ts` — cosmetic only
- Rename `HealthResponse.dependencies.claude_api` field (e.g. to `llm_api` or `gemini_api`)

---

## 3. API Calls That Must Change

| Aspect | Current (Anthropic) | Target (Gemini) |
|---|---|---|
| Endpoint | `POST https://api.anthropic.com/v1/messages` | `POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent` (or SDK equivalent) |
| Auth | `x-api-key` header + `anthropic-version` header | API key as query param (`?key=...`) or SDK-managed auth |
| Request body | `{ model, max_tokens, messages: [{ role: 'user', content: prompt }] }` | `{ contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens } }` |
| Response body | `response.data.content[0].text` | `response.data.candidates[0].content.parts[0].text` |
| Retry/backoff logic | Generic (3 attempts, exponential backoff) — provider-agnostic | Can be reused as-is; only the request/response mapping changes |
| Timeout handling | Generic axios timeout — provider-agnostic | Can be reused as-is |

The retry loop, exponential backoff, and timeout mechanics in `LlmService.analyze()` are not Anthropic-specific and can be preserved structurally. Only the request construction and response extraction need to change.

---

## 4. Prompt Changes

**Assessment: minimal to none required.**

`PromptBuilderService.buildAnalysisPrompt()` produces a single plain-text prompt string containing:
1. A generic system-style instruction block ("You are an AI assistant analyzing insurance policies...")
2. The policy text and optional prescription text
3. A JSON schema the model must follow

This prompt is provider-agnostic — it does not use any Anthropic-specific prompt syntax (no `\n\nHuman:` / `\n\nAssistant:` legacy markers, no Claude-specific system/user role separation beyond what's naturally embedded in the text). It is currently sent as a single `user` message to Claude.

For Gemini, the same prompt text can be sent as the `text` part of a `contents` entry. No rewriting of the prompt's instructions or JSON schema is expected to be necessary. The only consideration:
- Gemini and Claude may differ slightly in how reliably they return pure JSON without markdown fences — `ResponseParserService` already handles extracting JSON via regex (`/\{[\s\S]*\}/`), which should continue to work for Gemini output as-is, but should be re-verified once real Gemini responses are available.

---

## 5. Estimated Implementation Effort

| Task | Effort | Notes |
|---|---|---|
| Rewrite `LlmService` for Gemini API | 2-3 hours | New request/response shape, new auth, new error mapping. Retry/backoff structure reusable. |
| Update `ConfigService` | 15 minutes | Field renames and env var swap only |
| Update `AnalysisController` cosmetic references | 15 minutes | Variable/log renames, no logic change |
| Update `types/api.ts` field name | 5 minutes | Single field rename |
| Verify `ResponseParserService` against real Gemini output | 30-60 minutes | Confirm JSON extraction regex still works; adjust if Gemini wraps JSON differently (e.g. in markdown fences) |
| Update `.env` docs / README / API.md prose | 30 minutes | Documentation only, not required for functionality |
| End-to-end testing (upload → analyze → results) | 1 hour | Confirm full pipeline works with real Gemini responses |
| **Total** | **~5-6 hours** | Single-provider swap; no architectural changes needed elsewhere in the pipeline |

**Why this is a low-risk migration:** The service-oriented architecture already isolates the LLM call behind a single `LlmService.analyze(prompt: string): Promise<string>` interface. `AnalysisController`, `PromptBuilderService`, and `ResponseParserService` do not need to know which provider is behind that interface. The migration is contained almost entirely to `LlmService.ts` and a handful of config/naming references.

---

## 6. Open Questions for Approval

Before implementation begins, confirm:
1. **Which Gemini model** should be used (e.g. `gemini-2.0-flash`, `gemini-1.5-pro`)? Affects cost/latency/quality tradeoffs.
2. **REST API vs official SDK** (`@google/generative-ai` npm package)? SDK simplifies auth/response handling but adds a dependency.
3. Should `LlmError` be renamed, or kept as a provider-neutral name (recommended: keep as-is since it's already generic)?
4. Should the `CLAUDE_API_KEY` fallback be removed immediately, or kept temporarily for rollback safety during transition?

---

**Next step:** Await approval before modifying any file in `src/`.
