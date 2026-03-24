import { useStore } from "@/store/useStore";
import { useDictation } from "@/hooks/useDictation";

export function DictateButton() {
  const { status } = useStore();
  const { toggle } = useDictation();
  const isRecording = status === "recording";
  const isProcessing = status === "processing";
  const isDisabled = isProcessing;

  return (
    <button
      onClick={toggle}
      disabled={isDisabled}
      className={`
        relative flex items-center justify-center
        w-16 h-16 rounded-full
        transition-all duration-150
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${isRecording
          ? "bg-[var(--color-recording)] hover:bg-[var(--color-recording-hover)] focus:ring-red-400 shadow-lg shadow-red-200"
          : isProcessing
            ? "bg-gray-400 cursor-wait"
            : "bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] focus:ring-blue-400 shadow-lg shadow-blue-200"
        }
      `}
      title={isRecording ? "Stop dictation" : "Start dictation"}
    >
      {isRecording ? (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
      ) : isProcessing ? (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="animate-spin">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      ) : (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <line x1="12" y1="19" x2="12" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <line x1="8" y1="23" x2="16" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}

      {isRecording && (
        <span className="absolute inset-0 rounded-full animate-ping bg-[var(--color-recording)] opacity-20" />
      )}
    </button>
  );
}
