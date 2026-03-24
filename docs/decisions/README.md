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

### ADR-001: Tauri over Electron for desktop shell
- **Date**: 2026-03-24
- **Status**: accepted
- **Context**: Need a desktop runtime for a utility dictation app targeting Linux and macOS
- **Decision**: Use Tauri 2 with Rust backend and WebView frontend
- **Consequences**: Smaller binary (~10MB vs ~150MB), lower memory footprint, Rust for performance-sensitive code. Trade-off: smaller ecosystem than Electron, WebView rendering differences across platforms.

### ADR-002: Local-first ASR over cloud transcription
- **Date**: 2026-03-24
- **Status**: accepted
- **Context**: Core product must be free and privacy-conscious, no accounts or subscriptions
- **Decision**: Use local ASR engines (whisper.cpp, faster-whisper, or sherpa-onnx) as the primary transcription path
- **Consequences**: No network dependency, no API costs, works offline. Trade-off: larger install size (model files), higher CPU usage, potentially lower accuracy than cloud ASR.

### ADR-003: Zustand for state management
- **Date**: 2026-03-24
- **Status**: accepted (carried from v1)
- **Context**: Need global state for dictation status, config, audio devices
- **Decision**: Use Zustand instead of Redux, Jotai, or React Context
- **Consequences**: Simple API, small bundle, no boilerplate. Sufficient for this app's complexity.

### ADR-004: Monorepo with npm workspaces
- **Date**: 2026-03-24
- **Status**: accepted
- **Context**: Need clean module boundaries between audio, ASR, insertion, formatting, config, and logging
- **Decision**: Use npm workspaces with packages/ directory and apps/desktop for the Tauri app
- **Consequences**: Each package is testable in isolation, clear dependency graph, future packages (e.g., optional cloud providers) slot in cleanly. Trade-off: slightly more complex build setup.

### ADR-005: WebView audio capture over native Rust audio
- **Date**: 2026-03-24
- **Status**: accepted
- **Context**: Need microphone capture for dictation; could use Web APIs or native Rust audio libs (cpal, etc.)
- **Decision**: Use WebView getUserMedia + MediaRecorder for audio capture
- **Consequences**: Simpler implementation, well-tested browser APIs, automatic device enumeration. Audio data is passed to Rust backend for ASR processing. Trade-off: limited to formats supported by MediaRecorder.
