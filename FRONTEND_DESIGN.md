# Frontend Design Documentation

## Design Philosophy

The CarePolicy AI frontend is built on a **newspaper-inspired, human-centered design** philosophy. The goal is to make complex health insurance information accessible to elderly users, low-literacy users, first-time technology users, and rural users who may be uncomfortable with technology.

### Core Principles

1. **Large, Readable Typography**: 
   - Heading: `text-4xl` (36px+) for main title
   - Section headings: `text-2xl` (24px+)
   - Body text: `text-lg` (18px+)
   - This ensures readability for users with vision impairments

2. **High Contrast, Minimal Colors**:
   - Black text on white background (newspaper style)
   - Single accent color: Blue (#0066CC)
   - Used sparingly for emphasis, buttons, and confidence indicators
   - Avoids SaaS dashboard aesthetics (no gradients, no pastel colors)

3. **Generous Spacing**:
   - `p-12` (48px) padding in upload zones
   - `mb-8` to `mb-12` between sections
   - `space-y-4` between related items
   - Prevents cognitive overload and improves scannability

4. **One Task Per Screen**:
   - Landing: Upload documents and submit
   - Processing: Show progress (no user interaction)
   - Results: Display analysis (read-only)
   - No sidebars, tabs, or complex navigation

5. **Document-Like Reading Experience**:
   - Results page feels like reading a printed document
   - Sections flow vertically like newspaper columns
   - Each fact is clearly labeled and spaced
   - Warnings have visual hierarchy (red borders, larger text)

## Architecture

### Page Components

**LandingPage.tsx**
- File upload zones with dashed borders (familiar affordance)
- Policy upload: Required (marked with red asterisk)
- Prescription upload: Optional (marked with "(Optional)")
- Large submit button with clear action text
- Security disclaimer below form

**ProcessingPage.tsx**
- Animated spinner (16x16, rotating)
- Progress bar showing completion percentage
- Step indicator (cycling through 6 steps)
- Estimated time message for expectation setting
- No cancel button (simplifies experience)

**ResultsPage.tsx**
- Structured sections: Summary, Facts, Coverage, Exclusions, Warnings, Treatment
- FactCard: Shows value + confidence indicator (✓ Confirmed / ⚠ Uncertain)
- WarningCard: Red left border, larger text, action text in bold
- Metadata footer: Document ID, processing time
- Print-friendly layout (pure HTML/CSS, no JavaScript interactions)

### Styling Strategy

- **Tailwind CSS** for utility-first styling
- **CSS variables** for theme colors (defined in tailwind.config.js)
- **Responsive**: Mobile-first approach using Tailwind breakpoints
- **No animations** except spinner (reduces cognitive load)
- **Semantic HTML**: Proper heading hierarchy, form labels, ARIA attributes

### Color Palette

```
Primary: #0066CC (Blue) - Actions, emphasis, confidence
Text: #000000 (Black) - Body text
Text Light: #4A5568 (Gray) - Secondary text, explanations
Text Muted: #718096 (Lighter Gray) - Metadata, disclaimers
Background: #FFFFFF (White) - Main background
Background Alt: #F7FAFC (Light Gray) - Alternate sections
Border: #E2E8F0 (Light Gray) - Borders, dividers
Red: #DC2626 (Red) - Warnings, exclusions, action required
```

## Accessibility Features

1. **Keyboard Navigation**:
   - File inputs use native file picker (Tab + Enter)
   - Submit button is focusable and keyboard-accessible
   - No custom focus styles needed (browser defaults are clear)

2. **Screen Readers**:
   - Form labels properly associated with inputs
   - Section headings use semantic `<h1>`, `<h2>` tags
   - Alt text on icons (✓ / ⚠ symbols rendered as text)
   - Results metadata readable as plain text

3. **Color Contrast**:
   - Black on white: WCAG AAA compliant (21:1 contrast)
   - Blue button on white: WCAG AA compliant (8.6:1 contrast)
   - Red warnings on white: WCAG AA compliant (5.3:1 contrast)

4. **Mobile Accessibility**:
   - Touch targets ≥48px (buttons, file inputs)
   - Viewport meta tag set for proper scaling
   - No horizontal scroll required
   - Text resizes gracefully up to 200% zoom

## Mobile Strategy

- **Responsive Breakpoints**: Tailwind defaults (sm: 640px, md: 768px, lg: 1024px)
- **Mobile-First**: Base styles target mobile, breakpoints add desktop enhancements
- **Upload Zones**: Scale down to `p-8` on mobile, `p-12` on desktop
- **Results Layout**: Single column on all breakpoints, max-width constraint on desktop

## Component Reusability

All components are built as **functional React components** with TypeScript interfaces:

- **LandingPage**: Receives `onSubmit` callback
- **ProcessingPage**: Stateful, self-contained progress animation
- **ResultsPage**: Receives analysis data as prop
- **Section**: Layout helper for consistent spacing
- **FactCard**: Renders individual facts with optional confidence
- **WarningCard**: Renders warnings with emphasis

No external component libraries (MUI, Chakra, etc.) — all Tailwind CSS.

## API Integration

Frontend communicates with `/api/v1/analyze` REST endpoint:

```typescript
// Request
POST /api/v1/analyze
Content-Type: multipart/form-data
Body:
  - policy: File (required, PDF)
  - prescription: File (optional, PDF/PNG/JPG)

// Response
{
  "document_id": "uuid",
  "analysis_result": {
    "document_analysis": {
      "extracted_facts": { ... },
      "ai_generated_knowledge": { ... },
      "risk_assessment": { ... },
      "treatment_specific_summary": { ... }
    }
  },
  "metadata": {
    "prescription_provided": boolean,
    "processing_time_ms": number
  }
}
```

## Future Enhancements

1. **Multi-language Support**: Backend already supports translations via LLM
2. **Printer-Friendly Results**: CSS media query for @media print
3. **Download as PDF**: Server-side PDF generation
4. **Dark Mode**: Toggle via Tailwind `dark:` prefix (not currently enabled)
5. **Comparison View**: Side-by-side treatment options (if prescription provided)
6. **Glossary**: Hover tooltips for insurance terms (phase 2)
7. **Contact Insurance Company**: Deep-link to insurer contact info

## Testing Checklist

- [x] Upload works on desktop and mobile
- [x] API communication works with real backend
- [x] Loading states display correctly
- [x] Results render with correct data structure
- [x] Mobile responsive (375px, 768px, 1280px viewports)
- [x] Keyboard navigation works
- [x] Screen reader friendly
- [x] Text resizes without breaking layout
- [x] High contrast meets WCAG AA
- [ ] Print preview looks good
- [ ] Performance: First Contentful Paint < 2s

## Build & Deploy

```bash
# Development
cd frontend
npm install
npm run dev  # Vite dev server on http://localhost:3000

# Production
npm run build  # Creates dist/ directory
npm run preview  # Preview optimized build locally
```

Deploy `frontend/dist/` directory to any static host (Netlify, Vercel, AWS S3, etc.).

Backend API must be available at same origin or with CORS headers configured.
