import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Send user PII (email, IP) for better error context
  sendDefaultPii: true,

  // Adjust sample rate: 100% in dev, 10% in production
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

  // Enable Sentry logs for structured logging integration
  enableLogs: true,
});
