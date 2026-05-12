/**
 * @fileoverview Universal webhook endpoint.
 * POST /api/v1/webhook/[apiKey]
 *
 * This is the single entry point for ALL external platforms.
 * The API key in the URL identifies the tenant.
 * The platform is detected from the payload or specified via ?platform= query param.
 * Response mode can be overridden via ?response= query param.
 *
 * @example URLs:
 * - https://yourdomain.com/api/v1/webhook/ak_live_xxxxx
 * - https://yourdomain.com/api/v1/webhook/ak_live_xxxxx?platform=chatwoot
 * - https://yourdomain.com/api/v1/webhook/ak_live_xxxxx?platform=n8n&response=sync
 */

import { NextResponse } from "next/server";

import { detectPlatform, getAdapter } from "@/adapters";
import { findTenantByApiKey, processMessage } from "@/lib/agent/engine";
import { logger } from "@/lib/logger";
import type { ResponseMode } from "@/types/agent";

// =============================================================================
// POST /api/v1/webhook/[apiKey]
// =============================================================================

export async function POST(
  req: Request,
  { params }: { params: Promise<{ apiKey: string }> }
) {
  const { apiKey } = await params;

  // 1. Authenticate tenant by API key
  const tenant = await findTenantByApiKey(apiKey);
  if (!tenant) {
    logger.warn("Webhook: invalid API key", { apiKey: apiKey.slice(0, 8) + "..." });
    return NextResponse.json(
      { success: false, error: "Invalid API key." },
      { status: 401 }
    );
  }

  // 2. Parse the request body
  let payload: Record<string, unknown>;
  try {
    payload = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  // 3. Determine platform (query param > auto-detect)
  const url = new URL(req.url);
  const platformParam = url.searchParams.get("platform");
  const responseParam = url.searchParams.get("response") as ResponseMode | null;

  const platform = platformParam ?? detectPlatform(payload);

  // 4. Normalize the payload using the appropriate adapter
  const adapter = getAdapter(platform);
  const result = adapter.normalize(payload);

  if (result.skip) {
    logger.debug("Webhook: message skipped", {
      reason: result.reason,
      platform,
      tenantId: tenant.id,
    });
    return NextResponse.json({ success: true, skipped: true, reason: result.reason });
  }

  // 5. Process the message through the agent engine
  const response = await processMessage(
    tenant.id,
    result.message,
    responseParam ?? undefined
  );

  // 6. Return the response
  const status = response.success ? 200 : 500;
  return NextResponse.json(response, { status });
}

// =============================================================================
// GET — Health check / info endpoint
// =============================================================================

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ apiKey: string }> }
) {
  const { apiKey } = await params;
  const tenant = await findTenantByApiKey(apiKey);

  if (!tenant) {
    return NextResponse.json(
      { success: false, error: "Invalid API key." },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    tenant: tenant.name,
    status: "active",
    message:
      "Webhook endpoint is ready. Send a POST request with your message payload.",
  });
}
