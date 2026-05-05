"use server";

import type { ActionResponse } from "@/types";
import { requireAuth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { findUserByClerkId } from "@/data";

// =============================================================================
// Example Server Action — DAL + Auth + Logger pattern
// Replace with your own server actions.
// =============================================================================

/**
 * Example server action demonstrating the full architecture:
 * - `requireAuth()` for authentication
 * - DAL functions for database access
 * - `logger` for structured logging
 * - Discriminated `ActionResponse<T>` for type-safe returns
 */
export async function exampleAction(
  input: string
): Promise<ActionResponse<{ message: string }>> {
  try {
    // 1. Authenticate
    const authUser = await requireAuth();

    // 2. Validate input
    if (!input.trim()) {
      return {
        success: false,
        error: "Input is required.",
        code: "VALIDATION_ERROR",
      };
    }

    // 3. Data access (DAL)
    const dbUser = await findUserByClerkId(authUser.id);

    logger.info("exampleAction executed", {
      userId: authUser.id,
      input,
      found: !!dbUser,
    });

    return {
      success: true,
      data: {
        message: `Hello ${dbUser?.name ?? authUser.firstName ?? "user"}: ${input}`,
      },
    };
  } catch (error) {
    logger.error("[exampleAction]", error);
    return {
      success: false,
      error: "An unexpected error occurred.",
    };
  }
}
