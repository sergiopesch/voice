// Shared types for Voice Dictation

export type DictationMode = "push-to-talk" | "toggle";

export type InsertionStrategy = "auto" | "clipboard" | "type-simulation";

export type AsrEngine = "whisper-cpp" | "faster-whisper" | "sherpa-onnx";

export type LogLevel = "error" | "warn" | "info" | "debug";

export interface AppConfig {
  hotkey: string;
  dictationMode: DictationMode;
  selectedMic: string | null;
  insertionStrategy: InsertionStrategy;
  asrEngine: AsrEngine;
  logLevel: LogLevel;
}

export interface PlatformInfo {
  os: string;
  arch: string;
  sessionType: string;
  desktop: string;
}

export type DictationStatus = "idle" | "recording" | "processing" | "error";

export interface AudioDevice {
  deviceId: string;
  label: string;
}

export interface TranscriptEvent {
  type: "partial" | "final";
  text: string;
  timestamp: number;
}
