# Architecture Decision Records

Document significant technical decisions here using the format below.

## Template

### ADR-NNN: Title
- **Date**: YYYY-MM-DD
- **Status**: proposed / accepted / deprecated / superseded
- **Context**: What prompted the decision
- **Decision**: What was decided
- **Consequences**: What follows from the decision

---

## Decisions

### ADR-001: Client-side speech recognition via Web Speech API
- **Date**: 2024 (initial commit)
- **Status**: accepted
- **Context**: Need real-time transcription with minimal latency
- **Decision**: Use browser Web Speech API for primary STT, with Google Cloud STT as server-side backup
- **Consequences**: Lower latency (no network round-trip for transcription), but limited to Chromium browsers on Linux. Firefox users cannot use voice input.

### ADR-002: Zustand for state management
- **Date**: 2024 (initial commit)
- **Status**: accepted
- **Context**: Need global state for user, model selection, voice state, and messages
- **Decision**: Use Zustand instead of Redux or React Context
- **Consequences**: Simpler API, smaller bundle, no provider wrapper needed. Sufficient for current app complexity.

### ADR-003: Google Cloud TTS with browser fallback
- **Date**: 2024 (initial commit)
- **Status**: accepted
- **Context**: Need high-quality voice output for AI responses
- **Decision**: Primary: Google Cloud Neural2 TTS. Fallback: browser SpeechSynthesis API.
- **Consequences**: High-quality output when Google Cloud is available. Graceful degradation when it's not. Adds Google Cloud dependency and cost.
