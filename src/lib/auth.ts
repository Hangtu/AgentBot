import "server-only";
import { auth, currentUser } from "@clerk/nextjs/server";

import type { Role } from "@/lib/constants";
import { ROLES } from "@/lib/constants";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors";

// =============================================================================
// Auth helpers — centralized authentication & authorization for Server Actions
// =============================================================================

/**
 * Get the current authenticated user's Clerk ID and metadata.
 * Returns `null` if not authenticated (does not throw).
 */
export async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const user = await currentUser();

  return user
    ? {
        id: userId,
        email: user.emailAddresses[0]?.emailAddress ?? null,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        role: (user.publicMetadata?.role as Role) ?? ROLES.user,
      }
    : null;
}

/**
 * Require authentication — throws `UnauthorizedError` if not logged in.
 * Use in Server Actions that need a valid user.
 *
 * @example
 * ```ts
 * const user = await requireAuth();
 * // user.id is guaranteed to exist
 * ```
 */
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new UnauthorizedError();
  }

  return user;
}

/**
 * Require a specific role — throws `ForbiddenError` if the user doesn't have it.
 *
 * @example
 * ```ts
 * const admin = await requireRole("admin");
 * ```
 */
export async function requireRole(role: Role) {
  const user = await requireAuth();

  if (user.role !== role) {
    throw new ForbiddenError(`Role "${role}" is required.`);
  }

  return user;
}
