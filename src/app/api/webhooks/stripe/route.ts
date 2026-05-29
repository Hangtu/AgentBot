import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { logger } from "@/lib/logger";

// =============================================================================
// Stripe Webhook Handler
// Receives events from Stripe (checkout.session.completed, etc.)
//
// Setup:
// 1. Add STRIPE_WEBHOOK_SECRET to your .env.local
// 2. For local dev:  stripe listen --forward-to localhost:3000/api/webhooks/stripe
// 3. For production: Configure webhook URL in Stripe Dashboard → Webhooks
// =============================================================================

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    logger.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 }
    );
  }

  // Dynamic import to avoid loading the Stripe client at build time
  const { stripe } = await import("@/lib/stripe");

  if (!stripe) {
    logger.error("Stripe is not configured");
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 500 }
    );
  }

  const body = await req.text();
  const headerPayload = await headers();
  const signature = headerPayload.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
  } catch (err) {
    logger.error("Stripe webhook verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle events
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      logger.info("Stripe: checkout.session.completed", {
        sessionId: session.id,
        customerId: session.customer,
      });
      // TODO: Fulfill the order
      // await fulfillOrder(session);
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      logger.info("Stripe: invoice.payment_succeeded", {
        invoiceId: invoice.id,
      });
      // TODO: Update subscription status
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      logger.info("Stripe: subscription.deleted", {
        subscriptionId: subscription.id,
      });
      // TODO: Handle subscription cancellation
      break;
    }

    default:
      logger.debug("Stripe: unhandled event", { type: event.type });
  }

  return NextResponse.json({ received: true });
}
