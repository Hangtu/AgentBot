/**
 * @fileoverview Adapter registry — maps platform names to their adapter implementations.
 * The webhook handler uses this to select the correct adapter based on the
 * incoming request's platform query param or auto-detection.
 */

import type { Platform, PlatformAdapter } from "./types";
import { chatwootAdapter } from "./chatwoot.adapter";
import { genericAdapter } from "./generic.adapter";
import { makeAdapter } from "./make.adapter";
import { n8nAdapter } from "./n8n.adapter";

// =============================================================================
// Adapter Registry
// =============================================================================

const adapterRegistry: Record<Platform, PlatformAdapter> = {
  chatwoot: chatwootAdapter,
  n8n: n8nAdapter,
  make: makeAdapter,
  zapier: genericAdapter, // Zapier uses the same generic format
  generic: genericAdapter,
};

/**
 * Get the adapter for a given platform name.
 * Falls back to the generic adapter if the platform is not recognized.
 */
export function getAdapter(platform: string): PlatformAdapter {
  return adapterRegistry[platform as Platform] ?? genericAdapter;
}

/**
 * Auto-detect the platform from the webhook payload structure.
 * Used when no `?platform=` query param is provided.
 */
export function detectPlatform(payload: Record<string, unknown>): Platform {
  // Chatwoot: has "event" field with chatwoot-specific values
  if (
    payload.event &&
    typeof payload.event === "string" &&
    (payload.event === "message_created" ||
      payload.event === "message_updated" ||
      payload.event === "conversation_created" ||
      payload.event === "conversation_status_changed")
  ) {
    return "chatwoot";
  }

  // n8n: often wraps in { body: ... } or has executionId
  if (payload.executionId || payload.workflowId) {
    return "n8n";
  }

  // Make: often has scenarioId or moduleId
  if (payload.scenarioId || payload.moduleId) {
    return "make";
  }

  return "generic";
}

export { chatwootAdapter } from "./chatwoot.adapter";
export { genericAdapter } from "./generic.adapter";
export { makeAdapter } from "./make.adapter";
export { n8nAdapter } from "./n8n.adapter";
