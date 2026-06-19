/**
 * @fileoverview Logs page — recent agent activity.
 * Shows the last 100 messages processed by the bot (user + assistant).
 */

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import { Activity } from "lucide-react";

import { db } from "@/lib/db";
import { bots, conversations, messages, tenants } from "@/lib/db/schema";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Logs" };

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("es-MX", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function LogsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  type MessageRow = {
    id: string;
    role: string;
    content: string;
    tokens_used: number | null;
    response_time_ms: number | null;
    created_at: Date;
    conversation_id: string;
  };

  let messageList: MessageRow[] = [];

  if (db) {
    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.clerk_user_id, userId),
    });

    if (tenant) {
      const bot = await db.query.bots.findFirst({
        where: eq(bots.tenant_id, tenant.id),
      });

      if (bot) {
        // Get all conversation IDs for this bot
        const botConvs = await db.query.conversations.findMany({
          where: eq(conversations.bot_id, bot.id),
        });

        if (botConvs.length > 0) {
          const convIds = botConvs.map((c) => c.id);
          // Get recent messages - we'll filter in JS since drizzle inList needs import
          const allMessages = await db.query.messages.findMany({
            orderBy: [desc(messages.created_at)],
            limit: 200,
          });
          messageList = allMessages
            .filter((m) => convIds.includes(m.conversation_id))
            .slice(0, 100) as MessageRow[];
        }
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Logs de actividad</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Últimos 100 mensajes procesados por el agente.
          </p>
        </div>
        <Badge variant="secondary">{messageList.length} mensajes</Badge>
      </div>

      {/* Empty state */}
      {messageList.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Activity className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">
              Sin actividad registrada
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Los mensajes aparecerán aquí a medida que el bot procese conversaciones.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Message feed */}
      {messageList.length > 0 && (
        <div className="space-y-2">
          {messageList.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 rounded-xl border p-4 ${
                msg.role === "assistant"
                  ? "border-primary/20 bg-primary/5"
                  : "border-border bg-card"
              }`}
            >
              {/* Role badge */}
              <div className="shrink-0 pt-0.5">
                <Badge
                  variant={msg.role === "assistant" ? "default" : "secondary"}
                  className="text-[10px]"
                >
                  {msg.role === "assistant" ? "Bot" : "Usuario"}
                </Badge>
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <p className="whitespace-pre-wrap text-xs leading-relaxed text-foreground">
                  {msg.content}
                </p>

                {/* Meta */}
                <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
                  <span>{formatTime(new Date(msg.created_at))}</span>
                  {msg.tokens_used && (
                    <span>{msg.tokens_used.toLocaleString()} tokens</span>
                  )}
                  {msg.response_time_ms && (
                    <span>{msg.response_time_ms}ms</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
