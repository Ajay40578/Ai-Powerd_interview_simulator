# InterviewAI — Your Personal AI Interview Coach

Practice Smarter. Interview Better. Get Hired.

InterviewAI is a full-stack, AI-powered mock interview simulator built with React, TypeScript, Tailwind CSS, Express, and Google's official Gemini 3.8 Flash SDK. It provides personalized interview simulations, adaptive follow-up questioning, multi-dimensional rubric scoring, communication feedback, resume analysis, a curated question bank, and custom learning roadmaps.

---

## Key Features

1. **Dual Engine Support (Live AI & Deterministic Demo Mode)**:
   - **Live Gemini 3.8 Flash**: Server-side AI questions and evaluations with structured JSON responses.
   - **Deterministic Demo Mode**: Fully functional offline/zero-API-key mode featuring an honest, keyword- and structure-aware evaluation engine with adaptive follow-ups.

2. **Core Interview Room**:
   - 13 interview domains (Technical, Coding, DSA, SQL/DBMS, HR/Behavioral, Frontend, Backend, AI/ML, etc.).
   - Multi-modal answers: Accessible text editor with word counter, Web Speech API voice recording with live transcript editing, and a syntax-enabled code editor with language selector.
   - Live timer with Pause & Resume controls.
   - In-between answer evaluation breakdown and adaptive branching based on candidate performance.
   - Single-submission locks and draft preservation.

3. **Transparent Scoring & Readiness**:
   - Category-weighted rubric (Relevance, Correctness, Depth, Clarity, Reasoning).
   - Normalized scoring when specific dimensions are not assessed.
   - Holistic interview readiness calculated across multiple sessions (requires at least 2 sessions).

4. **Resume Analyzer**:
   - Upload or paste resume text.
   - Identifies candidate skills, experience level, formatting critique, and gaps.
   - Generates 5 custom interview questions based directly on the resume with 1-click launch.

5. **Curated Question Bank**:
   - 60+ categorized practice questions across Python, DSA, SQL, React, AI/ML, and Behavioral.
   - Hints, expandable model answers, bookmarking, and completion tracking.

6. **Performance Analytics & Learning Roadmap**:
   - Chronological score trajectory line chart.
   - Category and skill breakdown with weak areas alerts.
   - Side-by-side session comparison.
   - Priority-based study tasks generated directly from interview mistakes.

7. **Data Persistence & Portability**:
   - Local persistence with schema versioning.
   - One-click JSON export and import for full data backups.

---

## Technology Architecture

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React, Motion.
- **Backend**: Express on Node.js / `tsx` mounted with Vite middlewares in development.
- **AI Integration**: Official `@google/genai` TypeScript SDK (`gemini-3.8-flash`) executed server-side.
- **Persistence**: Authoritative service layer with local persistence and cross-component custom events.

---

## Setup & Running

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
# GEMINI_API_KEY: Optional for Demo Mode; required for live AI responses
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Automated Test Suite
```bash
npm run test
```

### 5. Build for Production
```bash
npm run build
npm start
```
