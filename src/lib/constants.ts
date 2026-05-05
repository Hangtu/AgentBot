// =============================================================================
// Global application constants — single source of truth for magic values
// =============================================================================

export const APP_CONFIG = {
  name: "agentBot",
  description: "Production-ready Next.js boilerplate",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
} as const;

export const PAGINATION = {
  defaultPageSize: 20,
  maxPageSize: 100,
} as const;

export const UPLOAD = {
  maxFileSizeMB: 5,
  maxFileSizeBytes: 5 * 1024 * 1024,
  allowedImageTypes: ["image/jpeg", "image/png", "image/webp"] as const,
} as const;

export const CACHE = {
  /** Default SWR revalidation interval in milliseconds */
  revalidateInterval: 30_000,
  /** Default Next.js revalidation interval in seconds */
  revalidateSeconds: 60,
} as const;

/**
 * User roles — extend as needed.
 * Must match what you store in Clerk's publicMetadata.
 */
export const ROLES = {
  user: "user",
  admin: "admin",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
