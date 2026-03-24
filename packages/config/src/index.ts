import type { AppConfig } from "@voice-dictation/shared";

export const DEFAULT_CONFIG: AppConfig = {
  hotkey: "Super+Shift+D",
  dictationMode: "push-to-talk",
  selectedMic: null,
  insertionStrategy: "auto",
  asrEngine: "whisper-cpp",
  logLevel: "info",
};

export function mergeConfig(
  saved: Partial<AppConfig>,
): AppConfig {
  return { ...DEFAULT_CONFIG, ...saved };
}
