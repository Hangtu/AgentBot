/**
 * @fileoverview Dashboard root layout.
 * Wraps all /dashboard/* pages with sidebar + header.
 * Protected by Clerk — redirects to sign-in if not authenticated.
 */

import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { Bot, FolderOpen, Database } from "lucide-react";

import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { hasLocalConfig } from "@/lib/agent/config-loader";
import { Badge } from "@/components/ui/badge";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  const isLocalMode = hasLocalConfig();

  return (
    <div className="flex min-h-screen bg-background">
      {/* ── Sidebar ── */}
      <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-border bg-card">
        {/* Brand */}
        <div className="flex h-16 items-center gap-3 border-b border-border px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
            <Bot className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              AgentBot
            </p>
            <p className="truncate text-[10px] text-muted-foreground">
              Admin Panel
            </p>
          </div>
        </div>

        {/* Mode badge */}
        <div className="px-4 py-3">
          {isLocalMode ? (
            <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-800 dark:bg-amber-950">
              <FolderOpen className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
              <span className="text-[10px] font-medium text-amber-700 dark:text-amber-300">
                Modo Archivo Local
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 dark:border-emerald-800 dark:bg-emerald-950">
              <Database className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
                Modo Base de Datos
              </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-2">
          <DashboardNav />
        </div>

        {/* User footer */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            <UserButton afterSignOutUrl="/" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-foreground">
                {user?.firstName ?? user?.emailAddresses[0]?.emailAddress ?? "Usuario"}
              </p>
              <p className="truncate text-[10px] text-muted-foreground">
                {user?.emailAddresses[0]?.emailAddress ?? ""}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="ml-60 flex min-h-screen flex-1 flex-col">
        <div className="flex-1 p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
