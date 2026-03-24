import { create } from "zustand";
import type {
  AppConfig,
  DictationStatus,
  AudioDevice,
  PlatformInfo,
} from "@/types";

interface AppState {
  // Dictation state
  status: DictationStatus;
  transcript: string;
  interimTranscript: string;
  error: string | null;

  // Audio
  audioDevices: AudioDevice[];
  selectedDeviceId: string | null;

  // Config
  config: AppConfig | null;

  // Platform
  platform: PlatformInfo | null;

  // UI
  view: "main" | "settings";

  // Actions
  setStatus: (status: DictationStatus) => void;
  setTranscript: (transcript: string) => void;
  setInterimTranscript: (interim: string) => void;
  setError: (error: string | null) => void;
  setAudioDevices: (devices: AudioDevice[]) => void;
  setSelectedDevice: (deviceId: string | null) => void;
  setConfig: (config: AppConfig) => void;
  setPlatform: (platform: PlatformInfo) => void;
  setView: (view: "main" | "settings") => void;
  clearTranscript: () => void;
}

export const useStore = create<AppState>((set) => ({
  status: "idle",
  transcript: "",
  interimTranscript: "",
  error: null,
  audioDevices: [],
  selectedDeviceId: null,
  config: null,
  platform: null,
  view: "main",

  setStatus: (status) => set({ status, error: status === "error" ? undefined : null }),
  setTranscript: (transcript) => set({ transcript }),
  setInterimTranscript: (interim) => set({ interimTranscript: interim }),
  setError: (error) => set({ error, status: error ? "error" : "idle" }),
  setAudioDevices: (devices) => set({ audioDevices: devices }),
  setSelectedDevice: (deviceId) => set({ selectedDeviceId: deviceId }),
  setConfig: (config) => set({ config }),
  setPlatform: (platform) => set({ platform }),
  setView: (view) => set({ view }),
  clearTranscript: () => set({ transcript: "", interimTranscript: "" }),
}));
