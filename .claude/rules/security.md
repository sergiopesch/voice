# Security Rules

## Local-First, No-Auth Design
- The app must run without any authentication, always
- No network calls in default operation
- No telemetry by default
- No hidden data transfer
- If optional remote features are ever added, they must be explicit and opt-in

## No Casual Secret Access
- The app must not require reading user secrets or shell configs
- No cloud credentials, API keys, or backend accounts for core functionality
- Never commit `.env`, `.env.local`, or credential files

## Least Privilege
- Request only: microphone access, local file storage, input insertion
- macOS accessibility permissions only when strictly required and clearly documented
- Tauri CSP must be restrictive: no remote script loading in default config

## Safe Local Storage
- Config: XDG config dir on Linux, ~/Library/Application Support on macOS
- Logs: XDG data dir on Linux, ~/Library/Logs on macOS
- Models: documented location, user-controllable
- Document retention behavior for all stored data

## Input Validation
- Validate all Tauri command arguments on the Rust side
- Sanitize text before insertion into target applications
- Reject oversized audio data

## Error Handling
- Never expose stack traces to the UI in production
- Error messages must be user-readable
- Log details to structured log, not to UI

## Dependencies
- Review new dependencies for known vulnerabilities before adding
- Prefer packages with active maintenance and no critical CVEs
- Run `npm audit` and `cargo audit` periodically
- Each significant dependency must be justified in dependency-policy.md

## Logging
- No noisy logging
- Never log audio content or full file paths containing user data
- Structured logs for local diagnosis only
