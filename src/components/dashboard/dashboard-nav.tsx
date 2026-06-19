/**
 * Dashboard Sidebar Navigation
 * Client component — handles active state highlighting
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  LayoutDashboard,
  Plug,
  MessageSquare,
  ScrollText,
  ChevronRight,
  FileText,
  BookOpen,
  Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Resumen",
    href: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Agente",
    href: "/dashboard/agent",
    icon: Bot,
    children: [
      { label: "Configuración", href: "/dashboard/agent", icon: Settings2, exact: true },
      { label: "System Prompt", href: "/dashboard/agent/prompt", icon: FileText },
      { label: "Knowledge Base", href: "/dashboard/agent/knowledge", icon: BookOpen },
    ],
  },
  {
    label: "Integraciones",
    href: "/dashboard/integrations",
    icon: Plug,
  },
  {
    label: "Conversaciones",
    href: "/dashboard/conversations",
    icon: MessageSquare,
  },
  {
    label: "Logs",
    href: "/dashboard/logs",
    icon: ScrollText,
  },
];

export function DashboardNav() {
  const pathname = usePathname();

  const isActive = (href: string, exact = false) => {
    // Strip locale prefix (e.g. /en/dashboard -> /dashboard)
    const normalized = pathname.replace(/^\/[a-z]{2}/, "");
    if (exact) return normalized === href;
    return normalized === href || normalized.startsWith(href + "/");
  };

  return (
    <nav className="space-y-1 px-3">
      {navItems.map((item) => {
        const active = isActive(item.href, item.exact);
        const Icon = item.icon;

        return (
          <div key={item.href}>
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.children && (
                <ChevronRight
                  className={cn(
                    "h-3.5 w-3.5 transition-transform",
                    active && "rotate-90"
                  )}
                />
              )}
            </Link>

            {/* Sub-navigation */}
            {item.children && isActive(item.href) && (
              <div className="ml-4 mt-1 space-y-1 border-l border-border pl-3">
                {item.children.map((child) => {
                  const childActive = isActive(child.href, child.exact);
                  const ChildIcon = child.icon;
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium transition-all duration-150",
                        childActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                    >
                      <ChildIcon className="h-3.5 w-3.5 shrink-0" />
                      {child.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
