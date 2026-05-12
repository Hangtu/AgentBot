/**
 * @fileoverview Response dispatcher.
 * Handles sending the LLM-generated response back to the originating platform.
 * Supports three modes: sync (return in HTTP response), callback (POST to URL),
 * and direct (use platform-specific API).
 */

import { getAdapter } from "@/adapters";
import { logger } from "@/lib/logger";
import type { ResponseMode, UniversalMessage } from "@/types/agent";

// =============================================================================
// Response Dispatcher
// =============================================================================

/**
 * Dispatch the bot's reply back to the platform.
 *
 * @param mode - How to send the response (sync, callback, direct)
 * @param message - The original incoming message (contains routing info)
 * @param reply - The LLM-generated response text
 * @param platformConfig - Platform-specific credentials (for "direct" mode)
 * @returns The reply text (useful for sync mode)
 */
export async function dispatchResponse(params: {
  mode: ResponseMode;
  message: UniversalMessage;
  reply: string;
  platformConfig?: Record<string, unknown>;
}): Promise<string> {
  const { mode, message, reply, platformConfig } = params;

  switch (mode) {
    case "sync":
      // No action needed — the webhook route returns the reply in the response body
      logger.debug("Response mode: sync — returning in HTTP response", {
        conversationId: message.conversation_id,
      });
      return reply;

    case "callback": {
      const callbackUrl = message.callback_url;
      if (!callbackUrl) {
        logger.warn("Callback mode but no callback_url provided", {
          conversationId: message.conversation_id,
        });
        return reply;
      }

      try {
        const response = await fetch(callbackUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reply,
            conversation_id: message.conversation_id,
            sender_id: message.sender_id,
            channel: message.channel,
          }),
        });

        if (!response.ok) {
          logger.error("Callback delivery failed", undefined, {
            callbackUrl,
            status: response.status,
          });
        } else {
          logger.info("Callback delivered successfully", { callbackUrl });
        }
      } catch (error) {
        logger.error("Callback request error", error, { callbackUrl });
      }
      return reply;
    }

    case "direct": {
      const adapter = getAdapter(message.platform);
      if (!adapter.sendResponse) {
        logger.warn(
          `Direct mode not supported for platform: ${message.platform}. Falling back to sync.`,
          { conversationId: message.conversation_id }
        );
        return reply;
      }

      await adapter.sendResponse({
        message,
        reply,
        platformConfig: platformConfig ?? {},
      });
      return reply;
    }

    default:
      logger.warn(`Unknown response mode: ${mode}. Using sync.`);
      return reply;
  }
}
