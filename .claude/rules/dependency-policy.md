# Dependency Policy

## Principles
- Minimal dependency surface: every dependency must justify its inclusion
- Prefer stable, widely-used packages with active maintenance
- Prefer MIT/Apache-2.0 licensed packages
- No cloud SDKs in core — local-first by design

## Current Dependencies (Justified)

### Desktop App (apps/desktop)
| Package | Purpose | Justification |
|---------|---------|---------------|
| @tauri-apps/api | Desktop bridge | Tauri IPC for Rust backend communication |
| @tauri-apps/plugin-shell | Shell access | Open URLs, spawn processes |
| react/react-dom | UI | Lightweight UI framework for Tauri WebView |
| zustand | State | Lightweight, minimal API, no boilerplate |
| tailwindcss | Styling | Utility-first CSS |
| vite | Build | Fast dev server and bundler for Tauri frontend |

### Rust Backend (apps/desktop/src-tauri)
| Crate | Purpose | Justification |
|-------|---------|---------------|
| tauri | Desktop shell | Core desktop runtime |
| tauri-plugin-shell | Shell access | Process spawning for ASR sidecars |
| serde/serde_json | Serialization | Tauri command data exchange |
| dirs | Path resolution | XDG/macOS standard directory resolution |

## Adding Dependencies
- Check if the need can be met with existing deps or native APIs first
- Run `npm audit` after adding JS deps
- Run `cargo audit` after adding Rust crates
- Document the justification in this table
- Avoid packages with >5 transitive dependencies when a lighter alternative exists

## Removing Dependencies
- Remove unused dependencies promptly
- Check for imports before removing
