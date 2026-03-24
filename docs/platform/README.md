# Platform Support

## Supported Platforms
| Platform | Status | Notes |
|----------|--------|-------|
| Linux (Chromium) | Primary | Web Speech API requires Chromium-based browser |
| Linux (Firefox) | Degraded | No Web Speech API; voice input unavailable |
| macOS (Chrome) | Primary | Full support |
| macOS (Safari) | Partial | Web Speech API support varies by version |
| Windows | Untested | Not a target platform currently |

## Linux

### Requirements
- Chromium-based browser (Chrome, Edge, Brave) for voice input
- PulseAudio or PipeWire for microphone access
- No root privileges needed

### Known Issues
- Flatpak/Snap browsers may require portal permissions for microphone
- Wayland: clipboard and screen-sharing APIs behave differently than X11
- Some Wayland compositors may block background audio capture

### Packaging Targets
- AppImage (universal)
- .deb (Debian/Ubuntu)
- .rpm (Fedora/RHEL)
- Flatpak (sandboxed distribution)

## macOS

### Requirements
- Chrome or Safari for voice input
- macOS 12+ recommended
- Microphone permission must be granted via System Settings > Privacy & Security

### Known Issues
- Unsigned/un-notarized apps are blocked by Gatekeeper
- First-run microphone permission dialog is mandatory; cannot be bypassed
- Universal binary (arm64 + x86_64) needed for Intel + Apple Silicon

### Packaging Targets
- .dmg (drag-to-install)
- Homebrew cask (CLI install)
- .pkg (installer package)

## Cross-Platform Considerations
- File paths: use XDG conventions on Linux, `~/Library/` on macOS
- Audio: PulseAudio/PipeWire on Linux, CoreAudio on macOS
- Permissions: handle `getUserMedia` errors with platform-specific guidance
- The app must start and be usable with zero configuration on both platforms
