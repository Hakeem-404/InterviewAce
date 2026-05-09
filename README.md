![Status](https://img.shields.io/badge/status-active-success)
![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20Vite-61dafb)
![Backend](https://img.shields.io/badge/backend-Supabase-3ecf8e)
![AI](https://img.shields.io/badge/AI-Claude%20%2B%20ElevenLabs-blueviolet)

InterviewAce is an AI-powered interview preparation platform. It helps users upload a CV and job description, generate tailored interview questions, practice answers (text or voice), receive AI feedback, and review progress across sessions.

## Demo-Focused Overview

InterviewAce is built to simulate realistic interview preparation with fast, personalized feedback loops:

- Personalized questions from your CV + target role
- Voice-first practice with selectable AI interviewer voices
- Detailed per-answer scoring, strengths, and growth opportunities
- Session history and progression analytics over time

### 2-Minute Product Demo Flow

1. **Upload** CV + job description on `Upload` page
2. **Analyze** fit and generate tailored questions
3. **Practice** answers in text or voice mode
4. **Evaluate** each answer with AI feedback
5. **Review** final scorecard, insights, and history

## Tech Stack

- `React` + `Vite` + `TypeScript`
- `Tailwind CSS` for styling
- `Supabase` for auth, data storage, and Edge Functions
- `Claude` (via Supabase Edge Functions) for document analysis and feedback
- `ElevenLabs` (optional) for enhanced voice playback

## Core Features

- CV upload and parsing (`PDF`, `DOCX`, `DOC`, `TXT`)
- Job description analysis against CV
- Personalized interview question generation
- Configurable interview sessions (question type/difficulty mix)
- Per-question AI answer evaluation and coaching feedback
- Session scoring, summary analytics, and interview history
- Voice mode:
  - Speech input support
  - Question read-aloud
  - Enhanced voices via ElevenLabs (with Web Speech fallback)

## Project Structure

```text
src/
  components/        # Reusable UI, interview/voice/auth/profile components
  context/           # App + auth state providers
  pages/             # Main flow pages (upload, analysis, interview, results)
  services/          # API, session analytics, file processing, voice
  lib/               # Supabase client bootstrap
supabase/
  functions/         # Edge Functions (analyze, generate, evaluate)
  migrations/        # DB schema migrations
```

## Prerequisites

- Node.js 18+
- npm
- A Supabase project
- (Optional) ElevenLabs API key for premium TTS voices
- (Optional) Claude API key configured in Supabase Edge Functions for live AI (otherwise mock responses are returned by functions)

## Environment Variables

Create a `.env` file in the project root:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: enable enhanced voice mode
VITE_ELEVEN_LABS_API_KEY=your_elevenlabs_api_key
VITE_ELEVEN_LABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
```

> Note: `CLAUDE_API_KEY` is used by Supabase Edge Functions and should be set as a Supabase secret, not a frontend `VITE_` variable.

## Local Development

Install dependencies:

```bash
npm install
```

Start the app:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview build:

```bash
npm run preview
```

Lint:

```bash
npm run lint
```

## Supabase Setup

### 1) Link/initialize Supabase project

Set up Supabase for this repository (local or hosted project).

### 2) Apply migrations

Run the SQL migrations in `supabase/migrations` to create required tables and policies.

### 3) Deploy Edge Functions

Deploy the functions in `supabase/functions`:

- `analyze-documents`
- `generate-questions`
- `generate-configured-questions`
- `evaluate-answer`
- `evaluate-response`

### 4) Set function secrets

Configure required secrets in Supabase:

- `CLAUDE_API_KEY` (recommended for real AI responses)

If `CLAUDE_API_KEY` is missing, functions return built-in mock data so the UI flow can still be tested.

## Typical User Flow

1. Sign up/sign in
2. Upload CV + paste job description
3. Run AI analysis and generate tailored questions
4. Practice answers (text or voice)
5. Request AI feedback per answer
6. Review session score, insights, and history

## Notes

- Voice features gracefully fallback to browser Web Speech API if ElevenLabs is not configured.
- Session data is persisted with localStorage/sessionStorage fallbacks when remote persistence fails.
- This repository includes some subscription-related migration tables, but billing workflows are not fully wired in the current frontend flow.

## Scripts

- `npm run dev` - start development server
- `npm run build` - production build
- `npm run preview` - preview production build
- `npm run lint` - run ESLint

## Open Source

### Contributing

Contributions are welcome. A typical contribution flow:

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-change`
3. Commit your changes with clear messages
4. Run checks locally (`npm run lint`, `npm run build`)
5. Open a pull request with context, screenshots (if UI), and test notes

### Suggested PR Template

```md
## What changed
- ...

## Why
- ...

## How to test
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] Manual flow tested (`/upload` -> `/analysis` -> `/interview` -> `/results`)
```

### Roadmap

- [ ] Add automated unit/integration tests
- [ ] Complete billing/subscription UI and Stripe integration
- [ ] Add interview-specific model selection and prompt tuning
- [ ] Export richer session reports (PDF)
- [ ] Improve accessibility and keyboard-only interview flow

### Code of Conduct

Please be respectful and constructive in issues and pull requests. If you adopt this publicly, add a dedicated `CODE_OF_CONDUCT.md`.

## License

No license file is currently included in this repository.
