/**
 * @fileoverview Admin API — Integrations (Chatwoot channel config).
 * GET  /api/v1/admin/integrations  → return current channel config
 * PUT  /api/v1/admin/integrations  → upsert bot_channels entry for Chatwoot
 *
 * Protected: requires Clerk session.
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";

import { db } from "@/lib/db";
import { bots, bot_channels, tenants } from "@/lib/db/schema";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getTenantAndBot(clerkUserId: string) {
  if (!db) throw new Error("Database not initialised");

  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.clerk_user_id, clerkUserId),
  });
  if (!tenant) return { tenant: null, bot: null };

  const bot = await db.query.bots.findFirst({
    where: eq(bots.tenant_id, tenant.id),
  });

  return { tenant, bot };
}

// ---------------------------------------------------------------------------
// GET — read current channel/integration config
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!db) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 }
      );
    }

    const { bot } = await getTenantAndBot(userId);
    if (!bot) {
      return NextResponse.json({ channel: null });
    }

    const channel = await db.query.bot_channels.findFirst({
      where: and(
        eq(bot_channels.bot_id, bot.id),
        eq(bot_channels.platform, "chatwoot")
      ),
    });

    return NextResponse.json({ channel: channel ?? null });
  } catch (err) {
    console.error("[admin/integrations GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// PUT — upsert Chatwoot channel config
// ---------------------------------------------------------------------------

export async function PUT(request: Request) {
  try {
    const { userId } = await auth();
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
      base_url?: string;
      api_token?: string;
      account_id?: string;
      response_mode?: string;
    };

    const { bot } = await getTenantAndBot(userId);
    if (!bot) {
      return NextResponse.json(
        { error: "No bot configured yet. Create a bot first." },
        { status: 404 }
      );
    }

    const platformConfig = {
      base_url: body.base_url ?? "https://app.chatwoot.com",
      api_token: body.api_token ?? "",
      account_id: body.account_id ?? "",
    };

    const existing = await db.query.bot_channels.findFirst({
      where: and(
        eq(bot_channels.bot_id, bot.id),
        eq(bot_channels.platform, "chatwoot")
      ),
    });

    if (existing) {
      const [updated] = await db
        .update(bot_channels)
        .set({
          response_mode: body.response_mode ?? existing.response_mode,
          platform_config: platformConfig,
        })
        .where(eq(bot_channels.id, existing.id))
        .returning();

      return NextResponse.json({ channel: updated });
    } else {
      const [created] = await db
        .insert(bot_channels)
        .values({
          bot_id: bot.id,
          platform: "chatwoot",
          channel: "all",
          response_mode: body.response_mode ?? "direct",
          platform_config: platformConfig,
          is_active: true,
        })
        .returning();

      return NextResponse.json({ channel: created }, { status: 201 });
    }
  } catch (err) {
    console.error("[admin/integrations PUT]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
