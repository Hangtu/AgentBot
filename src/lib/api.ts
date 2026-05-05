import "server-only";
import { NextResponse } from "next/server";

import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";

// =============================================================================
// API route helpers — consistent responses & error handling for Route Handlers
// =============================================================================

/**
 * Return a typed JSON success response.
 */
export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

/**
 * Return a JSON error response.
 */
export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Higher-order function that wraps a Route Handler with automatic error handling.
 * Catches `AppError` subclasses and returns the correct status code.
 *
 * @example
 * ```ts
 * // src/app/api/users/route.ts
 * export const GET = withErrorHandler(async (req) => {
 *   const users = await findAllUsers();
 *   return successResponse(users);
 * });
 * ```
 */
export function withErrorHandler(
  handler: (req: Request) => Promise<NextResponse>
) {
  return async (req: Request): Promise<NextResponse> => {
    try {
      return await handler(req);
    } catch (error) {
      if (error instanceof AppError) {
        logger.warn(`API Error: ${error.code}`, {
          message: error.message,
          statusCode: error.statusCode,
        });
        return errorResponse(error.message, error.statusCode);
      }

      logger.error("Unhandled API error", error, {
        url: req.url,
        method: req.method,
      });
      return errorResponse("Internal server error.", 500);
    }
  };
}
