import type { InsertionStrategy, PlatformInfo } from "@voice-dictation/shared";
import { createLogger } from "@voice-dictation/logging";

const log = createLogger("insertion");

export interface InsertionBackend {
  readonly strategy: InsertionStrategy;
  insert(text: string): Promise<void>;
  isAvailable(): Promise<boolean>;
}

// Insertion implementations will be added as separate files:
//
// Linux:
// - x11-xdotool.ts — xdotool type simulation for X11
// - wayland-wtype.ts — wtype for Wayland compositors
// - clipboard.ts — clipboard-preserving paste fallback
//
// macOS:
// - macos-accessibility.ts — Accessibility API text insertion
// - macos-applescript.ts — AppleScript keystroke simulation
// - clipboard.ts — clipboard-preserving paste fallback
//
// Each implements InsertionBackend.

export function selectInsertionStrategy(
  _platform: PlatformInfo,
  _preferred: InsertionStrategy,
): InsertionBackend {
  // TODO: Implement platform-aware strategy selection
  log.warn("Text insertion not yet implemented, returning clipboard stub");

  return {
    strategy: "clipboard",
    async insert(text: string) {
      await navigator.clipboard.writeText(text);
      log.info("Text copied to clipboard", { length: text.length });
    },
    async isAvailable() {
      return typeof navigator.clipboard?.writeText === "function";
    },
  };
}
