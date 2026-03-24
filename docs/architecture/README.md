# Architecture

## Overview

Voice is a free, local-first desktop dictation app built with Tauri 2.

```
User speaks -> Audio Capture -> Local ASR -> Text Insertion
```

## Module Layout

```
apps/desktop/           Tauri application
  src/                  React + TypeScript frontend (Vite)
  src-tauri/            Rust backend
    src/lib.rs          App setup, hotkey registration, commands
    src/tray.rs         System tray icon and menu
    src/transcribe.rs   whisper.cpp integration via whisper-rs
    src/insertion.rs    Text insertion (ydotool/xdotool/clipboard)
    src/config.rs       Settings persistence
```

## Data Flow

1. **Audio Capture**: WebView `getUserMedia` -> ScriptProcessorNode -> Float32Array samples
2. **ASR**: Samples sent to Rust via Tauri invoke -> whisper-rs -> transcript string
3. **Insertion**: Transcript -> ydotool/xdotool type simulation or clipboard paste

## Tauri IPC Boundary

- Frontend -> Rust: `invoke("command_name", { args })` for config, platform info, transcription, insertion
- Rust -> Frontend: `window.eval()` for toggle trigger from global hotkey
- Audio capture stays in WebView (Web APIs are sufficient and simpler)

## Platform Strategy

| Concern | Linux | macOS |
|---------|-------|-------|
| Audio | PulseAudio/PipeWire via WebView | CoreAudio via WebView |
| ASR | whisper.cpp via whisper-rs | whisper.cpp via whisper-rs |
| Insertion (primary) | xdotool (X11) / ydotool (Wayland) | Accessibility API |
| Insertion (fallback) | Clipboard paste | Clipboard paste |
| Config storage | XDG_CONFIG_HOME | ~/Library/Application Support |
| Packaging | .deb, .rpm, AppImage | .dmg (signed + notarized) |

## Key Decisions

- **Tauri over Electron**: Smaller binary, lower memory, better for utility app
- **Local ASR over cloud**: Privacy-first, no account needed, works offline
- **Tray-only UX**: No visible window, app runs from system tray
- **WebView audio capture**: Simpler than native audio bindings, sufficient for dictation
