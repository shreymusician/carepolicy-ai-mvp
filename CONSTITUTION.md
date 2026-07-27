# CarePolicy AI - Constitution

**Version:** 1.0  
**Effective Date:** 2026-07-28  
**Status:** Permanent (changes only if product vision fundamentally changes)

This document defines the permanent identity, principles, and boundaries of CarePolicy AI. Every architectural decision, feature proposal, and product pivot should be evaluated against this Constitution.

---

## ARTICLE I: MISSION

**CarePolicy AI is an AI-Assisted Health Insurance Intelligence Ecosystem.**

**Purpose:** To assist healthcare insurance workers throughout the insurance approval workflow using explainable, confidence-scored intelligence built on official insurance policies and authenticated medical records.

**Core Value:** Give insurance workers the intelligence to confidently approve claims quickly, without manual policy reading or guesswork.

---

## ARTICLE II: PRIMARY USERS

**Primary User:** Healthcare Insurance Worker

Examples:
- Hospital Insurance Desk Staff
- Insurance Coordinators
- Billing Executives
- Prior Authorization Specialists
- TPA (Third Party Administrator) Desk
- Claims Processors
- Denial Management Team

**Characteristics:**
- Makes insurance approval decisions
- Initiates workflows
- Owns outcomes
- Needs explainable intelligence
- Needs confidence scoring
- Needs audit trails

**What Primary User Needs:**
1. Instant access to insurance policy knowledge
2. Complete patient medical understanding
3. Data-backed coverage decisions
4. Explainable reasoning
5. Confidence scores
6. Missing document identification
7. Error detection before submission
8. Audit trail of all decisions

---

## ARTICLE III: SECONDARY USERS

**Secondary User:** Patient / Patient's Family

**Participation Level:** Reactive only

**Patient Actions:**
- Upload medical documents
- Provide missing information
- View coverage explanations (in plain language)
- View decision outcomes
- Respond to worker requests

**What Patient Does NOT Do:**
- Drive insurance decisions
- Negotiate coverage
- Initiate workflows
- Choose treatment paths based on coverage
- Access clinician functions

**Key Principle:** The workflow is worker-initiated. Patient is a participant, not the center.

---

## ARTICLE IV: CORE WORKFLOW

**The entire product revolves around exactly four Intelligence Engines:**

### Stage 1: Insurance Intelligence Engine
**Input:** Insurance policies (manual or automatic)  
**Processing:** Extract coverage, exclusions, conditions, requirements, terminology  
**Output:** Structured insurance knowledge with source traceability and confidence  
**Success Criteria:**
- Worker can retrieve any supported insurance in <30 seconds
- Worker can understand complete coverage in <2 minutes
- All extracted data is traceable to original source
- Confidence scores accompany all extractions

### Stage 2: Medical Intelligence Engine
**Input:** Patient medical documents (discharge, labs, prescriptions, bills, imaging)  
**Processing:** Extract diagnoses, procedures, medications, timeline, costs, missing documents  
**Output:** Structured patient case knowledge with medical codes and confidence  
**Success Criteria:**
- Worker can understand complete patient case in <2 minutes
- All diagnoses/procedures mapped to standard codes (ICD-10, CPT)
- Medical timeline is chronologically accurate
- Missing documents are identified relative to requirements
- Confidence scores accompany all extractions

### Stage 3: Knowledge Normalization Engine
**Input:** Insurance terminology + Medical terminology  
**Processing:** Map synonyms, resolve abbreviations, disambiguate terms, apply medical codes  
**Output:** Unified normalized concept identifiers across insurance & medical domains  
**Success Criteria:**
- Insurance term "CABG" maps to medical term "Coronary Artery Bypass Grafting"
- Ambiguous terms are disambiguated with context
- All normalizations have confidence scores
- Human-in-loop exists for low-confidence mappings

### Stage 4: Decision Intelligence Engine
**Input:** Insurance Intelligence + Medical Intelligence + Normalized Knowledge  
**Processing:** AI reasoning about coverage, exclusions, conflicts, requirements, probability  
**Output:** Coverage decision with explicit reasoning, evidence, confidence, next steps  
**Success Criteria:**
- Coverage decisions agree with insurance expert review ≥85% of time
- Decision reasoning is explainable with cited clauses
- Confidence scores are calibrated to actual outcomes
- Temporal consistency maintained (decision valid for specific date & policy version)
- Conflicting information is explicitly flagged
- Processing time <5 seconds per decision

### Stage 5: Prior Authorization Intelligence Engine
**Input:** Decision Intelligence output + PA form template + institutional rules  
**Processing:** Auto-fill forms, validate fields, detect errors, generate explanations  
**Output:** Submission-ready PA form with 75-85% auto-fill and explanation document  
**Success Criteria:**
- PA forms auto-fill 75-85% of fields correctly
- All required fields are identified
- Validation catches 100% of critical errors
- Worker can complete form in <10 minutes
- Zero submission errors

---

## ARTICLE V: ARCHITECTURE PRINCIPLES

### Principle 1: Intelligence Over Documents
CarePolicy AI is not a document management system. It is an intelligence system.
- Documents are inputs to extraction
- Knowledge graphs are the real architecture
- Intelligence engines process and reason about knowledge
- Outputs are displays of intelligence, not documents

### Principle 2: Features Are Engine Consumers
Every feature must strengthen or consume an intelligence engine.
- Patient Portal → Consumer of Decision Intelligence
- AI Chat → Consumer of Insurance & Decision Intelligence  
- Worker Dashboard → Consumer of Decision Intelligence & Audit Trails
- Notification System → Consumer of Decision Intelligence
- Mobile App → Consumer of all engines

Features that don't consume engines are deferred.

### Principle 3: Explainability by Default
Every intelligence output must include:
- The reasoning path ("Because X, and because Y, therefore Z")
- Source citations ("Clause 4.2 of Policy ABC")
- Confidence scoring ("HIGH confidence: 88%")
- Contradictions flagged ("Medical evidence conflicts with coverage")

No black-box outputs. Ever.

### Principle 4: Confidence Scores as Architecture
All extracted data must include confidence:
- HIGH: ≥80% confidence (safe for automation)
- MEDIUM: 60-79% confidence (requires worker review)
- LOW: <60% confidence (requires manual intervention)

Confidence is not a cosmetic field. It drives workflow routing and automation decisions.

### Principle 5: Temporal Consistency
All decisions must be time-scoped:
- "Decision made on DATE X"
- "Using policy VERSION Y"
- "With medical data as of DATE Z"
- "Confidence valid for 30 days"

When data changes, decision validity must be re-evaluated.

### Principle 6: Source Traceability
Every piece of intelligence must trace back to original source:
- Insurance data → Links to specific clause in specific policy
- Medical data → Links to specific document
- Normalized mapping → Links to curated list or ML model
- Decision → Links to supporting clauses and medical evidence

This enables audit trails and appeals.

### Principle 7: Graceful Degradation
System should work at every confidence level:
- Ideal: Official insurance data + complete medical records + high-confidence decision
- Acceptable: Manual PDF upload + extracted medical data + medium-confidence decision
- Workable: Limited data + low-confidence decision + escalation to manual review

Never fail because of missing data. Degrade gracefully.

### Principle 8: Compliance by Architecture
HIPAA, regulatory, and audit requirements are not bolt-on features:
- Encryption at rest is default
- Audit trails are immutable
- Data access is logged
- Regulatory fields are part of schema from Day 1
- Compliance is architecture, not feature

---

## ARTICLE VI: CORE PRODUCT PRINCIPLES

### Worker-Centric Design
Every UI, API, and workflow decision prioritizes the insurance worker's needs.
- Interfaces assume high cognitive load (multiple cases, fast decisions)
- Information must be scannable in <10 seconds
- Confidence scores highlight which decisions are safe vs. risky
- Audit trails support worker if decision is questioned

### One Workflow Excellence
CarePolicy AI does one workflow exceptionally well, not ten workflows mediocrely.
- Insurance approval workflow is THE workflow
- Every feature strengthens this workflow
- Every feature that doesn't is deferred
- Excellence matters more than comprehensiveness

### Intelligence > Automation
CarePolicy AI provides intelligence for human decision-making, not full automation.
- Worker always makes final insurance decisions
- AI provides reasoning and recommendations
- Worker reviews and can override
- 75-85% automation in forms is target, not 100%

### Official Knowledge > Inference
When official data exists, use it. Inference only when necessary.
- IRDAI official policies: Use directly
- Insurer website data: Use directly
- Inferred relationships: Flag as inferred with confidence
- Manual PDF: Extract, but mark as user-provided

### Explainability > Accuracy
A lower-accuracy decision with explanation beats high-accuracy black box.
- Decision with clear reasoning that worker can defend > 95% accurate decision worker can't explain
- This matters for insurance disputes and appeals

---

## ARTICLE VII: DECISION-MAKING RULES

### Rule 1: The Engine Test
**For any proposed feature, ask: "Does this strengthen one of the five intelligence engines?"**

Examples:
- "IRDAI data integration" → Strengthens Insurance Intelligence ✅ APPROVE
- "Patient mobile app" → Consumes Decision Intelligence ✅ APPROVE  
- "Hospital finder" → Does not strengthen any engine ❌ DEFER
- "Staff scheduling" → Does not strengthen any engine ❌ DEFER
- "AI chat interface" → Consumes Insurance & Decision Intelligence ✅ APPROVE

### Rule 2: The Workflow Test
**Does this feature improve one of the four workflow stages?**

Workflow Stages:
1. Insurance understanding (Stage 1 Engine)
2. Medical understanding (Stage 2 Engine)  
3. Normalization (Stage 3 Engine)
4. Coverage decision (Stage 4 Engine)
5. PA form completion (Stage 5 Engine)

Features that don't improve workflow stages are deferred.

### Rule 3: Exit Criteria Before Timelines
**Define completion using objective exit criteria, not estimated time.**

❌ WRONG: "Insurance Intelligence Engine in 4 weeks"
✅ CORRECT: "Insurance Intelligence Engine is complete when:
- Worker can search ≥1000 insurance policies
- Search succeeds in <1 second
- Coverage comparison works
- Source traceability is complete
- Confidence scores are calibrated"

### Rule 4: Confidence Drives Architecture
**Use confidence scores to determine automation level.**

- Decision confidence ≥85%: Proceed to auto-fill PA form
- Decision confidence 65-84%: Require worker review before auto-fill
- Decision confidence <65%: Escalate to manual review
- Extraction confidence <50%: Flag for human verification

### Rule 5: Temporal Scope Everything
**Every decision, extraction, and recommendation must include:**
- Valid-as-of date
- Data versions used
- Confidence validity window
- Re-evaluation trigger

---

## ARTICLE VIII: WHAT BELONGS IN THE PRODUCT

### Core In-Scope (Part of Intelligence Engines or Workflow)

✅ Insurance policy extraction and search  
✅ Medical document extraction and case building  
✅ Medical/insurance terminology normalization  
✅ AI-powered coverage decision reasoning  
✅ Prior Authorization form auto-fill  
✅ Decision explainability and citations  
✅ Confidence scoring system  
✅ Audit trails and compliance logging  
✅ Worker dashboard (consumer of engines)  
✅ Patient portal (consumer of Decision Intelligence)  
✅ AI copilot chat (consumer of engines)  
✅ Missing document detection  
✅ Error detection and validation  
✅ Recommendations and next steps  
✅ Appeals and revision workflows  

### Explicitly Out-of-Scope (Deferred Permanently or Indefinitely)

❌ Hospital operations (staff scheduling, bed allocation, OR scheduling)  
❌ Electronic Medical Records (EMR) - we consume, don't build  
❌ Hospital management systems (nursing, supply chain, inventory)  
❌ Appointment booking  
❌ Telemedicine consultation  
❌ Pharmacy management  
❌ Pathology lab ordering  
❌ Radiology ordering  
❌ Patient health tracking (vitals, exercise, sleep)  
❌ Wellness programs  
❌ Insurance marketplace (selling policies)  
❌ Hospital ratings and reviews  
❌ Patient communities/forums  
❌ Prescription delivery  
❌ Hospital ERP  
❌ Revenue cycle beyond claims approval  

**Rationale:** These features don't strengthen the insurance approval workflow. They belong in different systems.

---

## ARTICLE IX: FUTURE EXPANSION PHILOSOPHY

### Expansion Principle: Add Engines or Consumers, Never Diverge

**Allowed Expansions:**

1. **New Intelligence Engines (if they serve insurance workflow)**
   - Example: "Claim Denial Analysis Engine" (analyzes why claims were denied in past)
   - Must strengthen insurance approval workflow
   - Must be as rigorous as existing engines

2. **New Engine Consumers (if they visualize existing engines)**
   - Example: "Appeals Assistant" → Consumes Decision Intelligence to build appeal
   - Example: "Insurance Negotiation Assistant" → Consumes engines to suggest negotiation points
   - Must not create new independent workflows

3. **Engine Enhancement (depth in existing engines)**
   - Example: "Medical imaging analysis" → Enhances Medical Intelligence Engine
   - Example: "Integration with EHR systems" → Enhances Medical Intelligence sources
   - Example: "Insurer API integrations" → Enhances Insurance Intelligence sources

**Prohibited Expansions:**

1. **New Workflows Outside Insurance Approval**
   - ❌ "Build a patient health tracking app"
   - ❌ "Build a hospital operations platform"
   - ❌ "Build an insurance marketplace"

2. **Features That Diverge from Workflow**
   - ❌ "Add staff scheduling because hospitals need it"
   - ❌ "Add hospital finder because patients need it"
   - ❌ "Add social features because users want community"

3. **Features in Wrong Domain**
   - ❌ Build EMR (consume from EMR instead)
   - ❌ Build hospital ERP (stay focused)
   - ❌ Build claims processing (separate workflow)

### Multi-Region Expansion
**Allowed:** Support multiple countries' insurance systems (India, US, UK, etc.)
- Each region adds Insurance Intelligence connectors
- Each region adds Medical/insurance terminology mappings
- Regulatory frameworks vary by region
- Decision Intelligence reasoning may need region-specific rules

### Multi-Hospital Expansion
**Allowed:** Support multiple hospitals using same platform
- Each hospital configures their institutional rules
- Each hospital manages their PA form templates
- Each hospital configures their insurance networks
- Central platform, localized configuration

---

## ARTICLE X: TECHNOLOGY CONSTRAINTS

### Technology Choices (Permanent Until Major Pivot)

**Backend:** Node.js + Express + TypeScript
- Rationale: Fast iteration, good ecosystem, strong typing
- Change trigger: Only if significant bottleneck identified

**Frontend:** React 18 + Vite + TypeScript
- Rationale: Component-based UI, accessibility support, Tailwind CSS
- Change trigger: Only if accessibility or performance goals unmet

**Database:** MongoDB Atlas
- Rationale: Flexible schema for evolving intelligence models, managed service
- Fallback: Clear migration path to PostgreSQL if document model proves limiting
- Change trigger: Only if query patterns prove fundamentally mismatched

**AI Model:** Claude 3.5 Sonnet (for reasoning) + Gemini Flash (for speed)
- Rationale: Best available for explainable reasoning, provider abstraction allows swaps
- Change trigger: Only if new model significantly outperforms on benchmarks

**Cloud Infrastructure:** TBD (Render, Railway, or self-hosted)
- Rationale: TBD based on launch requirements
- Constraints: Must support HIPAA compliance, audit logging, redundancy

---

## ARTICLE XI: COMPLIANCE & SECURITY ARCHITECTURE

### Permanent Requirements (Not Optional)

1. **HIPAA Compliance**
   - All healthcare data encrypted at rest and in transit
   - Access controls and audit trails
   - Business Associate Agreements with service providers

2. **Regulatory Compliance**
   - Insurance commission regulations by region
   - State privacy laws
   - KYC/AML requirements

3. **Data Security**
   - Immutable audit trails
   - Encryption of PHI fields
   - Regular security audits
   - Incident response procedures

4. **Compliance Audit Trail**
   - Every decision logged with user, timestamp, reasoning, sources
   - Cannot be modified or deleted (immutable)
   - Supports appeals and regulatory inquiries

---

## ARTICLE XII: DECISION-MAKING AUTHORITY

### When To Build (Product Manager + Lead Engineer + Domain Expert)
- Strengthens one of five intelligence engines
- Passes the Engine Test
- Meets exit criteria with confidence scoring
- Aligns with workflow stage

### When To Defer (Same Review Board)
- Doesn't strengthen intelligence engines
- Fails the Engine Test
- Creates scope creep or workflow divergence
- Can be built later without blocking current engines

### When To Say No (CEO + Board)
- Fundamentally changes product mission
- Requires abandoning core workflow
- Pivots to different user type
- Requires licensing different regulatory domain

---

## ARTICLE XIII: MEASURING SUCCESS

### Engine-Level Success Metrics

**Insurance Intelligence Engine:**
- 1000+ policies searchable and retrievable
- <30 second retrieval time
- ≥95% accuracy on coverage extraction
- 100% source traceability
- Confidence scores calibrated to extraction accuracy

**Medical Intelligence Engine:**
- <2 minutes to understand complete patient case
- ≥95% accuracy on diagnosis/procedure extraction
- All data mapped to standard medical codes
- Missing documents identified with 100% accuracy
- Timeline chronologically accurate

**Knowledge Normalization Engine:**
- 99% of common medical/insurance terms normalized correctly
- Ambiguous terms disambiguated with ≥80% accuracy
- Human-in-loop for <5% of mappings
- Confidence scores available for all normalizations

**Decision Intelligence Engine:**
- Coverage decisions agree with insurance expert ≥85% of time
- All decisions have explainable reasoning
- Confidence scores calibrated (HIGH = 88% approval rate, MEDIUM = 70%, LOW = 50%)
- Processing time <5 seconds per decision
- Temporal consistency maintained

**Prior Authorization Intelligence Engine:**
- 75-85% auto-fill rate
- 100% of validation errors caught
- Worker form completion time <10 minutes
- Zero submission errors
- Submission success rate ≥90%

### Workflow-Level Success Metric

**The True Success Metric:**
"Insurance worker can complete full insurance approval workflow (from policy selection through PA form generation) with confidence and explainability, spending <20 minutes on a complex case, with zero manual errors."

---

## ARTICLE XIV: CHANGE CONTROL

### What Requires Constitutional Amendment

Changes to the Constitution require explicit approval:
- Changes to the four Intelligence Engines
- Changes to Primary User definition
- Changes to Core Workflow
- Changes to Technology Stack fundamentals
- Changes to Compliance requirements

### What Does NOT Require Amendment

- New features that consume engines
- Enhancements to existing engines
- UX/UI improvements
- Performance optimizations
- Bug fixes
- New integrations (IRDAI, insurer APIs, EHR systems)

### Amendment Process

1. **Proposal:** Documented with rationale
2. **Review:** Product team + domain experts + engineering leadership
3. **Approval:** CEO + Board (if major) or Product Manager (if minor)
4. **Documentation:** Updated Constitution with version number and effective date
5. **Stakeholder Communication:** All teams aligned before implementation

---

## ARTICLE XV: THE UNMISTAKABLE IDENTITY

**CarePolicy AI is not:**
- A consumer healthcare app
- A hospital ERP
- An insurance marketplace
- An EMR
- A telemedicine platform
- A patient health tracker
- A general "healthcare platform"

**CarePolicy AI IS:**
- The system that gives healthcare insurance workers the intelligence to confidently approve insurance claims in minutes instead of hours
- Built on explainable AI reasoning
- Powered by official insurance knowledge and verified medical records
- With confidence scores, source citations, and audit trails
- Such that workers can defend every decision to insurers, patients, and regulators

**CarePolicy AI's Unfair Advantage:**
- No one else optimizes for the insurance approval workflow with explainable AI
- Most healthcare software is either patient-facing or hospital operations-facing
- Insurance workflow is poorly served by existing systems
- Exceptional execution here creates defensible moat

---

## ARTICLE XVI: THE CONSTITUTION IN PRACTICE

### Example: Feature Proposal "Patient Mobile App"

**Proposal:** Build native iOS/Android app so patients can upload docs and check status on-the-go

**Constitutional Review:**

1. **Engine Test:** "Does this strengthen an intelligence engine?"
   - No. It consumes Decision Intelligence, but doesn't strengthen any engine.
   - ❌ FAILS Engine Test

2. **Workflow Test:** "Does this improve insurance approval workflow?"
   - Slightly. Patients can upload docs faster.
   - ⚠️ WEAK: Marginal benefit

3. **Scope Test:** "Does this keep focus on insurance workflow?"
   - Yes, if limited to insurance decision features only
   - ✅ PASSES if features stay in-scope

4. **Decision:**
   - ✅ APPROVE: But as consumer of Decision Intelligence
   - ✅ MOBILE WEB only (don't build native iOS/Android)
   - ✅ Features: Upload docs, view coverage decision, understand requirements
   - ❌ NO: Health tracking, appointments, messaging, general patient portal

---

### Example: Feature Proposal "AI Hospital Finder"

**Proposal:** Help patients find hospitals based on coverage, location, ratings

**Constitutional Review:**

1. **Engine Test:** "Does this strengthen an intelligence engine?"
   - No. It uses Insurance Intelligence (network lookup) but doesn't strengthen any engine.
   - ❌ FAILS Engine Test

2. **Workflow Test:** "Does this improve insurance approval workflow?"
   - No. Insurance approval happens before hospital selection.
   - ❌ FAILS Workflow Test

3. **Scope Test:** "Does this keep focus on insurance workflow?"
   - No. This is patient-facing navigation, outside insurance workflow.
   - ❌ FAILS Scope Test

4. **Decision:**
   - ❌ DEFER: Indefinitely
   - 📝 Rationale: Insurance approval happens before hospital selection. This feature belongs in a separate patient app or hospital finder product, not CarePolicy AI.
   - 🔄 Future Reconsideration: Only if hospitals start requesting this as pre-approval tool (unlikely).

---

### Example: Feature Proposal "Claims Denial Analysis Engine"

**Proposal:** Analyze past claim denials to identify patterns and suggest corrections

**Constitutional Review:**

1. **Engine Test:** "Does this strengthen an intelligence engine?"
   - Potentially YES. Could enhance Decision Intelligence with historical precedent.
   - ✅ Could PASS Engine Test if properly scoped

2. **Workflow Test:** "Does this improve insurance approval workflow?"
   - YES. Learning from past denials improves future approvals.
   - ✅ PASSES Workflow Test

3. **Scope Test:** "Does this keep focus on insurance workflow?"
   - YES. Denial analysis informs approval decisions.
   - ✅ PASSES Scope Test

4. **Decision:**
   - ✅ APPROVE: But as enhancement to Decision Intelligence
   - 📝 As: "Claim Denial Analysis Engine" (new intelligence engine)
   - 📝 Features: Analyze past denials, identify denial patterns, suggest pre-emptive corrections
   - 📝 Not features: Claims processing, claims submission, payment reconciliation
   - 🔄 Timeline: Phase 2+ (after Decision Intelligence mature)

---

## FINAL STATEMENT

This Constitution is the permanent north star for CarePolicy AI.

It is not aspirational.

It is not a roadmap.

It is law.

Every feature, every architecture decision, every product pivot must be evaluated against these principles.

When in doubt, return to the mission:

**"Give healthcare insurance workers the intelligence to confidently approve claims in minutes, not hours, with explainable reasoning built on official policies and medical records."**

If a feature moves us toward that mission, it belongs.

If it distracts from that mission, it is deferred.

That clarity is our strength.

