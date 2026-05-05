import { z } from "zod";

// =============================================================================
// Environment variable validation — fail fast with clear error messages
// =============================================================================

const serverSchema = z.object({
  // Database
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),

  // Auth (Clerk)
  CLERK_SECRET_KEY: z.string().min(1, "CLERK_SECRET_KEY is required"),

  // Cloudflare R2
  R2_ACCOUNT_ID: z.string().min(1, "R2_ACCOUNT_ID is required"),
  R2_ACCESS_KEY_ID: z.string().min(1, "R2_ACCESS_KEY_ID is required"),
  R2_SECRET_ACCESS_KEY: z.string().min(1, "R2_SECRET_ACCESS_KEY is required"),
  R2_BUCKET_NAME: z.string().min(1, "R2_BUCKET_NAME is required"),

  // Stripe
  STRIPE_SECRET_KEY: z.string().min(1, "STRIPE_SECRET_KEY is required"),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, "STRIPE_WEBHOOK_SECRET is required"),

  // Email (Resend)
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),
  RESEND_FROM_EMAIL: z
    .string()
    .email("RESEND_FROM_EMAIL must be a valid email"),
});

const clientSchema = z.object({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().default("/login"),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().default("/sign-up"),
  NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL: z.string().default("/"),
  NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL: z.string().default("/"),
  NEXT_PUBLIC_R2_PUBLIC_URL: z
    .string()
    .url("NEXT_PUBLIC_R2_PUBLIC_URL must be a valid URL"),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),
});

/**
 * Validated server-side environment variables.
 * Access via `serverEnv.DATABASE_URL` etc.
 * Throws at import-time if any variable is missing or invalid.
 */
export const serverEnv = (() => {
  // Skip validation during build (env vars may not be available)
  if (process.env.SKIP_ENV_VALIDATION === "true") {
    return process.env as unknown as z.infer<typeof serverSchema>;
  }

  const parsed = serverSchema.safeParse(process.env);

  if (!parsed.success) {
    const formatted = parsed.error.issues
      .map((issue) => `  ✗ ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new Error(
      `❌ Invalid server environment variables:\n${formatted}\n\n` +
        `Check your .env.local file against .env.example.`
    );
  }

  return parsed.data;
})();

/**
 * Validated client-side environment variables (NEXT_PUBLIC_*).
 * Safe to use in both server and client components.
 */
export const clientEnv = (() => {
  if (process.env.SKIP_ENV_VALIDATION === "true") {
    return process.env as unknown as z.infer<typeof clientSchema>;
  }

  const parsed = clientSchema.safeParse(process.env);

  if (!parsed.success) {
    const formatted = parsed.error.issues
      .map((issue) => `  ✗ ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new Error(
      `❌ Invalid client environment variables:\n${formatted}\n\n` +
        `Check your .env.local file against .env.example.`
    );
  }

  return parsed.data;
})();
