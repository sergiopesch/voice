# Testing

## Current State
No test suite exists yet. This document outlines the planned testing strategy.

## Planned Stack
- **Unit/Integration**: Vitest + React Testing Library
- **E2E**: Playwright
- **API Mocking**: msw (Mock Service Worker) for external API calls

## Priority Test Targets

### High Priority
1. **API Routes** (`src/app/api/*/route.ts`)
   - Mock OpenAI, Mistral, Google Cloud clients
   - Test input validation (missing fields, empty bodies)
   - Test error handling (API failures, invalid credentials)
   - Test response format consistency

2. **Voice Interaction Hook** (`src/hooks/useVoiceInteraction.ts`)
   - Mock MediaRecorder, SpeechRecognition, fetch
   - Test state transitions (idle -> listening -> processing -> responding)
   - Test silence detection and auto-processing
   - Test error recovery

### Medium Priority
3. **Auth Middleware** (`src/middleware.ts`)
   - Mock Supabase session
   - Test redirect logic for authenticated/unauthenticated users
   - Test env var validation

4. **Zustand Store** (`src/store/useStore.ts`)
   - Test all actions produce correct state

### Low Priority
5. **Components** - Visual/interaction testing via Playwright

## Setup Required
- Install: `npm install -D vitest @testing-library/react jsdom msw`
- Add `vitest.config.ts`
- Add `test` script to `package.json`
