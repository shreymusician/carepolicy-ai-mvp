# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│   Next.js 14 App Router · React 18 · Tailwind CSS · shadcn/ui  │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS / WSS
┌───────────────────────────▼─────────────────────────────────────┐
│                       API GATEWAY                               │
│           Node.js / Express · JWT Auth · Rate Limiting          │
└──────┬──────────────────────────────────────────┬───────────────┘
       │ REST                                      │ Events
┌──────▼──────────┐                    ┌───────────▼───────────────┐
│   Core API      │                    │     AI Pipeline Service   │
│  (Express)      │                    │  (Python / FastAPI)       │
│  - Auth         │                    │  - LLM Orchestration      │
│  - Patients     │◄───────────────────│  - Summarization          │
│  - Appointments │   Internal HTTP    │  - Risk Scoring           │
│  - Messages     │                    │  - Code Suggestion        │
└──────┬──────────┘                    └───────────┬───────────────┘
       │                                           │
┌──────▼───────────────────────────────────────────▼───────────────┐
│                         DATA LAYER                               │
│  PostgreSQL (primary)  ·  Redis (cache/sessions)                │
│  Vector DB — pgvector (embeddings for AI search)                │
└──────────────────────────────────────────────────────────────────┘
```

## Monorepo Structure

```
healthcare/
├── apps/
│   ├── web/                  # Next.js 14 frontend
│   └── api/                  # Node.js / Express backend
├── packages/
│   ├── ai-pipeline/          # Python FastAPI AI service
│   ├── database/             # Prisma schema + migrations
│   └── shared/               # Shared types, utils, constants
├── infrastructure/
│   ├── docker/               # Docker Compose files
│   ├── k8s/                  # Kubernetes manifests
│   └── terraform/            # Cloud IaC
├── docs/                     # All documentation
└── scripts/                  # Dev, seed, deploy scripts
```

## Technology Decisions

| Layer | Choice | Rationale |
|---|---|---|
| Frontend | Next.js 14 (App Router) | SSR, file-based routing, RSC support |
| UI | shadcn/ui + Tailwind | Accessible, unstyled primitives, fast customization |
| Backend | Node.js + Express + TypeScript | Team familiarity, rich ecosystem |
| AI Service | Python + FastAPI | Best LLM library support (LangChain, HuggingFace) |
| Database | PostgreSQL + Prisma | Relational data, strong typing, migrations |
| Cache | Redis | Sessions, rate-limit counters, pub/sub |
| Auth | JWT + bcrypt | Stateless, scalable |
| AI Provider | Google Gemini API | Provider abstraction (`AIProvider`) isolates vendor-specific logic |
| Deployment | Docker Compose (dev) | Reproducible local environment |

## Security Architecture

- All API routes behind JWT middleware
- Role-based access control: `patient`, `clinician`, `admin`
- PHI fields encrypted at column level (AES-256)
- All inter-service communication over private network
- API rate limiting: 100 req/min per user
- CORS restricted to known origins
- Audit log for every data access event

## AI Pipeline Architecture

```
Input (clinical text / vitals / labs)
    │
    ▼
Preprocessing & Anonymization
    │
    ▼
Embedding Generation (text-embedding-3-small or equivalent)
    │
    ├──► Vector Search (pgvector) → Context Retrieval (RAG)
    │
    ▼
LLM Prompt Construction (system + context + user query)
    │
    ▼
Gemini API Call (via AIProvider / GeminiProvider abstraction)
    │
    ▼
Response Parsing & Validation
    │
    ▼
Structured Output → API Response
```
