# Documentation Rules

## Living Documentation
- Docs must evolve with implementation; stale docs are worse than no docs
- Update README.md when features are added/removed/changed
- Architecture docs must reflect actual module boundaries

## What Must Be Documented
- API route contracts (request/response shapes)
- Environment variable requirements and formats
- Architectural decisions and their rationale (in `docs/decisions/`)
- Security-sensitive design choices (in `docs/security/`)
- Known limitations and browser compatibility

## Format
- Use Markdown for all docs
- Keep docs concise and scannable
- Use code blocks for examples
- Link to source files where helpful

## No Drift
- If code changes make a doc inaccurate, fix the doc in the same PR
- CI should eventually validate that critical docs are up-to-date
