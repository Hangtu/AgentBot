/**
 * @fileoverview Chatwoot platform adapter.
 * Normalizes Chatwoot webhook payloads (message_created event) into the
 * universal message format and handles sending responses back via the
 * Chatwoot API.
 */

import { logger } from "@/lib/logger";

import type {
  AdapterResult,
  Channel,
  PlatformAdapter,
  UniversalMessage,
} from "./types";

// =============================================================================
// Chatwoot payload type helpers (based on Chatwoot webhook docs)
// =============================================================================

interface ChatwootWebhookPayload {
  event?: string;
  id?: number;
  content?: string;
  message_type?: "incoming" | "outgoing" | "activity" | "template";
  content_type?: string;
  sender?: {
    id?: number;
    name?: string;
    email?: string;
    phone_number?: string;
  };
  contact?: {
    id?: number;
    name?: string;
    email?: string;
    phone_number?: string;
  };
  conversation?: {
    id?: number;
    display_id?: number;
    inbox_id?: number;
    account_id?: number;
    additional_attributes?: Record<string, unknown>;
    channel?: string;
  };
  inbox?: {
    id?: number;
    name?: string;
    channel_type?: string;
  };
  account?: {
    id?: number;
    name?: string;
  };
}

/**
 * Map Chatwoot channel_type strings to our universal Channel type.
 */
function mapChatwootChannel(channelType?: string): Channel {
  if (!channelType) return "unknown";

  const mapping: Record<string, Channel> = {
    "Channel::Whatsapp": "whatsapp",
    "Channel::Api": "web",
    "Channel::WebWidget": "web",
    "Channel::FacebookPage": "facebook",
    "Channel::TwitterProfile": "web",
    "Channel::Email": "email",
    "Channel::Sms": "sms",
    "Channel::Telegram": "telegram",
    "Channel::Line": "web",
  };

  // Also handle instagram via FacebookPage with additional checks
  if (
    channelType.toLowerCase().includes("instagram") ||
    channelType === "Channel::Instagram"
  ) {
    return "instagram";
  }

  return mapping[channelType] ?? "unknown";
}

// =============================================================================
// Chatwoot Adapter
// =============================================================================

export const chatwootAdapter: PlatformAdapter = {
  platform: "chatwoot",

  normalize(payload: Record<string, unknown>): AdapterResult {
    const data = payload as unknown as ChatwootWebhookPayload;

    // Only process message_created events
    if (data.event && data.event !== "message_created") {
      return { skip: true, reason: `Ignored event: ${data.event}` };
    }

    // Only process incoming messages (from the customer)
    if (data.message_type !== "incoming") {
      return {
        skip: true,
        reason: `Ignored message_type: ${data.message_type}`,
      };
    }

    // Must have content
    if (!data.content || data.content.trim() === "") {
      return { skip: true, reason: "Empty message content" };
    }

    // Build the universal message
    const conversationId =
      data.conversation?.display_id?.toString() ??
      data.conversation?.id?.toString() ??
      "unknown";

    const message: UniversalMessage = {
      content: data.content.trim(),
      sender_name:
        data.sender?.name ?? data.contact?.name ?? "Unknown Contact",
      sender_id:
        data.contact?.id?.toString() ??
        data.sender?.id?.toString() ??
        "unknown",
      conversation_id: conversationId,
      channel: mapChatwootChannel(data.inbox?.channel_type),
      platform: "chatwoot",
      raw_payload: payload,
      inbox_id: data.inbox?.id?.toString() ?? data.conversation?.inbox_id?.toString(),
      account_id: data.account?.id?.toString() ?? data.conversation?.account_id?.toString(),
    };

    return { skip: false, message };
  },

  async sendResponse({ message, reply, platformConfig }) {
    const baseUrl = (platformConfig.base_url as string) ?? "https://app.chatwoot.com";
    const apiToken = platformConfig.api_token as string;
    const accountId =
      (platformConfig.account_id as string) ?? message.account_id;

    if (!apiToken || !accountId) {
      logger.error("Chatwoot sendResponse: missing api_token or account_id", undefined, {
        hasApiToken: !!apiToken,
        hasAccountId: !!accountId,
      });
      return;
    }

    const conversationId = message.conversation_id;
    const url = `${baseUrl}/api/v1/accounts/${accountId}/conversations/${conversationId}/messages`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          api_access_token: apiToken,
        },
        body: JSON.stringify({
          content: reply,
          message_type: "outgoing",
          private: false,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        logger.error("Chatwoot API error", undefined, {
          status: response.status,
          body: errorBody,
          url,
        });
      } else {
        logger.info("Chatwoot: message sent successfully", {
          conversationId,
        });
      }
    } catch (error) {
      logger.error("Chatwoot sendResponse failed", error);
    }
  },
};
