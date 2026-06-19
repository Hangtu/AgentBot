/**
 * @fileoverview Integrations page — Chatwoot configuration.
 * Allows setting api_token, account_id, base_url, and response_mode.
 * Includes a "Test Connection" button that pings the Chatwoot API.
 */

"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Plug,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChannelConfig {
  platform_config: {
    base_url?: string;
    api_token?: string;
    account_id?: string;
  };
  response_mode: string;
  is_active: boolean;
}

type TestStatus = "idle" | "loading" | "success" | "error";

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function IntegrationsPage() {
  const [channel, setChannel] = useState<ChannelConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [baseUrl, setBaseUrl] = useState("https://app.chatwoot.com");
  const [apiToken, setApiToken] = useState("");
  const [accountId, setAccountId] = useState("");
  const [responseMode, setResponseMode] = useState("direct");
  const [showToken, setShowToken] = useState(false);

  // Connection test
  const [testStatus, setTestStatus] = useState<TestStatus>("idle");
  const [testMessage, setTestMessage] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/v1/admin/integrations");
        const data = (await res.json()) as { channel: ChannelConfig | null };
        if (data.channel) {
          setChannel(data.channel);
          setBaseUrl(data.channel.platform_config.base_url ?? "https://app.chatwoot.com");
          setApiToken(data.channel.platform_config.api_token ?? "");
          setAccountId(data.channel.platform_config.account_id ?? "");
          setResponseMode(data.channel.response_mode ?? "direct");
        }
      } catch {
        toast.error("No se pudo cargar la configuración de integraciones");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  async function handleTestConnection() {
    setTestStatus("loading");
    setTestMessage("");
    try {
      const res = await fetch("/api/v1/admin/integrations/test-chatwoot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base_url: baseUrl, api_token: apiToken, account_id: accountId }),
      });
      const data = (await res.json()) as { success: boolean; message?: string; error?: string };
      if (data.success) {
        setTestStatus("success");
        setTestMessage(data.message ?? "Conexión exitosa");
      } else {
        setTestStatus("error");
        setTestMessage(data.error ?? "Error de conexión");
      }
    } catch {
      setTestStatus("error");
      setTestMessage("No se pudo conectar. Verifica la URL.");
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/v1/admin/integrations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base_url: baseUrl, api_token: apiToken, account_id: accountId, response_mode: responseMode }),
      });
      if (!res.ok) throw new Error();
      toast.success("Integración guardada correctamente");
    } catch {
      toast.error("Error al guardar la configuración de Chatwoot");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-96 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Integraciones</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Conecta tu agente con Chatwoot para recibir y responder mensajes.
          </p>
        </div>
        {channel && (
          <Badge variant={channel.is_active ? "default" : "secondary"}>
            {channel.is_active ? "Conectado" : "Inactivo"}
          </Badge>
        )}
      </div>

      {/* Chatwoot card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Chatwoot logo placeholder */}
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-950">
                <Plug className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <CardTitle className="text-base">Chatwoot</CardTitle>
                <CardDescription>
                  Plataforma de atención al cliente omnicanal.{" "}
                  <a
                    href="https://www.chatwoot.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    chatwoot.com
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Base URL */}
          <div className="space-y-2">
            <Label htmlFor="base-url">URL del servidor Chatwoot</Label>
            <Input
              id="base-url"
              type="url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://app.chatwoot.com"
            />
            <p className="text-[11px] text-muted-foreground">
              Usa <code className="font-mono">https://app.chatwoot.com</code> si
              estás en la nube, o la URL de tu instancia self-hosted.
            </p>
          </div>

          <Separator />

          {/* Account ID */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="account-id">Account ID</Label>
              <Input
                id="account-id"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                placeholder="167674"
              />
              <p className="text-[11px] text-muted-foreground">
                Encuéntralo en Chatwoot → Configuración → General.
              </p>
            </div>

            {/* API Token */}
            <div className="space-y-2">
              <Label htmlFor="api-token">API Access Token</Label>
              <div className="relative">
                <Input
                  id="api-token"
                  type={showToken ? "text" : "password"}
                  value={apiToken}
                  onChange={(e) => setApiToken(e.target.value)}
                  placeholder="vjc9cxyst6fc..."
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showToken ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Perfil → Configuración de acceso → Token de acceso.
              </p>
            </div>
          </div>

          <Separator />

          {/* Response mode */}
          <div className="space-y-2">
            <Label htmlFor="response-mode">Modo de respuesta</Label>
            <Select value={responseMode} onValueChange={setResponseMode}>
              <SelectTrigger id="response-mode" className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="direct">
                  Direct — el bot responde directamente
                </SelectItem>
                <SelectItem value="sync">
                  Sync — responde y espera confirmación
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">
              <strong>Direct</strong> es el modo recomendado para producción con Chatwoot.
            </p>
          </div>

          {/* Test connection */}
          <div className="rounded-xl border bg-muted/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Probar conexión</p>
                <p className="text-[11px] text-muted-foreground">
                  Verifica que el token y el account ID sean válidos.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestConnection}
                disabled={testStatus === "loading" || !apiToken || !accountId}
                className="gap-2"
              >
                {testStatus === "loading" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plug className="h-4 w-4" />
                )}
                {testStatus === "loading" ? "Probando..." : "Probar"}
              </Button>
            </div>

            {testStatus !== "idle" && testStatus !== "loading" && (
              <div
                className={`mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${
                  testStatus === "success"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                    : "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300"
                }`}
              >
                {testStatus === "success" ? (
                  <CheckCircle className="h-4 w-4 shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 shrink-0" />
                )}
                {testMessage}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Guardando..." : "Guardar integración"}
        </Button>
      </div>
    </div>
  );
}
