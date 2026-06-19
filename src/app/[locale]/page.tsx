import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Bot, ArrowRight, Zap, Shield, Globe } from "lucide-react";

import { Button } from "@/components/ui/button";

export default async function Home() {
  // Authenticated users go directly to the dashboard
  const { userId } = await auth();
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Nav */}
      <header className="flex h-16 items-center justify-between border-b border-border px-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
            <Bot className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold text-foreground">AgentBot</span>
        </div>
        <Button asChild size="sm">
          <Link href="/sign-in">
            Iniciar sesión
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </Button>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
          <Zap className="h-3.5 w-3.5" />
          Agente de IA para atención al cliente
        </div>

        <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Tu agente inteligente,{" "}
          <span className="text-primary">configurado desde la UI</span>
        </h1>

        <p className="mt-6 max-w-xl text-base text-muted-foreground leading-relaxed">
          Conecta Chatwoot, define la personalidad de tu bot y gestiona tu
          knowledge base — todo desde un panel visual, sin tocar código.
        </p>

        <div className="mt-10 flex items-center gap-4">
          <Button asChild size="lg" className="gap-2">
            <Link href="/sign-in">
              Empezar gratis
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/dashboard">Ver dashboard</Link>
          </Button>
        </div>

        {/* Feature pills */}
        <div className="mt-16 flex flex-wrap justify-center gap-3">
          {[
            { icon: Bot, text: "Agente con IA (Groq / Gemini)" },
            { icon: Shield, text: "Autenticación con Clerk" },
            { icon: Globe, text: "Integración con Chatwoot" },
            { icon: Zap, text: "Deploy en Vercel" },
          ].map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs text-muted-foreground"
            >
              <Icon className="h-3.5 w-3.5 text-primary" />
              {text}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
