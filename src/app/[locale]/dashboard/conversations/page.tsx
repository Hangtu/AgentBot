/**
 * @fileoverview Conversations page.
 * Lists all conversations for the tenant's bot.
 */

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { MessageSquare, Clock, User } from "lucide-react";

import { db } from "@/lib/db";
import { bots, conversations, tenants } from "@/lib/db/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Conversaciones" };

// Map channel to emoji
const CHANNEL_ICONS: Record<string, string> = {
  whatsapp: "💬",
  web: "🌐",
  email: "📧",
  telegram: "✈️",
  instagram: "📷",
  facebook: "📘",
  sms: "📱",
  unknown: "❓",
};

function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `hace ${days} día${days > 1 ? "s" : ""}`;
  if (hours > 0) return `hace ${hours} hora${hours > 1 ? "s" : ""}`;
  if (minutes > 0) return `hace ${minutes} min`;
  return "justo ahora";
}

export default async function ConversationsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  let convList: Awaited<ReturnType<typeof db.query.conversations.findMany>> = [];
  let hasBotConfigured = false;

  if (db) {
    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.clerk_user_id, userId),
    });

    if (tenant) {
      const bot = await db.query.bots.findFirst({
        where: eq(bots.tenant_id, tenant.id),
      });

      if (bot) {
        hasBotConfigured = true;
        convList = await db.query.conversations.findMany({
          where: eq(conversations.bot_id, bot.id),
          orderBy: (c, { desc }) => [desc(c.last_message_at)],
          limit: 50,
        });
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Conversaciones</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Historial de conversaciones gestionadas por tu agente.
          </p>
        </div>
        <Badge variant="secondary">{convList.length} conversación{convList.length !== 1 ? "es" : ""}</Badge>
      </div>

      {/* No bot configured */}
      {!hasBotConfigured && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">
              No hay bot configurado aún
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Crea un bot en la sección Agente para empezar a recibir conversaciones.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {hasBotConfigured && convList.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">
              Sin conversaciones todavía
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Las conversaciones aparecerán aquí cuando tu bot reciba mensajes.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Conversation list */}
      {convList.length > 0 && (
        <div className="space-y-2">
          {convList.map((conv) => (
            <Card key={conv.id} className="transition-colors hover:border-primary/30">
              <CardContent className="flex items-center gap-4 p-4">
                {/* Avatar */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-lg">
                  {CHANNEL_ICONS[conv.channel ?? "unknown"] ?? "💬"}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-foreground">
                      {conv.contact_name ?? "Contacto desconocido"}
                    </p>
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      {conv.channel ?? conv.platform}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    ID externo: {conv.external_conversation_id}
                  </p>
                </div>

                {/* Time */}
                <div className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {formatRelativeTime(new Date(conv.last_message_at))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
