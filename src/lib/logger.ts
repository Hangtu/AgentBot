// =============================================================================
// Structured logger — console output always, Sentry forwarding when DSN is set.
// All logger.error calls also capture exceptions in Sentry automatically.
// =============================================================================

import * as Sentry from "@sentry/nextjs";

const sentryEnabled = !!process.env.NEXT_PUBLIC_SENTRY_DSN;
const sentryLogger = Sentry.logger;

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogMeta {
  [key: string]: unknown;
}

function formatMessage(
  level: LogLevel,
  message: string,
  meta?: LogMeta
): string {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : "";
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
}

function extractErrorInfo(error: unknown): LogMeta {
  if (error instanceof Error) {
    return {
      errorName: error.name,
      errorMessage: error.message,
      stack: error.stack,
    };
  }
  return { errorRaw: String(error) };
}

export const logger = {
  info(message: string, meta?: LogMeta) {
    console.log(formatMessage("info", message, meta));
    if (sentryEnabled) sentryLogger.info(message, meta ?? {});
  },

  warn(message: string, meta?: LogMeta) {
    console.warn(formatMessage("warn", message, meta));
    if (sentryEnabled) sentryLogger.warn(message, meta ?? {});
  },

  error(message: string, error?: unknown, meta?: LogMeta) {
    const errorMeta = error ? extractErrorInfo(error) : {};
    const mergedMeta = { ...errorMeta, ...meta };
    console.error(formatMessage("error", message, mergedMeta));

    if (!sentryEnabled) return;

    sentryLogger.error(message, mergedMeta);

    if (error instanceof Error) {
      Sentry.captureException(error, {
        extra: { loggerMessage: message, ...meta },
      });
    } else if (error) {
      Sentry.captureMessage(message, {
        level: "error",
        extra: { errorRaw: String(error), ...meta },
      });
    }
  },

  debug(message: string, meta?: LogMeta) {
    if (process.env.NODE_ENV === "development") {
      console.debug(formatMessage("debug", message, meta));
    }
    if (sentryEnabled) sentryLogger.debug(message, meta ?? {});
  },
};
