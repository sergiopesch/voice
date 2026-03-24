import { createLogger } from "@voice-dictation/logging";
import type { AudioDevice } from "@voice-dictation/shared";

const log = createLogger("audio");

export interface AudioCaptureOptions {
  deviceId?: string;
  sampleRate?: number;
  channelCount?: number;
}

export type AudioCaptureState = "idle" | "recording" | "error";

export class AudioCapture {
  private stream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private _state: AudioCaptureState = "idle";

  get state(): AudioCaptureState {
    return this._state;
  }

  async start(options: AudioCaptureOptions = {}): Promise<void> {
    if (this._state === "recording") {
      log.warn("Already recording");
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        audio: {
          deviceId: options.deviceId ? { exact: options.deviceId } : undefined,
          sampleRate: options.sampleRate ?? 16000,
          channelCount: options.channelCount ?? 1,
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: true,
        },
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.chunks = [];

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.chunks.push(e.data);
      };

      this.mediaRecorder.start(100);
      this._state = "recording";
      log.info("Recording started", { deviceId: options.deviceId });
    } catch (err) {
      this._state = "error";
      log.error("Failed to start recording", err);
      throw err;
    }
  }

  async stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || this._state !== "recording") {
        reject(new Error("Not recording"));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, {
          type: this.mediaRecorder?.mimeType ?? "audio/webm",
        });
        this.cleanup();
        this._state = "idle";
        log.info("Recording stopped", { size: blob.size });
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  cancel(): void {
    this.cleanup();
    this._state = "idle";
    log.info("Recording cancelled");
  }

  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.chunks = [];
  }

  static async enumerateDevices(): Promise<AudioDevice[]> {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices
      .filter((d) => d.kind === "audioinput")
      .map((d) => ({
        deviceId: d.deviceId,
        label: d.label || `Microphone ${d.deviceId.slice(0, 8)}`,
      }));
  }
}
