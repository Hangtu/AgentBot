/**
 * @fileoverview Dashboard overview page.
 * Shows bot status, conversation counts, and quick-action cards.
 */

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Bot,
  MessageSquare,
  Plug,
  BookOpen,
  ArrowRight,
  FolderOpen,
  Database,
  Zap,
  Activity,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { hasLocalConfig } from "@/lib/agent/config-loader";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const isLocalMode = hasLocalConfig();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Panel de Control
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gestiona tu agente, integraciones y conversaciones desde aquí.
        </p>
      </div>

      {/* Mode alert */}
      {isLocalMode ? (
        <div className="flex items-start gap-4 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/50">
          <FolderOpen className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
              Modo Archivo Local activo
            </p>
            <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-300">
              Tu bot está usando{" "}
              <code className="font-mono">config/agent.json</code>,{" "}
              <code className="font-mono">system_prompt.txt</code> y{" "}
              <code className="font-mono">knowledge.txt</code>. Los cambios en el
              editor de la UI no afectarán el bot mientras esos archivos existan.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/50">
          <Database className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div>
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
              Modo Base de Datos activo
            </p>
            <p className="mt-0.5 text-xs text-emerald-700 dark:text-emerald-300">
              Tu bot usa la configuración guardada en la base de datos. Edítala
              desde el panel de abajo y los cambios aplican de inmediato.
            </p>
          </div>
        </div>
      )}

      {/* Quick action cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <QuickActionCard
          href="/dashboard/agent"
          icon={Bot}
          iconColor="text-violet-600"
          iconBg="bg-violet-50 dark:bg-violet-950/50"
          title="Configurar Agente"
          description="Nombre, modelo LLM, temperatura y parámetros de respuesta."
        />
        <QuickActionCard
          href="/dashboard/agent/prompt"
          icon={Zap}
          iconColor="text-blue-600"
          iconBg="bg-blue-50 dark:bg-blue-950/50"
          title="System Prompt"
          description="Define la personalidad, reglas de comportamiento y tono del agente."
        />
        <QuickActionCard
          href="/dashboard/agent/knowledge"
          icon={BookOpen}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50 dark:bg-emerald-950/50"
          title="Knowledge Base"
          description="Información de productos, precios, FAQs y scripts de calificación."
        />
        <QuickActionCard
          href="/dashboard/integrations"
          icon={Plug}
          iconColor="text-orange-600"
          iconBg="bg-orange-50 dark:bg-orange-950/50"
          title="Integraciones"
          description="Conecta Chatwoot con tu API token y account ID."
        />
        <QuickActionCard
          href="/dashboard/conversations"
          icon={MessageSquare}
          iconColor="text-pink-600"
          iconBg="bg-pink-50 dark:bg-pink-950/50"
          title="Conversaciones"
          description="Historial de conversaciones con prospectos y leads."
        />
        <QuickActionCard
          href="/dashboard/logs"
          icon={Activity}
          iconColor="text-slate-600"
          iconBg="bg-slate-50 dark:bg-slate-950/50"
          title="Logs"
          description="Actividad reciente del agente para debugging y monitoreo."
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-component
// ---------------------------------------------------------------------------

function QuickActionCard({
  href,
  icon: Icon,
  iconColor,
  iconBg,
  title,
  description,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
}) {
  return (
    <Link href={href} className="group">
      <Card className="h-full transition-all duration-200 hover:border-primary/40 hover:shadow-md">
        <CardHeader className="pb-3">
          <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
          <CardTitle className="flex items-center justify-between text-base">
            {title}
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </CardTitle>
          <CardDescription className="text-xs leading-relaxed">
            {description}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
