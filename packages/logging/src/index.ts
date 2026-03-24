import type { LogLevel } from "@voice-dictation/shared";

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

interface LogEntry {
  level: LogLevel;
  module: string;
  message: string;
  data?: unknown;
  timestamp: string;
}

let currentLevel: LogLevel = "info";

export function setLogLevel(level: LogLevel): void {
  currentLevel = level;
}

function shouldLog(level: LogLevel): boolean {
  return LEVEL_PRIORITY[level] <= LEVEL_PRIORITY[currentLevel];
}

function emit(entry: LogEntry): void {
  const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.module}]`;
  const msg = `${prefix} ${entry.message}`;

  switch (entry.level) {
    case "error":
      console.error(msg, entry.data ?? "");
      break;
    case "warn":
      console.warn(msg, entry.data ?? "");
      break;
    case "debug":
      console.debug(msg, entry.data ?? "");
      break;
    default:
      console.log(msg, entry.data ?? "");
  }
}

export function createLogger(module: string) {
  function log(level: LogLevel, message: string, data?: unknown): void {
    if (!shouldLog(level)) return;
    emit({
      level,
      module,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  return {
    error: (message: string, data?: unknown) => log("error", message, data),
    warn: (message: string, data?: unknown) => log("warn", message, data),
    info: (message: string, data?: unknown) => log("info", message, data),
    debug: (message: string, data?: unknown) => log("debug", message, data),
  };
}
