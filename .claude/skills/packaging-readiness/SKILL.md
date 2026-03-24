# Packaging Readiness Review

## When to Use
Invoke before attempting to package the app for distribution (desktop, container, or platform deployment).

## What It Does
Evaluates whether the project is ready for packaging:
- Build succeeds cleanly
- No hardcoded localhost URLs in production paths
- Environment variables are documented and required ones validated at startup
- Static assets are properly referenced
- No development-only code in production bundle

## Review Checklist
1. Does `npm run build` complete without errors?
2. Are all required env vars documented in README?
3. Is there a `.env.example` file?
4. Are API endpoints relative (not hardcoded to localhost)?
5. Is the Next.js output configuration appropriate for the target?
6. Are development dependencies excluded from production?

## Output
Readiness status (ready / blocked / needs work) with specific items to address.
