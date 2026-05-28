/**
 * @fileoverview Zod schemas for bot configuration and webhook validation.
 */

import { z } from "zod";

// =============================================================================
// Bot Configuration Schemas
// =============================================================================

export const llmProviderSchema = z.enum([
  "gemini",
  "openai",
  "anthropic",
  "groq",
]);

export const platformSchema = z.enum([
  "chatwoot",
  "n8n",
  "make",
  "zapier",
  "generic",
]);

export const responseModeSchema = z.enum(["sync", "callback", "direct"]);

export const channelSchema = z.enum([
  "whatsapp",
  "instagram",
  "facebook",
  "telegram",
  "web",
  "email",
  "sms",
  "all",
  "unknown",
]);

export const createBotSchema = z.object({
  name: z
    .string()
    .min(1, "Bot name is required")
    .max(100, "Bot name must be under 100 characters"),
  system_prompt: z
    .string()
    .min(1, "System prompt is required")
    .max(10000, "System prompt must be under 10,000 characters"),
  llm_provider: llmProviderSchema.default("gemini"),
  llm_model: z.string().default("gemini-2.0-flash-lite"),
  temperature: z.number().min(0).max(2).default(0.7),
  max_tokens: z.number().min(1).max(8192).default(1024),
  context_window: z.number().min(1).max(100).default(20),
});

export const updateBotSchema = createBotSchema.partial();

export const createBotChannelSchema = z.object({
  bot_id: z.string().uuid("Invalid bot ID"),
  platform: platformSchema.default("generic"),
  channel: channelSchema.default("all"),
  response_mode: responseModeSchema.default("sync"),
  platform_config: z.record(z.unknown()).default({}),
  inbox_id: z.string().optional(),
});

export const createTenantSchema = z.object({
  name: z.string().min(1, "Tenant name is required"),
  email: z.string().email("Invalid email address"),
});
