# Desktop Platform Rules (Linux + macOS)

## General
- Target both Linux and macOS as first-class desktop platforms
- The app must be installable and runnable locally without sign-in
- Use POSIX paths; never assume Windows path separators
- Abstract platform-specific paths behind a utility

## Tauri Desktop Shell
- Tauri 2 is the desktop runtime
- Rust backend handles: config persistence, platform detection, ASR sidecar management, text insertion
- WebView frontend handles: UI, audio capture via Web APIs, user interaction
- IPC via Tauri invoke commands with typed arguments

## Linux

### Session Awareness
- Detect X11 vs Wayland via XDG_SESSION_TYPE
- Adapt text insertion strategy based on session type
- Do not assume one insertion method works everywhere

### Audio
- Microphone access depends on PulseAudio or PipeWire
- Handle `NotAllowedError` and `NotFoundError` from `getUserMedia`
- Flatpak/Snap browsers may need portal permissions for mic access

### Desktop Environments
- Plan for GNOME, KDE, and common Wayland/X11 setups
- Document unsupported cases honestly

### Text Insertion
- X11: xdotool type simulation
- Wayland: wtype or compositor-specific path
- Fallback: clipboard-preserving paste

### Packaging
- Target formats: AppImage, .deb, Flatpak
- Account for audio subsystem sandboxing in Flatpak
- Respect XDG directory conventions for config/data/cache
- Tauri must declare audio device permissions

## macOS

### Permissions
- Microphone requires explicit system permission (NSMicrophoneUsageDescription in Info.plist)
- Accessibility permissions needed for text insertion
- Guide user to System Settings > Privacy & Security when denied

### Audio
- CoreAudio is the backend; no PulseAudio concerns

### Text Insertion
- Preferred: Accessibility API text insertion
- Fallback: AppleScript keystroke simulation
- Last resort: clipboard-preserving paste

### Code Signing & Notarization
- macOS builds must be signed and notarized for distribution
- Plan for Apple Developer ID certificate in packaging pipeline

### Packaging
- Target formats: .dmg
- Declare NSMicrophoneUsageDescription in Info.plist
- Universal binary (arm64 + x86_64) preferred

### Paths
- Use `~/Library/Application Support/Voice` for app data
- Use `~/Library/Caches/Voice` for cache
- Never write to `/Applications` programmatically

## Cross-Platform
- Runtime platform detection via Tauri's get_platform_info command
- Test mic permission flows on both platforms
- Never hard-code platform assumptions; use runtime detection
