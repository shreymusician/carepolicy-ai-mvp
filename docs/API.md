# CarePolicy AI - API Documentation

## Base URL

```
http://localhost:5000
```

## Endpoints

### Health Check

**Endpoint:** `GET /health`

**Description:** Check if the server is running

**Response:**
```json
{
  "status": "ok",
  "service": "CarePolicy AI"
}
```

---

## Analysis Endpoints

### Analyze Insurance Policy

**Endpoint:** `POST /api/analyze`

**Description:** Upload insurance policy (and optional prescription) for comprehensive AI analysis

**Features:**
- Smart PDF type detection (digital vs scanned)
- Automatic OCR for scanned documents and images
- Google Gemini API integration with retry logic
- Strict JSON schema validation
- Complete processing metadata tracking
- Comprehensive error handling

**Request:**
- **Method:** POST
- **Content-Type:** multipart/form-data
- **Files:**
  - `policy` (required): Insurance policy PDF (max 10MB)
  - `prescription` (optional): Doctor prescription (PDF or image - PNG/JPG, max 10MB)

**Supported Formats:**
- **Policy:** Digital PDFs, scanned PDFs (will use OCR)
- **Prescription:** PDFs, PNG images, JPG/JPEG images

**Example Request (curl):**
```bash
curl -X POST http://localhost:5000/api/analyze \
  -F "policy=@insurance_policy.pdf" \
  -F "prescription=@doctor_prescription.pdf"
```

**Example Request (JavaScript):**
```javascript
const formData = new FormData();
formData.append('policy', policyFile);
formData.append('prescription', prescriptionFile);

const response = await fetch('http://localhost:5000/api/analyze', {
  method: 'POST',
  body: formData
});

const result = await response.json();
```

**Success Response (200):**
```json
{
  "success": true,
  "document_id": "507f1f77bcf86cd799439011",
  "analysis_result": {
    "document_analysis": {
      "extracted_facts": {
        "policy_information": {
          "policy_number": {
            "value": "ABC-123-DEF-456",
            "confidence": "high",
            "source": "Extracted from document"
          },
          "policyholder_name": {
            "value": "John Doe",
            "confidence": "high",
            "source": "Extracted from document"
          },
          "policy_start_date": {
            "value": "2024-01-15",
            "confidence": "high",
            "source": "Extracted from document"
          },
          "policy_end_date": {
            "value": "2025-01-15",
            "confidence": "high",
            "source": "Extracted from document"
          },
          "annual_coverage_limit": {
            "value": "Rs 5,00,000",
            "confidence": "high",
            "source": "Extracted from document"
          },
          "room_rent_limit": {
            "value": "Rs 2,000 per day",
            "confidence": "medium",
            "source": "Extracted from document"
          },
          "waiting_period": {
            "value": "30 days from enrollment",
            "confidence": "high",
            "source": "Extracted from document"
          }
        },
        "exclusions": [
          {
            "exclusion": "Pre-existing conditions",
            "details": "Not covered during first 30 days",
            "confidence": "high"
          }
        ]
      },
      "ai_generated_knowledge": {
        "policy_summary": {
          "what_is_covered": "This insurance covers hospital treatment including doctor consultation, medicines, hospital room charges (up to Rs 2,000/day), and surgical procedures...",
          "what_is_not_covered": "This insurance does NOT cover outpatient treatment (doctor visit without hospital admission), cosmetic procedures, or treatment for conditions you had before the policy started...",
          "key_points": [
            "Your insurance limit is Rs 5,00,000 per year",
            "Room charges are covered up to Rs 2,000 per day",
            "There is a 30-day waiting period for certain procedures"
          ],
          "source": "AI-generated explanation"
        },
        "relevant_clauses": [
          {
            "clause_name": "Cardiology Coverage",
            "reason_relevant": "Patient's prescription indicates cardiac surgery",
            "clause_details": "Covers cardiology procedures and hospital treatment for heart conditions",
            "appears_applicable": true,
            "confidence": "high",
            "source": "Matched to prescription context"
          }
        ]
      },
      "risk_assessment": {
        "critical_issues": [
          {
            "severity": "critical",
            "issue": "Waiting period not yet satisfied",
            "explanation": "Policy started 15 days ago. Cardiac procedures have a 30-day waiting period...",
            "action_required": "Verify enrollment date. Confirm if procedure can be delayed or if expedited enrollment is available."
          }
        ],
        "important_notes": [
          {
            "severity": "important",
            "issue": "Room rate mismatch",
            "explanation": "Policy covers up to Rs 2,000/day for room charges. Hospital's cardiac ward charges Rs 3,500/day..."
          }
        ],
        "general_notes": [
          {
            "severity": "info",
            "issue": "Policy expiration approaching",
            "explanation": "Current policy expires in 6 months. Plan for renewal."
          }
        ]
      },
      "treatment_specific_summary": {
        "treatment": "Cardiac Surgery",
        "diagnosis": "Coronary Artery Disease",
        "appears_covered": "Yes, appears to be covered",
        "coverage_explanation": "Cardiology section and surgery section both apply. Hospital treatment is covered.",
        "potential_financial_responsibility": "Room charges above Rs 2,000/day, medicines to take home, any co-insurance percentage if applicable",
        "important_treatment_notes": [
          "Waiting period of 15 days remains before full coverage",
          "ICU stay (if needed) covered within room rent limit"
        ],
        "source": "AI analysis of prescription context against policy"
      },
      "metadata": {
        "prescription_provided": true,
        "overall_confidence": "high",
        "confidence_explanation": "Policy text is clear. Prescription context helps identify relevant clauses...",
        "processing_complete": true,
        "processing_time_ms": 8234,
        "document_quality": "good",
        "ocr_confidence": "high"
      }
    }
  },
  "metadata": {
    "processing_time_ms": 8234,
    "prescription_provided": true,
    "extraction_method": "DIGITAL_PDF",
    "ocr_confidence": "high"
  }
}
```

**Error Response (400):**
```json
{
  "status": 400,
  "message": "Could not read or extract text from PDF file",
  "error_type": "OcrError"
}
```

**Error Response (503):**
```json
{
  "status": 503,
  "message": "AI processing failed. Please try again",
  "error_type": "LlmError"
}
```

---

## Extraction Methods

The system automatically detects the document type and uses the appropriate extraction method:

| Method | Description | Confidence |
|--------|-------------|-----------|
| DIGITAL_PDF | Selectable text extracted directly from PDF | High |
| SCANNED_PDF | OCR applied to scanned PDF pages | Medium |
| IMAGE_OCR | OCR applied to uploaded image (PNG/JPG) | Medium/High |
| IMAGE_DIRECT | Direct extraction from image file | High |

---

## Processing Status

Every analysis document tracks processing status:

| Status | Meaning |
|--------|---------|
| SUCCESS | Analysis completed successfully |
| FAILED | Analysis failed (check error_message) |
| PROCESSING | Analysis in progress (not typical in response) |

---

## Metadata Tracking

Each analysis includes detailed processing metadata:

- `processing_time_ms` - Total time to process (usually 5-15 seconds)
- `prescription_provided` - Whether prescription was included
- `extraction_method` - How text was extracted (see Extraction Methods)
- `ocr_confidence` - Confidence level of extraction (high/medium/low)
- `policy_mime_type` - MIME type of uploaded policy file
- `prescription_mime_type` - MIME type of prescription (if provided)

---

## Error Codes

| Status | Error Type | Meaning |
|--------|-----------|---------|
| 400 | OcrError | PDF could not be read or is invalid |
| 400 | DocumentCleanError | Text could not be processed |
| 400 | FileError | File type or size invalid |
| 404 | NotFoundError | Analysis document not found |
| 500 | PromptBuildError | Failed to prepare prompt |
| 500 | ParseError | AI response was invalid JSON |
| 500 | StorageError | Failed to save to database |
| 503 | LlmError | AI provider (Gemini) call failed |
| 503 | ConfigError | Database not configured |

---

## Notes

- All responses include a `document_id` that can be used for future retrieval
- Analysis results are stored in MongoDB for future reference
- Prescription is optional but recommended for better clause matching
- Processing time varies based on document length (typically 5-15 seconds)
- AI confidence is marked on all extracted fields (high/medium/low)
- All AI-generated explanations are marked as such for transparency

---

## Rate Limiting

Currently not implemented (planned for production).

## Authentication

Currently not implemented (planned for production).
