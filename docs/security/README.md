# Security

## Design Principle: Local-First, Zero-Auth
The app runs entirely locally with no authentication, no cloud accounts, and no network calls in default operation.

## Threat Model

### Assets
- User audio data (transient, not persisted beyond current session)
- User configuration (stored locally)
- ASR model files (stored locally)

### Attack Surface
- Tauri IPC commands (frontend -> Rust)
- Audio capture (WebView getUserMedia)
- Text insertion into target applications
- ASR model loading (local files)

## Current Protections
- **No network**: Default operation makes zero network calls
- **No auth**: No credentials to steal
- **Tauri CSP**: Restrictive content security policy, no remote scripts
- **Input validation**: Tauri commands validate arguments on Rust side
- **Local storage only**: Config in XDG/Library dirs, no cloud sync

## Data Storage Locations
| Data | Linux | macOS |
|------|-------|-------|
| Config | `~/.config/voice/config.json` | `~/Library/Application Support/Voice/config.json` |
| Logs | `~/.local/share/voice/logs/` | `~/Library/Logs/Voice/` |
| Models | `~/.local/share/voice/models/` | `~/Library/Application Support/Voice/models/` |

## Privacy
- Audio is processed locally and never sent to external services
- No telemetry, analytics, or crash reporting by default
- Transcripts are not persisted (in-memory only)
- Config contains only user preferences, no PII

## Permissions Required
| Permission | Purpose | Platform |
|-----------|---------|----------|
| Microphone | Audio capture for dictation | Both |
| Accessibility | Text insertion into apps | macOS only |
| File system | Config and model storage | Both |

## Known Gaps
- [ ] Tauri command input validation not yet comprehensive
- [ ] No model file integrity verification
- [ ] Text insertion could interact with sensitive input fields
