import { useStore } from "@/store/useStore";

export function TranscriptDisplay() {
  const { transcript, interimTranscript, status } = useStore();

  const hasContent = transcript || interimTranscript;

  if (!hasContent && status === "idle") {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <p className="text-[var(--color-text-secondary)] text-sm">
          Press the microphone button to start dictating
        </p>
        <p className="text-[var(--color-text-secondary)] text-xs mt-2 opacity-60">
          Text will be inserted into the active application
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {transcript && (
        <p className="text-base leading-relaxed text-[var(--color-text)] select-text">
          {transcript}
        </p>
      )}
      {interimTranscript && (
        <p className="text-base leading-relaxed text-[var(--color-text-secondary)] italic">
          {interimTranscript}
        </p>
      )}
    </div>
  );
}
