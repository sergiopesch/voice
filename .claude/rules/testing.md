# Testing Rules

## Philosophy
- Test-first where the behavior is well-defined
- Narrow tests first (unit), broad tests second (integration, E2E)
- Never claim a feature is complete without validation

## Unit Tests
- Test pure functions and utility logic directly
- Test Zustand store actions in isolation
- Mock external APIs (OpenAI, Mistral, Google Cloud) at the fetch boundary

## Integration Tests
- Test API routes with mocked provider clients
- Test middleware auth logic with mock Supabase sessions
- Test the voice interaction hook with mock MediaRecorder and SpeechRecognition

## E2E Tests
- Use Playwright when E2E coverage is added
- Test the full voice loop: record -> transcribe -> chat -> speak
- Test auth flow: login -> session -> protected route

## Validation
- `npm run build` must pass before any merge
- `npm run lint` must pass with zero warnings in changed files
- No skipped or `.only` tests in committed code
