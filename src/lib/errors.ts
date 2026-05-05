// =============================================================================
// Custom error classes — typed errors for business logic vs technical failures
// =============================================================================

/**
 * Base application error. All custom errors extend this.
 */
export class AppError extends Error {
  readonly code: string;
  readonly statusCode: number;

  constructor(message: string, code = "APP_ERROR", statusCode = 500) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

/**
 * Resource not found (404).
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(
      id ? `${resource} with id "${id}" not found.` : `${resource} not found.`,
      "NOT_FOUND",
      404
    );
    this.name = "NotFoundError";
  }
}

/**
 * Validation error (400).
 */
export class ValidationError extends AppError {
  readonly fieldErrors: Record<string, string[]>;

  constructor(
    message = "Validation failed.",
    fieldErrors: Record<string, string[]> = {}
  ) {
    super(message, "VALIDATION_ERROR", 400);
    this.name = "ValidationError";
    this.fieldErrors = fieldErrors;
  }
}

/**
 * User is not authenticated (401).
 */
export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required.") {
    super(message, "UNAUTHORIZED", 401);
    this.name = "UnauthorizedError";
  }
}

/**
 * User lacks required permissions (403).
 */
export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to perform this action.") {
    super(message, "FORBIDDEN", 403);
    this.name = "ForbiddenError";
  }
}

/**
 * Rate limit exceeded (429).
 */
export class RateLimitError extends AppError {
  constructor(message = "Too many requests. Please try again later.") {
    super(message, "RATE_LIMITED", 429);
    this.name = "RateLimitError";
  }
}
