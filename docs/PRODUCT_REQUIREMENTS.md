# Product Requirements Document (PRD)

## Overview

**Product:** HealthAI Platform  
**Version:** 0.1.0 (Hackathon MVP)  
**Status:** In Development  
**Last Updated:** 2026-07-27

---

## Feature Areas

### 1. Patient Portal

**P0 — Must Have (Hackathon)**
- [ ] Patient health summary dashboard (conditions, medications, allergies)
- [ ] AI-powered symptom checker with triage recommendation
- [ ] Appointment scheduling and reminders
- [ ] Secure messaging with care team
- [ ] Lab result viewer with AI plain-language explanation

**P1 — Nice to Have**
- [ ] Wearable data integration (Apple Health, Fitbit)
- [ ] Medication adherence reminders
- [ ] Preventive care gap alerts

---

### 2. Clinician Dashboard

**P0 — Must Have (Hackathon)**
- [ ] Patient list with risk stratification scores
- [ ] AI clinical note assistant (SOAP note generation)
- [ ] Drug interaction checker
- [ ] Early deterioration alerts (vitals trending)
- [ ] Differential diagnosis suggestions

**P1 — Nice to Have**
- [ ] Voice-to-note transcription
- [ ] Order set recommendations
- [ ] Referral workflow

---

### 3. Admin Operations Center

**P0 — Must Have (Hackathon)**
- [ ] Bed occupancy and capacity dashboard
- [ ] Staff scheduling overview
- [ ] Revenue cycle KPIs (claims, denials, AR days)
- [ ] Patient flow analytics

**P1 — Nice to Have**
- [ ] Predictive staffing with ML forecasts
- [ ] Supply chain tracking
- [ ] Regulatory compliance report generator

---

### 4. AI Pipeline

**P0 — Must Have (Hackathon)**
- [ ] Clinical text summarization (patient history → narrative)
- [ ] ICD-10 / CPT code suggestions from notes
- [ ] Risk score computation (readmission, deterioration)
- [ ] Symptom-to-triage classification

**P1 — Nice to Have**
- [ ] Radiology report parsing
- [ ] Lab result anomaly detection

---

### 5. Platform / Infrastructure

**P0 — Must Have (Hackathon)**
- [ ] Authentication (JWT + role-based access: patient / clinician / admin)
- [ ] HIPAA-safe data handling (no real PHI in demo)
- [ ] REST + WebSocket API
- [ ] Seed data / demo data generator
- [ ] Responsive web app (desktop + tablet)

---

## Non-Functional Requirements

| Requirement | Target |
|---|---|
| API response time (p95) | < 500 ms |
| AI inference time | < 3 s |
| Uptime (demo) | 99.9% |
| Authentication | JWT, 15-min access token |
| Data encryption | AES-256 at rest, TLS 1.3 in transit |
| Browser support | Chrome, Firefox, Safari, Edge (latest 2) |

---

## Out of Scope (MVP)

- Real EHR integration (Epic, Cerner)
- Native mobile apps
- Multi-tenancy / white-labeling
- Payment processing
- Medical device connectivity
