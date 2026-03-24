import type { TranscriptEvent, AsrEngine } from "@voice-dictation/shared";

export type TranscriptCallback = (event: TranscriptEvent) => void;

export interface AsrBackend {
  readonly engine: AsrEngine;
  initialize(): Promise<void>;
  transcribe(audio: Blob): Promise<string>;
  destroy(): void;
}

// Engine implementations will be added as separate files:
// - whisper-cpp.ts (via Tauri sidecar or WASM)
// - faster-whisper.ts (via Python subprocess)
// - sherpa-onnx.ts (via WASM or native)
//
// Each implements AsrBackend and is registered via createAsrBackend().

export function createAsrBackend(_engine: AsrEngine): AsrBackend {
  // TODO: Implement engine selection after benchmarking
  throw new Error(
    `ASR engine "${_engine}" not yet implemented. ` +
    "Local ASR integration is the next milestone.",
  );
}
