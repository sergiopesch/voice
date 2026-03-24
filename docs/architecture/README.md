# Architecture

## Overview

Voice Dictation is a free, local-first desktop dictation app built with Tauri 2.

```
User speaks -> Audio Capture -> Local ASR -> Formatting -> Text Insertion
```

## Module Layout

```
apps/desktop/           Tauri application
  src/                  React + TypeScript frontend (Vite)
  src-tauri/            Rust backend (config, platform, ASR sidecar)

packages/shared/        Shared types across all packages
packages/audio/         Microphone enumeration, capture, buffering
packages/asr/           ASR engine abstraction (whisper.cpp, etc.)
packages/insertion/     Platform-specific text insertion
packages/formatting/    Transcript cleanup and punctuation
packages/config/        Typed configuration with defaults
packages/logging/       Structured logging
```

## Data Flow

1. **Audio Capture** (packages/audio): WebView `getUserMedia` -> MediaRecorder -> audio blob
2. **ASR** (packages/asr): Audio blob -> local engine (via Tauri sidecar) -> transcript events
3. **Formatting** (packages/formatting): Raw transcript -> cleaned text
4. **Insertion** (packages/insertion): Text -> platform-specific insertion into active app

## Tauri IPC Boundary

- Frontend -> Rust: `invoke("command_name", { args })` for config, platform info, ASR control
- Rust -> Frontend: Tauri events for transcript updates, status changes
- Audio capture stays in WebView (Web APIs are sufficient and simpler)

## Platform Strategy

| Concern | Linux | macOS |
|---------|-------|-------|
| Audio | PulseAudio/PipeWire via WebView | CoreAudio via WebView |
| ASR | whisper.cpp sidecar | whisper.cpp sidecar |
| Insertion (primary) | xdotool (X11) / wtype (Wayland) | Accessibility API |
| Insertion (fallback) | Clipboard paste | Clipboard paste |
| Config storage | XDG_CONFIG_HOME | ~/Library/Application Support |
| Packaging | AppImage, .deb, Flatpak | .dmg (signed + notarized) |

## Key Decisions

- **Tauri over Electron**: Smaller binary, lower memory, better for utility app
- **Local ASR over cloud**: Privacy-first, no account needed, works offline
- **Monorepo with packages**: Clean module boundaries, testable in isolation
- **WebView audio capture**: Simpler than native audio bindings, sufficient for dictation
