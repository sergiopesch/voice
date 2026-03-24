# Architecture

## Overview
Voice AI is a Next.js 15 local-first desktop voice interaction app. The core experience works entirely with browser-native APIs and no backend dependencies.

## Voice Interaction Loop

### Local-only (no env vars needed)
```
User speaks -> Web Speech API (client STT) -> Transcription displayed
           -> Silence detected (2s) -> Browser SpeechSynthesis (echo/placeholder)
```

### With cloud providers configured
```
User speaks -> Web Speech API (client STT) -> Transcription displayed
           -> Silence detected (2s) -> /api/chat (LLM) -> AI response
           -> /api/text-to-speech (Google TTS) -> Audio playback
           -> Fallback: browser SpeechSynthesis if Google TTS fails
```

## Module Boundaries

### Client
- **Components**: UI rendering (VoiceButton, ModelPanel, Transcription, etc.)
- **Hooks**: `useVoiceInteraction` owns the voice capture/processing state machine
- **Store**: Zustand store holds global state (user, model, voice state, messages)

### Server (optional, activated by env vars)
- **API Routes**: Stateless handlers that proxy to external AI services
- **Middleware**: Auth guard using Supabase session verification (only when configured)

### External Services (all optional)
- **Supabase**: Authentication (Google/Twitter OAuth)
- **OpenAI**: GPT-4, GPT-3.5 Turbo chat completions
- **Mistral AI**: Mistral Large/Medium/Small chat
- **Google Cloud**: Speech-to-Text (server), Text-to-Speech Neural2

## Key Design Decisions
- Local-first: core experience requires zero configuration
- Client-side STT via Web Speech API (lower latency than server round-trip)
- Server-side TTS via Google Cloud (higher quality, optional upgrade over browser synthesis)
- Zustand over Redux (simpler API, sufficient for this app's state complexity)
- No message persistence (in-memory only, cleared on refresh)
- Auth is opt-in, not opt-out

## Platform Targets
- **Linux**: Chromium-based browsers (Web Speech API requirement), PulseAudio/PipeWire for mic
- **macOS**: Chrome or Safari, CoreAudio, mic permission via system dialog
- **Desktop packaging**: Electron or Tauri (future)
