import { useStore } from "@/store/useStore";
import { useAudioDevices } from "@/hooks/useAudioDevices";
import { saveConfig } from "@/lib/tauri";
import type { AppConfig, DictationMode, InsertionStrategy, AsrEngine } from "@/types";

export function SettingsView() {
  const { config, setConfig, setView, platform } = useStore();
  const { audioDevices, selectedDeviceId, setSelectedDevice } = useAudioDevices();

  if (!config) return null;

  async function updateConfig(partial: Partial<AppConfig>) {
    const updated = { ...config!, ...partial };
    setConfig(updated);
    try {
      await saveConfig(updated);
    } catch (err) {
      console.error("Failed to save config:", err);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)]">
        <button
          onClick={() => setView("main")}
          className="p-1.5 rounded-md hover:bg-gray-100 text-[var(--color-text-secondary)] transition-colors"
          title="Back"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-sm font-semibold text-[var(--color-text)]">Settings</h1>
      </header>

      {/* Settings body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {/* Microphone */}
        <section>
          <h2 className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)] mb-2">
            Microphone
          </h2>
          <select
            value={selectedDeviceId ?? ""}
            onChange={(e) => setSelectedDevice(e.target.value || null)}
            className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)]"
          >
            {audioDevices.length === 0 && (
              <option value="">No microphones found</option>
            )}
            {audioDevices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label}
              </option>
            ))}
          </select>
        </section>

        {/* Dictation mode */}
        <section>
          <h2 className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)] mb-2">
            Dictation Mode
          </h2>
          <div className="flex gap-2">
            {(["push-to-talk", "toggle"] as DictationMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => updateConfig({ dictationMode: mode })}
                className={`flex-1 px-3 py-2 rounded-md text-sm border transition-colors ${
                  config.dictationMode === mode
                    ? "border-[var(--color-accent)] bg-blue-50 text-[var(--color-accent)]"
                    : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-gray-50"
                }`}
              >
                {mode === "push-to-talk" ? "Push to Talk" : "Toggle"}
              </button>
            ))}
          </div>
        </section>

        {/* Hotkey */}
        <section>
          <h2 className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)] mb-2">
            Hotkey
          </h2>
          <input
            type="text"
            value={config.hotkey}
            onChange={(e) => updateConfig({ hotkey: e.target.value })}
            className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)]"
            placeholder="Super+Shift+D"
          />
        </section>

        {/* Insertion strategy */}
        <section>
          <h2 className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)] mb-2">
            Text Insertion
          </h2>
          <select
            value={config.insertionStrategy}
            onChange={(e) =>
              updateConfig({ insertionStrategy: e.target.value as InsertionStrategy })
            }
            className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)]"
          >
            <option value="auto">Auto-detect</option>
            <option value="clipboard">Clipboard paste</option>
            <option value="type-simulation">Type simulation</option>
          </select>
        </section>

        {/* ASR engine */}
        <section>
          <h2 className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)] mb-2">
            Transcription Engine
          </h2>
          <select
            value={config.asrEngine}
            onChange={(e) => updateConfig({ asrEngine: e.target.value as AsrEngine })}
            className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)]"
          >
            <option value="whisper-cpp">Whisper.cpp</option>
            <option value="faster-whisper">Faster Whisper</option>
            <option value="sherpa-onnx">Sherpa ONNX</option>
          </select>
        </section>

        {/* Platform info */}
        {platform && (
          <section>
            <h2 className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)] mb-2">
              Platform
            </h2>
            <div className="text-xs text-[var(--color-text-secondary)] space-y-1">
              <p>OS: {platform.os} ({platform.arch})</p>
              {platform.sessionType && <p>Session: {platform.sessionType}</p>}
              {platform.desktop && <p>Desktop: {platform.desktop}</p>}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
