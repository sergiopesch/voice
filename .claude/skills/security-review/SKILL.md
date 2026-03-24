# Security Review

## When to Use
Invoke when changes touch API routes, authentication, credential handling, user input processing, or dependency changes.

## What It Does
Reviews code for security vulnerabilities and unsafe patterns:
- Secret exposure (API keys in client code, logs, or error messages)
- Input validation gaps in API routes
- Auth bypass possibilities
- Prompt injection vectors in LLM calls
- Dependency vulnerabilities
- Error information leakage

## Review Checklist
1. Are all API keys accessed only in server-side code?
2. Is user input validated before use?
3. Are error responses free of stack traces and internal details?
4. Are credentials never logged, even partially?
5. Does auth middleware cover the new route?
6. Are new dependencies free of known critical CVEs?

## Output
Findings categorized as critical / high / medium / low with remediation steps.
