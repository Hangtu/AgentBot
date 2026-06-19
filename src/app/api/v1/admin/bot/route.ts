/**
 * @fileoverview Admin API — Bot configuration CRUD.
 * GET  /api/v1/admin/bot  → return current bot config (from DB)
 * PUT  /api/v1/admin/bot  → upsert bot config for the authenticated tenant
 *
 * Protected: requires Clerk session.
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { bots, tenants } from "@/lib/db/schema";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Resolve or create a tenant row for the current Clerk user. */
async function getOrCreateTenant(clerkUserId: string, email: string) {
  if (!db) throw new Error("Database not initialised");

  const existing = await db.query.tenants.findFirst({
    where: eq(tenants.clerk_user_id, clerkUserId),
  });
  if (existing) return existing;

  // First login — auto-provision a tenant
  const [created] = await db
    .insert(tenants)
    .values({
      name: email,
      email,
      clerk_user_id: clerkUserId,
      api_key: crypto.randomUUID(),
      plan: "free",
      is_active: true,
    })
    .returning();

  return created;
}

// ---------------------------------------------------------------------------
// GET — read current bot config
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    const { userId, sessionClaims } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!db) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 }
      );
    }

    const email =
      (sessionClaims?.email as string) ??
      (sessionClaims?.primaryEmail as string) ??
      userId;

    const tenant = await getOrCreateTenant(userId, email);

    const bot = await db.query.bots.findFirst({
      where: eq(bots.tenant_id, tenant.id),
    });

    return NextResponse.json({
      tenant: {
        id: tenant.id,
        name: tenant.name,
        api_key: tenant.api_key,
      },
      bot: bot ?? null,
    });
  } catch (err) {
    console.error("[admin/bot GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// PUT — upsert bot config
// ---------------------------------------------------------------------------

export async function PUT(request: Request) {
  try {
    const { userId, sessionClaims } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!db) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 }
      );
    }

    const body = (await request.json()) as {
      name?: string;
      system_prompt?: string;
      knowledge_base?: string;
      llm_provider?: string;
      llm_model?: string;
      temperature?: number;
      max_tokens?: number;
      context_window?: number;
    };

    const email =
      (sessionClaims?.email as string) ??
      (sessionClaims?.primaryEmail as string) ??
      userId;

    const tenant = await getOrCreateTenant(userId, email);

    const existing = await db.query.bots.findFirst({
      where: eq(bots.tenant_id, tenant.id),
    });

    if (existing) {
      // Update existing bot
      const [updated] = await db
        .update(bots)
        .set({
          name: body.name ?? existing.name,
          system_prompt: body.system_prompt ?? existing.system_prompt,
          knowledge_base: body.knowledge_base ?? existing.knowledge_base,
          llm_provider: body.llm_provider ?? existing.llm_provider,
          llm_model: body.llm_model ?? existing.llm_model,
          temperature: body.temperature ?? existing.temperature,
          max_tokens: body.max_tokens ?? existing.max_tokens,
          context_window: body.context_window ?? existing.context_window,
          updated_at: new Date(),
        })
        .where(eq(bots.id, existing.id))
        .returning();

      return NextResponse.json({ bot: updated });
    } else {
      // Create first bot for this tenant
      const [created] = await db
        .insert(bots)
        .values({
          tenant_id: tenant.id,
          name: body.name ?? "Mi Agente",
          system_prompt:
            body.system_prompt ?? "Eres un asistente virtual amable y profesional.",
          knowledge_base: body.knowledge_base ?? "",
          llm_provider: body.llm_provider ?? "groq",
          llm_model: body.llm_model ?? "llama-3.3-70b-versatile",
          temperature: body.temperature ?? 0.7,
          max_tokens: body.max_tokens ?? 1024,
          context_window: body.context_window ?? 20,
          is_active: true,
        })
        .returning();

      return NextResponse.json({ bot: created }, { status: 201 });
    }
  } catch (err) {
    console.error("[admin/bot PUT]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
