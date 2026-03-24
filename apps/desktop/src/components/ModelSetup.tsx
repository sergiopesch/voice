import { useState } from "react";
import { downloadModel } from "@/lib/tauri";

interface ModelSetupProps {
  onComplete: () => void;
}

export function ModelSetup({ onComplete }: ModelSetupProps) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setDownloading(true);
    setError(null);
    try {
      await downloadModel();
      onComplete();
    } catch (err) {
      setError(`Download failed: ${err}`);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </div>

      <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">
        Speech Model Required
      </h2>
      <p className="text-sm text-[var(--color-text-secondary)] mb-1">
        Voice uses a local speech recognition model.
      </p>
      <p className="text-xs text-[var(--color-text-secondary)] mb-6 opacity-70">
        Whisper base.en (~142 MB) — runs entirely on your machine, no data leaves your computer.
      </p>

      {error && (
        <p className="text-sm text-red-600 mb-4">{error}</p>
      )}

      <button
        onClick={handleDownload}
        disabled={downloading}
        className={`
          px-6 py-2.5 rounded-lg text-sm font-medium text-white
          transition-colors
          ${downloading
            ? "bg-gray-400 cursor-wait"
            : "bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)]"
          }
        `}
      >
        {downloading ? "Downloading..." : "Download Model"}
      </button>
    </div>
  );
}
