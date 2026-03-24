# Security

## Design Principle: No-Auth Local Baseline
The app must run without authentication or cloud accounts for the core voice interaction experience. Auth and cloud providers are optional enhancements.

## Threat Model

### Assets
- User audio data (transient, not persisted)
- API keys (OpenAI, Mistral, Google Cloud) when configured
- User sessions (Supabase auth tokens) when auth is enabled

### Attack Surface
- API routes (when cloud providers are configured)
- Client-side JavaScript
- LLM prompt injection via voice input (when LLM is connected)

## Current Protections
- **Server-side secrets**: API keys only in `process.env`, never in client bundle
- **Input validation**: API routes check for required fields and non-empty content
- **Credential parsing**: Google Cloud credentials validated at startup, not per-request
- **Auth middleware** (optional): When Supabase is configured, protects routes except `/login`, `/error`, `/auth/callback`

## No-Auth Mode
When Supabase env vars are not set:
- Middleware must pass through without redirecting to login
- All routes are accessible without session
- API routes work without session verification
- The app is fully functional with browser-native APIs only

## Known Gaps
- [ ] No rate limiting on API routes
- [ ] No audio upload size limit on `/api/transcribe`
- [ ] No prompt injection mitigation for LLM calls
- [ ] Error responses include stack traces (`error.stack`) in some routes
- [ ] `listVoices()` called on every TTS request (information leak + performance)
- [ ] No CSRF protection beyond Supabase session cookies
- [ ] Middleware crashes when Supabase env vars are missing (needs graceful bypass)

## Environment Variables
All optional. Set in `.env.local` (never committed):
- `OPENAI_API_KEY` — enables OpenAI models
- `MISTRAL_API_KEY` — enables Mistral models
- `GOOGLE_CLOUD_CREDENTIALS` (JSON string) — enables Google STT/TTS
- `GOOGLE_CLOUD_PROJECT_ID` — required with Google credentials
- `NEXT_PUBLIC_SUPABASE_URL` — enables auth
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — enables auth
