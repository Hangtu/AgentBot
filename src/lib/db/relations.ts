/**
 * @fileoverview Drizzle ORM relations definitions.
 * Required for db.query API to resolve relationships between tables.
 */

import { relations } from "drizzle-orm";

import {
  bots,
  bot_channels,
  conversations,
  messages,
  tenants,
} from "./schema";

// =============================================================================
// Relations
// =============================================================================

export const tenantsRelations = relations(tenants, ({ many }) => ({
  bots: many(bots),
}));

export const botsRelations = relations(bots, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [bots.tenant_id],
    references: [tenants.id],
  }),
  channels: many(bot_channels),
  conversations: many(conversations),
}));

export const botChannelsRelations = relations(bot_channels, ({ one }) => ({
  bot: one(bots, {
    fields: [bot_channels.bot_id],
    references: [bots.id],
  }),
}));

export const conversationsRelations = relations(
  conversations,
  ({ one, many }) => ({
    bot: one(bots, {
      fields: [conversations.bot_id],
      references: [bots.id],
    }),
    messages: many(messages),
  })
);

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversation_id],
    references: [conversations.id],
  }),
}));
