# Platform Support

## Supported Platforms
| Platform | Status | Notes |
|----------|--------|-------|
| Linux (X11) | Primary | xdotool for text insertion |
| Linux (Wayland) | Primary | wtype for text insertion, clipboard fallback |
| macOS (arm64) | Primary | Accessibility API for insertion |
| macOS (x86_64) | Primary | Same as arm64 |
| Windows | Not targeted | Not a current goal |

## Linux

### Requirements
- Tauri runtime dependencies: libwebkit2gtk-4.1, libgtk-3
- PulseAudio or PipeWire for microphone access
- xdotool (X11) or wtype (Wayland) for text insertion
- No root privileges needed

### Session Detection
The app detects session type via `XDG_SESSION_TYPE`:
- `x11` -> use xdotool for text insertion
- `wayland` -> use wtype or clipboard fallback
- Desktop environment detected via `XDG_CURRENT_DESKTOP`

### Known Limitations
- Wayland text insertion depends on compositor support
- Flatpak may require portal permissions for mic access
- Some Wayland compositors block simulated input

### Packaging Targets
- AppImage (universal, no deps)
- .deb (Debian/Ubuntu)
- Flatpak (sandboxed, needs audio portal)

## macOS

### Requirements
- macOS 10.15+
- Microphone permission (System Settings > Privacy & Security > Microphone)
- Accessibility permission for text insertion (System Settings > Privacy & Security > Accessibility)

### Known Limitations
- Unsigned apps blocked by Gatekeeper
- First-run permission dialogs cannot be bypassed
- Some apps may not accept simulated input

### Packaging Targets
- .dmg (signed + notarized)

## Cross-Platform
- Config paths: XDG on Linux, ~/Library/ on macOS (handled by Rust `dirs` crate)
- Audio: WebView getUserMedia works on both platforms
- The app starts and is usable with zero configuration on both platforms
