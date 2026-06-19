/**
 * @fileoverview Agent configuration page.
 * Allows editing: bot name, LLM provider/model, temperature, max_tokens, context_window.
 * Saves to DB via PUT /api/v1/admin/bot
 */

"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Bot, Save, AlertTriangle } from "lucide-react";

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ---------------------------------------------------------------------------
// LLM model options per provider
// ---------------------------------------------------------------------------

const MODELS: Record<string, { value: string; label: string }[]> = {
  groq: [
    { value: "llama-3.3-70b-versatile", label: "Llama 3.3 70B (Versatile)" },
    { value: "llama-3.1-8b-instant", label: "Llama 3.1 8B (Fast)" },
    { value: "mixtral-8x7b-32768", label: "Mixtral 8x7B" },
    { value: "gemma2-9b-it", label: "Gemma 2 9B" },
  ],
  gemini: [
    { value: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash Lite (Fast)" },
    { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
    { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
  ],
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BotConfig {
  id: string;
  name: string;
  llm_provider: string;
  llm_model: string;
  temperature: number;
  max_tokens: number;
  context_window: number;
  is_active: boolean;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AgentConfigPage() {
  const [bot, setBot] = useState<BotConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isLocalMode, setIsLocalMode] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [provider, setProvider] = useState("groq");
  const [model, setModel] = useState("llama-3.3-70b-versatile");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [contextWindow, setContextWindow] = useState(20);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/v1/admin/bot");
        const data = (await res.json()) as { bot: BotConfig | null };
        if (data.bot) {
          setBot(data.bot);
          setName(data.bot.name);
          setProvider(data.bot.llm_provider);
          setModel(data.bot.llm_model);
          setTemperature(data.bot.temperature);
          setMaxTokens(data.bot.max_tokens);
          setContextWindow(data.bot.context_window);
        }
      } catch {
        toast.error("No se pudo cargar la configuración del agente");
      } finally {
        setLoading(false);
      }
    }

    // Check if running in local mode by looking at the stats
    fetch("/api/v1/admin/stats")
      .then((r) => r.json())
      .then((d: { mode?: string }) => setIsLocalMode(d.mode === "local"))
      .catch(() => {});

    void load();
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/v1/admin/bot", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          llm_provider: provider,
          llm_model: model,
          temperature,
          max_tokens: maxTokens,
          context_window: contextWindow,
        }),
      });

      if (!res.ok) throw new Error("Error al guardar");
      const data = (await res.json()) as { bot: BotConfig };
      setBot(data.bot);
      toast.success("Configuración guardada correctamente");
    } catch {
      toast.error("No se pudo guardar la configuración");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-64 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configuración del Agente</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Nombre, proveedor LLM y parámetros de generación.
          </p>
        </div>
        {bot && (
          <Badge variant={bot.is_active ? "default" : "secondary"}>
            {bot.is_active ? "Activo" : "Inactivo"}
          </Badge>
        )}
      </div>

      {/* Local mode warning */}
      {isLocalMode && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/50">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-xs text-amber-700 dark:text-amber-300">
            <strong>Modo Archivo Local activo.</strong> El bot usa{" "}
            <code className="font-mono">config/agent.json</code>. Los cambios
            aquí se guardan en la DB pero no afectan el bot hasta que elimines
            ese archivo.
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bot identity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bot className="h-4 w-4" />
              Identidad
            </CardTitle>
            <CardDescription>Nombre y estado del agente.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bot-name">Nombre del agente</Label>
              <Input
                id="bot-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Valeria — GibboRadio"
              />
            </div>
          </CardContent>
        </Card>

        {/* LLM Provider */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Proveedor LLM</CardTitle>
            <CardDescription>Motor de inteligencia artificial.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="llm-provider">Proveedor</Label>
              <Select
                value={provider}
                onValueChange={(v) => {
                  setProvider(v);
                  setModel(MODELS[v]?.[0]?.value ?? "");
                }}
              >
                <SelectTrigger id="llm-provider">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="groq">Groq (recomendado)</SelectItem>
                  <SelectItem value="gemini">Google Gemini</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="llm-model">Modelo</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger id="llm-model">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(MODELS[provider] ?? []).map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Generation parameters */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Parámetros de generación</CardTitle>
            <CardDescription>
              Controlan el comportamiento del modelo al generar respuestas.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="temperature">
                Temperatura{" "}
                <span className="ml-1 font-mono text-xs text-muted-foreground">
                  {temperature.toFixed(1)}
                </span>
              </Label>
              <Input
                id="temperature"
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Preciso (0)</span>
                <span>Creativo (1)</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-tokens">Max tokens</Label>
              <Input
                id="max-tokens"
                type="number"
                min={256}
                max={8192}
                step={256}
                value={maxTokens}
                onChange={(e) => setMaxTokens(Number(e.target.value))}
              />
              <p className="text-[10px] text-muted-foreground">
                Longitud máxima de respuesta.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="context-window">Ventana de contexto</Label>
              <Input
                id="context-window"
                type="number"
                min={5}
                max={100}
                step={5}
                value={contextWindow}
                onChange={(e) => setContextWindow(Number(e.target.value))}
              />
              <p className="text-[10px] text-muted-foreground">
                Mensajes anteriores a incluir.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </div>
  );
}
