import { useStore } from "@/store/useStore";
import { DictateButton } from "./DictateButton";
import { TranscriptDisplay } from "./TranscriptDisplay";
import { StatusBar } from "./StatusBar";

export function MainView() {
  const { setView, error } = useStore();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
        <h1 className="text-sm font-semibold text-[var(--color-text)]">
          Voice Dictation
        </h1>
        <button
          onClick={() => setView("settings")}
          className="p-1.5 rounded-md hover:bg-gray-100 text-[var(--color-text-secondary)] transition-colors"
          title="Settings"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      </header>

      {/* Transcript area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <TranscriptDisplay />
      </div>

      {/* Error display */}
      {error && (
        <div className="mx-4 mb-2 px-3 py-2 rounded-md bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Dictation controls */}
      <div className="flex flex-col items-center gap-3 px-4 py-6 border-t border-[var(--color-border)]">
        <DictateButton />
        <StatusBar />
      </div>
    </div>
  );
}
