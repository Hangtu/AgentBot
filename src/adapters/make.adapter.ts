/**
 * @fileoverview Make (Integromat) platform adapter.
 * Normalizes Make HTTP module payloads into universal messages.
 * Make typically sends data from scenario modules in a predictable JSON shape.
 */

import type { AdapterResult, Channel, PlatformAdapter } from "./types";

export const makeAdapter: PlatformAdapter = {
  platform: "make",

  normalize(payload: Record<string, unknown>): AdapterResult {
    // Make sends whatever the user configures in the HTTP module.
    // Common shape from WhatsApp/IG modules:
    // { message, sender, senderId, conversationId, channel }

    const content =
      (payload.message as string) ??
      (payload.content as string) ??
      (payload.text as string) ??
      "";

    if (!content || content.trim() === "") {
      return { skip: true, reason: "Empty message content from Make" };
    }

    const channel = ((payload.channel as string) ?? "unknown") as Channel;

    return {
      skip: false,
      message: {
        content: content.trim(),
        sender_name:
          (payload.sender as string) ??
          (payload.senderName as string) ??
          (payload.from as string) ??
          "Make Contact",
        sender_id:
          (payload.senderId as string) ??
          (payload.sender_id as string) ??
          "unknown",
        conversation_id:
          (payload.conversationId as string) ??
          (payload.conversation_id as string) ??
          (payload.threadId as string) ??
          `make_${Date.now()}`,
        channel,
        platform: "make",
        raw_payload: payload,
        callback_url: payload.callback_url as string | undefined,
      },
    };
  },

  // Make typically uses sync mode (Webhook Response module)
};
