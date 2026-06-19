/**
 * @fileoverview Knowledge Base editor page.
 * Allows editing the knowledge_base text stored in the DB.
 * This mirrors the content of config/knowledge.txt for file-based users.
 */

"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BookOpen, Save, AlertTriangle, Info } from "lucide-react";

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

const PLACEHOLDER = `GibboRadio Solutions — Información de productos

RADIOCOMUNICACIÓN
- Renta y venta de radios Motorola, Kenwood, Hytera
- Renta 100% deducible de impuestos
- Soporte técnico incluido
- Ideal para: hoteles, restaurantes, seguridad, industria

ENERGÍA SOLAR (Gibbo Energy)
- Ahorro de hasta el 95% en recibo CFE
- Incluye: cotización personalizada, trámite CFE e instalación
- Criterio: recibo CFE mayor a $1,500/mes

FAQ
¿Cuál es el horario de atención?
Lunes a viernes de 9:00 a 18:00 hrs.

¿Tienen garantía?
Sí, todos nuestros equipos tienen garantía...`;

export default function KnowledgeBasePage() {
  const [knowledge, setKnowledge] = useState("");
  const [original, setOriginal] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isLocalMode, setIsLocalMode] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/v1/admin/bot");
        const data = (await res.json()) as {
          bot: { knowledge_base: string | null } | null;
        };
        const kb = data.bot?.knowledge_base ?? "";
        setKnowledge(kb);
        setOriginal(kb);
      } catch {
        toast.error("No se pudo cargar la knowledge base");
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
        body: JSON.stringify({ knowledge_base: knowledge }),
      });
      if (!res.ok) throw new Error();
      setOriginal(knowledge);
      toast.success("Knowledge base guardada");
    } catch {
      toast.error("Error al guardar la knowledge base");
    } finally {
      setSaving(false);
    }
  }

  const isDirty = knowledge !== original;
  const charCount = knowledge.length;
  const lineCount = knowledge.split("\n").length;

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
          <h1 className="text-2xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Información del negocio, productos, precios, FAQs y scripts de calificación.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isDirty && (
            <Badge variant="outline" className="border-amber-300 text-amber-600">
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
            <code className="font-mono">config/knowledge.txt</code>. Los cambios
            se guardan en la DB pero no afectan el bot hasta que elimines ese archivo.
          </p>
        </div>
      )}

      {/* Info tip */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
        <p className="text-xs text-blue-700 dark:text-blue-300">
          Este contenido se agrega al final del system prompt con la etiqueta{" "}
          <code className="font-mono">
            === INFORMACIÓN DE RESPALDO / CONOCIMIENTO DEL NEGOCIO ===
          </code>
          . El agente lo usa para responder preguntas sobre tu negocio.
        </p>
      </div>

      <Tabs defaultValue="edit">
        <TabsList>
          <TabsTrigger value="edit">Editor</TabsTrigger>
          <TabsTrigger value="preview">Vista previa</TabsTrigger>
        </TabsList>

        {/* Editor tab */}
        <TabsContent value="edit" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BookOpen className="h-4 w-4 text-emerald-500" />
                    Contenido de la Knowledge Base
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Texto libre. Usa secciones con encabezados en mayúsculas para organizar el contenido.
                  </CardDescription>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <div>{charCount.toLocaleString()} caracteres</div>
                  <div>{lineCount.toLocaleString()} líneas</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Label htmlFor="knowledge-base" className="sr-only">
                Knowledge Base
              </Label>
              <Textarea
                id="knowledge-base"
                value={knowledge}
                onChange={(e) => setKnowledge(e.target.value)}
                placeholder={PLACEHOLDER}
                className="min-h-[500px] resize-y font-mono text-sm leading-relaxed"
                spellCheck={false}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview tab */}
        <TabsContent value="preview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Vista previa — Prompt final</CardTitle>
              <CardDescription>
                Así recibirá el LLM la knowledge base, concatenada al final del system prompt.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  … (system prompt) …
                </p>
                <p className="mb-3 font-mono text-xs font-bold text-foreground">
                  === INFORMACIÓN DE RESPALDO / CONOCIMIENTO DEL NEGOCIO ===
                </p>
                <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-foreground">
                  {knowledge || (
                    <span className="italic text-muted-foreground">
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
          onClick={() => setKnowledge(original)}
          disabled={!isDirty}
          className="text-muted-foreground"
        >
          Descartar cambios
        </Button>
        <Button onClick={handleSave} disabled={saving || !isDirty} className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Guardando..." : "Guardar knowledge base"}
        </Button>
      </div>
    </div>
  );
}
