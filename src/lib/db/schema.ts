import {
  boolean,
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// =============================================================================
// Database Schema — agentBot
// =============================================================================

// --- Original boilerplate table ---

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerk_id: text("clerk_id").notNull().unique(),
  email: text("email").notNull().unique(),
  name: text("name"),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// =============================================================================
// Agent Bot tables
// =============================================================================

/**
 * Tenants — each customer/business that uses agentBot.
 * A tenant has an API key used to authenticate incoming webhooks.
 */
export const tenants = pgTable("tenants", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  clerk_user_id: text("clerk_user_id").unique(),
  api_key: text("api_key").notNull().unique(),
  plan: text("plan").notNull().default("free"),
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/**
 * Bots — an AI agent configuration belonging to a tenant.
 * Each bot has its own system prompt, LLM model, and behavior settings.
 */
export const bots = pgTable("bots", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenant_id: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  system_prompt: text("system_prompt").notNull(),
  llm_provider: text("llm_provider").notNull().default("gemini"),
  llm_model: text("llm_model").notNull().default("gemini-2.0-flash"),
  temperature: real("temperature").notNull().default(0.7),
  max_tokens: integer("max_tokens").notNull().default(1024),
  context_window: integer("context_window").notNull().default(20),
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/**
 * Bot Channels — maps a bot to a specific platform/channel combination.
 * Determines how inbound messages are routed and how responses are sent back.
 */
export const bot_channels = pgTable("bot_channels", {
  id: uuid("id").defaultRandom().primaryKey(),
  bot_id: uuid("bot_id")
    .notNull()
    .references(() => bots.id, { onDelete: "cascade" }),
  platform: text("platform").notNull().default("generic"),
  channel: text("channel").notNull().default("all"),
  response_mode: text("response_mode").notNull().default("sync"),
  platform_config: jsonb("platform_config").default({}),
  inbox_id: text("inbox_id"),
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/**
 * Conversations — tracks a conversation thread between a contact and a bot.
 * Links the external platform conversation ID to internal context.
 */
export const conversations = pgTable("conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  bot_id: uuid("bot_id")
    .notNull()
    .references(() => bots.id, { onDelete: "cascade" }),
  external_conversation_id: text("external_conversation_id").notNull(),
  platform: text("platform").notNull(),
  channel: text("channel"),
  contact_name: text("contact_name"),
  contact_id: text("contact_id"),
  metadata: jsonb("metadata").default({}),
  last_message_at: timestamp("last_message_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/**
 * Messages — individual messages within a conversation.
 * Stores both user messages and bot responses for context history.
 */
export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversation_id: uuid("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  tokens_used: integer("tokens_used"),
  response_time_ms: integer("response_time_ms"),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
