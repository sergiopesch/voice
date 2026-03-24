# Package for Linux

Evaluate and plan Linux desktop packaging.

## Steps
1. Assess current deployment target (Vercel web app)
2. Evaluate desktop packaging options:
   - Electron (heavy but mature)
   - Tauri (lighter, Rust-based)
   - PWA with service worker (lightest)
3. For each option, check:
   - Audio permission model (PulseAudio/PipeWire access)
   - Microphone access through sandbox
   - Web Speech API availability
   - Distribution format (.deb, .rpm, AppImage, Flatpak, Snap)
4. Identify blockers:
   - Web Speech API only works in Chromium
   - Google Cloud credentials management in desktop context
   - Auto-update mechanism
5. Recommend the most viable path with tradeoffs
