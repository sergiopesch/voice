# Testing

## Current State
No test suite exists yet. This document outlines the planned testing strategy.

## Planned Stack
- **Unit/Integration**: Vitest
- **E2E**: Playwright (or Tauri's WebDriver support)
- **Rust**: cargo test for backend logic

## Priority Test Targets

### High Priority
1. **packages/formatting** — Pure functions, easy to test
2. **packages/config** — Config merging and defaults
3. **packages/logging** — Log level filtering
4. **Rust config** (src-tauri/src/config.rs) — Serialize/deserialize, default creation

### Medium Priority
5. **packages/audio** — Mock getUserMedia, test capture lifecycle
6. **packages/asr** — Mock ASR backends, test interface contract
7. **Zustand store** — Test all actions produce correct state

### Lower Priority (system boundaries)
8. **packages/insertion** — Requires mocking platform APIs
9. **E2E dictation flow** — Requires mic + ASR + insertion mocks

## Difficult-to-Automate Boundaries
For system-level features that are hard to automate:
- Create manual verification scripts in `scripts/`
- Document expected behavior in test docs
- Use Tauri's mock runtime for IPC testing

## Setup Required
- Install: `npm install -D vitest`
- Add `vitest.config.ts` to apps/desktop
- Add `test` scripts to relevant packages
- Add `#[cfg(test)]` modules in Rust code
