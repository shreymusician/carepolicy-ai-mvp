# Database Design

## Overview

**Primary DB:** PostgreSQL 15  
**ORM:** Prisma  
**Cache:** Redis 7  
**Vector Search:** pgvector extension

---

## Core Entities

### users
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| email | VARCHAR(255) UNIQUE | |
| password_hash | TEXT | bcrypt |
| role | ENUM(patient, clinician, admin) | |
| is_active | BOOLEAN | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### patients
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK → users | |
| mrn | VARCHAR(20) UNIQUE | Medical Record Number |
| first_name | TEXT (encrypted) | |
| last_name | TEXT (encrypted) | |
| date_of_birth | DATE (encrypted) | |
| gender | VARCHAR(20) | |
| blood_type | VARCHAR(5) | |
| insurance_id | TEXT | |
| primary_clinician_id | UUID FK → clinicians | |
| created_at | TIMESTAMPTZ | |

### clinicians
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK → users | |
| npi | VARCHAR(10) UNIQUE | National Provider ID |
| specialty | VARCHAR(100) | |
| license_number | TEXT | |
| department | VARCHAR(100) | |

### appointments
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| patient_id | UUID FK | |
| clinician_id | UUID FK | |
| scheduled_at | TIMESTAMPTZ | |
| duration_minutes | INTEGER | |
| type | ENUM(in_person, telehealth) | |
| status | ENUM(scheduled, completed, cancelled, no_show) | |
| notes | TEXT | |

### medical_records
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| patient_id | UUID FK | |
| clinician_id | UUID FK | |
| record_type | ENUM(note, lab, imaging, prescription, vitals) | |
| content | JSONB | Structured payload per type |
| ai_summary | TEXT | LLM-generated summary |
| embedding | vector(1536) | pgvector |
| recorded_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |

### vitals
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| patient_id | UUID FK | |
| recorded_at | TIMESTAMPTZ | |
| heart_rate | INTEGER | bpm |
| blood_pressure_systolic | INTEGER | mmHg |
| blood_pressure_diastolic | INTEGER | mmHg |
| temperature | DECIMAL(4,1) | °C |
| spo2 | DECIMAL(5,2) | % |
| respiratory_rate | INTEGER | breaths/min |
| weight_kg | DECIMAL(6,2) | |

### medications
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| patient_id | UUID FK | |
| name | VARCHAR(255) | |
| dosage | VARCHAR(100) | |
| frequency | VARCHAR(100) | |
| route | VARCHAR(50) | |
| start_date | DATE | |
| end_date | DATE | |
| prescribed_by | UUID FK → clinicians | |
| is_active | BOOLEAN | |

### diagnoses
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| patient_id | UUID FK | |
| icd10_code | VARCHAR(10) | |
| description | TEXT | |
| severity | ENUM(mild, moderate, severe) | |
| onset_date | DATE | |
| clinician_id | UUID FK | |
| is_active | BOOLEAN | |

### messages
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| sender_id | UUID FK → users | |
| recipient_id | UUID FK → users | |
| subject | VARCHAR(255) | |
| body | TEXT | |
| is_read | BOOLEAN | |
| sent_at | TIMESTAMPTZ | |

### ai_interactions
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK | |
| session_id | UUID | |
| input_text | TEXT | |
| output_text | TEXT | |
| model_used | VARCHAR(100) | |
| tokens_in | INTEGER | |
| tokens_out | INTEGER | |
| latency_ms | INTEGER | |
| created_at | TIMESTAMPTZ | |

### audit_logs
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK | |
| action | VARCHAR(100) | e.g., READ_RECORD |
| resource_type | VARCHAR(50) | |
| resource_id | UUID | |
| ip_address | INET | |
| created_at | TIMESTAMPTZ | |

---

## Redis Usage

| Key Pattern | TTL | Purpose |
|---|---|---|
| `session:{userId}` | 15 min | JWT refresh tracking |
| `rate:{userId}` | 60 s | Rate limit counter |
| `ai_cache:{hash}` | 1 hr | Deduplicate identical AI queries |
| `online:{userId}` | 30 s | Presence tracking |
