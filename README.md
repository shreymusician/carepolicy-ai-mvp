# CarePolicy AI

**AI Copilot for Hospital Insurance Processing**

An intelligent system that helps hospital staff understand insurance policies and extract information in minutes instead of hours.

## Project Status

✅ **Milestone 4 Complete: Human-Centered Frontend**

All milestones now complete:
- Backend: Real OCR, Google Gemini API calls, MongoDB persistence, error handling, retry logic
- Frontend: React + TypeScript, newspaper-inspired design, mobile-responsive
- Design: Accessibility-first, elderly & low-literacy users, large typography, high contrast
- API: Real backend integration (no mock data), /api/v1/analyze endpoint

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB Atlas account (free tier available)
- Google Gemini API key (from [Google AI Studio](https://aistudio.google.com/app/apikey))

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Configure environment variables:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/carepolicy-ai
AI_PROVIDER=gemini
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-flash-latest
NODE_ENV=development
PORT=5000
```

## Environment Setup

The application is configured entirely through environment variables. Follow these steps before running the server:

1. **Copy the example file:**
```bash
cp .env.example .env
```

2. **Rename it to `.env`** (the copy command above already does this — just confirm the file is named `.env`, not `.env.example`).

3. **Replace every placeholder with actual values:**
   - `MONGODB_URI` — your MongoDB Atlas connection string (Atlas Dashboard → Connect → Drivers)
   - `GEMINI_API_KEY` — your Google Gemini API key (from [Google AI Studio](https://aistudio.google.com/app/apikey))
   - `AI_PROVIDER` — which AI provider `LlmService` uses (currently only `gemini` is supported)
   - `GEMINI_MODEL` — which Gemini model to call (e.g. `gemini-flash-latest`); availability varies by account, so verify your key has access to the model you set here
   - `FRONTEND_URL` — the URL your frontend runs on (defaults to `http://localhost:3000`)
   - `NODE_ENV`, `PORT`, `LOG_LEVEL` — adjust as needed, sensible defaults are provided

`.env` is listed in `.gitignore` and must never be committed. Only `.env.example` (with placeholders) should be tracked in version control.

### Development

Build TypeScript:
```bash
npm run build
```

Run development server:
```bash
npm run dev
```

Type checking:
```bash
npm run type-check
```

### Running the Backend Server

1. **Start the development server:**
```bash
npm run dev
```

2. **Check the server is running:**
```bash
curl http://localhost:5000/health
```

Response:
```json
{
  "status": "ok",
  "service": "CarePolicy AI"
}
```

### Running the Frontend

The frontend is located in the `frontend/` directory and connects to the backend API.

1. **Install frontend dependencies:**
```bash
cd frontend
npm install
```

2. **Start the frontend development server:**
```bash
npm run dev
```

Frontend runs on `http://localhost:3000` and proxies API calls to backend at `http://localhost:5000`.

3. **Build for production:**
```bash
npm run build
```

This creates an optimized `dist/` directory ready for deployment.

See [FRONTEND_DESIGN.md](FRONTEND_DESIGN.md) for design philosophy and accessibility features.

### Supported Document Types

**Insurance Policy:**
- Digital PDFs (selectable text) - Instant extraction
- Scanned PDFs - OCR applied automatically
- Maximum size: 10MB

**Prescription/Medical Documents:**
- PDF files
- PNG images
- JPG/JPEG images
- Maximum size: 10MB
- Optional (but recommended for better matching)

**Smart Detection:**
- System automatically detects document type
- Digital PDFs use fast text extraction
- Scanned documents use Tesseract OCR
- Image files use OCR with preprocessing

### Complete Pipeline

The backend implements a production-ready workflow:

1. **File Upload** - Accept policy (required) + prescription (optional)
2. **OCR Processing**
   - Detect digital vs scanned PDF
   - Use appropriate extraction method
   - Apply image preprocessing for OCR
   - Track extraction confidence
3. **Text Cleaning** - Normalize and clean extracted text
4. **Prompt Building** - Construct detailed AI prompt with medical context
5. **AI Analysis** - Call Google Gemini API (via provider abstraction) with retry logic (3 attempts)
6. **Response Validation** - Strict schema validation of JSON response
7. **Database Storage** - Store complete analysis with metadata
8. **Error Handling** - Graceful failure with detailed error tracking

**Processing Time:** Typically 8-15 seconds (depending on document size and OCR needs)

**Output Includes:**
- Extracted facts from the policy
- Plain-language explanations
- Treatment-specific clause matching (if prescription provided)
- Warnings and risks by severity
- Confidence levels on all extracted information
- Complete processing metadata (method, time, status)
- Unique document_id for future retrieval

### Project Structure

```
src/
├── config/          # Configuration (MongoDB, ConfigService)
├── models/          # Mongoose schemas
├── providers/       # AIProvider interface + GeminiProvider implementation
├── services/        # Business logic services
├── types/          # TypeScript type definitions
├── middleware/     # Express middleware
├── utils/          # Utility functions
├── env.ts          # Loads .env before any other module reads process.env
└── app.ts          # Express application entry point
```

## Architecture

### Services

**OcrService**
- Extracts text from PDF files
- Handles multi-page documents
- Input: PDF Buffer → Output: Text String

**DocumentCleanerService**
- Normalizes extracted text
- Removes OCR artifacts
- Input: Raw Text → Output: Cleaned Text

**PromptBuilderService**
- Constructs provider-agnostic AI prompts
- Includes prescription context (optional)
- Input: Policy Text, Optional Prescription → Output: Formatted Prompt

**LlmService**
- Orchestrates retry logic, backoff, and timeout
- Delegates the actual API call to an `AIProvider` implementation (currently `GeminiProvider`)
- Handles API errors gracefully
- Input: Prompt → Output: JSON Response Text

**GeminiProvider** (`src/providers/GeminiProvider.ts`)
- Implements the `AIProvider` interface using the Google Generative AI SDK
- Isolates all Gemini-specific request/response handling
- Swappable: implement `AIProvider` again to support another provider without touching `LlmService` or any caller

**ResponseParserService**
- Validates JSON response structure
- Extracts analysis results
- Input: Response Text → Output: Typed AnalysisResult

**AnalysisStorageService**
- Persists results to MongoDB
- Retrieves stored analyses
- Input: Analysis Data → Output: Document ID

## API

### Endpoints (Coming in Milestone 2)

- `POST /api/analyze` - Upload and analyze insurance documents
- `GET /api/download/:documentId` - Download patient summary PDF

## Database

### MongoDB Collections

**analyses**
- Stores complete analysis results
- One document per insurance policy analysis
- Indexes on `created_at` and `prescription_provided`

## Testing

Services are designed for independent unit testing:

```typescript
import OcrService from './services/OcrService';

const buffer = fs.readFileSync('policy.pdf');
const text = await OcrService.extractText(buffer);
```

## Development Standards

- TypeScript with strict mode
- Single responsibility per service
- Type-safe error handling
- No external dependencies for business logic
- Production-quality code from day one

## Common Issues

**MongoDB Connection**
- Ensure `MONGODB_URI` is set in `.env`
- Check MongoDB Atlas IP whitelist includes your IP
- Verify credentials are correct

**Gemini API**
- Ensure `GEMINI_API_KEY` is set in `.env`
- Check that `GEMINI_MODEL` is a model your key actually has access to (model availability varies by account — verify with a test call if you see 404 errors)
- Monitor rate limits and quota at [ai.dev/rate-limit](https://ai.dev/rate-limit)

## Next Steps

1. Milestone 2: API Endpoints
2. Milestone 3: PDF Export
3. Milestone 4: Integration & Testing
4. Milestone 5: Demo Preparation

## License

MIT

## Support

For issues or questions, contact the CarePolicy AI team.
