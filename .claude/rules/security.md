# Security Rules

## No-Auth Local Baseline
- The app must run without authentication for core functionality
- Auth is an optional enhancement; never gate basic voice interaction behind sign-in
- When auth env vars are missing, middleware must pass through without redirecting to login
- API routes must work without session verification when auth is not configured

## Secrets
- API keys (OPENAI_API_KEY, MISTRAL_API_KEY, GOOGLE_CLOUD_CREDENTIALS) are server-side only
- Never import or reference `process.env.*_KEY` in client components
- Never log full API keys; truncate to first 4 chars if debugging
- Never commit `.env`, `.env.local`, or credential JSON files
- When API keys are missing, the corresponding provider must be disabled gracefully, not crash

## Input Validation
- All API routes must validate request body before processing
- Reject oversized audio uploads (set a reasonable max, e.g. 10MB)
- Sanitize user input before passing to LLM prompts (prevent prompt injection where feasible)

## Auth Boundary (When Enabled)
- Middleware enforces auth on all routes except explicit allow-list
- API routes should verify session when handling sensitive operations
- Never trust client-side auth state for authorization decisions

## Dependencies
- Review new dependencies for known vulnerabilities before adding
- Prefer packages with active maintenance and no critical CVEs
- Run `npm audit` periodically; fix critical/high severity issues

## Error Handling
- Never expose stack traces to the client in production
- API error responses must use generic messages; log details server-side
- Google Cloud credential parsing errors must not leak credential content

## Logging
- Log enough to debug issues, never enough to reconstruct secrets
- Do not log full request/response bodies containing user audio or credentials
