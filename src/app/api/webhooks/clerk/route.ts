import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

import { logger } from "@/lib/logger";

// =============================================================================
// Clerk Webhook Handler
// Receives events from Clerk (user.created, user.updated, user.deleted, etc.)
//
// Setup:
// 1. Add CLERK_WEBHOOK_SECRET to your .env.local
// 2. Configure webhook URL in Clerk Dashboard → Webhooks
// 3. Subscribe to events: user.created, user.updated, user.deleted
// =============================================================================

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    logger.error("CLERK_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 }
    );
  }

  // Verify the webhook signature
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 }
    );
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let event: { type: string; data: Record<string, unknown> };

  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as typeof event;
  } catch (err) {
    logger.error("Clerk webhook verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle events
  switch (event.type) {
    case "user.created":
      logger.info("Clerk: user.created", { userId: event.data.id });
      // TODO: Sync user to your database
      // await createUser({ clerk_id: event.data.id, email: ... });
      break;

    case "user.updated":
      logger.info("Clerk: user.updated", { userId: event.data.id });
      // TODO: Update user in your database
      break;

    case "user.deleted":
      logger.info("Clerk: user.deleted", { userId: event.data.id });
      // TODO: Delete or soft-delete user in your database
      break;

    default:
      logger.debug("Clerk: unhandled event", { type: event.type });
  }

  return NextResponse.json({ received: true });
}
