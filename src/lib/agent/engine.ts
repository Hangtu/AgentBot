/**
 * @fileoverview Agent Engine — the core orchestrator.
 * Receives a normalized UniversalMessage, loads bot config and conversation
 * context, calls the LLM, persists the exchange, and dispatches the response.
 * This is the single entry point for processing any incoming message.
 */

import { eq, and } from "drizzle-orm";

import { db } from "@/lib/db";
import { bots, bot_channels, tenants } from "@/lib/db/schema";
import { getLLMProvider } from "@/lib/llm";
import { logger } from "@/lib/logger";
import type {
  BotConfig,
  LLMProviderName,
  ResponseMode,
  UniversalMessage,
  WebhookResponse,
} from "@/types/agent";

import {
  buildLLMContext,
  findOrCreateConversation,
  saveMessage,
} from "./context-manager";
import { dispatchResponse } from "./response-dispatcher";

// =============================================================================
// Agent Engine
// =============================================================================

/**
 * Resolve which bot should handle this message.
 * Priority: bot_channel match (by platform + inbox) → first active bot for tenant.
 */
async function resolveBot(
  tenantId: string,
  message: UniversalMessage
): Promise<{
  bot: BotConfig;
  responseMode: ResponseMode;
  platformConfig: Record<string, unknown>;
} | null> {
  // 1. Try to find a bot_channel that matches this platform + inbox
  const allBotChannels = await db.query.bot_channels.findMany({
    where: and(
      eq(bot_channels.platform, message.platform),
      eq(bot_channels.is_active, true)
    ),
  });

  for (const bc of allBotChannels) {
    // Check if the bot belongs to this tenant and is active
    const bot = await db.query.bots.findFirst({
      where: and(
        eq(bots.id, bc.bot_id),
        eq(bots.tenant_id, tenantId),
        eq(bots.is_active, true)
      ),
    });

    if (!bot) continue;

    // Check inbox match (if specified)
    if (bc.inbox_id && message.inbox_id && bc.inbox_id !== message.inbox_id) {
      continue;
    }

    return {
      bot: {
        id: bot.id,
        tenant_id: bot.tenant_id,
        name: bot.name,
        system_prompt: bot.system_prompt,
        llm_provider: bot.llm_provider as LLMProviderName,
        llm_model: bot.llm_model,
        temperature: bot.temperature,
        max_tokens: bot.max_tokens,
        context_window: bot.context_window,
        is_active: bot.is_active,
      },
      responseMode: bc.response_mode as ResponseMode,
      platformConfig: (bc.platform_config as Record<string, unknown>) ?? {},
    };
  }

  // 2. Fallback: first active bot for this tenant (no channel restriction)
  const fallbackBot = await db.query.bots.findFirst({
    where: and(eq(bots.tenant_id, tenantId), eq(bots.is_active, true)),
  });

  if (!fallbackBot) return null;

  return {
    bot: {
      id: fallbackBot.id,
      tenant_id: fallbackBot.tenant_id,
      name: fallbackBot.name,
      system_prompt: fallbackBot.system_prompt,
      llm_provider: fallbackBot.llm_provider as LLMProviderName,
      llm_model: fallbackBot.llm_model,
      temperature: fallbackBot.temperature,
      max_tokens: fallbackBot.max_tokens,
      context_window: fallbackBot.context_window,
      is_active: fallbackBot.is_active,
    },
    responseMode: "sync",
    platformConfig: {},
  };
}

/**
 * Process an incoming message through the full agent pipeline.
 *
 * Pipeline:
 * 1. Resolve which bot handles this message
 * 2. Find or create the conversation
 * 3. Load conversation history (context)
 * 4. Call the LLM with system prompt + context + new message
 * 5. Save both user message and bot response
 * 6. Dispatch the response back to the platform
 *
 * @param tenantId - The tenant UUID (resolved from API key)
 * @param message - The normalized universal message
 * @param responseModeOverride - Override the response mode (from query param)
 * @returns WebhookResponse with the bot's reply
 */
export async function processMessage(
  tenantId: string,
  message: UniversalMessage,
  responseModeOverride?: ResponseMode
): Promise<WebhookResponse> {
  const startTime = Date.now();

  // 1. Resolve bot
  const resolved = await resolveBot(tenantId, message);
  if (!resolved) {
    logger.warn("No active bot found for tenant", {
      tenantId,
      platform: message.platform,
    });
    return {
      success: false,
      error: "No active bot configured for this tenant/platform.",
    };
  }

  const { bot, responseMode: defaultMode, platformConfig } = resolved;
  const responseMode = responseModeOverride ?? defaultMode;

  logger.info("Processing message", {
    botName: bot.name,
    platform: message.platform,
    channel: message.channel,
    conversationId: message.conversation_id,
    senderName: message.sender_name,
  });

  // 2. Find or create conversation
  const conversation = await findOrCreateConversation(bot.id, message);

  // 3. Build LLM context (history + new message)
  const llmMessages = await buildLLMContext(
    conversation.id,
    message.content,
    bot
  );

  // 4. Call the LLM
  let replyText: string;
  let tokensUsed: number | undefined;

  try {
    const llm = getLLMProvider(bot.llm_provider);
    const result = await llm.generateResponse({
      systemPrompt: bot.system_prompt,
      messages: llmMessages,
      model: bot.llm_model,
      temperature: bot.temperature,
      maxTokens: bot.max_tokens,
    });

    replyText = result.text;
    tokensUsed = result.tokensUsed;
  } catch (error) {
    logger.error("LLM call failed", error, {
      botId: bot.id,
      provider: bot.llm_provider,
      model: bot.llm_model,
    });
    return {
      success: false,
      error: "Failed to generate response from AI.",
    };
  }

  const responseTimeMs = Date.now() - startTime;

  // 5. Save messages to DB
  await saveMessage({
    conversationId: conversation.id,
    role: "user",
    content: message.content,
  });

  await saveMessage({
    conversationId: conversation.id,
    role: "assistant",
    content: replyText,
    tokensUsed,
    responseTimeMs,
  });

  // 6. Dispatch response
  await dispatchResponse({
    mode: responseMode,
    message,
    reply: replyText,
    platformConfig,
  });

  logger.info("Message processed successfully", {
    botName: bot.name,
    responseTimeMs,
    tokensUsed,
    responseMode,
  });

  return {
    success: true,
    reply: replyText,
    conversation_id: message.conversation_id,
  };
}

/**
 * Look up a tenant by their API key.
 * Returns the tenant record or null if not found / inactive.
 */
export async function findTenantByApiKey(apiKey: string) {
  const tenant = await db.query.tenants.findFirst({
    where: and(eq(tenants.api_key, apiKey), eq(tenants.is_active, true)),
  });
  return tenant ?? null;
}
