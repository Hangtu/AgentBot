/**
 * @fileoverview Core type definitions for the agentBot AI middleware.
 * These types define the universal message format, LLM interfaces,
 * and bot configuration structures used across all adapters and the engine.
 */

// =============================================================================
// Universal Message — normalized format for any platform
// =============================================================================

/** Supported external platforms */
export type Platform =
  | "chatwoot"
  | "n8n"
  | "make"
  | "zapier"
  | "generic";

/** Messaging channels */
export type Channel =
  | "whatsapp"
  | "instagram"
  | "facebook"
  | "telegram"
  | "web"
  | "email"
  | "sms"
  | "all"
  | "unknown";

/** How the bot should send the response back */
export type ResponseMode = "sync" | "callback" | "direct";

/**
 * The universal normalized message format.
 * Every adapter transforms its platform-specific payload into this shape.
 */
export interface UniversalMessage {
  /** The text content of the message */
  content: string;
  /** Display name of the sender */
  sender_name: string;
  /** Unique ID of the sender on the external platform */
  sender_id: string;
  /** Conversation/thread ID on the external platform */
  conversation_id: string;
  /** Which messaging channel (whatsapp, instagram, etc.) */
  channel: Channel;
  /** Which platform sent this webhook (chatwoot, n8n, etc.) */
  platform: Platform;
  /** The original un-modified payload from the platform */
  raw_payload: Record<string, unknown>;
  /** Optional URL to POST the response back to */
  callback_url?: string;
  /** Optional inbox ID for platform-specific routing */
  inbox_id?: string;
  /** Optional account ID on the platform */
  account_id?: string;
}

// =============================================================================
// LLM Types
// =============================================================================

/** A single message in a chat conversation for the LLM */
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/** Supported LLM providers */
export type LLMProviderName = "gemini" | "openai" | "anthropic" | "groq";

/** Configuration passed to the LLM provider */
export interface LLMConfig {
  provider: LLMProviderName;
  model: string;
  temperature: number;
  maxTokens: number;
  apiKey: string;
}

/** Interface that all LLM providers must implement */
export interface LLMProvider {
  generateResponse(params: {
    systemPrompt: string;
    messages: ChatMessage[];
    model: string;
    temperature: number;
    maxTokens: number;
  }): Promise<{ text: string; tokensUsed?: number }>;
}

// =============================================================================
// Bot Configuration (from DB)
// =============================================================================

export interface BotConfig {
  id: string;
  tenant_id: string;
  name: string;
  system_prompt: string;
  llm_provider: LLMProviderName;
  llm_model: string;
  temperature: number;
  max_tokens: number;
  context_window: number;
  is_active: boolean;
}

// =============================================================================
// Webhook Response
// =============================================================================

/** Response returned from the webhook endpoint */
export interface WebhookResponse {
  success: boolean;
  reply?: string;
  conversation_id?: string;
  error?: string;
}

// =============================================================================
// Adapter Interface
// =============================================================================

/** Result of adapter normalization — either a valid message or a skip signal */
export type AdapterResult =
  | { skip: false; message: UniversalMessage }
  | { skip: true; reason: string };

/** Interface that all platform adapters must implement */
export interface PlatformAdapter {
  /** Platform identifier */
  platform: Platform;
  /** Transform raw webhook payload into a UniversalMessage */
  normalize(payload: Record<string, unknown>): AdapterResult;
  /** Send a response back to the platform (for "direct" response mode) */
  sendResponse?(params: {
    message: UniversalMessage;
    reply: string;
    platformConfig: Record<string, unknown>;
  }): Promise<void>;
}
