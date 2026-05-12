/**
 * @fileoverview Generic platform adapter.
 * Handles a simple, universal JSON format that any developer can POST.
 * This is the fallback adapter when no platform-specific one is detected.
 *
 * Expected payload:
 * {
 *   "message": "Hello, what are your hours?",
 *   "sender": "Juan Pérez",
 *   "sender_id": "5215512345678",
 *   "conversation_id": "conv_123",
 *   "channel": "whatsapp",
 *   "callback_url": "https://example.com/callback" // optional
 * }
 */

import type { AdapterResult, Channel, PlatformAdapter } from "./types";

export const genericAdapter: PlatformAdapter = {
  platform: "generic",

  normalize(payload: Record<string, unknown>): AdapterResult {
    // Support multiple field names for flexibility
    const content =
      (payload.message as string) ??
      (payload.content as string) ??
      (payload.text as string) ??
      "";

    if (!content || content.trim() === "") {
      return { skip: true, reason: "Empty message content" };
    }

    const channel = ((payload.channel as string) ?? "unknown") as Channel;

    return {
      skip: false,
      message: {
        content: content.trim(),
        sender_name:
          (payload.sender as string) ??
          (payload.sender_name as string) ??
          (payload.from as string) ??
          "Unknown",
        sender_id:
          (payload.sender_id as string) ??
          (payload.from_id as string) ??
          "unknown",
        conversation_id:
          (payload.conversation_id as string) ??
          (payload.thread_id as string) ??
          (payload.chat_id as string) ??
          `generic_${Date.now()}`,
        channel,
        platform: "generic",
        raw_payload: payload,
        callback_url: payload.callback_url as string | undefined,
      },
    };
  },

  // Generic adapter uses sync or callback mode — no direct API to call
};
