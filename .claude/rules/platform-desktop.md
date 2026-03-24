# Desktop Platform Rules (Linux + macOS)

## General
- Target both Linux and macOS as first-class desktop platforms
- The app must be installable and runnable locally without sign-in or backend dependency for the core experience
- Use POSIX paths; never assume Windows path separators

## Linux

### Browser / Runtime
- Web Speech API requires Chromium-based browsers (Chrome, Edge, Brave)
- Firefox does not support Web Speech API; detect and show a clear message
- Test with both Chromium and Firefox; gracefully degrade on Firefox

### Audio
- Microphone access depends on PulseAudio or PipeWire
- Flatpak/Snap browsers may need portal permissions for mic access
- Always handle `NotAllowedError` and `NotFoundError` from `getUserMedia`

### Display Server
- Test on both Wayland and X11 when packaging as desktop app
- Clipboard and screen-sharing APIs behave differently under Wayland

### Packaging
- Target formats: .deb, .rpm, AppImage, Flatpak
- Account for audio subsystem sandboxing in Flatpak/Snap
- Use libsecret or equivalent for credential storage
- Electron/Tauri must declare audio device permissions
- Respect XDG directory conventions for config/data/cache

## macOS

### Microphone & Accessibility
- macOS requires explicit microphone permission via system dialog
- The app must handle `NotAllowedError` gracefully with a prompt guiding the user to System Settings > Privacy & Security > Microphone
- Accessibility permissions may be needed for global hotkeys

### Audio
- CoreAudio is the audio backend; no PulseAudio/PipeWire concerns
- Audio session category must be set correctly in native wrappers (Electron/Tauri)

### Code Signing & Notarization
- macOS builds must be signed and notarized for distribution outside the App Store
- Unsigned apps trigger Gatekeeper warnings that block most users
- Plan for Apple Developer ID certificate in packaging pipeline

### Packaging
- Target formats: .dmg, .pkg, or Homebrew cask
- Electron/Tauri must declare `NSMicrophoneUsageDescription` in Info.plist
- Universal binary (arm64 + x86_64) preferred for broad compatibility

### Paths
- Use `~/Library/Application Support/<AppName>` for app data
- Use `~/Library/Caches/<AppName>` for cache
- Never write to `/Applications` programmatically; let the user drag-install

## Cross-Platform
- Abstract platform-specific paths behind a utility (XDG on Linux, Library dirs on macOS)
- Test mic permission flows on both platforms
- Never hard-code platform assumptions; use runtime detection
