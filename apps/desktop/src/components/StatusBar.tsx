import { useStore } from "@/store/useStore";

export function StatusBar() {
  const { status, config } = useStore();

  const label = {
    idle: "Ready",
    recording: "Listening...",
    processing: "Processing...",
    error: "Error",
  }[status];

  return (
    <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
      <span
        className={`inline-block w-1.5 h-1.5 rounded-full ${
          status === "recording"
            ? "bg-red-500"
            : status === "processing"
              ? "bg-yellow-500"
              : status === "error"
                ? "bg-red-500"
                : "bg-green-500"
        }`}
      />
      <span>{label}</span>
      {config && (
        <span className="opacity-50">
          {config.hotkey}
        </span>
      )}
    </div>
  );
}
