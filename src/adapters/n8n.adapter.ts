/**
 * @fileoverview n8n platform adapter.
 * Normalizes n8n HTTP Request node payloads into universal messages.
 * n8n typically sends whatever the user configures, but the common patterns
 * from WhatsApp/Telegram triggers are handled here.
 */

import type { AdapterResult, Channel, PlatformAdapter } from "./types";

export const n8nAdapter: PlatformAdapter = {
  platform: "n8n",

  normalize(payload: Record<string, unknown>): AdapterResult {
    // n8n can send data in various shapes depending on the trigger node.
    // Common patterns:
    // 1. Direct body: { message, chatId, from }
    // 2. Wrapped: { body: { message, ... } }
    // 3. WhatsApp trigger: { messages: [{ text: { body }, from }] }

    const body = (payload.body as Record<string, unknown>) ?? payload;

    const content =
      (body.message as string) ??
      (body.content as string) ??
      (body.text as string) ??
      "";

    if (!content || content.trim() === "") {
      return { skip: true, reason: "Empty message content from n8n" };
    }

    const channel = ((body.channel as string) ?? "unknown") as Channel;

    return {
      skip: false,
      message: {
        content: content.trim(),
        sender_name:
          (body.sender_name as string) ??
          (body.from as string) ??
          (body.name as string) ??
          "n8n Contact",
        sender_id:
          (body.sender_id as string) ??
          (body.from_id as string) ??
          (body.chatId as string) ??
          "unknown",
        conversation_id:
          (body.conversation_id as string) ??
          (body.chatId as string) ??
          (body.thread_id as string) ??
          `n8n_${Date.now()}`,
        channel,
        platform: "n8n",
        raw_payload: payload,
        callback_url: (body.callback_url as string) ?? (payload.callback_url as string),
      },
    };
  },

  // n8n typically uses sync mode (waits for response) or callback
};
