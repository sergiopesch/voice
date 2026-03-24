# Desktop Platform Integration Review

## When to Use
Invoke when changes touch audio capture, browser APIs, desktop integration, file system paths, packaging configuration, or platform-specific permission handling.

## What It Does
Reviews code for Linux and macOS compatibility issues including:
- Web Speech API browser requirements (Chromium on Linux, Safari/Chrome on macOS)
- Audio subsystem compatibility (PulseAudio/PipeWire on Linux, CoreAudio on macOS)
- Wayland vs X11 behavioral differences on Linux
- macOS microphone permission dialogs and Gatekeeper/notarization
- Sandbox permission models (Flatpak/Snap on Linux, App Sandbox on macOS)
- Platform-appropriate file path conventions
- No-auth local operation on both platforms

## Review Checklist
1. Does the code assume a specific audio backend or platform?
2. Are browser API fallbacks provided for non-Chromium browsers?
3. Are file paths handled with platform abstraction (XDG vs ~/Library)?
4. Are permission errors handled gracefully with platform-specific user guidance?
5. Does the code work under Wayland compositor restrictions?
6. Does the code handle macOS microphone permission denial?
7. Does the app start and function without any env vars or sign-in?

## Output
Structured findings with severity (blocker / warning / note), platform tag, and file:line references.
