import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

// =============================================================================
// Users Data Access Layer — pure database queries, no auth/validation logic
// =============================================================================

export async function findUserById(id: string) {
  const result = await db.query.users.findFirst({
    where: eq(users.id, id),
  });
  return result ?? null;
}

export async function findUserByClerkId(clerkId: string) {
  const result = await db.query.users.findFirst({
    where: eq(users.clerk_id, clerkId),
  });
  return result ?? null;
}

export async function findUserByEmail(email: string) {
  const result = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  return result ?? null;
}

export async function createUser(data: {
  clerk_id: string;
  email: string;
  name?: string;
}) {
  const [user] = await db.insert(users).values(data).returning();
  return user;
}

export async function updateUser(
  id: string,
  data: Partial<{ email: string; name: string }>
) {
  const [user] = await db
    .update(users)
    .set({ ...data, updated_at: new Date() })
    .where(eq(users.id, id))
    .returning();
  return user ?? null;
}

export async function deleteUser(id: string) {
  const [user] = await db.delete(users).where(eq(users.id, id)).returning();
  return user ?? null;
}
