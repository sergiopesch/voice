export type InsertionStrategy = "auto" | "clipboard" | "type-simulation";

export interface AppConfig {
  hotkey: string;
  selectedMic: string | null;
  insertionStrategy: InsertionStrategy;
}

export interface PlatformInfo {
  os: string;
  arch: string;
  sessionType: string;
  desktop: string;
}

export type DictationStatus = "idle" | "recording" | "processing" | "error";
