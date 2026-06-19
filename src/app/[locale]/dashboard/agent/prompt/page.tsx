/**
 * @fileoverview System Prompt editor page.
 * Allows editing the system prompt (personality, rules, tone) stored in the DB.
 */

"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Zap, Save, AlertTriangle, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PLACEHOLDER = `Eres un asistente virtual amable y profesional.

Reglas de comportamiento:
- Responde siempre en español a menos que el usuario te escriba en otro idioma.
- Sé conciso y directo, especialmente en WhatsApp.
- Si no sabes la respuesta, sé honesto y ofrece contactar a un humano.
- Mantén un tono entusiasta, servicial y amigable.`;

export default function SystemPromptPage() {
  const [systemPrompt, setSystemPrompt] = useState("");
  const [original, setOriginal] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isLocalMode, setIsLocalMode] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/v1/admin/bot");
        const data = (await res.json()) as {
          bot: { system_prompt: string } | null;
        };
        const prompt = data.bot?.system_prompt ?? "";
        setSystemPrompt(prompt);
        setOriginal(prompt);
      } catch {
        toast.error("No se pudo cargar el system prompt");
      } finally {
        setLoading(false);
      }
    }

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
        body: JSON.stringify({ system_prompt: systemPrompt }),
      });
      if (!res.ok) throw new Error();
      setOriginal(systemPrompt);
      toast.success("System prompt guardado");
    } catch {
      toast.error("Error al guardar el system prompt");
    } finally {
      setSaving(false);
    }
  }

  const isDirty = systemPrompt !== original;
  const charCount = systemPrompt.length;

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
          <h1 className="text-2xl font-bold tracking-tight">System Prompt</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Define la personalidad, tono y reglas de comportamiento del agente.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isDirty && (
            <Badge variant="outline" className="text-amber-600 border-amber-300">
              Sin guardar
            </Badge>
          )}
        </div>
      </div>

      {/* Local mode warning */}
      {isLocalMode && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/50">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-xs text-amber-700 dark:text-amber-300">
            <strong>Modo Archivo Local activo.</strong> El bot usa{" "}
            <code className="font-mono">config/system_prompt.txt</code>. Los cambios
            se guardan en la DB pero no afectan el bot hasta que elimines ese archivo.
          </p>
        </div>
      )}

      <Tabs defaultValue="edit">
        <TabsList>
          <TabsTrigger value="edit">Editor</TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="mr-1.5 h-3.5 w-3.5" />
            Vista previa
          </TabsTrigger>
        </TabsList>

        {/* Editor tab */}
        <TabsContent value="edit" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Zap className="h-4 w-4 text-blue-500" />
                    Prompt del sistema
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Este texto se envía al LLM antes de cada conversación.
                  </CardDescription>
                </div>
                <span className="text-xs text-muted-foreground">
                  {charCount.toLocaleString()} caracteres
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="system-prompt" className="sr-only">
                  System Prompt
                </Label>
                <Textarea
                  id="system-prompt"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder={PLACEHOLDER}
                  className="min-h-[400px] font-mono text-sm leading-relaxed resize-y"
                  spellCheck={false}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview tab */}
        <TabsContent value="preview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Vista previa</CardTitle>
              <CardDescription>
                Así verá el LLM tu system prompt al inicio de cada conversación.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border bg-muted/30 p-4">
                <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-foreground">
                  {systemPrompt || (
                    <span className="text-muted-foreground italic">
                      (sin contenido)
                    </span>
                  )}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSystemPrompt(original)}
          disabled={!isDirty}
          className="text-muted-foreground"
        >
          Descartar cambios
        </Button>
        <Button onClick={handleSave} disabled={saving || !isDirty} className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Guardando..." : "Guardar system prompt"}
        </Button>
      </div>
    </div>
  );
}
