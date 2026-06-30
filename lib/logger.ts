/**
 * Tiny structured logger. Emits single-line JSON in production (easy for log
 * aggregators) and readable text in development. Swap the sink for Sentry /
 * Logtail / Datadog by editing `emit`.
 */

type Level = "debug" | "info" | "warn" | "error";

function emit(level: Level, message: string, meta?: Record<string, unknown>) {
  if (process.env.NODE_ENV === "production") {
    // eslint-disable-next-line no-console
    console[level === "debug" ? "log" : level](
      JSON.stringify({ level, message, ...meta, ts: new Date().toISOString() }),
    );
  } else {
    // eslint-disable-next-line no-console
    console[level === "debug" ? "log" : level](
      `[${level}] ${message}`,
      meta ?? "",
    );
  }
}

export const log = {
  debug: (m: string, meta?: Record<string, unknown>) => emit("debug", m, meta),
  info: (m: string, meta?: Record<string, unknown>) => emit("info", m, meta),
  warn: (m: string, meta?: Record<string, unknown>) => emit("warn", m, meta),
  error: (m: string, meta?: Record<string, unknown>) => emit("error", m, meta),
};
