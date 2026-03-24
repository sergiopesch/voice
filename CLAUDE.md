# Voice AI - Claude Code Project Instructions

## Purpose
Local-first, real-time voice interaction app. Users speak, the app transcribes, sends to an LLM, and plays back the response. Must work without sign-in or cloud accounts for the core experience.

## Product Baseline
- The app must be installable and runnable locally without authentication
- Core voice loop (record -> transcribe -> LLM -> speak) must work offline-capable or with local models as a goal
- Cloud providers (OpenAI, Mistral, Google Cloud) are optional enhancements, not requirements
- No sign-in gate for basic functionality

## Stack
- **Framework**: Next.js 15 (App Router, Turbopack dev)
- **Language**: TypeScript 5
- **UI**: React 19, Tailwind CSS, Headless UI, Framer Motion
- **State**: Zustand
- **Auth**: Supabase (optional; Google + Twitter OAuth)
- **ASR**: Web Speech API (client), Google Cloud Speech-to-Text (server, optional)
- **LLM**: OpenAI, Mistral AI, Google Gemini (all optional; local model support planned)
- **TTS**: Google Cloud Text-to-Speech (optional), browser SpeechSynthesis fallback

## Core Commands
```bash
npm run dev      # Start dev server (Turbopack)
npm run build    # Production build
npm run start    # Serve production build
npm run lint     # ESLint
```

## Architecture
```
src/
  app/            # Next.js App Router pages + API routes
    api/chat/     # LLM proxy (OpenAI, Mistral)
    api/transcribe/   # Google Cloud STT (optional)
    api/text-to-speech/ # Google Cloud TTS (optional)
    auth/callback/    # Supabase OAuth callback (optional)
    login/        # Login page (optional)
    account/      # Account page (optional)
  components/     # React UI components
  hooks/          # useVoiceInteraction (core voice loop)
  store/          # Zustand store
  types/          # TypeScript types
  middleware.ts   # Auth guard (optional; bypass when no auth configured)
```

## Coding Conventions
- Functional React components only
- `'use client'` directive where needed
- Zustand for global state; no prop drilling for shared state
- API routes return `NextResponse.json()` with proper status codes
- Tailwind utility classes; no CSS modules
- Path aliases via `@/` prefix

## Testing Expectations
- No test suite exists yet. When adding tests:
  - Use Vitest for unit/integration tests
  - Use Playwright for E2E tests
  - Test API routes with mock providers
  - Test hooks with renderHook

## Documentation
- Keep README.md in sync with actual capabilities
- Document architectural decisions in `docs/decisions/`
- Security-sensitive changes require a note in `docs/security/`
- Platform-specific behavior documented in `docs/platform/`

## Security Constraints
- API keys are server-side only (never exposed to client)
- All API routes must validate input
- Never log full API keys or credentials
- Never commit `.env`, `.env.local`, or credential files
- Auth is optional; the app must not require it for core functionality
- When auth is disabled, skip middleware session checks gracefully

## Platform Cautions
- **Linux**: Web Speech API requires Chromium; mic needs PulseAudio/PipeWire; test Wayland + X11
- **macOS**: Mic permission dialog required; builds need code signing + notarization for distribution
- Both platforms: handle `getUserMedia` permission errors with user-friendly guidance

## Completion Checklist
- [ ] App runs locally with `npm run dev` without any env vars or auth
- [ ] Voice loop works with browser-native APIs (Web Speech API + SpeechSynthesis)
- [ ] Cloud providers degrade gracefully when API keys are missing
- [ ] Build passes (`npm run build`)
- [ ] Lint passes (`npm run lint`)
- [ ] No secrets in client bundle
- [ ] Docs reflect actual state
