/**
 * @fileoverview Conversation context manager.
 * Handles loading, building, and persisting conversation history from the database.
 * Implements a sliding window to keep context within the LLM's token budget.
 */

import { eq, and } from "drizzle-orm";

import { db } from "@/lib/db";
import { conversations, messages, bots, tenants } from "@/lib/db/schema";
import { logger } from "@/lib/logger";
import type { BotConfig, ChatMessage, UniversalMessage } from "@/types/agent";

// =============================================================================
// Local In-Memory Fallback Store (for database-less mode)
// =============================================================================

interface LocalConversation {
  id: string;
  bot_id: string;
  external_conversation_id: string;
  platform: string;
  channel: string;
  contact_name: string;
  contact_id: string;
  last_message_at: Date;
}

interface LocalMessage {
  conversation_id: string;
  role: "system" | "user" | "assistant";
  content: string;
  created_at: Date;
}

const localConversations = new Map<string, LocalConversation>();
const localMessages: LocalMessage[] = [];

/**
 * Helper to handle conversation creation in memory when database is disabled.
 */
function findOrCreateConversationInMemory(
  botId: string,
  message: UniversalMessage
): LocalConversation {
  const key = `${message.platform}:${message.conversation_id}`;
  const existing = localConversations.get(key);
  if (existing) {
    existing.last_message_at = new Date();
    return existing;
  }

  const newConv: LocalConversation = {
    id: key,
    bot_id: botId,
    external_conversation_id: message.conversation_id,
    platform: message.platform,
    channel: message.channel,
    contact_name: message.sender_name,
    contact_id: message.sender_id,
    last_message_at: new Date(),
  };
  localConversations.set(key, newConv);
  logger.info("New local in-memory conversation created", { conversationId: key });
  return newConv;
}

// =============================================================================
// Context Manager
// =============================================================================

/**
 * Find or create a conversation record for the given external conversation.
 */
export async function findOrCreateConversation(
  botId: string,
  message: UniversalMessage
) {
  if (!db) {
    return findOrCreateConversationInMemory(botId, message);
  }

  // Ensure local configuration references exist in the database (hybrid mode)
  if (botId === "00000000-0000-0000-0000-000000000000") {
    try {
      await db
        .insert(tenants)
        .values({
          id: "00000000-0000-0000-0000-000000000000",
          name: "Local Development Tenant",
          email: "local@example.com",
          api_key: "ak_live_local",
        })
        .onConflictDoNothing();

      await db
        .insert(bots)
        .values({
          id: "00000000-0000-0000-0000-000000000000",
          tenant_id: "00000000-0000-0000-0000-000000000000",
          name: "Local Bot",
          system_prompt: "Local prompt",
        })
        .onConflictDoNothing();
    } catch (err) {
      logger.warn("Failed to seed dummy local bot/tenant in active DB, using memory fallback.", { error: err });
      return findOrCreateConversationInMemory(botId, message);
    }
  }

  // Try to find existing conversation
  const existing = await db.query.conversations.findFirst({
    where: and(
      eq(conversations.bot_id, botId),
      eq(conversations.external_conversation_id, message.conversation_id),
      eq(conversations.platform, message.platform)
    ),
  });

  if (existing) {
    // Update last_message_at
    await db
      .update(conversations)
      .set({ last_message_at: new Date() })
      .where(eq(conversations.id, existing.id));
    return existing;
  }

  // Create new conversation
  const [conversation] = await db
    .insert(conversations)
    .values({
      bot_id: botId,
      external_conversation_id: message.conversation_id,
      platform: message.platform,
      channel: message.channel,
      contact_name: message.sender_name,
      contact_id: message.sender_id,
      metadata: {
        inbox_id: message.inbox_id,
        account_id: message.account_id,
      },
    })
    .returning();

  logger.info("New conversation created", {
    conversationId: conversation.id,
    externalId: message.conversation_id,
    platform: message.platform,
  });

  return conversation;
}

/**
 * Load the conversation history as ChatMessage[] for the LLM.
 * Returns the last `contextWindow` messages in chronological order.
 */
export async function loadConversationHistory(
  conversationId: string,
  contextWindow: number
): Promise<ChatMessage[]> {
  if (!db) {
    const history = localMessages
      .filter((msg) => msg.conversation_id === conversationId)
      .slice(-contextWindow);
    return history.map((msg) => ({
      role: msg.role as ChatMessage["role"],
      content: msg.content,
    }));
  }

  const result = await db.query.messages.findMany({
    where: eq(messages.conversation_id, conversationId),
    orderBy: (msgs, { desc }) => [desc(msgs.created_at)],
    limit: contextWindow,
  });

  // Reverse to get chronological order (oldest first)
  return result.reverse().map((msg) => ({
    role: msg.role as ChatMessage["role"],
    content: msg.content,
  }));
}

/**
 * Save a message (user or assistant) to the conversation history.
 */
export async function saveMessage(params: {
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  tokensUsed?: number;
  responseTimeMs?: number;
}) {
  if (!db) {
    const msg: LocalMessage = {
      conversation_id: params.conversationId,
      role: params.role,
      content: params.content,
      created_at: new Date(),
    };
    localMessages.push(msg);
    if (localMessages.length > 5000) {
      localMessages.shift();
    }
    return msg;
  }

  const [message] = await db
    .insert(messages)
    .values({
      conversation_id: params.conversationId,
      role: params.role,
      content: params.content,
      tokens_used: params.tokensUsed,
      response_time_ms: params.responseTimeMs,
    })
    .returning();

  return message;
}

/**
 * Build the complete message array for the LLM call.
 * Combines: existing history + new user message.
 */
export async function buildLLMContext(
  conversationId: string,
  newMessage: string,
  config: BotConfig
): Promise<ChatMessage[]> {
  const history = await loadConversationHistory(
    conversationId,
    config.context_window
  );

  // Add the new user message
  history.push({ role: "user", content: newMessage });

  return history;
}
