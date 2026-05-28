import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

// =============================================================================
// Database seed script
// Run: npm run db:seed
// =============================================================================

/**
 * Generate a random API key for tenants.
 */
function generateApiKey(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let key = "ak_live_";
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

async function seed() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for seeding.");
  }

  const sql = neon(databaseUrl);
  const db = drizzle(sql, { schema });

  console.log("🌱 Seeding database...\n");

  // --- Users ---
  const seedUsers = [
    {
      clerk_id: "seed_user_001",
      email: "admin@example.com",
      name: "Admin User",
    },
    {
      clerk_id: "seed_user_002",
      email: "test@example.com",
      name: "Test User",
    },
  ];

  for (const user of seedUsers) {
    await db
      .insert(schema.users)
      .values(user)
      .onConflictDoNothing({ target: schema.users.email });
    console.log(`  ✓ User: ${user.email}`);
  }

  // --- Tenant (demo) ---
  const demoApiKey = generateApiKey();
  const [tenant] = await db
    .insert(schema.tenants)
    .values({
      name: "Demo Business",
      email: "demo@example.com",
      api_key: demoApiKey,
      plan: "pro",
    })
    .onConflictDoNothing({ target: schema.tenants.api_key })
    .returning();

  if (tenant) {
    console.log(`  ✓ Tenant: ${tenant.name} (API Key: ${demoApiKey})`);

    // --- Bot ---
    const [bot] = await db
      .insert(schema.bots)
      .values({
        tenant_id: tenant.id,
        name: "Asistente General",
        system_prompt: `Eres un asistente virtual amable y profesional para un negocio.

Reglas de comportamiento:
- Responde siempre en español a menos que el usuario escriba en otro idioma.
- Sé conciso pero útil. No escribas respuestas largas a menos que sea necesario.
- Si no sabes la respuesta a algo, dilo honestamente y sugiere contactar a un humano.
- Nunca inventes información sobre productos, precios o políticas.
- Mantén un tono profesional pero cercano.
- Si el usuario parece frustrado, muestra empatía y ofrece escalar a un agente humano.`,
        llm_provider: "groq",
        llm_model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_tokens: 1024,
        context_window: 20,
      })
      .returning();

    console.log(`  ✓ Bot: ${bot.name}`);

    // --- Bot Channel (Chatwoot — direct mode) ---
    await db.insert(schema.bot_channels).values({
      bot_id: bot.id,
      platform: "chatwoot",
      channel: "all",
      response_mode: "direct",
      platform_config: {
        base_url: "https://app.chatwoot.com",
        api_token: "YOUR_CHATWOOT_API_TOKEN",
        account_id: "YOUR_CHATWOOT_ACCOUNT_ID",
      },
    });
    console.log("  ✓ Bot Channel: Chatwoot (direct mode)");

    // --- Bot Channel (Generic — sync mode for n8n/Make/testing) ---
    await db.insert(schema.bot_channels).values({
      bot_id: bot.id,
      platform: "generic",
      channel: "all",
      response_mode: "sync",
    });
    console.log("  ✓ Bot Channel: Generic (sync mode)");
  }

  console.log("\n✅ Seeding complete!");
  console.log(`\n📋 Your demo API key: ${demoApiKey}`);
  console.log(
    `   Test with: curl -X POST http://localhost:3000/api/v1/webhook/${demoApiKey} \\`
  );
  console.log('     -H "Content-Type: application/json" \\');
  console.log(
    '     -d \'{"message": "Hola, ¿cuál es su horario?", "sender": "Test User", "sender_id": "123", "conversation_id": "test_1"}\''
  );
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  });
